import type { FilterQuery, SortOrder } from "mongoose";
import type { Product } from "../../DB/models/product/product.model.js";

export interface ProductQueryOptions {
  filter: FilterQuery<Product>;
  sort: Record<string, SortOrder>;
  page: number;
  limit: number;
}
