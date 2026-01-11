import { User } from "../models/user.model.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";



export const userRegister = async(req,res)=>{
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


}