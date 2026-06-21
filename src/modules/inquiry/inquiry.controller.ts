import type { Request, Response } from "express";
import { inquiryService } from "./inquiry.service.js";
import { responseHandler } from "../../shared/utils/response/response.handler.js";
import { HttpStatusCode } from "../../shared/utils/response/http.status.code.js";
import type {
  CreateInquiryDTO,
  ListInquiriesQueryDTO,
  UpdateInquiryDTO,
} from "./inquiry.validators.js";

export class InquiryController {
  // ---------------------------- create ----------------------------
  async create(req: Request, res: Response): Promise<void> {
    const inquiry = await inquiryService.create(req.body as CreateInquiryDTO);
    responseHandler(
      res,
      HttpStatusCode.CREATED,
      "Inquiry submitted successfully",
      inquiry,
    );
  }

  // ---------------------------- getAll ----------------------------
  async getAll(req: Request, res: Response): Promise<void> {
    const { inquiries, meta } = await inquiryService.getAll(
      req.query as unknown as ListInquiriesQueryDTO,
    );
    responseHandler(
      res,
      HttpStatusCode.OK,
      "Inquiries retrieved successfully",
      inquiries,
      meta,
    );
  }

  // ---------------------------- getById ----------------------------
  async getById(req: Request, res: Response): Promise<void> {
    const inquiry = await inquiryService.getById(req.params["id"] as string);
    responseHandler(res, HttpStatusCode.OK, "Inquiry retrieved successfully", inquiry);
  }

  // ---------------------------- update ----------------------------
  async update(req: Request, res: Response): Promise<void> {
    const inquiry = await inquiryService.update(
      req.params["id"] as string,
      req.body as UpdateInquiryDTO,
    );
    responseHandler(res, HttpStatusCode.OK, "Inquiry updated successfully", inquiry);
  }
}

export const inquiryController = new InquiryController();
