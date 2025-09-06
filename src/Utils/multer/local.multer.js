import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

export const fileValidation = {
  image: ['image/png', 'image/jpg', 'image/jpeg','image/webp'],
  video: ['video/mp4', 'video/mkv', 'video/avi','video/mov'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  document: [
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ],
  archive: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed']
}

export const localFileUpload = ({ customPath = "general", fileTypes=[]}) => {
  let basePath = `uploads/${customPath}`

  const fileFilter = function (req, file, cb) {
    if (fileTypes?.includes(file?.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPG, JPEG, GIF, and WEBP are allowed!' , { cause: 400 }), false);
    }
  }
  const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
      file.finalPath = basePath + `/${(req.user?.id) ? req.user.id : "guests"}`
      file.destination = path.resolve(`./src/${file.finalPath}`);

      if (!fs.existsSync(file?.destination)) {
        fs.mkdirSync(file.destination, { recursive: true });
      }

      cb(null, file.destination);
    },
    filename: function (req, file, cb) {
      let filename = file?.originalname.split(".");
      const ext = filename.pop();
      filename = filename.join(".");
      const fileCounter = String(fs.readdirSync(file.destination).length).padStart(3, '0');
      let date = new Date();
      date = `${String(date.getFullYear()).padStart(4,"0")}_${String(date.getMonth()).padStart(2,"0")}_${String(date.getDay()).padStart(2,"0")}_${String(date.getHours()).padStart(2,"0")}_${String(date.getMinutes()).padStart(2,"0")}_${String(date.getSeconds()).padStart(2,"0")}_${String(date.getMilliseconds()).padStart(3,"0")}`
      const uniqueFilename = filename + "_" + fileCounter + "_" + date + "." + ext;

      file.finalPath += `/${uniqueFilename}`

      cb(null, uniqueFilename);
    }
  });
  return multer({
    fileFilter,
    storage
  });
}