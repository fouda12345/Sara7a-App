import multer from "multer";
import { cloudinaryConfig } from "./cloudinary.js";

export const cloudFileUpload = ({fileTypes=[]}) => {
  const fileFilter = function (req, file, cb) {
    req.body.attachments = []
    if (fileTypes?.includes(file?.mimetype)) {
      req.body.attachments.push(file)
      cb(null, true);
    } else {
      cb(new Error('Invalid file type' , { cause: 400 }), false);
    }
  }
  const storage = multer.diskStorage({});
  return multer({
    fileFilter,
    storage
  });
}

export const uploadFileCloudinary = async ({file , options}) => {
  return await cloudinaryConfig().uploader.upload(file , options);
}
export const deleteFileCloudinary = async ({public_id , options}) => {
  return await cloudinaryConfig().uploader.destroy(public_id , options);
}