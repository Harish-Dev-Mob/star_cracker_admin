import { PrismaClient } from "../generated/prisma";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
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
    stock: 250,
    weight: "200g",
    isFeatured: false,
    tags: '["sparklers","silver","fountain"]',
    images: '["/images/products/sparklers-silver.jpg"]',
  },
  {
    name: "Color Changing Sparklers (Pack of 5)",
    slug: "color-changing-sparklers-pack-5",
    description: "Extra-long sparklers that change color from red to green to gold as they burn. 90-second burn time.",
    price: 249,
    discountPrice: 199,
    category: "sparklers",
    stock: 150,
    weight: "250g",
    isFeatured: true,
    tags: '["sparklers","color-changing","premium"]',
    images: '["/images/products/sparklers-color.jpg"]',
  },

  // Rockets
  {
    name: "Whistling Silver Rockets (Pack of 12)",
    slug: "whistling-silver-rockets-pack-12",
    description: "High-flying rockets that emit a loud whistle before bursting into a silver shower.",
    price: 349,
    discountPrice: 299,
    category: "rockets",
    stock: 200,
    weight: "300g",
    isFeatured: true,
    tags: '["rockets","whistling","silver","aerial"]',
    images: '["/images/products/rockets-silver.jpg"]',
  },
  {
    name: "Giant Parachute Rocket (Single)",
    slug: "giant-parachute-rocket-single",
    description: "Reaches 200 feet before deploying a glowing parachute that floats slowly back to earth.",
    price: 149,
    discountPrice: 129,
    category: "rockets",
    stock: 100,
    weight: "100g",
    isFeatured: false,
    tags: '["rockets","parachute","daytime"]',
    images: '["/images/products/rockets-parachute.jpg"]',
  },
  {
    name: "Thunder King Rocket Assortment",
    slug: "thunder-king-rocket-assortment",
    description: "A pack of 6 massive rockets with various effects including crackling willow, red peony, and brocade crown.",
    price: 899,
    discountPrice: 799,
    category: "rockets",
    stock: 50,
    weight: "800g",
    isFeatured: true,
    tags: '["rockets","assortment","premium","loud"]',
    images: '["/images/products/rockets-thunder.jpg"]',
  },

  // Fountains
  {
    name: "Mega Volcano Fountain",
    slug: "mega-volcano-fountain",
    description: "Cone fountain that builds in intensity, reaching a height of 15 feet with crackling gold and silver sparks. Lasts 2 minutes.",
    price: 499,
    discountPrice: 399,
    category: "fountains",
    stock: 75,
    weight: "450g",
    isFeatured: true,
    tags: '["fountains","volcano","cone","long-lasting"]',
    images: '["/images/products/fountain-volcano.jpg"]',
  },
  {
    name: "Peacock Tail Fountain (Pack of 2)",
    slug: "peacock-tail-fountain-pack-2",
    description: "Spreads out in a wide fan shape resembling a peacock\'s tail. Vibrant blue, green, and red stars.",
    price: 399,
    discountPrice: 349,
    category: "fountains",
    stock: 120,
    weight: "350g",
    isFeatured: false,
    tags: '["fountains","colorful","fan"]',
    images: '["/images/products/fountain-peacock.jpg"]',
  },
  {
    name: "Magic Flower Pot (Pack of 10)",
    slug: "magic-flower-pot-pack-10",
    description: "Classic small fountains that emit a crackling gold spray. Ideal for small spaces.",
    price: 199,
    discountPrice: 149,
    category: "fountains",
    stock: 300,
    weight: "200g",
    isFeatured: false,
    tags: '["fountains","flower-pot","small"]',
    images: '["/images/products/fountain-flowerpot.jpg"]',
  },

  // Ground Spinners
  {
    name: "Chakkra Gold (Pack of 25)",
    slug: "chakkra-gold-pack-25",
    description: "Traditional ground spinners that spin rapidly while emitting a continuous gold shower.",
    price: 249,
    discountPrice: 199,
    category: "ground-spinners",
    stock: 400,
    weight: "300g",
    isFeatured: true,
    tags: '["spinners","chakkra","traditional"]',
    images: '["/images/products/spinner-chakkra.jpg"]',
  },
  {
    name: "Color Changing UFO Spinners (Pack of 10)",
    slug: "color-changing-ufo-spinners-pack-10",
    description: "Spins on the ground changing colors, then lifts off slightly with a whistling sound.",
    price: 349,
    discountPrice: 299,
    category: "ground-spinners",
    stock: 150,
    weight: "250g",
    isFeatured: false,
    tags: '["spinners","ufo","color-changing","whistling"]',
    images: '["/images/products/spinner-ufo.jpg"]',
  },

  // Aerial Shells
  {
    name: "25-Shot Golden Willow Cake",
    slug: "25-shot-golden-willow-cake",
    description: "Multi-shot repeater that fires 25 shots of golden willow effects with blue stars. High altitude.",
    price: 1299,
    discountPrice: 1099,
    category: "aerial-shells",
    stock: 40,
    weight: "1.5kg",
    isFeatured: true,
    tags: '["aerial","cake","multi-shot","willow"]',
    images: '["/images/products/aerial-25shot.jpg"]',
  },
  {
    name: "100-Shot Crackling Matrix",
    slug: "100-shot-crackling-matrix",
    description: "Intense rapid-fire cake bursting with 100 shots of loud crackling stars. Perfect finale piece.",
    price: 2499,
    discountPrice: 1999,
    category: "aerial-shells",
    stock: 20,
    weight: "3kg",
    isFeatured: true,
    tags: '["aerial","cake","finale","crackling"]',
    images: '["/images/products/aerial-100shot.jpg"]',
  },
  {
    name: "Single 3-Inch Titanium Salute",
    slug: "single-3-inch-titanium-salute",
    description: "A single large reloadable shell that produces a massive, loud white flash (salute).",
    price: 499,
    discountPrice: 449,
    category: "aerial-shells",
    stock: 80,
    weight: "400g",
    isFeatured: false,
    tags: '["aerial","shell","loud","salute"]',
    images: '["/images/products/aerial-salute.jpg"]',
  },

  // Combo Packs
  {
    name: "Kids Safe Diwali Assortment",
    slug: "kids-safe-diwali-assortment",
    description: "A curated box of sparklers, small fountains, and magic snakes. Handpicked for safety and fun without loud bangs.",
    price: 999,
    discountPrice: 799,
    category: "combo-packs",
    stock: 100,
    weight: "1.2kg",
    isFeatured: true,
    isCombo: true,
    tags: '["combo","kids","safe","noise-free"]',
    images: '["/images/products/combo-kids.jpg"]',
  },
  {
    name: "Grand Festival Mega Box",
    slug: "grand-festival-mega-box",
    description: "The ultimate collection for a complete display. Includes 2 cakes, 10 rockets, 5 large fountains, sparklers, and spinners.",
    price: 4999,
    discountPrice: 3999,
    category: "combo-packs",
    stock: 25,
    weight: "8kg",
    isFeatured: true,
    isCombo: true,
    tags: '["combo","premium","finale","complete-show"]',
    images: '["/images/products/combo-mega.jpg"]',
  },
];

