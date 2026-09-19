"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Make a slug unique by appending a numeric suffix if needed */
async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let attempt = 0;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing) return slug;
    attempt++;
    slug = `${base}-${attempt}`;
  }
}

// ─── Category icon map ────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  "ONE SOUND CRACKERS": "🔊",
  "CHORSA CRACKERS": "💥",
  "GIANT CRACKERS": "🏔️",
  "DELUXE CRACKERS": "✨",
  "SOUND CRACKERS": "🔥",
  "BIJILI CRACKERS": "⚡",
  "FANCY FLOWER POTS": "🌸",
  "FANCY GROUND CHAKKARS": "🌀",
  "FUN FANCY VARIETIES": "🎉",
  "SPECIAL FANCY FOUNTAIN ITEMS": "⛲",
  "FANCY FUN NIGHTS": "🌙",
  "FANCY WHEELING ITEMS": "🎡",
  "PEACOCK SERIES": "🦚",
  "FANCY PENCIL": "✏️",
  "FANCY MULTICOLOUR SHOTS": "🌈",
  "PEACOCK DANCE MULTICOLOUR CRACKLING WITH SIZZLING SHOTS": "🦚",
  "WHISTLING SHOTS": "🎶",
  "FANCY SET OUTS": "🎆",
  "PAPER BOMB": "💣",
  "FANCY GIFT BOXES (NO DISCOUNT)": "🎁",
  "KIDS ITEMS (NO DISCOUNT)": "🧒",
  "COLOUR MATCH BOXES (NO DISCOUNT)": "🎨",
};

function iconForCategory(name: string): string {
  const upper = name.trim().toUpperCase();
  if (CATEGORY_ICONS[upper]) return CATEGORY_ICONS[upper];
  if (upper.includes("COMET") || upper.includes("PIPE")) return "🚀";
  if (upper.includes("COMBO")) return "🎁";
  if (upper.includes("DOUBLE BALL")) return "🎯";
  return "🎆";
}

// ─── Types ────────────────────────────────────────────────────────────────────

/** Used by the original CSV uploader (kept for backwards compat) */
export type BulkProductData = {
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  weight?: string;
  categoryId: string;
  images: string[];
};

/**
 * Row parsed from the Excel template on the client.
 * Maps 1-to-1 to the Product model fields.
 */
export type ExcelProductRow = {
  // ── Required ──────────────────────────────────────────────────────────────
  /** Raw product name (column B) */
  name: string;
  /** Category section header (column A category row) */
  categoryName: string;
  /** MRP / list price (column D) */
  price: number;

  // ── Optional — all have server-side defaults ───────────────────────────────
  /** Short description (column C; auto-generated if blank) */
  description: string;
  /** Discounted / sale price (column E; null = no discount) */
  discountPrice: number | null;
  /** Unit / weight label, e.g. "1 PKT" | "1 BOX" | "500g" (column F) */
  unit: string;
  /** Initial stock quantity (column G, default 100) */
  stock: number;
  /** Low-stock alert threshold (column H, default 10) */
  lowStockThreshold: number;
  /** Up to 3 public image URLs (columns I, J, K) */
  images: string[];
  /** Whether the product is visible in the shop (column L, default true) */
  isActive: boolean;
  /** Whether shown in featured sections (column M, default false) */
  isFeatured: boolean;
  /** Whether this is a combo/gift-box product (column N, default false) */
  isCombo: boolean;
  /** "TRADITIONAL" | "GREEN" (column O, default "TRADITIONAL") */
  crackerType: string;
  /** GST % e.g. 5, 12, 18, 28 (column P, default 18) */
  gstRate: number;
  /** HSN code for GST compliance (column Q, optional) */
  hsnCode: string;
  /** Comma-separated tags parsed into an array (column R) */
  tags: string[];
};

// ─── Original CSV bulk create (unchanged, kept for backwards compat) ──────────

