import type { FilterQuery, SortOrder } from "mongoose";
import type { Product } from "../../../DB/models/product/product.model.js";
import type { ListProductsQueryDTO } from "../product.validators.js";
import type { ProductQueryOptions } from "../product.types.js";

export function buildProductQuery(
  query: ListProductsQueryDTO,
  includeUnpublished: boolean,
): ProductQueryOptions {
  const page = Math.max(Number(query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(query.limit ?? 20), 1), 100);
  const filter: FilterQuery<Product> = {};

  if (includeUnpublished) {
    if (query.isPublished) filter.isPublished = query.isPublished === "true";
    if (query.isActive) filter.isActive = query.isActive === "true";
  } else {
    filter.isPublished = true;
    filter.isActive = true;
  }

  if (query.categoryId) filter.categoryId = query.categoryId;
  if (query.brandId) filter.brandId = query.brandId;
  if (query.type) filter.type = query.type;
  if (query.stockStatus) filter.stockStatus = query.stockStatus;
  if (query.condition) filter.condition = query.condition;
  if (query.isFeatured) filter.isFeatured = query.isFeatured === "true";

  if (query.minPrice || query.maxPrice) {
    filter.price = {
      ...(query.minPrice && { $gte: Number(query.minPrice) }),
      ...(query.maxPrice && { $lte: Number(query.maxPrice) }),
    };
  }

  if (query.search) {
    const keyword = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { "name.ar": { $regex: keyword, $options: "i" } },
      { "name.en": { $regex: keyword, $options: "i" } },
      { sku: { $regex: keyword, $options: "i" } },
      { "tags.ar": { $regex: keyword, $options: "i" } },
      { "tags.en": { $regex: keyword, $options: "i" } },
    ];
  }

  const sortOptions: Record<string, Record<string, SortOrder>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    name_asc: { "name.en": 1 },
    name_desc: { "name.en": -1 },
  };
  const sort = sortOptions[query.sort ?? "newest"] ?? { createdAt: -1 };

  return { filter, sort, page, limit };
}
