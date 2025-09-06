
import { compareHash, hashData } from "../../../Utils/encryption/hashing.utils.js";
import { createOTP } from "../../../Utils/userVerification/createOTP.utils.js";
import { emailEvent } from "../../../Utils/userVerification/sendEmail/emailEvent.utils.js";

export const OTPtypes = {
    email: "email", 
    phone: "phone",
    password: "password"
};

Object.freeze(OTPtypes);

export const userMethods = {
    checkPassword: function (password) {
        return compareHash(password, this.password);
    },
    genOTP: async function ({ type }) {
        if (!Object.values(OTPtypes).includes(type)) {
            return new Error(`Invalid OTP type. Use ${Object.values(OTPtypes)}.`, { cause: 400 });
        }

        if (type !== OTPtypes.email && !this.confirmEmail) {
            return new Error("Must verify the email first", { cause: 400 });
        }

        let currentOTP = this[type + "OTP"] && this[type + "OTP"] || false;

        if (currentOTP && currentOTP.expiresIn > Date.now()) {
            return new Error("OTP already exists and is still valid.", { cause: 400 });
        }

        const code = createOTP();
        this[type + "OTP"] = {
            code : hashData(code)   ,
            createdAt: Date.now(),
            expiresIn: Date.now() + Number(process.env.OTP_EXPIRY_TIME) * 60 * 1000
        };
        await this.save();
        
        return code;
    },
    verifyOTP: async function ({ type, code = "" }) {
        if (!Object.values(OTPtypes).includes(type)) {
            return new Error(`Invalid OTP type. Use ${Object.values(OTPtypes)}.`, { cause: 400 });
        }
        if (type !== OTPtypes.email && !this.confirmEmail) {
            return new Error("Must verify the email first", { cause: 400 });
        }
        const currentOTP = this[type + "OTP"]?.code && this[type + "OTP"] || false;
        
        if (!currentOTP || !compareHash(code, currentOTP.code) || currentOTP.expiresIn < Date.now()) {
            return new Error("Invalid OTP / OTP expired", { cause: 400 });
        }
        switch (type) {
            case OTPtypes.password:
                break;
            default:
                this["confirm" + type.charAt(0).toUpperCase() + type.slice(1)] = true;
                break;
        }
        await this.updateOne({ $unset: { [type + "OTP"]: 1 } });

        await this.save();
        return true;
    },
    sendEmailOTP: async function () {
        const code = await this.genOTP({ type: OTPtypes.email });
        if (code instanceof Error) return code;

        emailEvent.emit("confirmEmail", {
            email: this.email,
            code: code,
            name: this.name,
        });

        return true;
    },
    forgetPassword: async function () {
        const code = await this.genOTP({ type: OTPtypes.password });
        if (code instanceof Error) return code;

        emailEvent.emit("foegetPassword", {
            email: this.email,            
            code: code,
            name: this.name,
        });
        await this.save();
        return true;
    },
}