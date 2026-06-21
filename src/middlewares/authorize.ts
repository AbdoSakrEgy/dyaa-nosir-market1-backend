import type { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../shared/utils/error/app.error.js";
import { AuthPayload } from "../shared/types/jwt.types.js";
import { RoleModel } from "../DB/models/user/role.model.js";
import type { UserRole } from "../shared/types/shared.types.js";
/**
 * Role-based authorization middleware factory.
 *
 * Usage:
 *   router.delete("/products/:id", authenticate, authorize("admin"), handler);
 *
 * Design: Higher-order function (factory pattern) returns a middleware closure
 * that has access to the allowed roles via closure scope.
 * This is more flexible and composable than a single middleware with hardcoded roles.
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const payload = (req as any).payload as AuthPayload;

      if (!payload?.roleId) {
        throw new ForbiddenError(
          "Authentication required before authorization",
        );
      }

      const role = await RoleModel.findById(payload.roleId).lean();

      if (!role?.isActive) {
        throw new ForbiddenError(
          "Role is not authorized to access this resource",
        );
      }

      if (!allowedRoles.includes(role.slug)) {
        throw new ForbiddenError(
          `Role '${role.slug}' is not authorized to access this resource`,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
