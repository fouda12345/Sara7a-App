import nodemailer from 'nodemailer';
import { generateHtml } from './generateHtml.utils.js';

export const sendEmail = async ({email, subject ,code ,name}) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.GOOGLE_APP_USER,
            pass: process.env.GOOGLE_APP_PASSWORD,
        },
    })

    const html = generateHtml({
        subject,
        to: email,
        name: name,
        code: code,
        time: process.env.OTP_EXPIRY_TIME
    });

    const mailOptions = {
        from: ` Sara7a App <${process.env.GOOGLE_APP_USER}>`,
        to: email,
        subject,
        html
    };
    transporter.sendMail(mailOptions).catch((error) => {
        console.log("Error sending email:", error)
    })
}