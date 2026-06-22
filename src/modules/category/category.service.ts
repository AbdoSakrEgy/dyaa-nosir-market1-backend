import mongoose, { type FilterQuery, type SortOrder } from "mongoose";
import {
  CategoryModel,
  type Category,
} from "../../DB/models/product/category.model.js";
import { ProductModel } from "../../DB/models/product/product.model.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../shared/utils/error/app.error.js";
import {
  destroySingleFile,
  extractPublicIdFromUrl,
  uploadSingleBuffer,
} from "../../shared/utils/cloudinary/cloudinary.service.js";
import type {
  CreateCategoryDTO,
  ListCategoriesManagementQueryDTO,
  ListCategoriesQueryDTO,
  UpdateCategoryDTO,
} from "./category.validators.js";
import { buildCategoryTree } from "./utils/build-category-tree.js";
import { validateCategoryParent } from "./utils/validate-category-parent.js";

export class CategoryService {
  // ============================ getAll ============================
  async getAll(query: ListCategoriesQueryDTO) {
    // step: build allow-listed filters
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 20), 1), 100);
    const filter: FilterQuery<Category> = { isActive: true };

    if (query.parentId === "root") filter.parentId = { $exists: false };
    else if (query.parentId) filter.parentId = query.parentId;
    if (query.search) {
      const keyword = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { "name.ar": { $regex: keyword, $options: "i" } },
        { "name.en": { $regex: keyword, $options: "i" } },
        { slug: { $regex: keyword, $options: "i" } },
      ];
    }
    const sortOptions: Record<string, Record<string, SortOrder>> = {
      created_at_asc: { createdAt: 1 },
      created_at_desc: { createdAt: -1 },
      updated_at_asc: { updatedAt: 1 },
      updated_at_desc: { updatedAt: -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      name_asc: { "name.en": 1 },
      name_desc: { "name.en": -1 },
    };
    const sort = sortOptions[query.sort ?? "name_asc"] ?? { "name.en": 1 };

    // step: retrieve categories and count
    const [categories, totalItems] = await Promise.all([
      CategoryModel.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CategoryModel.countDocuments(filter),
    ]);

    // step: result
    return {
      categories,
      meta: {
        totalItems,
        itemCount: categories.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  // ============================ getAllForManagement ============================
  async getAllForManagement(query: ListCategoriesManagementQueryDTO) {
    // step: build allow-listed filters
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 20), 1), 100);
    const filter: FilterQuery<Category> = {};

    if (query.isActive) filter.isActive = query.isActive === "true";
    if (query.parentId === "root") filter.parentId = { $exists: false };
    else if (query.parentId) filter.parentId = query.parentId;
    if (query.search) {
      const keyword = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { "name.ar": { $regex: keyword, $options: "i" } },
        { "name.en": { $regex: keyword, $options: "i" } },
        { slug: { $regex: keyword, $options: "i" } },
      ];
    }
    const sortOptions: Record<string, Record<string, SortOrder>> = {
      created_at_asc: { createdAt: 1 },
      created_at_desc: { createdAt: -1 },
      updated_at_asc: { updatedAt: 1 },
      updated_at_desc: { updatedAt: -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      name_asc: { "name.en": 1 },
      name_desc: { "name.en": -1 },
    };
    const sort = sortOptions[query.sort ?? "name_asc"] ?? { "name.en": 1 };

    // step: retrieve categories and count
    const [categories, totalItems] = await Promise.all([
      CategoryModel.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CategoryModel.countDocuments(filter),
    ]);

    // step: result
    return {
      categories,
      meta: {
        totalItems,
        itemCount: categories.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  // ============================ getTree ============================
  async getTree() {
    // step: retrieve active categories
    const categories = await CategoryModel.find({ isActive: true })
      .sort({ "name.en": 1 })
      .lean();

    // step: build hierarchy
    return buildCategoryTree(
      categories as unknown as Array<Record<string, unknown>>,
    );
  }

  // ============================ getByIdentifier ============================
  async getByIdentifier(identifier: string) {
    // step: find category by id or slug
    const identifierFilter = mongoose.isValidObjectId(identifier)
      ? { _id: identifier }
      : { slug: identifier.toLowerCase() };
    const category = await CategoryModel.findOne({
      ...identifierFilter,
      isActive: true,
    }).lean();

    if (!category) throw new NotFoundError("Category");

    // step: result
    return category;
  }

  // ============================ create ============================
  async create(data: CreateCategoryDTO, imageFile?: Express.Multer.File) {
    // step: normalize slug
    data.slug = data.slug.toLowerCase();

    // step: protect slug uniqueness
    const duplicate = await CategoryModel.exists({ slug: data.slug });
    if (duplicate) throw new ConflictError("Category slug is already used");

    // step: validate parent category
    if (data.parentId) await validateCategoryParent(data.parentId);

    // step: upload the supplied image
    const categoryData: Record<string, unknown> = { ...data };
    let uploadedPublicId: string | undefined;
    if (imageFile) {
      const uploadedImage = await uploadSingleBuffer({
        fileBuffer: imageFile.buffer,
        storagePathOnCloudinary: "categories",
      });
      categoryData["image"] = uploadedImage.secure_url;
      uploadedPublicId = uploadedImage.public_id;
    }

    // step: create category and roll back a new upload on failure
    try {
      return await CategoryModel.create(categoryData);
    } catch (error) {
      if (uploadedPublicId) {
        await destroySingleFile({ public_id: uploadedPublicId }).catch(
          () => undefined,
        );
      }
      throw error;
    }
  }

  // ============================ update ============================
  async update(
    id: string,
    data: UpdateCategoryDTO,
    imageFile?: Express.Multer.File,
  ) {
    // step: require a body field or uploaded image
    if (Object.keys(data).length === 0 && !imageFile) {
      throw new BadRequestError("At least one category field is required");
    }

    // step: confirm category exists
    const existing = await CategoryModel.findById(id).lean();
    if (!existing) throw new NotFoundError("Category");

    // step: normalize slug
    if (data.slug) {
      data.slug = data.slug.toLowerCase();
    }

    // step: protect slug uniqueness
    if (data.slug) {
      const duplicate = await CategoryModel.exists({
        _id: { $ne: id },
        slug: data.slug,
      });
      if (duplicate) throw new ConflictError("Category slug is already used");
    }

    // step: validate parent category
    if (data.parentId) await validateCategoryParent(data.parentId, id);

    // step: upload the supplied image
    let uploadedPublicId: string | undefined;
    let uploadedImageUrl: string | undefined;
    if (imageFile) {
      const uploadedImage = await uploadSingleBuffer({
        fileBuffer: imageFile.buffer,
        storagePathOnCloudinary: "categories",
      });
      uploadedPublicId = uploadedImage.public_id;
      uploadedImageUrl = uploadedImage.secure_url;
    }

    // step: apply category changes
    const update: Record<string, unknown> = { ...data };
    if (data.parentId === null) {
      delete update["parentId"];
    }
    if (uploadedImageUrl) update["image"] = uploadedImageUrl;

    let category;
    try {
      category = await CategoryModel.findByIdAndUpdate(
        id,
        {
          $set: update,
          ...(data.parentId === null && { $unset: { parentId: 1 } }),
        },
        { new: true, runValidators: true },
      );
    } catch (error) {
      if (uploadedPublicId) {
        await destroySingleFile({ public_id: uploadedPublicId }).catch(
          () => undefined,
        );
      }
      throw error;
    }

    if (!category) {
      if (uploadedPublicId) {
        await destroySingleFile({ public_id: uploadedPublicId }).catch(
          () => undefined,
        );
      }
      throw new NotFoundError("Category");
    }

    // step: remove the replaced Cloudinary image
    if (uploadedImageUrl && existing.image !== uploadedImageUrl) {
      const oldPublicId = existing.image
        ? extractPublicIdFromUrl(existing.image)
        : null;
      if (oldPublicId) {
        await destroySingleFile({ public_id: oldPublicId }).catch(
          () => undefined,
        );
      }
    }

    // step: result
    return category;
  }

  // ============================ delete ============================
  async delete(id: string): Promise<void> {
    // step: confirm category exists
    const category = await CategoryModel.findById(id).lean();
    if (!category) throw new NotFoundError("Category");

    // step: protect descendants and products
    const [relatedChild, relatedProduct] = await Promise.all([
      CategoryModel.exists({ parentId: id }),
      ProductModel.exists({ categoryId: id }),
    ]);

    if (relatedChild) {
      throw new ConflictError("Delete child categories first");
    }
    if (relatedProduct) {
      throw new ConflictError("Category is used by products and cannot be deleted");
    }

    // step: permanently delete category
    const deletedCategory = await CategoryModel.findByIdAndDelete(id).lean();
    if (!deletedCategory) throw new NotFoundError("Category");

    // step: remove category image from Cloudinary
    const imagePublicId = deletedCategory.image
      ? extractPublicIdFromUrl(deletedCategory.image)
      : null;
    if (imagePublicId) {
      await destroySingleFile({ public_id: imagePublicId }).catch(
        () => undefined,
      );
    }
  }
}

export const categoryService = new CategoryService();
