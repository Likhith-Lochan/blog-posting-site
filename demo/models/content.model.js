import mongoose,{Schema} from "mongoose";


const contentSchema=new Schema({
        content:{
            type:String,
            required:true
        },
        owner:{
            type:mongoose.Types.ObjectId,
            ref:"User"
        }
},{timestamps:true})

export  const Content=mongoose.model("Content",contentSchema)