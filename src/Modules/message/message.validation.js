import joi from "joi";
import { generalFields } from "../../MIddlewares/validate.middleware.js";
import { fileValidation } from "../../Utils/multer/local.multer.js";


export const sendMessageValidation = {
    params: joi.object({
        recieverId: generalFields.id.required(),
    }).required(),
    body: joi.object({
        attachments: joi.array(),
        content: joi.any(),
        anonymus: joi.alternatives().try(
            joi.boolean(),
            joi.string().valid("0", "1"),
            joi.number().valid(0, 1),
        ).default(true),
        senderName: joi.string().min(3).max(30),
    }).required().when(joi.object({
        attachments: joi.array().min(1).required()
    }).unknown(true), {
        then: joi.object({
            content: joi.string().min(10).max(500),
        }),
        otherwise: joi.object({
            content: joi.string().min(10).max(500).required(),
        })
    }),
    headers: generalFields.headerForAuthorization,
    files: joi
            .array()
            .items(
                joi.object({
                    fieldname: generalFields.file.fieldname.valid("attachments").required(),
                    originalname: generalFields.file.originalname.required(),
                    mimetype: generalFields.file.mimetype.valid(...fileValidation.image).required(),
                    encoding: generalFields.file.encoding.required(),
                    size: generalFields.file.size.max(5 * 1024 * 1024).required(),
                    destination: generalFields.file.destination.required(),
                    filename: generalFields.file.filename.required(),
                    path: generalFields.file.path.required(),
                    finalPath: generalFields.file.finalPath
                    // .required(),
                })
            )
            .min(0)
            .max(3),
}



export const getMessagesValidation = {
    headers: generalFields.headerForAuthorization.required(),
    query: joi.object({
        page: joi.string().pattern(/^\d+$/).default("1"),
        limit: joi.string().default(/^\d+$/).default("5"),
    }).default({page:1 , limit:5})
}