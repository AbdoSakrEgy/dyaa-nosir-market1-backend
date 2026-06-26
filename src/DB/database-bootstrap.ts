import { RoleModel } from "./models/user/role.model.js";

export const databaseBootstrap = async (): Promise<void> => {
  await ensureSystemRoles();
};

const ensureSystemRoles = async (): Promise<void> => {
  const systemRoles = [
    {
      name: "Customer",
      slug: "customer",
      permissions: [
        "product:read",
        "cart:manage",
        "order:create",
        "own_order:read",
        "inquiry:create",
        "review:create",
      ],
    },
    {
      name: "Admin",
      slug: "admin",
      permissions: [
        "product:manage",
        "category:manage",
        "brand:manage",
        "order:manage",
        "inquiry:manage",
        "inventory:manage",
      ],
    },
  ] as const;
  await Promise.all(
    systemRoles.map((role) =>
      RoleModel.findOneAndUpdate(
        { slug: role.slug },
        {
          $set: {
            name: role.name,
            isActive: true,
            isSystem: true,
          },
          $setOnInsert: {
            slug: role.slug,
            permissions: role.permissions,
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      ),
    ),
  );
};
