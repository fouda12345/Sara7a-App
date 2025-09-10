import mongoose from "mongoose";
import { hashData } from "../../../Utils/encryption/hashing.utils.js";
import { decryptData, encryptData } from "../../../Utils/encryption/encryption.utlis.js";
import { Tokens } from "../../../Utils/encryption/jwt.utils.js";
import { userMethods } from "./user.methods.js";



export const Roles = {};
for (let role in Tokens) {
    Roles[role] = role
}

export const genders = {
    male: "male",
    female: "female"
};
Object.freeze(genders);
Object.freeze(Roles);

export const providerTypes = {
    google: "google",   
    facebook: "facebook",
    apple: "apple",
    system: "system"
}
Object.freeze(providerTypes);
const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : [true , "Name is required"],
        trim : true,
    },
    middleName : {
        type : String,
        trim : true,
    },
    lastName : {
        type : String,
        required : [true , "Name is required"],
        trim : true,
    },
    email : {
        type : String,
        required : [true , "Email is required"],
        trim : true,
        unique : [true , "User already exists"],
    },
    password : {
        type : String,
        required : function(){
            return this.provider === providerTypes.system;
        },
        minlength : [6 , "Password must be at least 6 characters"],
        set: (v) => hashData(v),
    },
    phone : {
        type : String,
        unique : [true , "Phone number already in use"],
        sparse : true,
        get: (v) => decryptData(v) ,
        set: (v) => encryptData(v),
    },
    gender : {
        type : String,
        enum : Object.values(genders),
        lowercase : true,
        trim : true,
        default : genders.male
    },
    role : {
        type : String,
        required : true,
        enum : Object.values(Roles),
        default : Roles.user,
    },
    confirmEmail : {
        type : Boolean,
        default : false
    },
    confirmPhone : {
        type : Boolean,
        default : false
    },
    emailOTP : {
        code : String,
        createdAt : Date,
        expiresIn :Date
    },
    phoneOTP : {
        code : String,
        createdAt : Date,
        expiresIn :Date
    },
    passwordOTP : {
        code : String,
        createdAt : Date,
        expiresIn :Date
    },
    credentialsUpdatedAt : {
        type : Date,
        default : Date.now()
    },
    provider : {
        type : String,
        enum : Object.values(providerTypes),
        default : providerTypes.system
    },
    deletedAt :Date,
    deletedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    restoredAt : Date,
    restoredBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    profileImageLocal : String,
    coverImagesLocal : [String],
    profileImageCloudinary : {public_id:String , secure_url:String},
    coverImagesCloudinary : [{public_id:String , secure_url:String}],
} , {
    timestamps : true,
    toJSON : {
        getters : true,
        virtuals : true,
    },
    toObject : {
        getters : true,
        virtuals : true,
    },
    methods : userMethods
})

userSchema.virtual("messages" , {
    localField : "_id",
    foreignField : "recieverId",
    ref : "Message"
})

export const UserModel = mongoose.model("User" , userSchema);
