import { Router } from "express";
import { productController } from "./product.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../shared/utils/error/async.handler.js";
import {
  createProductSchema,
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
  validate({ query: listProductsQuerySchema }),
  asyncHandler(
    productController.getAllForManagement.bind(productController),
  ),
);
router.post(
  "/create",
  authenticate,
  authorize("admin"),
  validate({ body: createProductSchema }),
  asyncHandler(productController.create.bind(productController)),
);
router.patch(
  "/update/:id",
  authenticate,
  authorize("admin"),
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
router.get(
  "/get-by-identifier/:identifier",
  validate({ params: productIdentifierParamSchema }),
  asyncHandler(productController.getByIdentifier.bind(productController)),
);

export default router;
