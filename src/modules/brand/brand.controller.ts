import type { Request, Response } from "express";
import { brandService } from "./brand.service.js";
import { responseHandler } from "../../shared/utils/response/response.handler.js";
import { HttpStatusCode } from "../../shared/utils/response/http.status.code.js";
import type {
  CreateBrandDTO,
  ListBrandsQueryDTO,
  UpdateBrandDTO,
} from "./brand.validators.js";

export class BrandController {
  // ---------------------------- getAll ----------------------------
  async getAll(req: Request, res: Response): Promise<void> {
    const brands = await brandService.getAll(
      req.query as unknown as ListBrandsQueryDTO,
    );
    responseHandler(res, HttpStatusCode.OK, "Brands retrieved successfully", brands);
  }

  // ---------------------------- getAllForManagement ----------------------------
  async getAllForManagement(req: Request, res: Response): Promise<void> {
    const brands = await brandService.getAllForManagement(
      req.query as unknown as ListBrandsQueryDTO,
    );
    responseHandler(res, HttpStatusCode.OK, "Brands retrieved successfully", brands);
  }

  // ---------------------------- getByIdentifier ----------------------------
  async getByIdentifier(req: Request, res: Response): Promise<void> {
    const brand = await brandService.getByIdentifier(
      req.params["identifier"] as string,
    );
    responseHandler(res, HttpStatusCode.OK, "Brand retrieved successfully", brand);
  }

  // ---------------------------- create ----------------------------
  async create(req: Request, res: Response): Promise<void> {
    const brand = await brandService.create(req.body as CreateBrandDTO);
    responseHandler(res, HttpStatusCode.CREATED, "Brand created successfully", brand);
  }

  // ---------------------------- update ----------------------------
  async update(req: Request, res: Response): Promise<void> {
    const brand = await brandService.update(
      req.params["id"] as string,
      req.body as UpdateBrandDTO,
    );
    responseHandler(res, HttpStatusCode.OK, "Brand updated successfully", brand);
  }

  // ---------------------------- delete ----------------------------
  async delete(req: Request, res: Response): Promise<void> {
    await brandService.delete(req.params["id"] as string);
    responseHandler(res, HttpStatusCode.OK, "Brand deactivated successfully");
  }
}

export const brandController = new BrandController();
