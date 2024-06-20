import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrpyt"
import jwt from "jsonwebtoken"

const userSchema=new Schema({
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            index:true
        },
        fullname:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            index:true,

        },
        likes:{
            type:mongoose.Types.ObjectId,
            ref:"Content",
        },
        favourites:{
            type:mongoose.Types.ObjectId,
            ref:"Content"
        },
        password:{
            type:String,
            required:[true,"Password is required"]
        },
        refreshToken:{
            type:String,
        },
},{timestamps:true})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next()
    }

    this.password= await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect=async (password)=>{
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken= ()=>{
    return jwt.sign(
        {
            _id:this._id,
            name:this.username,
            email:this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.ACCESS_TOKEN_EXPIRY
        }

    )
}

userSchema.methods.generateRefreshToken=()=>{
    return jwt.sign(
        {
            _id:this._id,
            name:this.username
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}

export const User=mongoose.model("User",userSchema)