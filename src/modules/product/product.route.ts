import { Router } from "express";
import { productController } from "./product.controller.js";
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
  createProductSchema,
  listProductsManagementQuerySchema,
  listProductsQuerySchema,
  productIdParamSchema,
  productIdentifierParamSchema,
  updateProductSchema,
} from "./product.validators.js";

const router = Router();

router.get(
  "/get-all",
  validate({ query: listProductsQuerySchema }),
  asyncHandler(productController.getAll.bind(productController)),
);

router.get(
  "/get-all-for-management",
  authenticate,
  authorize("admin"),
  validate({ query: listProductsManagementQuerySchema }),
  asyncHandler(productController.getAllForManagement.bind(productController)),
);

router.get(
  "/get-by-identifier/:identifier",
  validate({ params: productIdentifierParamSchema }),
  asyncHandler(productController.getByIdentifier.bind(productController)),
);

router.post(
  "/create",
  authenticate,
  authorize("admin"),
  multerUpload({
    sendedFileType: FileType.image,
    storeIn: StoreInEnum.memory,
  }).array("images", 20),
  parseMultipartJson,
  validate({ body: createProductSchema }),
  asyncHandler(productController.create.bind(productController)),
);

router.patch(
  "/update/:id",
  authenticate,
  authorize("admin"),
  multerUpload({
    sendedFileType: FileType.image,
    storeIn: StoreInEnum.memory,
  }).array("images", 20),
  parseMultipartJson,
  validate({ params: productIdParamSchema, body: updateProductSchema }),
  asyncHandler(productController.update.bind(productController)),
);

router.delete(
  "/delete/:id",
  authenticate,
  authorize("admin"),
  validate({ params: productIdParamSchema }),
  asyncHandler(productController.delete.bind(productController)),
);

export default router;
