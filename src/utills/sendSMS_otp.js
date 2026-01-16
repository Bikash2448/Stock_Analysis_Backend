import axios from "axios";
import nodemailer from "nodemailer"

export const sendSmsOtp = async (mobile, otp) => {
  console.log("api key",process.env.FAST2SMS_APIKEY)
  try {
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "otp",
        variables_values: otp,
        numbers: mobile,
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_APIKEY,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Fast2SMS Error:", error.response?.data || error.message);
    throw new Error("SMS sending failed");
  }
};

// For send Gmail OTP
const transporter = nodemailer.createTransport({
  // service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});


export const sendOtpEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `"Nandi Stock Algo" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Your One-Time Password (OTP)",
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f6f8; padding: 24px;">
        <div style="max-width: 480px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 24px; box-shadow: 0 2px 6px rgba(0,0,0,0.08);">
          
          <h2 style="color: #1f2937; text-align: center; margin-bottom: 12px;">
            Verify Your Email Address
          </h2>

          <p style="color: #374151; font-size: 14px;">
            Hello,
          </p>

          <p style="color: #374151; font-size: 14px;">
            Use the following One-Time Password (OTP) to complete your verification. 
            This code is valid for <strong>5 minutes</strong>.
          </p>

          <div style="text-align: center; margin: 24px 0;">
            <span style="
              display: inline-block;
              font-size: 28px;
              letter-spacing: 4px;
              font-weight: bold;
              color: #111827;
              background-color: #f3f4f6;
              padding: 12px 24px;
              border-radius: 6px;
            ">
              ${otp}
            </span>
          </div>

          <p style="color: #374151; font-size: 14px;">
            If you did not request this code, please ignore this email or contact our support team.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            This is an automated message. Please do not reply.<br />
            © ${new Date().getFullYear()} Bikash Stock Algo. All rights reserved.
          </p>
        </div>
      </div>
    `
  });
};


