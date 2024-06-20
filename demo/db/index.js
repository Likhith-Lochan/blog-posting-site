import mongoose from "mongoose";

const connectDB=async()=>{
    try {
        await mongoose.connect(process.env.DB_URI,{
            useNewUrlParser:true,
            useUnifiedTopology:true
        })
        console.log("DB connected successfully")
        
    } catch (error) {
        console.log("Unable to connect to DB",error)
    }
}

export default connectDB