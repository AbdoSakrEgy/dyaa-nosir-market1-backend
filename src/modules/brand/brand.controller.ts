import type { Request, Response } from "express";
import { brandService } from "./brand.service.js";
import { responseHandler } from "../../shared/utils/response/response.handler.js";
import { HttpStatusCode } from "../../shared/utils/response/http.status.code.js";
import type {
  CreateBrandDTO,
  ListBrandsManagementQueryDTO,
  ListBrandsQueryDTO,
  UpdateBrandDTO,
} from "./brand.validators.js";

export class BrandController {
  // ---------------------------- getAll ----------------------------
  async getAll(req: Request, res: Response): Promise<void> {
    const { brands, meta } = await brandService.getAll(
      req.query as unknown as ListBrandsQueryDTO,
    );
    responseHandler(
      res,
      HttpStatusCode.OK,
      "brand.list",
      brands,
      meta,
    );
  }

  // ---------------------------- getAllForManagement ----------------------------
  async getAllForManagement(req: Request, res: Response): Promise<void> {
    const { brands, meta } = await brandService.getAllForManagement(
      req.query as unknown as ListBrandsManagementQueryDTO,
    );
    responseHandler(
      res,
      HttpStatusCode.OK,
      "brand.list",
      brands,
      meta,
    );
  }

  // ---------------------------- getByIdentifier ----------------------------
  async getByIdentifier(req: Request, res: Response): Promise<void> {
    const brand = await brandService.getByIdentifier(
      req.params["identifier"] as string,
    );
    responseHandler(res, HttpStatusCode.OK, "brand.retrieved", brand);
  }

  // ---------------------------- create ----------------------------
  async create(req: Request, res: Response): Promise<void> {
    const brand = await brandService.create(
      req.body as CreateBrandDTO,
      req.file,
    );
    responseHandler(res, HttpStatusCode.CREATED, "brand.created", brand);
  }

  // ---------------------------- update ----------------------------
  async update(req: Request, res: Response): Promise<void> {
    const brand = await brandService.update(
      req.params["id"] as string,
      req.body as UpdateBrandDTO,
      req.file,
    );
    responseHandler(res, HttpStatusCode.OK, "brand.updated", brand);
  }

  // ---------------------------- delete ----------------------------
  async delete(req: Request, res: Response): Promise<void> {
    const brand = await brandService.delete(req.params["id"] as string);
    const message = brand.isActive
      ? "brand.deleted"
      : "brand.previouslyDeactivatedDeleted";
    responseHandler(
      res,
      HttpStatusCode.OK,
      message,
      brand,
    );
  }
}

export const brandController = new BrandController();
