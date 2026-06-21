import { Router } from "express";
import { profileController } from "./profile.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { asyncHandler } from "../../shared/utils/error/async.handler.js";
import { validate } from "../../middlewares/validate.js";
import {
  listProfilesQuerySchema,
  profileIdParamSchema,
  updateProfileSchema,
  updateProfileStatusSchema,
} from "./profile.validators.js";

const router = Router();

router.get(
  "/get-profile",
  authenticate,
  asyncHandler(profileController.getProfile.bind(profileController)),
);

router.patch(
  "/update-profile",
  authenticate,
  validate({ body: updateProfileSchema }),
  asyncHandler(profileController.updateProfile.bind(profileController)),
);

router.get(
  "/list-profiles",
  authenticate,
  authorize("admin"),
  validate({ query: listProfilesQuerySchema }),
  asyncHandler(profileController.listProfiles.bind(profileController)),
);

router.get(
  "/get-profile-by-id/:id",
  authenticate,
  authorize("admin"),
  validate({ params: profileIdParamSchema }),
  asyncHandler(profileController.getProfileById.bind(profileController)),
);

router.patch(
  "/update-profile-status/:id",
  authenticate,
  authorize("admin"),
  validate({ params: profileIdParamSchema, body: updateProfileStatusSchema }),
  asyncHandler(profileController.updateProfileStatus.bind(profileController)),
);

export default router;
