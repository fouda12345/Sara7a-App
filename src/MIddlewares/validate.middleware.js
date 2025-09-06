import joi from "joi";
import { OTPtypes } from "../DB/Models/user/user.methods.js";
import { genders } from "../DB/Models/user/user.model.js";
import { Types } from "mongoose";

export const tokenRegex = new RegExp(`^(${process.env.ADMIN_TOKEN_BEARER_KEY}|${process.env.USER_TOKEN_BEARER_KEY}) ((?:\.?(?:[A-Za-z0-9-_]+)){3})$`);
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
export const generalFields = {
	name: joi
		.string()
		.pattern(/^[A-Z][a-z]{2,29}$/)
		.messages({
			'string.base': `"name" should be a type of 'text'`,
			'string.empty': `"name" cannot be an empty field`,
			'string.min': `"name" should have a minimum length of {#limit}`,
			'string.max': `"name" should have a maximum length of {#limit}`,
			'any.required': `"name" is a required field`
		}),
	email: joi
		.string()
		.email({ minDomainSegments: 2, maxDomainSegments: 5, tlds: { allow: ['com', 'net', 'org', 'io', 'edu', 'gov'] } })
		.messages({
			'string.base': `"email" should be a type of 'text'`,
			'string.empty': `"email" cannot be an empty field`,
			'string.email': `"email" should be a valid email`,
			'any.required': `"email" is a required field`
		}),
	password: joi
		.string()
		.messages({
			'string.base': `"password" should be a type of 'text'`,
			'string.empty': `"password" cannot be an empty field`,
			'any.required': `"password" is a required field`,
			'string.pattern.base': `"password" must contain at least 8 characters, one uppercase, one lowercase, one number and one special character`
		}),
	phone: joi
		.string()
		.pattern(/^(?:\+20|002|0|20)1[0125][0-9]{8}$/)
		.messages({
			'string.base': `"phone" should be a type of 'text'`,
			'string.empty': `"phone" cannot be an empty field`,
			'string.pattern.base': `"phone" must be a valid Egyptian phone number`,
		}),
	OTP: joi
		.string()
		.pattern(/^\d{6}$/)
		.messages({
			'string.base': `"OTP" should be a type of 'text'`,
			'string.empty': `"OTP" cannot be an empty field`,
			'any.required': `"OTP" is a required field`
		}),
	token: joi
		.string()
		.messages({
			'string.base': `"refreshToken" should be a type of 'text'`,
			'string.empty': `"refreshToken" cannot be an empty field`,
			'any.required': `"refreshToken" is a required field`
		}),
	OTPtype: joi
		.string()
		.valid(...Object.values(OTPtypes))
		.messages({
			'string.base': `"type" should be a type of 'text'`,
			'any.only': `"type" must be one of [${Object.values(OTPtypes).join(", ")}]`,
			'string.empty': `"type" cannot be an empty field`,
			'any.required': `"type" is a required field`
		}),
	logOutAlldevices: joi
		.boolean()
		.default(false)
		.messages({
			'boolean.base': `"logOutAlldevices" should be a type of 'boolean'`,
			'any.required': `"logOutAlldevices" is a required field`,
		}),
	gender: joi
		.string()
		.valid(...Object.values(genders))
		.default(genders.male)
		.messages({
			'string.base': `"gender" should be a type of 'text'`,
			'any.only': `"gender" must be one of ['male' , 'female']`,
			'string.empty': `"gender" cannot be an empty field`,
		}),
	headerForAuthorization: joi
		.object({
			authorization: joi
				.string()
				.pattern(tokenRegex)
				.messages({
					'string.base': `"refreshToken" should be a type of 'text'`,
					'string.empty': `"refreshToken" cannot be an empty field`,
					'any.required': `"refreshToken" is a required field`
				}),
		}).unknown(true),
	id: joi
		.string()
		.custom((value, helpers) => {
			return (
				Types.ObjectId.isValid(value) || helpers.error("any.invalid")
			)
		})
		.messages({
			'string.base': `"id" should be a type of 'text'`,
			'string.empty': `"id" cannot be an empty field`,
			'any.required': `"id" is a required field`,
			'any.invalid': `"id" is not a valid mongo id`,
		}),
	file: {
		fieldname: joi
			.string()
			.messages({
				'string.base': `"fieldName" should be a type of 'text'`,
				'string.empty': `"fieldName" cannot be an empty field`,
				'any.required': `"fieldName" is a required field`,
			}),
		originalname: joi
			.string()
			.messages({
				'string.base': `"originalName" should be a type of 'text'`,
				'string.empty': `"originalName" cannot be an empty field`,
				'any.required': `"originalName" is a required field`,
			}),
		mimetype: joi
			.string()
			.messages({
				'string.base': `"mimetype" should be a type of 'text'`,
				'string.empty': `"mimetype" cannot be an empty field`,
				'any.required': `"mimetype" is a required field`,
			}),
		encoding: joi
			.string()
			.messages({
				'string.base': `"encoding" should be a type of 'text'`,
				'string.empty': `"encoding" cannot be an empty field`,
				'any.required': `"encoding" is a required field`,
			}),
		size: joi
			.number()
			.positive()
			.messages({
				'number.base': `"size" should be a type of 'number'`,
				'number.empty': `"size" cannot be an empty field`,
				'any.required': `"size" is a required field`,
				'number.positive': `"size" must be a positive number`,
			}),
		path: joi
			.string()
			.messages({
				'string.base': `"path" should be a type of 'text'`,
				'string.empty': `"path" cannot be an empty field`,
				'any.required': `"path" is a required field`,
			}),
		destination: joi
			.string()
			.messages({
				'string.base': `"destination" should be a type of 'text'`,
				'string.empty': `"destination" cannot be an empty field`,
				'any.required': `"destination" is a required field`,
			}),
		finalPath: joi
			.string()
			.messages({
				'string.base': `"finalPath" should be a type of 'text'`,
				'string.empty': `"finalPath" cannot be an empty field`,
				'any.required': `"finalPath" is a required field`,
			}),
		filename: joi
			.string()
			.messages({
				'string.base': `"filename" should be a type of 'text'`,
				'string.empty': `"filename" cannot be an empty field`,
				'any.required': `"filename" is a required field`,
			}),
	}
}
export const validate = (schema) => {
	return (req, res, next) => {
		let ValidationError = {
			name: "ValidationError",
			isJoi: true,
			details: []
		};
		for (let key in schema) {
			const { error, value } = schema[key].validate(req[key], { abortEarly: false });
			if (error) {
				ValidationError.isJoi = true;
				ValidationError.details.push(...error.details);
			}
		}

		if (ValidationError.details.length) {
			return res.status(400).json({
				success: false,
				status: 400,
				error: ValidationError
			});
		}
		next();
	};
}