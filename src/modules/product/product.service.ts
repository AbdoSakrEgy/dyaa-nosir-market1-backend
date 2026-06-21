import mongoose from "mongoose";
import { ProductModel } from "../../DB/models/product/product.model.js";
import { ProductStockStatus } from "../../shared/types/catalog.types.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../shared/utils/error/app.error.js";
import {
  destroyManyFiles,
  extractPublicIdFromUrl,
  uploadManyBuffers,
} from "../../shared/utils/cloudinary/cloudinary.service.js";
import type {
  CreateProductDTO,
  ListProductsQueryDTO,
  UpdateProductDTO,
} from "./product.validators.js";
import { buildProductQuery } from "./utils/build-product-query.js";
import { validateProductRelations } from "./utils/validate-product-relations.js";
import { validateProductState } from "./utils/validate-product-state.js";

export class ProductService {
  // ============================ getAll ============================
  async getAll(query: ListProductsQueryDTO, includeUnpublished = false) {
    // step: build catalog query
    const { filter, sort, page, limit } = buildProductQuery(
      query,
      includeUnpublished,
    );

    // step: retrieve products and count
    const [products, totalItems] = await Promise.all([
      ProductModel.find(filter)
        .populate("categoryId", "name slug")
        .populate("brandId", "name slug")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ProductModel.countDocuments(filter),
    ]);

    // step: result
    return {
      products,
      meta: {
        totalItems,
        itemCount: products.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  // ============================ getAllForManagement ============================
  async getAllForManagement(query: ListProductsQueryDTO) {
    // step: retrieve products with management visibility
    return this.getAll(query, true);
  }

  // ============================ getByIdentifier ============================
  async getByIdentifier(identifier: string) {
    // step: find published product by id or slug
    const identifierFilter = mongoose.isValidObjectId(identifier)
      ? { _id: identifier }
      : { slug: identifier.toLowerCase() };
    const product = await ProductModel.findOne({
      ...identifierFilter,
      isPublished: true,
      isActive: true,
    })
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug")
      .lean();

    if (!product) throw new NotFoundError("Product");

    // step: result
    return product;
  }

  // ============================ create ============================
  async create(data: CreateProductDTO, imageFiles?: Express.Multer.File[]) {
    // step: protect slug and SKU uniqueness
    const [slugOwner, skuOwner] = await Promise.all([
      ProductModel.exists({ slug: data.slug }),
      ProductModel.exists({ sku: data.sku }),
    ]);
    if (slugOwner) throw new ConflictError("Product slug is already used");
    if (skuOwner) throw new ConflictError("Product SKU is already used");

    // step: validate catalog relations
    await validateProductRelations(data.categoryId, data.brandId);

    // step: validate pricing and stock state
    const stockStatus =
      data.stockStatus ??
      ((data.stockQuantity ?? 0) > 0
        ? ProductStockStatus.inStock
        : ProductStockStatus.outOfStock);
    validateProductState({
      price: data.price,
      discountPrice: data.discountPrice,
      stockQuantity: data.stockQuantity ?? 0,
      stockStatus,
    });

    // step: upload the supplied product images
    const productData: Record<string, unknown> = { ...data };
    let uploadedPublicIds: string[] = [];
    if (imageFiles?.length) {
      const uploadedImages = await uploadManyBuffers({
        fileBufferArr: imageFiles.map((file) => file.buffer),
        storagePathOnCloudinary: "products",
      });
      productData["images"] = uploadedImages.map((image) => image.secure_url);
      uploadedPublicIds = uploadedImages.map((image) => image.public_id);
    }

    // step: create product and roll back new uploads on failure
    try {
      return await ProductModel.create({
        ...productData,
        stockStatus,
      });
    } catch (error) {
      if (uploadedPublicIds.length) {
        await destroyManyFiles({ public_ids: uploadedPublicIds }).catch(
          () => undefined,
        );
      }
      throw error;
    }
  }

  // ============================ update ============================
  async update(
    id: string,
    data: UpdateProductDTO,
    imageFiles?: Express.Multer.File[],
  ) {
    // step: require a body field or uploaded images
    if (Object.keys(data).length === 0 && !imageFiles?.length) {
      throw new BadRequestError("At least one product field is required");
    }

    // step: retrieve existing product
    const existing = await ProductModel.findById(id).lean();
    if (!existing) throw new NotFoundError("Product");

    // step: protect slug and SKU uniqueness
    const [slugOwner, skuOwner] = await Promise.all([
      data.slug
        ? ProductModel.exists({ slug: data.slug, _id: { $ne: id } })
        : Promise.resolve(false),
      data.sku
        ? ProductModel.exists({ sku: data.sku, _id: { $ne: id } })
        : Promise.resolve(false),
    ]);
    if (slugOwner) throw new ConflictError("Product slug is already used");
    if (skuOwner) throw new ConflictError("Product SKU is already used");

    // step: validate changed catalog relations
    await validateProductRelations(data.categoryId, data.brandId);

    // step: validate resulting pricing and stock state
    validateProductState({
      price: data.price ?? existing.price,
      discountPrice:
        data.discountPrice === null
          ? undefined
          : (data.discountPrice ?? existing.discountPrice),
      stockQuantity: data.stockQuantity ?? existing.stockQuantity,
      stockStatus: data.stockStatus ?? existing.stockStatus,
    });

    // step: upload the supplied product images
    let uploadedPublicIds: string[] = [];
    let uploadedImageUrls: string[] | undefined;
    if (imageFiles?.length) {
      const uploadedImages = await uploadManyBuffers({
        fileBufferArr: imageFiles.map((file) => file.buffer),
        storagePathOnCloudinary: "products",
      });
      uploadedImageUrls = uploadedImages.map((image) => image.secure_url);
      uploadedPublicIds = uploadedImages.map((image) => image.public_id);
    }

    // step: prepare nullable fields
    const update: Record<string, unknown> = { ...data };
    if (data.brandId === null) delete update["brandId"];
    if (data.discountPrice === null) delete update["discountPrice"];
    if (data.warranty === null) delete update["warranty"];
    if (uploadedImageUrls) update["images"] = uploadedImageUrls;

    // step: apply product changes
    const unset = {
      ...(data.brandId === null && { brandId: 1 }),
      ...(data.discountPrice === null && { discountPrice: 1 }),
      ...(data.warranty === null && { warranty: 1 }),
    };
    let product;
    try {
      product = await ProductModel.findByIdAndUpdate(
        id,
        {
          $set: update,
          ...(Object.keys(unset).length > 0 && { $unset: unset }),
        },
        { new: true, runValidators: true },
      );
    } catch (error) {
      if (uploadedPublicIds.length) {
        await destroyManyFiles({ public_ids: uploadedPublicIds }).catch(
          () => undefined,
        );
      }
      throw error;
    }

    if (!product) {
      if (uploadedPublicIds.length) {
        await destroyManyFiles({ public_ids: uploadedPublicIds }).catch(
          () => undefined,
        );
      }
      throw new NotFoundError("Product");
    }

    // step: remove replaced Cloudinary images
    if (uploadedImageUrls) {
      const oldPublicIds = existing.images
        .map((image) => extractPublicIdFromUrl(image))
        .filter((publicId): publicId is string => publicId !== null);
      if (oldPublicIds.length) {
        await destroyManyFiles({ public_ids: oldPublicIds }).catch(
          () => undefined,
        );
      }
    }

    // step: result
    return product;
  }

  // ============================ delete ============================
  async delete(id: string): Promise<void> {
    // step: archive product without removing order references
    const product = await ProductModel.findByIdAndUpdate(id, {
      $set: { isActive: false, isPublished: false },
    });

    if (!product) throw new NotFoundError("Product");
  }
}

export const productService = new ProductService();
