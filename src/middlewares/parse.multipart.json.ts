import type { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../shared/utils/error/app.error.js";

const numericFields = new Set([
  "age",
  "price",
  "discountPrice",
  "stockQuantity",
]);

export const parseMultipartJson = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const directFields: Record<string, unknown> = { ...req.body };
    const data = directFields["data"];
    delete directFields["data"];

    let parsedData: Record<string, unknown> = {};
    if (typeof data === "string") {
      const parsedValue: unknown = JSON.parse(data);
      if (
        typeof parsedValue !== "object" ||
        parsedValue === null ||
        Array.isArray(parsedValue)
      ) {
        throw new BadRequestError("Multipart data must be a JSON object");
      }
      parsedData = parsedValue as Record<string, unknown>;
    }

    const mergedFields = { ...directFields, ...parsedData };
    req.body = Object.fromEntries(
      Object.entries(mergedFields).map(([field, value]) => [
        field,
        parseFieldValue(field, value),
      ]),
    );
    next();
  } catch (error) {
    next(
      error instanceof BadRequestError
        ? error
        : new BadRequestError("Multipart data must contain valid JSON"),
    );
  }
};

const parseFieldValue = (field: string, value: unknown): unknown => {
  if (typeof value !== "string") return value;

  const trimmedValue = value.trim();

  if (numericFields.has(field)) {
    const numericValue = Number(trimmedValue);
    if (Number.isFinite(numericValue)) return numericValue;
  }

  if (trimmedValue === "true") return true;
  if (trimmedValue === "false") return false;
  if (trimmedValue === "null") return null;

  if (trimmedValue.startsWith("{") || trimmedValue.startsWith("[")) {
    try {
      return JSON.parse(trimmedValue) as unknown;
    } catch {
      throw new BadRequestError(
        `Multipart field '${field}' must contain valid JSON`,
      );
    }
  }

  return value;
};
