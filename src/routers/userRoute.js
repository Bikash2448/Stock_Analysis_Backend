import express from "express";
import { loginUser, logoutUser, userRegister } from "../controllers/userController.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

export const userRouter = express.Router();
console.log("user router");


userRouter.post('/signup',userRegister);
userRouter.post('/login',loginUser);
userRouter.get('/logout',verifyJWT,logoutUser);