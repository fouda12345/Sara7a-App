import { Router } from "express";
import * as messageServices from "./message.service.js";
import { auth } from "../../MIddlewares/auth.middleware.js";
import { cloudFileUpload } from "../../Utils/multer/cloud.multer.js";
import { fileValidation } from "../../Utils/multer/local.multer.js";
import { validate } from "../../MIddlewares/validate.middleware.js";
import { getMessagesValidation, sendMessageValidation } from "./message.validation.js";
const router = Router();

router.post(
    "/send-message/:recieverId",
    cloudFileUpload(
        {
            customPath:"message-attachments",
            fileTypes:fileValidation.image
        }
    ).array("attachments",3),
    validate(sendMessageValidation),
    auth({required : false}),
    messageServices.sendMessage
);

router.get(
    "/get-messages",
    validate(),
    auth(getMessagesValidation),
    messageServices.getMessages
);

export default router;