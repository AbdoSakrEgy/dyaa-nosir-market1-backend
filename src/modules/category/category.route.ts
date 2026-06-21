import { Router } from "express";
import { categoryController } from "./category.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../shared/utils/error/async.handler.js";
import {
  categoryIdParamSchema,
  categoryIdentifierParamSchema,
  createCategorySchema,
  listCategoriesQuerySchema,
  updateCategorySchema,
} from "./category.validators.js";

const router = Router();

router.get(
  "/get-all",
  validate({ query: listCategoriesQuerySchema }),
  asyncHandler(categoryController.getAll.bind(categoryController)),
);
router.get(
  "/get-tree",
  asyncHandler(categoryController.getTree.bind(categoryController)),
);
router.get(
  "/get-all-for-management",
  authenticate,
  authorize("admin"),
  validate({ query: listCategoriesQuerySchema }),
  asyncHandler(
    categoryController.getAllForManagement.bind(categoryController),
  ),
);
router.post(
  "/create",
  authenticate,
  authorize("admin"),
  validate({ body: createCategorySchema }),
  asyncHandler(categoryController.create.bind(categoryController)),
);
router.patch(
  "/update/:id",
  authenticate,
  authorize("admin"),
  validate({ params: categoryIdParamSchema, body: updateCategorySchema }),
  asyncHandler(categoryController.update.bind(categoryController)),
);
router.delete(
  "/delete/:id",
  authenticate,
  authorize("admin"),
  validate({ params: categoryIdParamSchema }),
  asyncHandler(categoryController.delete.bind(categoryController)),
);
router.get(
  "/get-by-identifier/:identifier",
  validate({ params: categoryIdentifierParamSchema }),
  asyncHandler(categoryController.getByIdentifier.bind(categoryController)),
);

export default router;
