import * as DBservices from "../../DB/DBservices.js";
import { anonSender, MessageModel } from "../../DB/Models/message/message.model.js";
import { UserModel } from "../../DB/Models/user/user.model.js";
import successResponse from "../../Utils/handlers/successResponse.utils.js";
import {uploadFileCloudinary } from "../../Utils/multer/cloud.multer.js";

export const sendMessage = async (req, res, next) => {
    const {recieverId} = req.params;

    if (!DBservices.findOne({
        model: UserModel,
        filter: {
            _id: recieverId,
            confirmEmail: true,
            deletedAt: {$exists: false},
        },
    })) return next(new Error("Reciever not found" , {cause : 404}));
    let {content, anonymus ,senderName} = req.body;
    const senderId = req.user?.id && req.user.id
    anonymus = (typeof anonymus === "string" || typeof anonymus === "number") && Number(anonymus)
    const finalSenderName = anonymus ? anonSender : req.user?.name||senderName;
    let attachments = req.files?.length && await req.files.map(async (file) => {
        const {public_id , secure_url} = await uploadFileCloudinary(
            {
                file: file.path, 
                options : {
                    folder : `Sara7aApp/messages/${recieverId}`
                }
            }
        )
        return {public_id , secure_url}
    }) || []
    attachments = attachments && await Promise.all(attachments)
    const message = await DBservices.create({
        model: MessageModel,
        data: [{
            senderId,
            recieverId,
            senderName: finalSenderName,
            content,
            attachments : attachments.length && attachments
        }]
    })
    successResponse({ res, message: "Message sent successfully", data: { message }, statusCode: 201 });
}
export const getMessages = async (req, res, next) => {
    const { user } = req;
    let { page = 1 , limit =5} = req.query;
    page = Number(page);
    limit = Number(limit);
    const messages = await DBservices.find({ model: MessageModel, filter: { recieverId: user._id }, skip: (page - 1) * limit, limit , select:"-recieverId -__v" });
    successResponse({ res, message: "Messages fetched successfully", data: { messages }, statusCode: 200 });
}