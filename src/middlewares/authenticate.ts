import type { Request, Response, NextFunction } from "express";
import { UserModel } from "../DB/models/user/user.model.js";
import { decodeToken } from "../shared/utils/decode.token.js";
import { UnauthorizedError } from "../shared/utils/error/app.error.js";

/**
 * Authentication middleware — verifies JWT from the Authorization header.
 *
 * Flow:
 * 1. Pass authorization header to decodeToken utility
 * 2. Confirm that the account is still active
 * 3. Reject tokens issued before the latest credentials change
 * 4. Attach decoded payload to (req as any).payload
 * 5. Pass to next middleware
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const payload = decodeToken({
      authorization: req.headers.authorization as string,
    });

    // step: check user activity and credentials changing
    const user = await UserModel.findById(payload.userId)
      .select("isActive credentialsChangedAt")
      .lean();
    if (!user?.isActive) {
      throw new UnauthorizedError("Account is inactive or no longer exists");
    }
    if (
      user.credentialsChangedAt &&
      payload.iat * 1000 < user.credentialsChangedAt.getTime()
    ) {
      throw new UnauthorizedError(
        "Credentials changed after this token was issued — please log in again",
      );
    }

    (req as any).payload = payload;

    next();
  } catch (error) {
    next(error);
  }
};
