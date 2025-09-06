import { Router } from "express";
import * as authServices from "./auth.service.js";
import { auth } from "../../MIddlewares/auth.middleware.js";
import { validate } from "../../MIddlewares/validate.middleware.js";
import { forgetPasswordSchema, googleLoginSchema, loginSchema, logoutSchema, refreshTokenSchema, registerSchema, resendEmailOTPSchema, resetPasswordSchema, verifyOTPSchema } from "./auth.validation.js";
const router = Router();

router.post("/register" , validate(registerSchema), authServices.register);

router.post("/login" , validate(loginSchema) , authServices.login);

router.post("/logout" , validate(logoutSchema) , auth(), authServices.logout);

router.patch("/refresh-token", validate(refreshTokenSchema), auth({REFRESH : true}), authServices.refreshAccessToken);

router.post("/resend-email-otp", validate(resendEmailOTPSchema) , authServices.resendEmailOTP);

router.post("/verify-otp/:type",validate(verifyOTPSchema), authServices.verifyOTP);

router.post("/forget-password", validate(forgetPasswordSchema),authServices.forgetPassword);

router.patch("/reset-password", validate(resetPasswordSchema),authServices.resetPassword);

router.post("/google-login", validate(googleLoginSchema),authServices.googleLogin);

export default router;