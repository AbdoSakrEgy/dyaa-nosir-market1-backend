import type { Request, Response } from "express";
import { categoryService } from "./category.service.js";
import { responseHandler } from "../../shared/utils/response/response.handler.js";
import { HttpStatusCode } from "../../shared/utils/response/http.status.code.js";
import type {
  CreateCategoryDTO,
  ListCategoriesManagementQueryDTO,
  ListCategoriesQueryDTO,
  UpdateCategoryDTO,
} from "./category.validators.js";

export class CategoryController {
  // ---------------------------- getAll ----------------------------
  async getAll(req: Request, res: Response): Promise<void> {
    const { categories, meta } = await categoryService.getAll(
      req.query as unknown as ListCategoriesQueryDTO,
    );
    responseHandler(
      res,
      HttpStatusCode.OK,
      "Categories retrieved successfully",
      categories,
      meta,
    );
  }

  // ---------------------------- getAllForManagement ----------------------------
  async getAllForManagement(req: Request, res: Response): Promise<void> {
    const { categories, meta } = await categoryService.getAllForManagement(
      req.query as unknown as ListCategoriesManagementQueryDTO,
    );
    responseHandler(
      res,
      HttpStatusCode.OK,
      "Categories retrieved successfully",
      categories,
      meta,
    );
  }

  // ---------------------------- getTree ----------------------------
  async getTree(_req: Request, res: Response): Promise<void> {
    const categories = await categoryService.getTree();
    responseHandler(
      res,
      HttpStatusCode.OK,
      "Category tree retrieved successfully",
      categories,
    );
  }

  // ---------------------------- getByIdentifier ----------------------------
  async getByIdentifier(req: Request, res: Response): Promise<void> {
    const category = await categoryService.getByIdentifier(
      req.params["identifier"] as string,
    );
    responseHandler(res, HttpStatusCode.OK, "Category retrieved successfully", category);
  }

  // ---------------------------- create ----------------------------
  async create(req: Request, res: Response): Promise<void> {
    const category = await categoryService.create(
      req.body as CreateCategoryDTO,
      req.file,
    );
    responseHandler(res, HttpStatusCode.CREATED, "Category created successfully", category);
  }

  // ---------------------------- update ----------------------------
  async update(req: Request, res: Response): Promise<void> {
    const category = await categoryService.update(
      req.params["id"] as string,
      req.body as UpdateCategoryDTO,
      req.file,
    );
    responseHandler(res, HttpStatusCode.OK, "Category updated successfully", category);
  }

  // ---------------------------- delete ----------------------------
  async delete(req: Request, res: Response): Promise<void> {
    await categoryService.delete(req.params["id"] as string);
    responseHandler(res, HttpStatusCode.OK, "Category deleted successfully");
  }
}

export const categoryController = new CategoryController();
