import type { FilterQuery, SortOrder } from "mongoose";
import { InquiryModel } from "../../DB/models/communication/inquiry.model.js";
import type { Inquiry } from "../../DB/models/communication/inquiry.model.js";
import { ProductModel } from "../../DB/models/product/product.model.js";
import { RoleModel } from "../../DB/models/user/role.model.js";
import { UserModel } from "../../DB/models/user/user.model.js";
import {
  BadRequestError,
  NotFoundError,
} from "../../shared/utils/error/app.error.js";
import { InquiryRequestStatus } from "./inquiry.types.js";
import type {
  CreateInquiryDTO,
  CreateInquiryWithResponseDTO,
  ListInquiriesQueryDTO,
  UpdateInquiryDTO,
} from "./inquiry.validators.js";
import { normalizeInquiryPhone } from "./utils/normalize-inquiry-phone.js";

export class InquiryService {
  // ============================ create ============================
  async create(data: CreateInquiryDTO, userId?: string) {
    // step: retrieve the referenced public product
    const product = await ProductModel.findOne({
      _id: data.productId,
      isPublished: true,
      isActive: true,
    })
      .select("name slug sku images")
      .lean();
    if (!product) throw new NotFoundError("resource.product");

    // step: create inquiry with normalized contact data and product snapshot
    return InquiryModel.create({
      ...data,
      ...(userId && { userId }),
      phone: data.phone.map((phone) => normalizeInquiryPhone(phone)),
      productSnapshot: {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        ...(product.images[0] && { image: product.images[0] }),
      },
    });
  }

  // ============================ createWithResponse ============================
  async createWithResponse(
    data: CreateInquiryWithResponseDTO,
    adminId: string,
  ) {
    // step: retrieve the referenced active product
    const product = await ProductModel.findOne({
      _id: data.productId,
      isActive: true,
    })
      .select("name slug sku images")
      .lean();
    if (!product) throw new NotFoundError("resource.product");

    // step: retrieve the selected active customer account
    const customerRole = await RoleModel.findOne({
      slug: "customer",
      isActive: true,
    })
      .select("_id")
      .lean();
    if (!customerRole)
      throw new BadRequestError("auth.customerRoleNotConfigured");

    const customer = await UserModel.findOne({
      _id: data.userId,
      roleId: customerRole._id,
      isActive: true,
    })
      .select("name email phone")
      .lean();
    if (!customer) throw new NotFoundError("resource.user");

    // sub-step: use the account phone when the customer has one
    const customerPhones = customer.phone
      ? [normalizeInquiryPhone(customer.phone)]
      : [];

    // step: create manual inquiry with the admin response already recorded
    return InquiryModel.create({
      userId: data.userId,
      customerName: customer.name,
      phone: customerPhones,
      email: customer.email,
      productId: data.productId,
      quantity: data.quantity,
      requestType: data.requestType,
      ...(data.message !== undefined && { message: data.message }),
      productSnapshot: {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        ...(product.images[0] && { image: product.images[0] }),
      },
      requestStatus: InquiryRequestStatus.completed,
      adminResponse: data.adminResponse,
      ...(data.adminNotes !== undefined && { adminNotes: data.adminNotes }),
      createdByAdminId: adminId,
      respondedAt: new Date(),
    });
  }

  // ============================ getAll ============================
  async getAll(query: ListInquiriesQueryDTO) {
    // step: build allow-listed filters
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 20), 1), 100);
    const filter: FilterQuery<Inquiry> = {};

    if (query.requestStatus) filter.requestStatus = query.requestStatus;
    if (query.requestType) filter.requestType = query.requestType;
    if (query.productId) filter.productId = query.productId;

    // sub-step: apply escaped text search
    if (query.search) {
      const keyword = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { customerName: { $regex: keyword, $options: "i" } },
        { phone: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
        { message: { $regex: keyword, $options: "i" } },
        { "productSnapshot.name.ar": { $regex: keyword, $options: "i" } },
        { "productSnapshot.name.en": { $regex: keyword, $options: "i" } },
        { "productSnapshot.sku": { $regex: keyword, $options: "i" } },
      ];
    }
    const sortOptions: Record<string, Record<string, SortOrder>> = {
      created_at_asc: { createdAt: 1 },
      created_at_desc: { createdAt: -1 },
      updated_at_asc: { updatedAt: 1 },
      updated_at_desc: { updatedAt: -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      name_asc: { customerName: 1 },
      name_desc: { customerName: -1 },
    };
    const sort = sortOptions[query.sort ?? "newest"] ?? { createdAt: -1 };

    // step: retrieve inquiries and count
    const [inquiries, totalItems] = await Promise.all([
      InquiryModel.find(filter)
        .populate("productId", "name slug sku images")
        .populate("userId", "name email phone")
        .populate("createdByAdminId", "name email phone")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      InquiryModel.countDocuments(filter),
    ]);

    // step: result
    return {
      inquiries,
      meta: {
        totalItems,
        itemCount: inquiries.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  // ============================ getById ============================
  async getById(id: string) {
    // step: retrieve inquiry details
    const inquiry = await InquiryModel.findById(id)
      .populate("productId", "name slug sku images")
      .populate("userId", "name email phone")
      .populate("createdByAdminId", "name email phone")
      .lean();

    if (!inquiry) throw new NotFoundError("resource.inquiry");

    // step: result
    return inquiry;
  }

  // ============================ update ============================
  async update(id: string, data: UpdateInquiryDTO) {
    // step: prepare workflow and response updates
    const set: Record<string, unknown> = {};
    const unset: Record<string, 1> = {};

    if (data.requestStatus !== undefined) {
      set["requestStatus"] = data.requestStatus;
    }
    if (data.adminNotes !== undefined) {
      if (data.adminNotes === null) unset["adminNotes"] = 1;
      else set["adminNotes"] = data.adminNotes;
    }
    if (data.adminResponse !== undefined) {
      if (data.adminResponse === null) {
        unset["adminResponse"] = 1;
        unset["respondedAt"] = 1;
      } else {
        for (const [key, value] of Object.entries(data.adminResponse)) {
          if (value !== undefined) set[`adminResponse.${key}`] = value;
        }
        set["respondedAt"] = new Date();
      }
    }

    // step: update inquiry workflow
    const inquiry = await InquiryModel.findByIdAndUpdate(
      id,
      {
        ...(Object.keys(set).length > 0 && { $set: set }),
        ...(Object.keys(unset).length > 0 && { $unset: unset }),
      },
      { new: true, runValidators: true },
    );

    if (!inquiry) throw new NotFoundError("resource.inquiry");

    // step: result
    return inquiry;
  }
}

export const inquiryService = new InquiryService();
