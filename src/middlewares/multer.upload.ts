import multer from "multer";
import { Request } from "express";
import fs from "fs";
import { AppError } from "../shared/utils/error/app.error.js";
import { HttpStatusCode } from "../shared/utils/response/http.status.code.js";
import {
  FileType,
  MulterUploadOptions,
  StoreInEnum,
} from "../shared/types/multer.upload.types.js";

export const multerUpload = ({
  sendedFileDest = "general",
  sendedFileType = FileType.image,
  storeIn = StoreInEnum.memory,
}: MulterUploadOptions): multer.Multer => {
  const storage =
    storeIn == StoreInEnum.memory
      ? multer.memoryStorage()
      : multer.diskStorage({
          // destination: (req: any, file, cb) => {
          //   const fullDest = `uploads/${sendedFileDest}/${req.user._id}`;
          //   if (!fs.existsSync(fullDest)) {
          //     fs.mkdirSync(fullDest, { recursive: true });
          //   }
          //   cb(null, fullDest);
          // },
          // filename: (req: any, file, cb) => {
          //   cb(null, `${file.originalname}`);
          // },
        });

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: CallableFunction,
  ) => {
    if (
      file.size > 200 * 1024 * 1024 &&
      storeIn == StoreInEnum.memory
    ) {
      return cb(
        new AppError("Use disk not memory", HttpStatusCode.BAD_REQUEST),
        false,
      );
    } else if (!sendedFileType.includes(file.mimetype)) {
      return cb(
        new AppError("Invalid file format", HttpStatusCode.BAD_REQUEST),
        false,
      );
    }
    cb(null, true);
  };
  return multer({ storage, fileFilter });
};
