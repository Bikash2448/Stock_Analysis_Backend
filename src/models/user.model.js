import {mongoose,Schema} from "mongoose";
import bcrypt from "bcrypt"
import  JWT  from "jsonwebtoken";


const UserSchema = new Schema({
    name:{ 
            type:String,
            lowercase: true,
            required: true
        },
    email: { 
            type: String, 
            unique: true,
            lowercase: true,
            required: true
        },
    mobile:{
            type:Number, 
            unique:true,
            sparse: true
        },
    password: {
        type: String,
        required: function () {
                return !this.googleId;
            }
        },
    googleId: {
            type:String,
            unique: true,
            sparse: true
        },
    avatar: { 
            type:String
        },
    provider: {
            type: String,
            enum: ["local", "google"],
            required: true,
            default: "local"
        },
    refreshToken: {
            type: String
        },
    otp:{type: String},
    otpExpiresAt: {type:Date},
    isVerified: {
        type: Boolean,
        default: false,
    },
},{timestamps:true})


UserSchema.pre("save", async function(){
    if(!this.password) return;
    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password,10);

    // next();
})

UserSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

UserSchema.methods.generateAccessToken = async function(){
    return JWT.sign(
        {
            _id : this._id,
            email : this.email,
            name : this.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

UserSchema.methods.generateRefreshToken = async function(){
    return JWT.sign(
        {
            _id : this._id,
            email : this.email
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model('User', UserSchema);