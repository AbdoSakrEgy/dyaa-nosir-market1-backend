import mongoose from "mongoose";
import { BrandModel } from "../../DB/models/product/brand.model.js";
import { ProductModel } from "../../DB/models/product/product.model.js";
import {
  ConflictError,
  NotFoundError,
} from "../../shared/utils/error/app.error.js";
import type {
  CreateBrandDTO,
  ListBrandsQueryDTO,
  UpdateBrandDTO,
} from "./brand.validators.js";

export class BrandService {
  // ============================ getAll ============================
  async getAll(query: ListBrandsQueryDTO, includeInactive = false) {
    // step: build public brand filter
    const filter: Record<string, unknown> = includeInactive
      ? {}
      : { isActive: true };
    if (includeInactive && query.isActive) {
      filter["isActive"] = query.isActive === "true";
    }
    if (query.type) filter["type"] = query.type;

    // step: retrieve brands
    return BrandModel.find(filter).sort({ "name.en": 1 }).lean();
  }

  // ============================ getAllForManagement ============================
  async getAllForManagement(query: ListBrandsQueryDTO) {
    // step: retrieve brands with management visibility
    return this.getAll(query, true);
  }

  // ============================ getByIdentifier ============================
  async getByIdentifier(identifier: string) {
    // step: find active brand by id or slug
    const identifierFilter = mongoose.isValidObjectId(identifier)
      ? { _id: identifier }
      : { slug: identifier.toLowerCase() };
    const brand = await BrandModel.findOne({
      ...identifierFilter,
      isActive: true,
    }).lean();

    if (!brand) throw new NotFoundError("Brand");

    // step: result
    return brand;
  }

  // ============================ create ============================
  async create(data: CreateBrandDTO) {
    // step: protect slug uniqueness
    const duplicate = await BrandModel.exists({ slug: data.slug });
    if (duplicate) throw new ConflictError("Brand slug is already used");

    // step: create brand
    return BrandModel.create(data);
  }

  // ============================ update ============================
  async update(id: string, data: UpdateBrandDTO) {
    // step: protect slug uniqueness
    if (data.slug) {
      const duplicate = await BrandModel.exists({
        slug: data.slug,
        _id: { $ne: id },
      });
      if (duplicate) throw new ConflictError("Brand slug is already used");
    }

    // step: prepare nullable fields
    const update: Record<string, unknown> = { ...data };
    if (data.logo === null) delete update["logo"];

    // step: apply brand changes
    const brand = await BrandModel.findByIdAndUpdate(
      id,
      {
        $set: update,
        ...(data.logo === null && { $unset: { logo: 1 } }),
      },
      { new: true, runValidators: true },
    );

    if (!brand) throw new NotFoundError("Brand");

    // step: result
    return brand;
  }

  // ============================ delete ============================
  async delete(id: string): Promise<void> {
    // step: confirm brand exists
    const brand = await BrandModel.findById(id).lean();
    if (!brand) throw new NotFoundError("Brand");

    // step: protect active products
    const activeProduct = await ProductModel.exists({
      brandId: id,
      isActive: true,
    });
    if (activeProduct) throw new ConflictError("Brand is used by active products");

    // step: soft-delete brand
    await BrandModel.updateOne({ _id: id }, { $set: { isActive: false } });
  }
}

export const brandService = new BrandService();
