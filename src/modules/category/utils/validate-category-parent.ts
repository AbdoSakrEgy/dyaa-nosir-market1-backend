import { CategoryModel } from "../../../DB/models/product/category.model.js";
import {
  BadRequestError,
  NotFoundError,
} from "../../../shared/utils/error/app.error.js";

export async function validateCategoryParent(
  parentId: string,
  categoryId?: string,
): Promise<void> {
  if (categoryId && parentId === categoryId) {
    throw new BadRequestError("category.parentSelf");
  }

  let current = await CategoryModel.findById(parentId)
    .select("parentId isActive")
    .lean();

  if (!current || !current.isActive) {
    throw new NotFoundError("resource.parentCategory");
  }

  while (current?.parentId) {
    if (categoryId && String(current.parentId) === categoryId) {
      throw new BadRequestError("category.hierarchyCycle");
    }

    current = await CategoryModel.findById(current.parentId)
      .select("parentId isActive")
      .lean();
  }
}
