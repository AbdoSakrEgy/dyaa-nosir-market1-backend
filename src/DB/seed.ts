import bcrypt from "bcrypt";
import { connectDatabase, disconnectDatabase } from "./database.js";
import { BrandModel } from "./models/product/brand.model.js";
import { CartModel } from "./models/shopping/cart.model.js";
import { CategoryModel } from "./models/product/category.model.js";
import { CouponModel } from "./models/shopping/coupon.model.js";
import { InquiryModel } from "./models/communication/inquiry.model.js";
import { OrderModel } from "./models/shopping/order.model.js";
import { PaymentModel } from "./models/shopping/payment.model.js";
import { ProductModel } from "./models/product/product.model.js";
import { ReviewModel } from "./models/shopping/review.model.js";
import { StockTransactionModel } from "./models/shopping/stock-transaction.model.js";
import { UserModel } from "./models/user/user.model.js";
import { RoleModel } from "./models/user/role.model.js";

const seedDatabase = async (): Promise<void> => {
  await connectDatabase();

  const shouldClear = process.argv.includes("--clear");

  if (shouldClear) {
    await Promise.all([
      CartModel.deleteMany({}),
      CouponModel.deleteMany({}),
      InquiryModel.deleteMany({}),
      OrderModel.deleteMany({}),
      PaymentModel.deleteMany({}),
      ReviewModel.deleteMany({}),
      StockTransactionModel.deleteMany({}),
      ProductModel.deleteMany({}),
      CategoryModel.deleteMany({}),
      BrandModel.deleteMany({}),
      UserModel.deleteMany({}),
      RoleModel.deleteMany({}),
    ]);
  }

  const customerRole = await RoleModel.create({
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
    isSystem: true,
  });

  const adminRole = await RoleModel.create({
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
    isSystem: true,
  });

  const password = await bcrypt.hash("Password123", 12);

  const admin = await UserModel.create({
    name: "Admin User",
    email: "admin@example.com",
    phone: "01000000001",
    password,
    roleId: adminRole._id,
    isEmailConfirmed: true,
  });

  const customer = await UserModel.create({
    name: "Ahmed Customer",
    email: "customer@example.com",
    phone: "01000000003",
    password,
    roleId: customerRole._id,
    isEmailConfirmed: true,
  });

  const tractorCategory = await CategoryModel.create({
    name: { ar: "جرارات", en: "Tractors" },
    slug: "tractors",
    description: {
      ar: "جرارات زراعية جديدة ومستعملة",
      en: "New and used tractors",
    },
    isActive: true,
  });

  const tractorPartsCategory = await CategoryModel.create({
    name: { ar: "قطع غيار جرارات", en: "Tractor Spare Parts" },
    slug: "tractor-spare-parts",
    isActive: true,
  });

  const carPartsCategory = await CategoryModel.create({
    name: { ar: "قطع غيار سيارات", en: "Car Spare Parts" },
    slug: "car-spare-parts",
    isActive: true,
  });

  const filtersCategory = await CategoryModel.create({
    name: { ar: "فلاتر", en: "Filters" },
    slug: "filters",
    parentId: tractorPartsCategory._id,
    isActive: true,
  });

  const masseyBrand = await BrandModel.create({
    name: { ar: "ماسي فيرجسون", en: "Massey Ferguson" },
    slug: "massey-ferguson",
    type: "tractor",
    isActive: true,
  });

  const newHollandBrand = await BrandModel.create({
    name: { ar: "نيو هولاند", en: "New Holland" },
    slug: "new-holland",
    type: "tractor",
    isActive: true,
  });

  const toyotaBrand = await BrandModel.create({
    name: { ar: "تويوتا", en: "Toyota" },
    slug: "toyota",
    type: "car",
    isActive: true,
  });

  const tractor = await ProductModel.create({
    name: { ar: "جرار ماسي فيرجسون 285", en: "Massey Ferguson 285 Tractor" },
    slug: "massey-ferguson-285-tractor",
    description: {
      ar: "جرار زراعي بحالة جيدة مناسب للأعمال الزراعية اليومية",
      en: "A reliable tractor suitable for daily farm work",
    },
    type: "tractor",
    categoryId: tractorCategory._id,
    brandId: masseyBrand._id,
    sku: "TR-MF-285-001",
    images: ["https://placehold.co/800x600?text=Massey+Ferguson+285"],
    price: 520000,
    currency: "EGP",
    stockQuantity: 1,
    stockStatus: "in_stock",
    condition: "used",
    specs: [
      {
        key: { ar: "القدرة", en: "Horsepower" },
        value: { ar: "75 حصان", en: "75 HP" },
      },
      {
        key: { ar: "المحرك", en: "Engine" },
        value: { ar: "بيركنز", en: "Perkins" },
      },
      {
        key: { ar: "نوع الدفع", en: "Drive Type" },
        value: { ar: "دفع ثنائي", en: "2WD" },
      },
      {
        key: { ar: "ساعات الاستخدام", en: "Hours Used" },
        value: { ar: "3200 ساعة", en: "3200 hours" },
      },
    ],
    tags: { ar: ["جرار", "ماسي"], en: ["tractor", "massey"] },
    isFeatured: true,
    isPublished: true,
  });

  const oilFilter = await ProductModel.create({
    name: { ar: "فلتر زيت جرار ماسي 285", en: "Oil Filter for Massey 285" },
    slug: "oil-filter-massey-285",
    description: {
      ar: "فلتر زيت متوافق مع جرار ماسي فيرجسون 285",
      en: "Oil filter compatible with Massey Ferguson 285",
    },
    type: "tractor_part",
    categoryId: filtersCategory._id,
    brandId: masseyBrand._id,
    sku: "TP-FLT-MF285-001",
    images: ["https://placehold.co/800x600?text=Oil+Filter"],
    price: 250,
    discountPrice: 225,
    currency: "EGP",
    stockQuantity: 25,
    stockStatus: "in_stock",
    condition: "new",
    specs: [
      {
        key: { ar: "النوع", en: "Type" },
        value: { ar: "فلتر زيت", en: "Oil Filter" },
      },
      {
        key: { ar: "رقم القطعة", en: "Part Number" },
        value: { ar: "OF-MF285", en: "OF-MF285" },
      },
      {
        key: { ar: "رقم OEM", en: "OEM Number" },
        value: { ar: "OEM-MF-285-OIL", en: "OEM-MF-285-OIL" },
      },
    ],
    tags: { ar: ["فلتر", "زيت", "ماسي"], en: ["filter", "oil", "massey"] },
    isFeatured: true,
    isPublished: true,
  });

  const brakePads = await ProductModel.create({
    name: { ar: "تيل فرامل تويوتا كورولا", en: "Toyota Corolla Brake Pads" },
    slug: "toyota-corolla-brake-pads",
    description: {
      ar: "تيل فرامل أمامي متوافق مع تويوتا كورولا",
      en: "Front brake pads compatible with Toyota Corolla",
    },
    type: "car_part",
    categoryId: carPartsCategory._id,
    brandId: toyotaBrand._id,
    sku: "CP-BRK-COR-001",
    images: ["https://placehold.co/800x600?text=Brake+Pads"],
    price: 850,
    currency: "EGP",
    stockQuantity: 12,
    stockStatus: "in_stock",
    condition: "new",
    specs: [
      {
        key: { ar: "رقم القطعة", en: "Part Number" },
        value: { ar: "BP-COR-2018", en: "BP-COR-2018" },
      },
      {
        key: { ar: "رقم OEM", en: "OEM Number" },
        value: { ar: "OEM-TOY-COR-BRK", en: "OEM-TOY-COR-BRK" },
      },
    ],
    tags: { ar: ["فرامل", "كورولا"], en: ["brakes", "corolla"] },
    isPublished: true,
  });

  await CartModel.create({
    userId: customer._id,
    items: [
      {
        productId: oilFilter._id,
        quantity: 2,
        priceSnapshot: 225,
      },
    ],
  });

  const order = await OrderModel.create({
    orderNumber: "ORD-100001",
    userId: customer._id,
    customer: {
      name: "Ahmed Customer",
      phone: "01000000003",
      email: "customer@example.com",
    },
    items: [
      {
        productId: oilFilter._id,
        nameSnapshot: "Oil Filter for Massey 285",
        skuSnapshot: "TP-FLT-MF285-001",
        imageSnapshot: "https://placehold.co/800x600?text=Oil+Filter",
        quantity: 2,
        priceSnapshot: 225,
        totalPrice: 450,
      },
    ],
    subtotal: 450,
    shippingFees: 50,
    discount: 0,
    total: 500,
    currency: "EGP",
    shippingAddress: {
      city: "Cairo",
      area: "Nasr City",
      street: "Abbas El Akkad",
      building: "10",
    },
    orderStatus: "confirmed",
  });

  await PaymentModel.create({
    orderId: order._id,
    userId: customer._id,
    provider: "cash_on_delivery",
    amount: 500,
    currency: "EGP",
    status: "pending",
  });

  await InquiryModel.create({
    userId: customer._id,
    customerName: "Ahmed Customer",
    phone: "01000000003",
    email: "customer@example.com",
    productId: tractor._id,
    type: "availability_check",
    message: "Is this tractor still available?",
    status: "new",
  });

  await ReviewModel.create({
    userId: customer._id,
    productId: oilFilter._id,
    rating: 5,
    comment: "Good quality filter.",
    isApproved: true,
  });

  await CouponModel.create({
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minOrderAmount: 300,
    maxDiscountAmount: 150,
    usageLimit: 100,
    usedCount: 0,
    isActive: true,
  });

  await StockTransactionModel.create({
    productId: oilFilter._id,
    type: "purchase",
    quantity: 25,
    previousStock: 0,
    newStock: 25,
    reason: "Initial seed stock",
    createdBy: admin._id,
  });

  await StockTransactionModel.create({
    productId: oilFilter._id,
    type: "sale",
    quantity: -2,
    previousStock: 25,
    newStock: 23,
    orderId: order._id,
    reason: "Seed order",
    createdBy: admin._id,
  });

  void brakePads;
};

seedDatabase()
  .then(async () => {
    console.log("Seed data inserted successfully");
    await disconnectDatabase();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    console.error("Failed to seed database", error);
    await disconnectDatabase();
    process.exit(1);
  });
