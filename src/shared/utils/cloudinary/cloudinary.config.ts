import { v2 as cloudinary } from "cloudinary";
import { env } from "../../../config/env.js";

export const cloudinaryConfig = () => {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME as string,
    api_key: env.CLOUDINARY_API_KEY as string,
    api_secret: env.CLOUDINARY_API_SECRET as string,
    secure: true,
  });
  return cloudinary;
};
