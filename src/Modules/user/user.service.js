import {Roles, UserModel} from "../../DB/Models/user/user.model.js";
import * as DBservices from "../../DB/DBservices.js";
import successResponse from "../../Utils/handlers/successResponse.utils.js";
import { deleteFileCloudinary, uploadFileCloudinary } from "../../Utils/multer/cloud.multer.js";
import path from "node:path";

export const loadProfile = async (req , res , next) => {
    let user = req.user;
    if (!user) return next(new Error("Invalid Credintals: please login again" , {cause : 401}));
    if (!user.confirmEmail)  {
        await user.sendEmailOTP();
        return next(new Error("Please confirm your email first" , {cause : 400}))
    };
    user = await DBservices.findById({model: UserModel , id : user._id , select : "-password -__v -credentialsUpdatedAt -emailOTP -phoneOTP -passwordOTP" , populate:[{path: "messages"}]});
    if (!user) return next(new Error("User not found" , {cause : 404}));
    successResponse({
        res,
        status : 200,
        message: "Loaded user profile succesfully",
        data : {user}
    });
}

export const changePassword = async (req , res , next) => {
    const {currentPassword , newPassword , confirmPassword , logOutAlldevices} = req.body;
    const user = req.user;
    if (!user) return next(new Error("Invalid Credintals please login again" , {cause : 401})); 
    if (! await user.checkPassword(currentPassword)) return next(new Error("Invalid password" , {cause : 400}));
    if (newPassword == currentPassword) return next(new Error("New password cannot be the same as old password" , {cause : 400}));
    if (newPassword !== confirmPassword) return next(new Error("Passwords do not match" , {cause : 400})); 
    const credentialsUpdatedAt = logOutAlldevices ? Date.now() : user.credentialsUpdatedAt;
    const updatedUser = await DBservices.findByIdAndUpdate({model: UserModel , id :  user._id , data : {password: newPassword , credentialsUpdatedAt} , options : {new : true}});
    successResponse({res , status : 200 , message: "Password updated successfully" , data : {user: updatedUser}}); 
}

export const shareProfile = async (req , res , next) => {
    const {id} = req.params;
    const user = await DBservices.findOne({model: UserModel , filter : {_id : id , confirmEmail : true} , select : "-password -__v -credentialsUpdatedAt -emailOTP -phoneOTP -passwordOTP -createdAt -confirmEmail -confirmPhone"});
    if (!user) return next(new Error("User not found" , {cause : 404}));
    successResponse({res , status : 200 , message: "User profile" , data : {user}}); 
}

export const updateProfile = async (req , res , next) => {
    const user = req.user;
    if (!user) return next(new Error("Invalid Credintals please login again" , {cause : 401})); 
    const updatedUser = await DBservices.findByIdAndUpdate({model: UserModel , id :  user._id , data : {...req.body} , options : {new : true}});
    successResponse({res , status : 200 , message: "Profile updated successfully" , data : {user: updatedUser}});
}

export const deleteAccount = async (req , res , next) => {
    const targetId = req.params?.targetId;
    const user = req.user;
    if (!user) return next(new Error("Invalid Credintals please login again" , {cause : 401}));
    const password = req.body?.password;
    if (!await user.checkPassword(password)) return next(new Error("Invalid password" , {cause : 400}));
    if (targetId) {
        if (user.role !== Roles.admin) return next(new Error("You are not authorized to perform this action" , {cause : 401}));
        const targetUser = await DBservices.findByIdAndDelete({model: UserModel , id :  targetId});
        console.log(targetUser);
        if (!targetUser) return next(new Error("User not found" , {cause : 400}));
        return successResponse({res , status : 200 , message: "User deleted successfully" , data : {user: targetUser}});
    } 
    const deletedUser = await DBservices.findByIdAndDelete({model: UserModel , id :  user._id});
    successResponse({res , status : 200 , message: "Account deleted successfully" , data : {user: deletedUser}});
}
export const freezeAccount = async (req , res , next) => {
    const targetId = req.params?.targetId;
    const user = req.user;
    if (!user) return next(new Error("Invalid Credintals please login again" , {cause : 401}));
    const password = req.body?.password;
    if (!await user.checkPassword(password)) return next(new Error("Invalid password" , {cause : 400}));
    if (targetId) {
        if (user.role !== Roles.admin) return next(new Error("You are not authorized to perform this action" , {cause : 401}));
        const targetUser = await DBservices.findByIdAndUpdate({model: UserModel , id: targetId , data : {deletedAt: Date.now() , DeletedBy: user._id , role: Roles.user , $unset : {restoredAt: true , restoredBy: true}}});
        console.log(targetUser);
        if (!targetUser) return next(new Error("User not found" , {cause : 400}));
        return successResponse({res , status : 200 , message: "User account frozen successfully" , data : {user: targetUser}});
    } 
    const frozenUser = await DBservices.findByIdAndUpdate({model: UserModel , id: user._id , data : {deletedAt: Date.now() , DeletedBy: user._id , $unset : {restoredAt: true , restoredBy: true}}});
    successResponse({res , status : 200 , message: "Account frozen successfully" , data : {user: frozenUser}});
}

