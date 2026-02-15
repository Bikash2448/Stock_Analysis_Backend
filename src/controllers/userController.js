import { User } from "../models/user.model.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";


const cookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    };

const generateAccessAndRefreshToken = async(userid)=>{
    try {
        
        const user = await User.findById(userid)
       
        const accesstoken = user.generateAccessToken()
        
        const refreshtoken = user.generateRefreshToken()
        user.refreshToken = refreshtoken
        await user.save({ validateBeforeSave: false })
        return {accesstoken,refreshtoken};
    } catch (error) {
        throw new ApiError(500,"Something went wrong in server side",error)
    }
}

export const userRegister = asyncHandler(async(req,res)=>{
    const {name, mobile, email,password} = req.body;
    console.log("name",name,mobile,email,password);

     if([name, email, mobile, password].some((filed)=>filed?.trim()=="")){
        throw new ApiError(400,"All fields are required");
    }

    const existingUser = await User.findOne({$or:[{mobile},{email}]});

    if(existingUser){
        throw new ApiError(401,"Mobile No or Email already Used");
    }
    const user = await User.create({
        name,
        mobile,
        email, 
        password,
    })
    const newUser = await User.findById(user._id).select("-refreshToken -password");
    if(!newUser){
        throw new ApiError(400,"Something went wrong, user not created");
    }

    return res.status(201).json(
        new ApiResponse(200,newUser,"User Register Successfully")
    )


})


export const loginUser = asyncHandler(async(req,res)=>{

    const {mobile,email,password} = req.body
    // console.log(mobile,email,password)
    if (!mobile && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({$or:[{mobile},{email}]});
    if(!user){
        throw new ApiError(400,"Enter vaild mobile or emailId")
    }
    
    const checkValidPassword = await user.isPasswordCorrect(password)
    if(!checkValidPassword){
        throw new ApiError(401,"Enter vaild password");
    }

    // console.log("code here",user._id)
    const {accesstoken,refreshtoken} = await generateAccessAndRefreshToken(user._id);
    // console.log("accesstoken",accesstoken);
    // console.log("refreshtoken",refreshtoken);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    

    return res
    .status(200)
    .cookie("accessToken", accesstoken, cookieOptions)
    .cookie("refreshToken", refreshtoken, cookieOptions)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accesstoken, refreshtoken
            },
            "User logged In Successfully"
        )
    )
})


export const logoutUser = asyncHandler(async(req,res)=>{
    const user = req.user
    await User.findByIdAndUpdate(user._id,{
        $unset:{refreshToken:undefined},
    },{
        new:true
    })
    return res.status(200)
    .clearCookie("accessToken",cookieOptions)
    .clearCookie("refreshToken",cookieOptions)
    .json(new ApiResponse(200,{},"User logged out"))
})