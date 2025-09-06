import joi from 'joi';
import { generalFields, passwordRegex } from '../../MIddlewares/validate.middleware.js';
export const registerSchema = {
    body: joi.object({
            firstName: generalFields.name.required(),
            middleName: generalFields.name,
            lastName: generalFields.name.required(),
            email: generalFields.email.required(),
            password: generalFields.password.required().pattern(passwordRegex),
            phone: generalFields.phone,
            gender: generalFields.gender
    }).required()
}

export const loginSchema = {
    body: joi.object({
            email: generalFields.email.required(),
            password: generalFields.password.required(),
    }).required()
}

export const refreshTokenSchema = {
    headers: generalFields.headerForAuthorization.required(),
}

export const verifyOTPSchema = {
    params: joi.object({
            type: generalFields.OTPtype.required(),
    }).required(),
    body: joi.object({
            email: generalFields.email.required(),
            OTP: generalFields.OTP.required(),
    }).required()
}

export const resendEmailOTPSchema = {
    body: joi.object({
            email: generalFields.email.required(),
    }).required()
}

export const forgetPasswordSchema = {
    body: joi.object({
            email: generalFields.email.required(),
    }).required()
}

export const resetPasswordSchema = {
    body: joi.object({
            email: generalFields.email.required(),
            OTP: generalFields.OTP.required(),
            newPassword: generalFields.password.required().pattern(passwordRegex),
            confirmPassword: generalFields.password.valid(joi.ref('newPassword')).required().messages({'any.only': `"confirmPassword" does not match "newPassword'`}),
            logOutAlldevices: generalFields.logOutAlldevices
    }).required()
}

export const googleLoginSchema = {
    body: joi.object({
            token: joi.string().required(),
    }).required()
}

export const logoutSchema = {
    headers: generalFields.headerForAuthorization.required(),
}