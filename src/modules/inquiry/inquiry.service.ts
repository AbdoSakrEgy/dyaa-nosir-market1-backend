import type { FilterQuery, SortOrder } from "mongoose";
import { InquiryModel } from "../../DB/models/communication/inquiry.model.js";
import type { Inquiry } from "../../DB/models/communication/inquiry.model.js";
import { ProductModel } from "../../DB/models/product/product.model.js";
import { NotFoundError } from "../../shared/utils/error/app.error.js";
import type {
  CreateInquiryDTO,
  ListInquiriesQueryDTO,
  UpdateInquiryDTO,
} from "./inquiry.validators.js";
import { normalizeInquiryPhone } from "./utils/normalize-inquiry-phone.js";

export class InquiryService {
  // ============================ create ============================
  async create(data: CreateInquiryDTO, userId?: string) {
    // step: validate the referenced public product
    if (data.productId) {
      const product = await ProductModel.exists({
        _id: data.productId,
        isPublished: true,
        isActive: true,
      });
      if (!product) throw new NotFoundError("Product");
    }

    // step: create inquiry with normalized contact data
    return InquiryModel.create({
      ...data,
      ...(userId && { userId }),
      phone: normalizeInquiryPhone(data.phone),
    });
  }

  // ============================ getAll ============================
  async getAll(query: ListInquiriesQueryDTO) {
    // step: build allow-listed filters
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 20), 1), 100);
    const filter: FilterQuery<Inquiry> = {};

    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;
    if (query.productId) filter.productId = query.productId;

    // sub-step: apply escaped text search
    if (query.search) {
      const keyword = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { customerName: { $regex: keyword, $options: "i" } },
        { phone: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
        { message: { $regex: keyword, $options: "i" } },
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
      .lean();

    if (!inquiry) throw new NotFoundError("Inquiry");

    // step: result
    return inquiry;
  }

  // ============================ update ============================
  async update(id: string, data: UpdateInquiryDTO) {
    // step: prepare nullable fields
    const update: Record<string, unknown> = { ...data };
    if (data.adminNotes === null) delete update["adminNotes"];

    // step: update inquiry workflow
    const inquiry = await InquiryModel.findByIdAndUpdate(
      id,
      {
        $set: update,
        ...(data.adminNotes === null && { $unset: { adminNotes: 1 } }),
      },
      { new: true, runValidators: true },
    );

    if (!inquiry) throw new NotFoundError("Inquiry");

    // step: result
    return inquiry;
  }
}

export const inquiryService = new InquiryService();
