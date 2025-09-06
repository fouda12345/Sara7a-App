import { Router } from "express";
import * as userServices from "./user.service.js";
import { auth } from "../../MIddlewares/auth.middleware.js";
import { validate } from "../../MIddlewares/validate.middleware.js";
import { changePasswordSchema, deleteAccountSchema, loadProfileSchema, shareProfileSchema, updateProfileSchema, uploadCoverImageSchema, uploadProfileImageSchema, validateAuthSchema } from "./user.validation.js";
import { fileValidation, localFileUpload } from "../../Utils/multer/local.multer.js";
import { cloudFileUpload } from "../../Utils/multer/cloud.multer.js";
const router = Router();

router.patch(
    "/change-password",
    validate(changePasswordSchema),
    auth(),
    userServices.changePassword
);
router.get(
    "/get-user-profile",
    validate(loadProfileSchema),
    auth(),
    userServices.loadProfile
);
router.get(
    "/share-profile/:id",
    validate(shareProfileSchema),
    userServices.shareProfile
);
router.patch(
    "/update-profile",
    validate(updateProfileSchema),
    auth(),
    userServices.updateProfile
);
router.delete(
    "{/:targetId}/delete-account",
    validate(deleteAccountSchema),
    auth(),
    userServices.deleteAccount
);
router.patch(
    "{/:targetId}/freeze-account",
    validate(deleteAccountSchema),
    auth(),
    userServices.freezeAccount
)
router.patch(
    "{/:targetId}/restore-account",
    validate(deleteAccountSchema),
    auth(),
    userServices.freezeAccount
)
router.patch(
    "/upload-profile-image",
    validate(validateAuthSchema),
    auth(),
    cloudFileUpload({customPath : "users" , fileTypes : [...fileValidation.image]}).single("profileImage"),
    validate(uploadProfileImageSchema),
    userServices.uploadProfileImage
)
router.patch(
    "/upload-cover-images",
    validate(validateAuthSchema),
    auth(),
    cloudFileUpload({customPath : "users" , fileTypes : [...fileValidation.image]}).array("coverImages",5),
    validate(uploadCoverImageSchema),
    userServices.coverImages
)
export default router;