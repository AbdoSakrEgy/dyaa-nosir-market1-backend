export interface CategoryTreeNode {
  _id: unknown;
  parentId?: unknown;
  [key: string]: unknown;
  children: CategoryTreeNode[];
}
