import { EventEmitter } from "events";
import { sendEmail } from "./sendEmail.utils.js";

export const emailEvent = new EventEmitter();

emailEvent.on("confirmEmail", async ({email , code , name }) => {
    const subject = "Email Verification Required for Your sara7a App Account";

    sendEmail({ email, subject, code , name})
});

emailEvent.on("foegetPassword", async ({email , code , name }) => {
    const subject = "Resert Password OTP for Your sara7a App Account";
    sendEmail({ email, subject, code , name})
});