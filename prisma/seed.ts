import { PrismaClient } from "../generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL ?? `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
const dbPath = dbUrl.replace(/^file:/, "");
const adapter = new PrismaBetterSqlite3({ url: dbPath });

const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  { name: "Sparklers", slug: "sparklers", icon: "✨", sortOrder: 1 },
  { name: "Rockets", slug: "rockets", icon: "🚀", sortOrder: 2 },
  { name: "Fountains", slug: "fountains", icon: "⛲", sortOrder: 3 },
  { name: "Ground Spinners", slug: "ground-spinners", icon: "🌀", sortOrder: 4 },
  { name: "Aerial Shells", slug: "aerial-shells", icon: "💥", sortOrder: 5 },
  { name: "Combo Packs", slug: "combo-packs", icon: "📦", sortOrder: 6 },
];

const PRODUCTS = [
  // Sparklers
  {
    name: "Golden Sparklers 30cm (Pack of 10)",
    slug: "golden-sparklers-30cm-pack-10",
    description: "Classic gold sparklers that burn for 60 seconds each. Safe for all ages with adult supervision. Perfect for birthdays and Diwali celebrations.",
    price: 149,
    discountPrice: 99,
    category: "sparklers",
    stock: 500,
    weight: "150g",
    isFeatured: true,
    tags: '["sparklers","birthday","diwali","safe"]',
    images: '["/images/products/sparklers-golden.jpg"]',
  },
  {
    name: "Silver Fountain Sparklers (Pack of 6)",
    slug: "silver-fountain-sparklers-pack-6",
    description: "Brilliant silver sparklers with a 45-second burn time. Creates a beautiful fountain effect.",
    price: 199,
    discountPrice: 149,
    category: "sparklers",
    stock: 350,
    weight: "200g",
    tags: '["sparklers","silver","fountain"]',
    images: '["/images/products/sparklers-silver.jpg"]',
  },
  // Rockets
  {
    name: "Sky Thunder Rocket (Single)",
    slug: "sky-thunder-rocket-single",
    description: "High-altitude single-stage rocket that explodes with a brilliant gold star burst at 80ft. Loud report with trailing silver tail.",
    price: 299,
    discountPrice: 249,
    category: "rockets",
    stock: 200,
    weight: "80g",
    isFeatured: true,
    tags: '["rockets","loud","aerial"]',
    images: '["/images/products/rocket-thunder.jpg"]',
  },
  {
    name: "Rainbow Rocket (Pack of 3)",
    slug: "rainbow-rocket-pack-3",
    description: "Three colour-changing rockets — each breaks into red, green, and blue stars at peak altitude.",
    price: 599,
    discountPrice: 499,
    category: "rockets",
    stock: 150,
    weight: "240g",
    tags: '["rockets","colourful","pack"]',
    images: '["/images/products/rocket-rainbow.jpg"]',
  },
  // Fountains
  {
    name: "Volcano Fountain (Large)",
    slug: "volcano-fountain-large",
    description: "90-second ground fountain erupts with golden lava sparks, crackling effects, and a final star burst. Ideal for outdoor use.",
    price: 499,
    discountPrice: 399,
    category: "fountains",
    stock: 300,
    weight: "400g",
    isFeatured: true,
    tags: '["fountain","outdoor","grand"]',
    images: '["/images/products/fountain-volcano.jpg"]',
  },
  {
    name: "Colour Cascade Fountain (Medium)",
    slug: "colour-cascade-fountain-medium",
    description: "60-second fountain with alternating red, green, gold, and silver colour changes throughout the burn.",
    price: 349,
    discountPrice: 279,
    category: "fountains",
    stock: 250,
    weight: "280g",
    tags: '["fountain","colourful","medium"]',
    images: '["/images/products/fountain-cascade.jpg"]',
  },
  // Ground Spinners
  {
    name: "Turbo Chakkar (Pack of 4)",
    slug: "turbo-chakkar-pack-4",
    description: "High-speed ground spinners that emit colourful sparks and a whistle effect. Traditional Diwali favourite.",
    price: 199,
    discountPrice: 149,
    category: "ground-spinners",
    stock: 400,
    weight: "120g",
    tags: '["spinner","chakkar","diwali","traditional"]',
    images: '["/images/products/spinner-turbo.jpg"]',
  },
  {
    name: "Galaxy Spinner (Pack of 6)",
    slug: "galaxy-spinner-pack-6",
    description: "Premium ground spinners with multi-colour sparks and a titanium crackling effect.",
    price: 349,
    discountPrice: 299,
    category: "ground-spinners",
    stock: 280,
    weight: "180g",
    tags: '["spinner","galaxy","premium"]',
    images: '["/images/products/spinner-galaxy.jpg"]',
  },
  // Aerial Shells
  {
    name: "Peony Aerial Shell (3-shot)",
    slug: "peony-aerial-shell-3-shot",
    description: "Three-shot tube that launches professional-grade peony shells to 100ft. Each shell breaks into 200+ golden stars.",
    price: 799,
    discountPrice: 649,
    category: "aerial-shells",
    stock: 120,
    weight: "350g",
    isFeatured: true,
    tags: '["aerial","shell","peony","professional"]',
    images: '["/images/products/aerial-peony.jpg"]',
  },
  {
    name: "Brocade Crown Shell (5-shot)",
    slug: "brocade-crown-shell-5-shot",
    description: "Five-shot sequence with hanging brocade tails that form a glittering crown pattern against the night sky.",
    price: 1299,
    discountPrice: 1099,
    category: "aerial-shells",
    stock: 80,
    weight: "550g",
    tags: '["aerial","shell","brocade","premium"]',
    images: '["/images/products/aerial-brocade.jpg"]',
  },
  // Combo Packs
  {
    name: "Diwali Starter Pack",
    slug: "diwali-starter-pack",
    description: "Everything you need to celebrate Diwali! Includes 2x golden sparklers, 1x volcano fountain, 2x turbo chakkars, and 1x sky thunder rocket. Best value combo for families.",
    price: 999,
    discountPrice: 799,
    category: "combo-packs",
    stock: 200,
    isCombo: true,
    isFeatured: true,
    tags: '["combo","diwali","family","value","starter"]',
    images: '["/images/products/combo-starter.jpg"]',
  },
  {
    name: "Grand Festival Combo",
    slug: "grand-festival-combo",
    description: "The ultimate fireworks collection — 20+ items including aerial shells, fountains, rockets, sparklers, and spinners. Enough for a 45-minute show.",
    price: 2499,
    discountPrice: 1999,
    category: "combo-packs",
    stock: 100,
    isCombo: true,
    isFeatured: true,
    tags: '["combo","grand","premium","festival","show"]',
    images: '["/images/products/combo-grand.jpg"]',
  },
  {
    name: "Kids Safe Sparkler Pack",
    slug: "kids-safe-sparkler-pack",
    description: "Specially curated safe sparklers for children (under adult supervision). 20 sparklers in 4 colours — pink, blue, gold, green.",
    price: 249,
    discountPrice: 199,
    category: "sparklers",
    stock: 450,
    weight: "220g",
    tags: '["sparklers","kids","safe","colourful"]',
    images: '["/images/products/sparklers-kids.jpg"]',
  },
  {
    name: "Anaar Fountain (Small, Pack of 3)",
    slug: "anaar-fountain-small-pack-3",
    description: "Three small traditional anaar fountains, each burning for 40 seconds with golden sparks. Classic and crowd-favourite.",
    price: 149,
    discountPrice: 119,
    category: "fountains",
    stock: 600,
    weight: "150g",
    tags: '["fountain","anaar","traditional","small"]',
    images: '["/images/products/fountain-anaar.jpg"]',
  },
  {
    name: "Bijli Pattaka (100-shot String)",
    slug: "bijli-pattaka-100-shot",
    description: "100-shot firecrackers in a string. Classic celebration cracker with rapid-Starsound effect.",
    price: 199,
    discountPrice: 149,
    category: "aerial-shells",
    stock: 350,
    weight: "300g",
    tags: '["pattaka","bijli","string","traditional"]',
    images: '["/images/products/pattaka-bijli.jpg"]',
  },
  {
    name: "Flower Pot Fountain (Medium, Pack of 2)",
    slug: "flower-pot-fountain-medium-pack-2",
    description: "Two medium flower pot fountains with multi-colour sparks and a crackling finish. Easy to light, stunning effect.",
    price: 299,
    discountPrice: 249,
    category: "fountains",
    stock: 200,
    weight: "260g",
    tags: '["fountain","flower","colourful"]',
    images: '["/images/products/fountain-flowerpot.jpg"]',
  },
  {
    name: "Night Queen Rocket (Pack of 5)",
    slug: "night-queen-rocket-pack-5",
    description: "Five sleek rockets with a silver trail and glittering red/green star burst at peak. Perfect for rooftop celebrations.",
    price: 699,
    discountPrice: 599,
    category: "rockets",
    stock: 130,
    weight: "400g",
    tags: '["rockets","pack","premium"]',
    images: '["/images/products/rocket-nightqueen.jpg"]',
  },
  {
    name: "Wheel of StarGround Spinner",
    slug: "wheel-of-fire-ground-spinner",
    description: "Dramatic large ground spinner that creates a 60cm ring of golden Starbefore launching colour-changing sparks.",
    price: 449,
    discountPrice: 379,
    category: "ground-spinners",
    stock: 90,
    weight: "250g",
    tags: '["spinner","large","dramatic","wheel"]',
    images: '["/images/products/spinner-wheel.jpg"]',
  },
  {
    name: "Budget Diwali Pack",
    slug: "budget-diwali-pack",
    description: "Great value starter combo — 10 golden sparklers, 2 anaar fountains, 1 sky thunder rocket, and 4 chakkars. Perfect for apartments and small spaces.",
    price: 499,
    discountPrice: 399,
    category: "combo-packs",
    stock: 300,
    isCombo: true,
    isFeatured: true,
    tags: '["combo","budget","apartment","value"]',
    images: '["/images/products/combo-budget.jpg"]',
  },
  {
    name: "Whistling Pete Rocket (Pack of 10)",
    slug: "whistling-pete-rocket-pack-10",
    description: "Pack of 10 whistling rockets with a distinctive ascending whistle and bright gold break. Great for drawing attention at any celebration.",
    price: 799,
    discountPrice: 649,
    category: "rockets",
    stock: 160,
    weight: "500g",
    tags: '["rockets","whistle","pack","loud"]',
    images: '["/images/products/rocket-whistling.jpg"]',
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Clean up existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();
  await prisma.banner.deleteMany();

  // ── Categories ──────────────────────────────────────────────────────────────
  console.log("📁 Creating categories...");
  const categoryMap: Record<string, string> = {};

  for (const cat of CATEGORIES) {
    const created = await prisma.category.create({ data: cat });
    categoryMap[cat.slug] = created.id;
  }

  // ── Products ────────────────────────────────────────────────────────────────
  console.log("📦 Creating products...");
  for (const p of PRODUCTS) {
    const { category, ...rest } = p;
    await prisma.product.create({
      data: {
        ...rest,
        categoryId: categoryMap[category],
      },
    });
  }

  // ── Admin User ───────────────────────────────────────────────────────────────
  console.log("👤 Creating admin user...");
  const adminHash = await bcrypt.hash("Admin@123", 12);
  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@firecrackers.in",
      phone: "9000000000",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  // ── Sample Customer ──────────────────────────────────────────────────────────
  console.log("👤 Creating sample customer...");
  const customerHash = await bcrypt.hash("Customer@123", 12);
  await prisma.user.create({
    data: {
      name: "Ravi Kumar",
      email: "ravi@example.com",
      phone: "9876543210",
      passwordHash: customerHash,
      role: "CUSTOMER",
    },
  });

  // ── Coupons ──────────────────────────────────────────────────────────────────
  console.log("🎟️ Creating coupons...");
  await prisma.coupon.createMany({
    data: [
      {
        code: "DIWALI10",
        type: "PERCENT",
        value: 10,
        minOrderValue: 500,
        expiresAt: new Date("2026-11-30"),
        usageLimit: 100,
      },
      {
        code: "FLAT100",
        type: "FLAT",
        value: 100,
        minOrderValue: 799,
        expiresAt: new Date("2026-12-31"),
        usageLimit: 50,
      },
    ],
  });

  // ── Banners ──────────────────────────────────────────────────────────────────
  console.log("🖼️ Creating banners...");
  await prisma.banner.createMany({
    data: [
      {
        title: "Diwali Sale — Up to 40% Off",
        imageUrl: "/images/banners/banner-diwali.jpg",
        linkUrl: "/products",
        isActive: true,
        sortOrder: 1,
      },
      {
        title: "Grand Festival Combo",
        imageUrl: "/images/banners/banner-combo.jpg",
        linkUrl: "/products/grand-festival-combo",
        isActive: true,
        sortOrder: 2,
      },
    ],
  });

  console.log("✅ Seeding complete!");
  console.log("─────────────────────────────────");
  console.log("Admin:    admin@firecrackers.in  / Admin@123");
  console.log("Customer: ravi@example.com       / Customer@123");
  console.log("─────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
