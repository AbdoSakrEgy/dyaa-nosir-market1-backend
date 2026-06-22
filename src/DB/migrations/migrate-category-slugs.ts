import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "../database.js";
import { CategoryModel } from "../models/product/category.model.js";

interface LegacyLocalizedSlug {
  ar?: unknown;
  en?: unknown;
}

const migrateCategorySlugs = async (): Promise<void> => {
  await connectDatabase();

  const collection = CategoryModel.collection;
  const categories = await collection
    .find({}, { projection: { slug: 1 } })
    .toArray();

  const migrations = categories.map((category) => {
    if (typeof category.slug === "string") {
      const slug = category.slug.trim().toLowerCase();
      if (slug.length === 0) {
        throw new Error(`Category ${String(category._id)} has no usable slug`);
      }
      return { _id: category._id, slug };
    }

    const localizedSlug = category.slug as LegacyLocalizedSlug | undefined;
    const slug =
      typeof localizedSlug?.en === "string"
        ? localizedSlug.en
        : localizedSlug?.ar;

    if (typeof slug !== "string" || slug.trim().length === 0) {
      throw new Error(`Category ${String(category._id)} has no usable slug`);
    }

    return { _id: category._id, slug: slug.trim().toLowerCase() };
  });

  const uniqueSlugs = new Set(migrations.map(({ slug }) => slug));
  if (uniqueSlugs.size !== migrations.length) {
    throw new Error("Category slug migration would create duplicate slugs");
  }

  const indexes = await collection.listIndexes().toArray();
  const legacyIndexes = indexes.filter((index) => {
    const keys = Object.keys(index.key);
    return (
      keys.length === 1 &&
      (keys[0] === "slug.ar" || keys[0] === "slug.en")
    );
  });

  for (const index of legacyIndexes) {
    if (index.name) await collection.dropIndex(index.name);
  }

  if (migrations.length > 0) {
    await collection.bulkWrite(
      migrations.map(({ _id, slug }) => ({
        updateOne: {
          filter: { _id },
          update: { $set: { slug } },
        },
      })),
    );
  }

  await collection.createIndex({ slug: 1 }, { unique: true });
};

migrateCategorySlugs()
  .then(async () => {
    console.log("Category slugs migrated successfully");
    await disconnectDatabase();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    console.error("Failed to migrate category slugs", error);
    await disconnectDatabase();
    process.exit(1);
  });
