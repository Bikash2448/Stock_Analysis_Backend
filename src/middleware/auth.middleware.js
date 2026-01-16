import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import { ApiError } from "../utills/ApiError.js"
import { asyncHandler } from "../utills/AsyncHandler.js"


export const verifyJWT = asyncHandler(async(req,res,next)=>{
    // console.log(req.cookies)
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        console.log("token",token)
        if(!token){
            throw new ApiError(401,"unauthorize request")
        }
        const decodetoken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        if (!decodetoken) {
            throw new ApiError(401, "Invalid access token");
        }

        const user  = await User.findById(decodetoken._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401,"Invalid accessToken")
        }
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid AccessToken")
    }
})