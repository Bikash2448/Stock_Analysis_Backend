import express from 'express';
import { googleLogin, sendOtp, verifyOtp } from '../controllers/authController.js';
import { loginUser, userRegister } from '../controllers/userController.js';


const router = express.Router();


router.post('/google',googleLogin);
router.post('/signup',userRegister);
router.post('/send-otp',sendOtp);
router.post('/verify-otp',verifyOtp);
router.post('/login',loginUser)

export default router;