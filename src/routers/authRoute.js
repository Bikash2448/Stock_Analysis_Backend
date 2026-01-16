import express from 'express';
import { forgetPasswordOTP, googleLogin, resetPassword, sendOtp, verifyForgetPasswordOTP, verifyOtp } from '../controllers/authController.js';
import { loginUser, userRegister } from '../controllers/userController.js';






const router = express.Router();


router.post('/google',googleLogin);
// router.post('/signup',userRegister);
router.post('/send-otp',sendOtp);
router.post('/verify-otp',verifyOtp);
// router.post('/login',loginUser);
router.post('/request_otp',forgetPasswordOTP);
router.post('/verifyOtp_ResetPassword',verifyForgetPasswordOTP);
router.post('/reset_password',resetPassword);

export default router;