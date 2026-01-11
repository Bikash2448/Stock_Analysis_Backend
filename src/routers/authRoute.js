import express from 'express';
import { googleLogin, sendOtp, verifyOtp } from '../controllers/authController.js';
import { userRegister } from '../controllers/userController.js';


const router = express.Router();


router.post('/google',googleLogin);
router.post('/signup',userRegister);
router.post('/send-otp',sendOtp);
router.post('/verify-otp',verifyOtp);

export default router;