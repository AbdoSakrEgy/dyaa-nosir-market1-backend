import { ProductStockStatus } from "../../../shared/types/catalog.types.js";
import { BadRequestError } from "../../../shared/utils/error/app.error.js";

export function validateProductState({
  price,
  discountPrice,
  stockQuantity,
  stockStatus,
}: {
  price: number;
  discountPrice?: number | null;
  stockQuantity: number;
  stockStatus: ProductStockStatus;
}): void {
  if (discountPrice !== undefined && discountPrice !== null && discountPrice > price) {
    throw new BadRequestError("Discount price cannot exceed the regular price");
  }

  if (stockStatus === ProductStockStatus.inStock && stockQuantity === 0) {
    throw new BadRequestError("An in-stock product must have available quantity");
  }

  if (stockStatus === ProductStockStatus.outOfStock && stockQuantity > 0) {
    throw new BadRequestError("An out-of-stock product cannot have available quantity");
  }
}
