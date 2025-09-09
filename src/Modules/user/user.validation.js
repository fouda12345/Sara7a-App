import joi from 'joi';
import { generalFields, passwordRegex } from '../../MIddlewares/validate.middleware.js';
import { fileValidation } from '../../Utils/multer/local.multer.js';

export const loadProfileSchema = {
	headers: generalFields.headerForAuthorization.required(),
}

export const changePasswordSchema = {
	headers: generalFields.headerForAuthorization.required(),
	body: joi.object({
		currentPassword: generalFields.password.required(),
		newPassword: generalFields.password.required().pattern(passwordRegex),
		confirmPassword: generalFields.password.valid(joi.ref('newPassword')).required().messages({ 'any.only': `"confirmPassword" does not match "newPassword'` }),
		logOutAlldevices: generalFields.logOutAlldevices
	}).required()
}
export const shareProfileSchema = {
	params: joi.object({
		id: generalFields.id.required(),
	}).required(),
}

export const updateProfileSchema = {
	headers: generalFields.headerForAuthorization.required(),
	body: joi.object({
		firstName: generalFields.name,
		middleName: generalFields.name,
		lastName: generalFields.name,
		gender: generalFields.gender,
	})
}

export const deleteAccountSchema = {
	headers: generalFields.headerForAuthorization.required(),
	params: joi.object({
		targetId: generalFields.id,
	}),
	body: joi.object({
		password: generalFields.password.required(),
	}).required()
}

export const validateAuthSchema = {
	headers: generalFields.headerForAuthorization.required(),
}

export const uploadProfileImageSchema = {
	headers: generalFields.headerForAuthorization.required(),
	file: joi.object({
		fieldname: generalFields.file.fieldname.valid("profileImage").required(),
		originalname: generalFields.file.originalname.required(),
		mimetype: generalFields.file.mimetype.valid(...fileValidation.image).required(),
		encoding: generalFields.file.encoding.required(),
		size: generalFields.file.size.max(5 * 1024 * 1024).required(),
		destination: generalFields.file.destination.required(),
		filename: generalFields.file.filename.required(),
		path: generalFields.file.path.required(),
		finalPath: generalFields.file.finalPath
		// .required(),
	}).required()
}

export const uploadCoverImageSchema = {
	headers: generalFields.headerForAuthorization.required(),
	files: joi
			.array()
			.items(
				joi.object({
					fieldname: generalFields.file.fieldname.valid("coverImages").required(),
					originalname: generalFields.file.originalname.required(),
					mimetype: generalFields.file.mimetype.valid(...fileValidation.image).required(),
					encoding: generalFields.file.encoding.required(),
					size: generalFields.file.size.max(5 * 1024 * 1024).required(),
					destination: generalFields.file.destination.required(),
					filename: generalFields.file.filename.required(),
					path: generalFields.file.path.required(),
					finalPath: generalFields.file.finalPath
					// .required(),
				}).required()
			)
			.min(1)
			.max(5)
			.required()
}