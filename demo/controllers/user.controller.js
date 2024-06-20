import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { jwt } from "jsonwebtoken";


const registerUser=asyncHandler(async (req,res)=>{
    //get username,fullname,email
    //validate the same
    //check username ,fullname or email already exists
    //create user object and save in database
    //check for object in db
    //remove password and refresh token from response
    //return res

    const {username,fullname,email,password}=req.body
    if(!(username || fullname || email || password) ){
        throw new ApiError(403,"all fields are required ")
    }

    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(405,"User already exists")
    }

    const user = await User.create({
        username:username.toLowerCase(),
        fullname:fullname,
        email:email,
        password,

    })

    const createdUser=await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while creating User")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User created successfully")
    )




})

const generateAccessAndRefreshToken=async (id)=>{
   try {
     const user=await User.findById(id)
     if(!user){
         throw new ApiError(404,"user does not exists")
     }
     const accessToken=user.generateAccessToken()
     const refreshToken=user.generateRefreshToken()
 
     user.accessToken=accessToken
 
     await user.save({validateBeforeSave:false})
 
     return {accessToken,refreshToken}
   } catch (error) {
       console.log(error)
       throw new ApiError(500,"something went wrong in server while generating access and refresh token")
   }
}

const loginUser=asyncHandler(async (req,res)=>{
    //get username / email and password
    //check if username and email both are missing
    //check if user doesnot exists
    //check password
    //generate access token and refresh token
    //set refresh token in db 
    // save in db
    // send cookie

    const  {email,username,password}=req.body

    if(!email && !username){
        throw new ApiError(200,'username or password is required')
    }

    const user=await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"user does not exists")
    }

    const ispasswordvalid=user.isPasswordCorrect(password)

    if(!ispasswordvalid){
        throw new ApiError(401,"password is invalid")
    }

    const {accessToken,refreshToken}=generateAccessAndRefreshToken(user._id)

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "user successfully logged in"
        )
    )



})

const logoutUser=asyncHandler(async (req,res)=>{
    await user.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            new :true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"successfully logged out"))

})

const getFavourites=asyncHandler(async (req,res)=>{
        const user=await User.findById(req.user?._id)

        if(!user){
            throw new ApiError(404,"user does not exists")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {   
                    username:user.username,
                    favourites:user.favourites
                },
                "favourites fetched successfully"

            )
        )


})

const getLiked = asyncHandler(async (req,res)=>{

    const user= await User.findById(req.user?._id)

    if(!user){
        throw new ApiError(404,"user does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {   
                username:user.username,
                favourites:user.likes
            },
            "likes fetched successfully"

        )
    )


})

const getUserProfile= asyncHandler(async (req,res)=>{

    const username =req.params

    if(!username){
        throw new ApiError(400,"username is missing")
    }

    const profile=await User.findOne({
        $or:[{username}]
    }).select("-password -refreshToken")

    if(!profile){
        throw new ApiError(404,"user does not exists")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,{
            username:profile.username,
            fullname:profile.fullname,
            email:profile.email,
        
        },"user fetched successfully"))



})

const getCurrentUser= asyncHandler(async (req,res)=>{

    return res.status(200)
    .json(
        new ApiResponse(200,req.user,"user fetched successfully")
    )

})

const refreshAccessToken = asyncHandler (async (req,res)=>{

    const incomingToken= req.cookies?.refreshToken || req.body.refreshToken

    if(!incomingToken){
        throw new ApiError(406,"refresh token is unavailable")
    }

   try {
     const decodedToken=jwt.verify(incomingToken,process.env.REFRESH_TOKEN_SECRET)
 
     
     const user=await User.findById(decodedToken._id)
     
     if(!user){
         throw new ApiError(404,"user does not exists")
     }
 
     if(incomingToken!=user?.refreshToken){
         throw new ApiError(408,"token is expired")
     }
 
     const options={
         httpOnly:true,
         secure:true,
     }
 
     const {accessToken,refreshToken}=generateAccessAndRefreshToken(user._id)
 
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(new ApiResponse(200,
         {accessToken,refreshToken:refreshToken},
         "accessToken is refreshed"
         ))
   } catch (error) {
        throw new ApiError(401,error?.message || "invalid access token")
   }
})

const changePassword=asyncHandler (async (req,res)=>{

    const {newPassword,oldPassword}=req.body

    const user=await User.findById(req.user?._id)

    const isPasswordCorrect= user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(406,"enter correct password")
    }

    user.password=newPassword

    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"password changed successfully"))


})

const updateAccountDetails=asyncHandler(async (req,res)=>{

    const {fullname,email}=req.body

    if(!fullname || !email){
        throw new ApiError(404,"all fields are required")
    }

    const user =await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname:fullname,
                email:email
            }
        },
        {
            new :true
        }
        ).select("-password")

        return res
        .status(200)
        .json(new ApiResponse(200,
            user,
            "details updated successfully"
        ))


})

export {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    getCurrentUser,
    refreshAccessToken,
    changePassword,
    updateAccountDetails,
    getFavourites,
    getLiked,

}
