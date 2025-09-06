import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    jwtid : {
        type : String,
        required : true,
        unique : true
    },
    expiresIn : {
        type : Date,
        required : true
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    }   
} , {
    timestamps : true,
})

export const tokenModel = mongoose.model("Token" , tokenSchema);