export const restoreAccount = async (req , res , next) => {
    const targetId = req.params?.targetId;
    const user = req.user;
    if (!user) return next(new Error("Invalid Credintals please login again" , {cause : 401}));
    const password = req.body?.password;
    if (!await user.checkPassword(password)) return next(new Error("Invalid password" , {cause : 400}));
    if (targetId) {
        if (user.role !== Roles.admin) return next(new Error("You are not authorized to perform this action" , {cause : 401}));
        let targetUser = await DBservices.findById({model : UserModel , id: targetId});
        if (!targetUser) return next(new Error("User not found" , {cause : 400}));
        if (!targetUser?.deletedAt || !targetUser?.DeletedBy) return next(new Error("User is not frozen" , {cause : 400}));
        if (targetUser?.DeletedBy == targetId) return next(new Error("Only the owner of the account can restore it" , {cause : 403}));
        targetUser = await DBservices.findByIdAndUpdate({
            model: UserModel , 
            id: targetId , 
            data : {
                $unset : {deletedAt: true , DeletedBy: true} , 
                restoredBy: user._id , 
                restoredAt : Date.now()
            }
        });
        console.log(targetUser);
        if (!targetUser) return next(new Error("User not found" , {cause : 400}));
        return successResponse({res , status : 200 , message: "User account restored successfully" , data : {user: targetUser}});
    }
    if (!user?.deletedAt || !user?.DeletedBy) return next(new Error("Your account is not frozen" , {cause : 400}));
    if (user?.DeletedBy !== user._id) return next(new Error("only an admin can restore your account" , {cause : 401}));
    const restoredUser = await DBservices.findByIdAndUpdate({model: UserModel , id: user._id , data : {$unset : {deletedAt: true , DeletedBy: true} , restoredBy: user._id , restoredAt : Date.now()}});
    successResponse({res , status : 200 , message: "Account restored successfully" , data : {user: restoredUser}});
}

export const uploadProfileImage = async (req , res , next) => {
    // local upload
    // const user = await DBservices.findByIdAndUpdate({model: UserModel , id: req.user._id , data : {profileImageLocal: req.file?.finalPath} , options : {new : true}});
    // if (!user) return next(new Error("Error uploading photo" , {cause : 500}));
    // cloudinary upload
    const {public_id , secure_url} = await uploadFileCloudinary({file: req.file.path , options : {folder : `Sara7aApp/users/${(req.user?.id) ? req.user.id : "guests"}`}});
    if (req.user.profileImageCloudinary?.public_id) {
        await deleteFileCloudinary(req.user.profileImageCloudinary.public_id)
    }
    const user = await DBservices.findByIdAndUpdate({model: UserModel , id: req.user._id , data : {profileImageCloudinary: {public_id , secure_url}} , options : {new : true}});
    if (!user) return next(new Error("Error uploading photo" , {cause : 500}));
    successResponse({res , status : 200 , message: "Profile image uploaded successfully" , data : {user}});
}

export const coverImages = async (req , res , next) => {
    // local upload
    // const user = await DBservices.findByIdAndUpdate({model: UserModel , id: req.user._id , data : {coverImagesLocal: [...req.user?.coverImages,...((req.files)?.map(file => file.finalPath))]} , options : {new : true}});
    // if (!user) return next(new Error("Error uploading photo" , {cause : 500}));
    let images = await req.files.map(async (file) => {
        const {public_id , secure_url} = await uploadFileCloudinary({file: file.path , options : {folder : `Sara7aApp/users/${(req.user?.id) ? req.user.id : "guests"}/coverImages`}})
        return {public_id , secure_url}
    })

    if (req.user.coverImagesCloudinary[1]) {
        req.user.coverImagesCloudinary.map( async (img) => {
            await deleteFileCloudinary(img?.public_id)
        })
    }
    
    const user = await DBservices.findByIdAndUpdate({model: UserModel , id: req.user._id , data : {coverImagesCloudinary: [...(await Promise.all(images))]} , options : {new : true}});
    if (!user) return next(new Error("Error uploading photo" , {cause : 500}));
    successResponse({res , status : 200 , message: "Profile image uploaded successfully" , data : {user}});
}