async function main() {
  console.log("🌱 Seeding database (Safe Mode for Production)...");

  // ── Categories ──────────────────────────────────────────────────────────────
  console.log("📁 Creating/Updating categories...");
  const categoryMap: Record<string, string> = {};

  for (const cat of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap[cat.slug] = created.id;
  }

  // ── Products ────────────────────────────────────────────────────────────────
  console.log("📦 Creating/Updating products...");
  for (const p of PRODUCTS) {
    const { category, ...rest } = p;
    await prisma.product.upsert({
      where: { slug: rest.slug },
      update: {
        ...rest,
        categoryId: categoryMap[category],
      },
      create: {
        ...rest,
        categoryId: categoryMap[category],
      },
    });
  }

  // ── Admin User ───────────────────────────────────────────────────────────────
  console.log("👤 Ensuring admin user exists...");
  const adminEmail = "admin@firecrackers.in";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const adminHash = await bcrypt.hash("Admin@2026", 12);
    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        phone: "9000000000",
        passwordHash: adminHash,
        role: "ADMIN",
      },
    });
    console.log("   ✅ Admin created.");
  } else {
    console.log("   ✅ Admin already exists, skipping.");
  }

  // ── Sample Customer ──────────────────────────────────────────────────────────
  console.log("👤 Ensuring sample customer exists...");
  const customerEmail = "ravi@example.com";
  const existingCustomer = await prisma.user.findUnique({ where: { email: customerEmail } });
  if (!existingCustomer) {
    const customerHash = await bcrypt.hash("Customer@2026", 12);
    await prisma.user.create({
      data: {
        name: "Ravi Kumar",
        email: customerEmail,
        phone: "9876543210",
        passwordHash: customerHash,
        role: "CUSTOMER",
      },
    });
    console.log("   ✅ Customer created.");
  } else {
    console.log("   ✅ Customer already exists, skipping.");
  }

  // ── Coupons ──────────────────────────────────────────────────────────────────
  console.log("🎟️ Ensuring coupons exist...");
  const coupons = [
    {
      code: "DIWALI10",
      type: "PERCENT" as const,
      value: 10,
      minOrderValue: 500,
      expiresAt: new Date("2026-11-30"),
      usageLimit: 100,
    },
    {
      code: "FLAT100",
      type: "FLAT" as const,
      value: 100,
      minOrderValue: 799,
      expiresAt: new Date("2026-12-31"),
      usageLimit: 50,
    },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }

  // ── Banners ──────────────────────────────────────────────────────────────────
  console.log("🖼️ Ensuring banners exist...");
  const bannerCount = await prisma.banner.count();
  if (bannerCount === 0) {
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
  }

  console.log("✅ Dynamic Seeding complete (Production Safe)!");
  console.log("─────────────────────────────────");
  console.log("Admin:    admin@firecrackers.in  / Admin@2026 (if newly created)");
  console.log("Customer: ravi@example.com       / Customer@2026 (if newly created)");
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