export async function bulkCreateProducts(products: BulkProductData[]) {
  try {
    if (!products || products.length === 0) {
      return { success: false, error: "No products provided." };
    }

    const incomingSlugs = products.map((p) => p.slug);
    const existingProducts = await prisma.product.findMany({
      where: { slug: { in: incomingSlugs } },
      select: { slug: true },
    });

    const existingSlugs = new Set(existingProducts.map((p) => p.slug));
    const productsToInsert = products.filter((p) => !existingSlugs.has(p.slug));
    const skippedCount = products.length - productsToInsert.length;

    if (productsToInsert.length === 0) {
      return {
        success: false,
        error: "All provided products already exist (based on matching slugs).",
      };
    }

    await prisma.$transaction(
      productsToInsert.map((p) =>
        prisma.product.create({
          data: {
            name: p.name,
            slug: p.slug,
            description: p.description,
            price: p.price,
            discountPrice: p.discountPrice || null,
            stock: p.stock,
            weight: p.weight || null,
            categoryId: p.categoryId,
            images: JSON.stringify(p.images),
            isActive: true,
            isCombo: false,
            isFeatured: false,
            tags: JSON.stringify([]),
          },
        })
      )
    );

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return { success: true, inserted: productsToInsert.length, skipped: skippedCount };
  } catch (error: any) {
    console.error("Bulk upload error:", error);
    return { success: false, error: error.message || "Failed to bulk insert products." };
  }
}

// ─── Excel bulk create ────────────────────────────────────────────────────────

export async function bulkCreateProductsFromExcel(rows: ExcelProductRow[]) {
  try {
    if (!rows || rows.length === 0) {
      return { success: false, error: "No products found in the uploaded file." };
    }

    // 1. Collect unique category names
    const uniqueCategoryNames = [...new Set(rows.map((r) => r.categoryName.trim()))];

    // 2. Upsert each category (create if missing, return existing id if present)
    const categoryIdMap: Record<string, string> = {};

    for (let i = 0; i < uniqueCategoryNames.length; i++) {
      const catName = uniqueCategoryNames[i];
      const catSlug = slugify(catName);
      const icon = iconForCategory(catName);

      const existing = await prisma.category.findUnique({ where: { slug: catSlug } });
      if (existing) {
        categoryIdMap[catName] = existing.id;
      } else {
        const created = await prisma.category.create({
          data: { name: catName, slug: catSlug, icon, sortOrder: i, isActive: true },
        });
        categoryIdMap[catName] = created.id;
      }
    }

    // 3. Insert products — skip if slug already exists
    let inserted = 0;
    let skipped  = 0;

    for (const row of rows) {
      const categoryId = categoryIdMap[row.categoryName.trim()];
      if (!categoryId) { skipped++; continue; }

      const baseSlug = slugify(row.name);
      if (!baseSlug)  { skipped++; continue; }

      // Skip exact duplicates
      const exact = await prisma.product.findUnique({ where: { slug: baseSlug } });
      if (exact) { skipped++; continue; }

      const slug = await uniqueSlug(baseSlug);

      // Images: filter blank entries
      const imageArr = (row.images ?? []).filter(Boolean);

      // Tags: filter blank entries
      const tagsArr = (row.tags ?? []).filter(Boolean);

      await prisma.product.create({
        data: {
          name:              row.name.trim(),
          slug,
          description:       row.description?.trim() || `${row.name.trim()} — ${row.unit || "1 PKT"}`,
          price:             row.price,
          discountPrice:     row.discountPrice     ?? null,
          stock:             row.stock             ?? 100,
          lowStockThreshold: row.lowStockThreshold ?? 10,
          categoryId,
          images:            JSON.stringify(imageArr),
          isActive:          row.isActive          ?? true,   // auto-approve ✅
          isCombo:           row.isCombo           ?? false,
          isFeatured:        row.isFeatured        ?? false,
          crackerType:       row.crackerType       || "TRADITIONAL",
          gstRate:           row.gstRate           ?? 18,
          hsnCode:           row.hsnCode           || null,
          tags:              JSON.stringify(tagsArr),
          weight:            row.unit              || null,
        },
      });

      inserted++;
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/admin/categories");

    return {
      success: true,
      inserted,
      skipped,
      categoriesCreated: uniqueCategoryNames.length,
    };
  } catch (error: any) {
    console.error("Excel bulk upload error:", error);
    return { success: false, error: error.message || "Failed to bulk insert products from Excel." };
  }
}
