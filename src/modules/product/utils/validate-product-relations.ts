import { BrandModel } from "../../../DB/models/product/brand.model.js";
import { CategoryModel } from "../../../DB/models/product/category.model.js";
import { NotFoundError } from "../../../shared/utils/error/app.error.js";

export async function validateProductRelations(
  categoryId?: string,
  brandId?: string | null,
): Promise<void> {
  const [category, brand] = await Promise.all([
    categoryId
      ? CategoryModel.exists({ _id: categoryId, isActive: true })
      : Promise.resolve(true),
    brandId
      ? BrandModel.exists({ _id: brandId, isActive: true })
      : Promise.resolve(true),
  ]);

  if (!category) throw new NotFoundError("resource.activeCategory");
  if (!brand) throw new NotFoundError("resource.activeBrand");
}
