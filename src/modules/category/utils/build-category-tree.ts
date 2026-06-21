import type { CategoryTreeNode } from "../category.types.js";

export function buildCategoryTree(
  categories: Array<Record<string, unknown>>,
): CategoryTreeNode[] {
  const nodeMap = new Map<string, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  for (const category of categories) {
    nodeMap.set(String(category["_id"]), {
      ...category,
      _id: category["_id"],
      children: [],
    });
  }

  for (const node of nodeMap.values()) {
    const parentId = node.parentId ? String(node.parentId) : undefined;
    const parent = parentId ? nodeMap.get(parentId) : undefined;

    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  return roots;
}
