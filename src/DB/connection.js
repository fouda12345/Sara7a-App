import mongoose from "mongoose";
import dotenv from 'dotenv';

const ConnectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URI, {serverSelectionTimeoutMS : 5000});
        console.log("Connected to DB");
    } catch (error) {
        console.log(error);
    }
}

export default ConnectDB;