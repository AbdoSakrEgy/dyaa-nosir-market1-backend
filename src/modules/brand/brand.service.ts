import mongoose, { type FilterQuery, type SortOrder } from "mongoose";
import {
  BrandModel,
  type Brand,
} from "../../DB/models/product/brand.model.js";
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
  CreateBrandDTO,
  ListBrandsManagementQueryDTO,
  ListBrandsQueryDTO,
  UpdateBrandDTO,
} from "./brand.validators.js";

export class BrandService {
  // ============================ getAll ============================
  async getAll(query: ListBrandsQueryDTO) {
    // step: build allow-listed filters
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 20), 1), 100);
    const filter: FilterQuery<Brand> = { isActive: true };

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
    const sort = sortOptions[query.sort ?? "newest"] ?? { createdAt: -1 };

    // step: retrieve brands and count
    const [brands, totalItems] = await Promise.all([
      BrandModel.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      BrandModel.countDocuments(filter),
    ]);

    // step: result
    return {
      brands,
      meta: {
        totalItems,
        itemCount: brands.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  // ============================ getAllForManagement ============================
  async getAllForManagement(query: ListBrandsManagementQueryDTO) {
    // step: build allow-listed filters
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 20), 1), 100);
    const filter: FilterQuery<Brand> = {};

    if (query.isActive) {
      filter.isActive = query.isActive === "true";
    }
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
    const sort = sortOptions[query.sort ?? "newest"] ?? { createdAt: -1 };

    // step: retrieve brands and count
    const [brands, totalItems] = await Promise.all([
      BrandModel.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      BrandModel.countDocuments(filter),
    ]);

    // step: result
    return {
      brands,
      meta: {
        totalItems,
        itemCount: brands.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
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
  async create(data: CreateBrandDTO, logoFile?: Express.Multer.File) {
    // step: protect slug uniqueness
    const duplicate = await BrandModel.exists({ slug: data.slug });
    if (duplicate) throw new ConflictError("Brand slug is already used");

    // step: upload the supplied logo
    const brandData: Record<string, unknown> = { ...data };
    let uploadedPublicId: string | undefined;
    if (logoFile) {
      const uploadedLogo = await uploadSingleBuffer({
        fileBuffer: logoFile.buffer,
        storagePathOnCloudinary: "brands",
      });
      brandData["logo"] = uploadedLogo.secure_url;
      uploadedPublicId = uploadedLogo.public_id;
    }

    // step: create brand and roll back a new upload on failure
    try {
      return await BrandModel.create(brandData);
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
    data: UpdateBrandDTO,
    logoFile?: Express.Multer.File,
  ) {
    // step: require a body field or uploaded logo
    if (Object.keys(data).length === 0 && !logoFile) {
      throw new BadRequestError("At least one brand field is required");
    }

    // step: confirm brand exists
    const existing = await BrandModel.findById(id).lean();
    if (!existing) throw new NotFoundError("Brand");

    // step: protect slug uniqueness
    if (data.slug) {
      const duplicate = await BrandModel.exists({
        slug: data.slug,
        _id: { $ne: id },
      });
      if (duplicate) throw new ConflictError("Brand slug is already used");
    }

    // step: upload the supplied logo
    let uploadedPublicId: string | undefined;
    let uploadedLogoUrl: string | undefined;
    if (logoFile) {
      const uploadedLogo = await uploadSingleBuffer({
        fileBuffer: logoFile.buffer,
        storagePathOnCloudinary: "brands",
      });
      uploadedPublicId = uploadedLogo.public_id;
      uploadedLogoUrl = uploadedLogo.secure_url;
    }

    // step: prepare brand changes
    const update: Record<string, unknown> = { ...data };
    if (uploadedLogoUrl) update["logo"] = uploadedLogoUrl;

    // step: apply brand changes
    let brand;
    try {
      brand = await BrandModel.findByIdAndUpdate(
        id,
        {
          $set: update,
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

    if (!brand) {
      if (uploadedPublicId) {
        await destroySingleFile({ public_id: uploadedPublicId }).catch(
          () => undefined,
        );
      }
      throw new NotFoundError("Brand");
    }

    // step: remove the replaced Cloudinary logo
    if (uploadedLogoUrl && existing.logo !== uploadedLogoUrl) {
      const oldPublicId = existing.logo
        ? extractPublicIdFromUrl(existing.logo)
        : null;
      if (oldPublicId) {
        await destroySingleFile({ public_id: oldPublicId }).catch(
          () => undefined,
        );
      }
    }

    // step: result
    return brand;
  }

  // ============================ delete ============================
  async delete(id: string) {
    // step: confirm brand exists
    const brand = await BrandModel.findById(id).lean();
    if (!brand) throw new NotFoundError("Brand");

    // step: protect all products that reference the brand
    const relatedProduct = await ProductModel.exists({
      brandId: id,
    });
    if (relatedProduct) {
      throw new ConflictError("Brand is used by products and cannot be deleted");
    }

    // step: permanently delete brand
    const deletedBrand = await BrandModel.findByIdAndDelete(id).lean();
    if (!deletedBrand) throw new NotFoundError("Brand");

    // step: remove the brand logo from Cloudinary
    const logoPublicId = deletedBrand.logo
      ? extractPublicIdFromUrl(deletedBrand.logo)
      : null;
    if (logoPublicId) {
      await destroySingleFile({ public_id: logoPublicId }).catch(
        () => undefined,
      );
    }

    // step: result
    return deletedBrand;
  }
}

export const brandService = new BrandService();
