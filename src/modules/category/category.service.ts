import mongoose from "mongoose";
import { CategoryModel } from "../../DB/models/product/category.model.js";
import { ProductModel } from "../../DB/models/product/product.model.js";
import {
  ConflictError,
  NotFoundError,
} from "../../shared/utils/error/app.error.js";
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
  async create(data: CreateCategoryDTO) {
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

    // step: create category
    return CategoryModel.create(data);
  }

  // ============================ update ============================
  async update(id: string, data: UpdateCategoryDTO) {
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

    // step: apply category changes
    const update: Record<string, unknown> = { ...data };
    if (data.parentId === null) {
      delete update["parentId"];
    }
    if (data.image === null) {
      delete update["image"];
    }

    const category = await CategoryModel.findByIdAndUpdate(
      id,
      {
        $set: update,
        ...(data.parentId === null && { $unset: { parentId: 1 } }),
        ...(data.image === null && { $unset: { image: 1 } }),
      },
      { new: true, runValidators: true },
    );

    if (!category) throw new NotFoundError("Category");

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
