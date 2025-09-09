import mongoose, { Schema } from "mongoose";

export const anonSender = "Anonymous";

const messageSchema = new Schema(
    {
        senderId: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        recieverId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        senderName: {
            type: String,
            default: anonSender
        },
        content: {
            type: String,
            minLength: 10,
            maxlength: 500,
            required: function () {return this.attachments?.length ? false : true}
        },
        attachments: [{
            secure_url: { type: String, required: true },
            public_id: { type: String, required: true },
        }],
    },
    { timestamps: true }
);

export const MessageModel = mongoose.model("Message", messageSchema);