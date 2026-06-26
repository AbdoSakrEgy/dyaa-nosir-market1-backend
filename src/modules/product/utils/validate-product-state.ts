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
    throw new BadRequestError("product.discountPriceTooHigh");
  }

  if (stockStatus === ProductStockStatus.inStock && stockQuantity === 0) {
    throw new BadRequestError("product.inStockQuantityRequired");
  }

  if (stockStatus === ProductStockStatus.outOfStock && stockQuantity > 0) {
    throw new BadRequestError("product.outOfStockQuantityForbidden");
  }
}
