import { InquiryModel } from "../../DB/models/communication/inquiry.model.js";
import { ProductModel } from "../../DB/models/product/product.model.js";
import { NotFoundError } from "../../shared/utils/error/app.error.js";
import type {
  CreateInquiryDTO,
  ListInquiriesQueryDTO,
  UpdateInquiryDTO,
} from "./inquiry.validators.js";
import { buildInquiryQuery } from "./utils/build-inquiry-query.js";
import { normalizeInquiryPhone } from "./utils/normalize-inquiry-phone.js";

export class InquiryService {
  // ============================ create ============================
  async create(data: CreateInquiryDTO) {
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
      phone: normalizeInquiryPhone(data.phone),
    });
  }

  // ============================ getAll ============================
  async getAll(query: ListInquiriesQueryDTO) {
    // step: build administration query
    const { filter, page, limit } = buildInquiryQuery(query);

    // step: retrieve inquiries and count
    const [inquiries, totalItems] = await Promise.all([
      InquiryModel.find(filter)
        .populate("productId", "name slug sku images")
        .populate("userId", "name email phone")
        .sort({ createdAt: -1 })
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
