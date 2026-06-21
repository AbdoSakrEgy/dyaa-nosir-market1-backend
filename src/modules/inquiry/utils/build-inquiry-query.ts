import type { FilterQuery } from "mongoose";
import type { Inquiry } from "../../../DB/models/communication/inquiry.model.js";
import type { ListInquiriesQueryDTO } from "../inquiry.validators.js";

export function buildInquiryQuery(query: ListInquiriesQueryDTO): {
  filter: FilterQuery<Inquiry>;
  page: number;
  limit: number;
} {
  const page = Math.max(Number(query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(query.limit ?? 20), 1), 100);
  const filter: FilterQuery<Inquiry> = {};

  if (query.status) filter.status = query.status;
  if (query.type) filter.type = query.type;
  if (query.productId) filter.productId = query.productId;

  if (query.search) {
    const keyword = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { customerName: { $regex: keyword, $options: "i" } },
      { phone: { $regex: keyword, $options: "i" } },
      { email: { $regex: keyword, $options: "i" } },
      { message: { $regex: keyword, $options: "i" } },
    ];
  }

  return { filter, page, limit };
}
