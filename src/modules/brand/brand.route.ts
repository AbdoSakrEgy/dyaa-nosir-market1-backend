import { Router } from "express";
import { brandController } from "./brand.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../shared/utils/error/async.handler.js";
import { multerUpload } from "../../middlewares/multer.upload.js";
import { parseMultipartJson } from "../../middlewares/parse.multipart.json.js";
import {
  FileType,
  StoreInEnum,
} from "../../shared/types/multer.upload.types.js";
import {
  brandIdParamSchema,
  brandIdentifierParamSchema,
  createBrandSchema,
  listBrandsManagementQuerySchema,
  listBrandsQuerySchema,
  updateBrandSchema,
} from "./brand.validators.js";

const router = Router();

router.get(
  "/get-all",
  validate({ query: listBrandsQuerySchema }),
  asyncHandler(brandController.getAll.bind(brandController)),
);

router.get(
  "/get-all-for-management",
  authenticate,
  authorize("admin"),
  validate({ query: listBrandsManagementQuerySchema }),
  asyncHandler(brandController.getAllForManagement.bind(brandController)),
);

router.get(
  "/get-by-identifier/:identifier",
  validate({ params: brandIdentifierParamSchema }),
  asyncHandler(brandController.getByIdentifier.bind(brandController)),
);

router.post(
  "/create",
  authenticate,
  authorize("admin"),
  multerUpload({
    sendedFileType: FileType.image,
    storeIn: StoreInEnum.memory,
  }).single("logo"),
  parseMultipartJson,
  validate({ body: createBrandSchema }),
  asyncHandler(brandController.create.bind(brandController)),
);

router.patch(
  "/update/:id",
  authenticate,
  authorize("admin"),
  multerUpload({
    sendedFileType: FileType.image,
    storeIn: StoreInEnum.memory,
  }).single("logo"),
  parseMultipartJson,
  validate({ params: brandIdParamSchema, body: updateBrandSchema }),
  asyncHandler(brandController.update.bind(brandController)),
);

router.delete(
  "/delete/:id",
  authenticate,
  authorize("admin"),
  validate({ params: brandIdParamSchema }),
  asyncHandler(brandController.delete.bind(brandController)),
);

export default router;
