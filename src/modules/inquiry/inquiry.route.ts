import { Router } from "express";
import { inquiryController } from "./inquiry.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { limitCreateInquiryRequests } from "../../middlewares/limit.requests.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../shared/utils/error/async.handler.js";
import {
  createInquirySchema,
  inquiryIdParamSchema,
  listInquiriesQuerySchema,
  updateInquirySchema,
} from "./inquiry.validators.js";

const router = Router();

router.post(
  "/create",
  limitCreateInquiryRequests,
  validate({ body: createInquirySchema }),
  asyncHandler(inquiryController.create.bind(inquiryController)),
);
router.get(
  "/get-all",
  authenticate,
  authorize("admin"),
  validate({ query: listInquiriesQuerySchema }),
  asyncHandler(inquiryController.getAll.bind(inquiryController)),
);
router.get(
  "/get-by-id/:id",
  authenticate,
  authorize("admin"),
  validate({ params: inquiryIdParamSchema }),
  asyncHandler(inquiryController.getById.bind(inquiryController)),
);
router.patch(
  "/update/:id",
  authenticate,
  authorize("admin"),
  validate({ params: inquiryIdParamSchema, body: updateInquirySchema }),
  asyncHandler(inquiryController.update.bind(inquiryController)),
);

export default router;
