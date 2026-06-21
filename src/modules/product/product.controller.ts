import type { Request, Response } from "express";
import { productService } from "./product.service.js";
import { responseHandler } from "../../shared/utils/response/response.handler.js";
import { HttpStatusCode } from "../../shared/utils/response/http.status.code.js";
import type {
  CreateProductDTO,
  ListProductsQueryDTO,
  UpdateProductDTO,
} from "./product.validators.js";

export class ProductController {
  // ---------------------------- getAll ----------------------------
  async getAll(req: Request, res: Response): Promise<void> {
    const { products, meta } = await productService.getAll(
      req.query as unknown as ListProductsQueryDTO,
    );
    responseHandler(
      res,
      HttpStatusCode.OK,
      "Products retrieved successfully",
      products,
      meta,
    );
  }

  // ---------------------------- getAllForManagement ----------------------------
  async getAllForManagement(req: Request, res: Response): Promise<void> {
    const { products, meta } = await productService.getAllForManagement(
      req.query as unknown as ListProductsQueryDTO,
    );
    responseHandler(
      res,
      HttpStatusCode.OK,
      "Products retrieved successfully",
      products,
      meta,
    );
  }

  // ---------------------------- getByIdentifier ----------------------------
  async getByIdentifier(req: Request, res: Response): Promise<void> {
    const product = await productService.getByIdentifier(
      req.params["identifier"] as string,
    );
    responseHandler(res, HttpStatusCode.OK, "Product retrieved successfully", product);
  }

  // ---------------------------- create ----------------------------
  async create(req: Request, res: Response): Promise<void> {
    const product = await productService.create(req.body as CreateProductDTO);
    responseHandler(res, HttpStatusCode.CREATED, "Product created successfully", product);
  }

  // ---------------------------- update ----------------------------
  async update(req: Request, res: Response): Promise<void> {
    const product = await productService.update(
      req.params["id"] as string,
      req.body as UpdateProductDTO,
    );
    responseHandler(res, HttpStatusCode.OK, "Product updated successfully", product);
  }

  // ---------------------------- delete ----------------------------
  async delete(req: Request, res: Response): Promise<void> {
    await productService.delete(req.params["id"] as string);
    responseHandler(res, HttpStatusCode.OK, "Product archived successfully");
  }
}

export const productController = new ProductController();
