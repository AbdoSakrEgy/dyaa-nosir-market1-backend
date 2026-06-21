export enum StoreInEnum {
  disk = "disk",
  memory = "memory",
}

export const FileType = {
  image: ["image/jpg", "image/jpeg", "image/png", "image/webp"],
  video: ["video/mp4", "video/webm"],
};

export interface MulterUploadOptions {
  sendedFileDest?: string;
  sendedFileType?: string[];
  storeIn?: StoreInEnum;
}
