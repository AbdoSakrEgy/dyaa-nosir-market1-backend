import type { PaginationMeta } from "../../shared/types/shared.types.js";

export interface ProfileListResult<T> {
  profiles: T[];
  meta: PaginationMeta;
}
