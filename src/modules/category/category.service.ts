import mongoose from "mongoose";
import { CategoryModel } from "../../DB/models/product/category.model.js";
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
  ListCategoriesQueryDTO,
  UpdateCategoryDTO,
} from "./category.validators.js";
import { buildCategoryTree } from "./utils/build-category-tree.js";
import { validateCategoryParent } from "./utils/validate-category-parent.js";

export class CategoryService {
  // ============================ getAll ============================
  async getAll(query: ListCategoriesQueryDTO, includeInactive = false) {
    // step: build public category filter
    const filter: Record<string, unknown> = includeInactive
      ? {}
      : { isActive: true };
    if (includeInactive && query.isActive) {
      filter["isActive"] = query.isActive === "true";
    }
    if (query.parentId === "root") filter.parentId = { $exists: false };
    else if (query.parentId) filter.parentId = query.parentId;

    // step: retrieve categories
    return CategoryModel.find(filter).sort({ "name.en": 1 }).lean();
  }

  // ============================ getAllForManagement ============================
  async getAllForManagement(query: ListCategoriesQueryDTO) {
    // step: retrieve categories with management visibility
    return this.getAll(query, true);
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
    // step: find category by id or localized slug
    const identifierFilter = mongoose.isValidObjectId(identifier)
      ? { _id: identifier }
      : { $or: [{ "slug.ar": identifier }, { "slug.en": identifier }] };
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
    // step: normalize localized slugs
    data.slug = {
      ar: data.slug.ar.toLowerCase(),
      en: data.slug.en.toLowerCase(),
    };

    // step: protect localized slug uniqueness
    const duplicate = await CategoryModel.exists({
      $or: [
        { "slug.ar": data.slug.ar },
        { "slug.en": data.slug.en },
      ],
    });
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

    // step: normalize localized slugs
    if (data.slug) {
      data.slug = {
        ar: data.slug.ar.toLowerCase(),
        en: data.slug.en.toLowerCase(),
      };
    }

    // step: protect localized slug uniqueness
    if (data.slug) {
      const duplicate = await CategoryModel.exists({
        _id: { $ne: id },
        $or: [
          { "slug.ar": data.slug.ar },
          { "slug.en": data.slug.en },
        ],
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

    // step: protect active descendants and products
    const [activeChild, activeProduct] = await Promise.all([
      CategoryModel.exists({ parentId: id, isActive: true }),
      ProductModel.exists({ categoryId: id, isActive: true }),
    ]);

    if (activeChild) {
      throw new ConflictError("Deactivate child categories first");
    }
    if (activeProduct) {
      throw new ConflictError("Category is used by active products");
    }

    // step: soft-delete category
    await CategoryModel.updateOne({ _id: id }, { $set: { isActive: false } });
  }
}

export const categoryService = new CategoryService();
