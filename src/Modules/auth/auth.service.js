import { providerTypes, UserModel } from "../../DB/Models/user/user.model.js";
import * as DBservices from "../../DB/DBservices.js";


import successResponse from "../../Utils/handlers/successResponse.utils.js";
import { createToken, Tokens } from "../../Utils/encryption/jwt.utils.js";
import { OTPtypes } from "../../DB/Models/user/user.methods.js";
import { verifyGoogleLogin } from "../../Utils/socialLogin/googleLogin.utils.js";
import { nanoid } from "nanoid";
import { tokenModel } from "../../DB/Models/token/token.model.js";

export const getNewLoginCredentials = async (user) => {
    const jwtid = nanoid();
    const accessToken = await createToken(
        {
            data: { _id: user.id },
            tokenType: Tokens[user.role].ACCESS,
        }
    );
    const refreshToken = await createToken(
        {
            data: { _id: user.id },
            tokenType: Tokens[user.role].REFRESH,
        }
    );
    return { accessToken, refreshToken };
};

export const register = async (req, res, next) => {
    const {email} = req.body;
    const isExist = await DBservices.findOne(
        {
            model: UserModel,
            filter: {
                email
            }
        })

    if (isExist) {
        return next(new Error("User already exists", { cause: 400 }));
    }
    const user = (await DBservices.create({ model: UserModel, data: [{...req.body}] }))[0];

    await user.sendEmailOTP();

    successResponse({ res, status: 201, message: "User created successfully", data: {user} });
}
export const login = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await DBservices.findOne({ model: UserModel, filter: { email } });
    if (!user || !await user.checkPassword(password)) return next(new Error("Invalid Credentials", { cause: 401 }));

    if (!user.confirmEmail) {
        await user.sendEmailOTP();
        return next(new Error("Please confirm your email first", { cause: 400 }))
    };

    await user.save();

    const { accessToken, refreshToken } = await getNewLoginCredentials(user);

    successResponse({ res, status: 200, message: "User logged in successfully", data: { accessToken, refreshToken } });
}

export const logout = async (req, res, next) => {
    const user = req.user;
    if (!user) return next(new Error("User not found", { cause: 404 }));
    const decodedToken = req.decoded
    await DBservices.create({model : tokenModel , data : [{jwtid : decodedToken.jti , userId : user._id ,expiresIn: decodedToken.exp}] }) 
    successResponse({ res, status: 200, message: "User logged out successfully" });
}
export const refreshAccessToken = async (req, res, next) => {

    const user = req.user;
    if (!user) return next(new Error("Refresh token not found", { cause: 400 }));

    const { accessToken, refreshToken } = await getNewLoginCredentials(user);
    successResponse({ res, status: 200, message: "Access token refreshed successfully", data: { accessToken } });
}
export const verifyOTP = async (req, res, next) => {
    const type = req.params.type
    const { OTP, email } = req.body;
    const user = await DBservices.findOne({ model: UserModel, filter: { email } });
    if (!user) return next(new Error("User not found", { cause: 404 }));
    if (!type || !OTP) return next(new Error("Type and OTP are required", { cause: 400 }));
    if (!Object.values(OTPtypes).includes(type) || type == OTPtypes.password) return next(new Error(`Invalid type. Use ${[OTPtypes.email, OTPtypes.phone]}.`, { cause: 400 }));
    if (user["confirm" + type.charAt(0).toUpperCase() + type.slice(1)]) {
        return next(new Error("OTP already confirmed for " + type, { cause: 400 }));
    }
    if (type == "phone" && !user.confirmEmail) {
        return next(new Error("Email must be confirmed before phone verification", { cause: 400 }));
    }
    const isValid = await user.verifyOTP({ type, code: OTP });
    if (isValid instanceof Error) return next(isValid);

    if (!isValid) return next(new Error("Error verifying OTP", { cause: 500 }));

    successResponse({ res, status: 200, message: `${type} verified successfully` });
}
export const resendEmailOTP = async (req, res, next) => {
    const { email } = req.body;
    const user = await DBservices.findOne({ model: UserModel, filter: { email } });
    if (!user) return next(new Error("user not found", { cause: 404 }));

    if (user.confirmEmail) {
        return next(new Error("Email already confirmed", { cause: 400 }));
    }

    const emailSent = await user.sendEmailOTP();
    if (emailSent instanceof Error) return next(emailSent);

    successResponse({ res, status: 200, message: "Email OTP resent successfully" });
}
export const forgetPassword = async (req, res, next) => {
    const { email } = req.body;
    const user = await DBservices.findOne({ model: UserModel, filter: { email } });
    if (!user) return next(new Error("User not found", { cause: 404 }));
    if (!user.confirmEmail) {
        await user.sendEmailOTP();
        return next(new Error("Please confirm your email first", { cause: 400 }));
    }
    if (user.provider !== providerTypes.system) {
        return next(new Error(`User registered with ${user.provider}, please use ${user.provider} login`, { cause: 400 }));
    }
    const emailSent = await user.forgetPassword();
    if (emailSent instanceof Error) return next(emailSent);

    successResponse({ res, status: 200, message: "OTP sent to your email" });
}
export const resetPassword = async (req, res, next) => {
    const { email, OTP, newPassword, confirmPassword } = req.body;
    const user = await DBservices.findOne({ model: UserModel, filter: { email } });
    if (!user) return next(new Error("User not found", { cause: 404 }));

    if (!user.confirmEmail) {
        await user.sendEmailOTP();
        return next(new Error("Please confirm your email first", { cause: 400 }));
    }

    if (user.checkPassword(newPassword)) {
        return next(new Error("New password cannot be the same as old password", { cause: 400 }));
    }
    const isValid = await user.verifyOTP({ type: OTPtypes.password, code: OTP });
    if (isValid instanceof Error) return next(isValid);

    if (newPassword !== confirmPassword) return next(new Error("Passwords do not match", { cause: 400 }));

    await DBservices.findByIdAndUpdate({ model: UserModel, id: user._id, data: { password: newPassword , credentialsUpdatedAt: Date.now() } });
    
    successResponse({ res, status: 200, message: "Password reset successfully" });
}
export const googleLogin = async (req, res, next) => {
    const { idToken } = req.body;
    if (!idToken) return next(new Error("ID token is required", { cause: 400 }));
    
    const {name , email , picture , email_verified} = await verifyGoogleLogin({ idToken });
    if (!email_verified) {
        return next(new Error("Email not verified", { cause: 400 }));
    }
    let user = await DBservices.findOne({ model: UserModel, filter: { email } });
    let state = "logged in";
    if (!user) {
        user = (await DBservices.create({ model: UserModel, data: { name, email, confirmEmail: true , provider: providerTypes.google } }))[0];
        state = "registered and logged in";
    }
    else if (user.provider !== providerTypes.google) {
        return next(new Error("User already exists with a different provider", { cause: 400 }));
    }
   
    await user.save();

    const { accessToken, refreshToken } = await getNewLoginCredentials(user);

    successResponse({ res, status: 200, message: `User ${state} successfully`, data: { accessToken, refreshToken } });
}