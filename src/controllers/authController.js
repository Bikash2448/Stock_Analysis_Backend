import { googleClient } from "../config/google.config.js";
import otpModel from "../models/otp.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utills/ApiError.js";
import { sendOtpEmail, sendSmsOtp } from "../utills/sendSMS_otp.js";


const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
// const normalizeIdentifier = (identifier) => {
//   identifier = identifier.trim();

//   const isEmail = identifier.includes("@");

//   return {
//     email: isEmail ? identifier.toLowerCase() : null,
//     mobile: isEmail ? null : identifier,
//     type: isEmail ? "email" : "mobile",
//   };
// };

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token)
      return res.status(400).json({ message: "Token missing" });

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    // console.log("Payload",payload)
    const { sub, email, name, picture } = payload;

    let user = await User.findOne({ email });
    // console.log("user",user)

    if (!user) {
      user = await User.create({
        googleId: sub,
        email,
        name,
        avatar: picture,
        provider: "google",
      });
    }
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    // user.refreshToken = refreshToken;
    // console.log("refresh",user);
    // await user.save({ validateBeforeSave: false });
    const val = await User.findByIdAndUpdate(
      user._id,
      { refreshToken },
      { new: true }
    );

    console.log("val",val);

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    };

    // 🍪 Set cookies
    res
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .status(200)
      .json({
        message: "Google login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
      });

    // res.status(200).json({
    //   user,
    // });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Google authentication failed: Backend Error" });
  }
};


export const sendOtp = async (req, res) => {
  const { mobile, email } = req.body;

  const existingUser = await User.findOne({$or:[{mobile},{email}]});

  if(existingUser){
      return res.json({
        success: false,
        message: "Mobile No or Email already Used",
      })
  }
  const otp = generateOtp();
  // console.log("otp",otp)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Task : Improve Version -> You can also store OTP In  HASH
  await otpModel.findOneAndUpdate(
    { $or: [{ mobile }, { email }] },
    { email,
      mobile,
      otp,
      expiresAt,
      verified: false 
    },
    { upsert: true, new: true }    // upsert: true => If record not found → create new
  );


  // await sendSmsOtp(mobile, otp);
  await sendOtpEmail(email,otp);

  console.log("OTP (dev only):", otp);

  res.json({
    success: true,
    message: "OTP sent successfully",
  });
};


export const verifyOtp = async (req, res) => {
  try {
    const { email, mobile, otp } = req.body;
    // console.log("em-mo-otp",email,otp,mobile)

    if (!email || !mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email, mobile and OTP are required",
      });
    }

    // Find latest OTP
    const otpRecord = await otpModel.findOne({
      email,
      mobile,
      verified: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or already verified",
      });
    }

    // Check expiry
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // Check OTP
    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const forgetPasswordOTP = async (req, res) => {

  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const existingUser = await User.findOne( {email});

  if (!existingUser) {
    throw new ApiError(401, "User not found");
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

  console.log("otp",otp)
  await otpModel.findOneAndUpdate({ email },
    {
      email,
      otp: String(otp),
      expiresAt,
      verified: false,
    },
    { upsert: true, new: true }
  );
  await sendOtpEmail(email, otp);

  res.status(200).json({
    success: true,
    message: "OTP sent successfully",
  });
};



export const verifyForgetPasswordOTP = async (req, res) => {
  const { email, otp } = req.body;

  const record = await otpModel.findOne({email,verified: false}).sort({ createdAt: -1 });

  if (!record) {
    throw new ApiError(400, "OTP not found");
  }

  if (record.expiresAt < Date.now()) {
    await otpModel.deleteOne({ _id: record._id });
    throw new ApiError(400, "OTP expired");
  }
  // console.log("recodeotp",record.otp);
  // console.log("otp",otp);

  if (record.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  record.verified = true;
  await record.save();

  res.json({
    success: true,
    message: "OTP verified",
  });
};



export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  const otpRecord = await otpModel.findOne({email,verified: true});

  if (!otpRecord || !otpRecord.verified) {
    throw new ApiError(403, "OTP verification required");
  }

  const user = await User.findOne({email});

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: "Password reset successful",
  });
};
