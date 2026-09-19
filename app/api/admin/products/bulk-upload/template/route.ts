import { NextResponse } from "next/server";

/**
 * GET /api/admin/products/bulk-upload/template
 *
 * Generates a fully-featured Excel (.xlsx) bulk-upload template matching
 * every field in the Product model.
 *
 * Sheet layout
 * ────────────
 * Sheet 1 – "Instructions"  → field reference + rules
 * Sheet 2 – "Products"      → data entry sheet with headers + sample rows
 *
 * Category sections: a row where column A (Category) is filled and all
 * other columns are empty marks the start of a new category. Every
 * product row below it belongs to that category.
 *
 * Columns (Products sheet):
 *   A  Category         – category name (fill only on first row of a section)
 *   B  Product Name     – required
 *   C  Description      – optional (auto-generated if blank)
 *   D  MRP (₹)          – required, numeric
 *   E  Sale Price (₹)   – optional; leave blank → no discount
 *   F  Unit / Weight    – e.g. "1 PKT", "500g", "1 BOX"
 *   G  Stock            – numeric, default 100
 *   H  Low Stock Alert  – numeric, default 10
 *   I  Image URL 1      – direct public URL (https://…)
 *   J  Image URL 2      – optional extra image
 *   K  Image URL 3      – optional extra image
 *   L  Is Active        – "Yes" / "No"  (default Yes → auto-approved)
 *   M  Is Featured      – "Yes" / "No"  (default No)
 *   N  Is Combo         – "Yes" / "No"  (default No)
 *   O  Cracker Type     – "TRADITIONAL" / "GREEN"
 *   P  GST Rate (%)     – numeric, default 18
 *   Q  HSN Code         – optional compliance code
 *   R  Tags             – comma-separated tags, e.g. "diwali,popular"
 */
export async function GET() {
  const XLSX = await import("xlsx");

  const wb = XLSX.utils.book_new();

  /* ── Sheet 1: Instructions ─────────────────────────────────────────── */
  const INSTR: (string | number)[][] = [
    ["🎆  Star Cracker — Bulk Product Upload Template"],
    [""],
    ["HOW TO FILL THE 'Products' SHEET"],
    ["─────────────────────────────────────────────────────────────────────────────────────────────────"],
    ["1. Do NOT rename or delete either sheet."],
    ["2. Row 1 of the Products sheet is the HEADER — do not edit it."],
    ["3. To start a NEW CATEGORY: fill column A with the category name; leave B–R blank."],
    ["   All product rows below that row (until the next category row) belong to that category."],
    ["4. For every PRODUCT ROW: leave column A blank and fill B–R."],
    ["5. Columns marked * are REQUIRED. Others are optional and have defaults."],
    ["6. All products are set to Active automatically — no extra approval step."],
    ["7. Duplicate products (same name+category) are skipped safely."],
    ["8. Image URLs must be publicly accessible https:// links."],
    ["   To use existing product images already on your server, enter the path from /public, e.g. /images/products/my-img.jpg"],
    [""],
    ["COLUMN REFERENCE"],
    ["─────────────────────────────────────────────────────────────────────────────────────────────────"],
    ["Col", "Field",           "Required?", "Default",       "Notes"],
    ["A",   "Category",        "* (section)","—",            "Category name row — leave blank on product rows"],
    ["B",   "Product Name",    "*",          "—",            "Full product name"],
    ["C",   "Description",     "",           "Auto-generated","Short description; auto-generated from name+unit if blank"],
    ["D",   "MRP (₹)",         "*",          "—",            "Original/list price (number only, no ₹ sign)"],
    ["E",   "Sale Price (₹)",  "",           "Same as MRP",  "Discounted sale price; leave blank if no discount"],
    ["F",   "Unit / Weight",   "",           "1 PKT",        "Pack description e.g. '1 PKT', '500g', '1 BOX'"],
    ["G",   "Stock",           "",           "100",          "Initial quantity in stock (whole number)"],
    ["H",   "Low Stock Alert", "",           "10",           "Admin is alerted when stock drops below this"],
    ["I",   "Image URL 1",     "",           "—",            "Public URL of the main product image"],
    ["J",   "Image URL 2",     "",           "—",            "Additional image (optional)"],
    ["K",   "Image URL 3",     "",           "—",            "Additional image (optional)"],
    ["L",   "Is Active",       "",           "Yes",          "'Yes' = visible on the shop / 'No' = hidden"],
    ["M",   "Is Featured",     "",           "No",           "'Yes' = shown in featured sections"],
    ["N",   "Is Combo",        "",           "No",           "'Yes' = this is a combo/gift-box product"],
    ["O",   "Cracker Type",    "",           "TRADITIONAL",  "'TRADITIONAL' or 'GREEN' (eco-friendly)"],
    ["P",   "GST Rate (%)",    "",           "18",           "GST percentage e.g. 5, 12, 18, 28"],
    ["Q",   "HSN Code",        "",           "—",            "HSN code for GST compliance (optional)"],
    ["R",   "Tags",            "",           "—",            "Comma-separated tags, e.g. 'diwali,popular,bestseller'"],
  ];

  const wsInstr = XLSX.utils.aoa_to_sheet(INSTR);
  wsInstr["!cols"] = [{ wch: 6 }, { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 75 }];
  XLSX.utils.book_append_sheet(wb, wsInstr, "Instructions");

  /* ── Sheet 2: Products ─────────────────────────────────────────────── */
  const HEADER = [
    "Category",
    "Product Name",
    "Description",
    "MRP (₹)",
    "Sale Price (₹)",
    "Unit / Weight",
    "Stock",
    "Low Stock Alert",
    "Image URL 1",
    "Image URL 2",
    "Image URL 3",
    "Is Active",
    "Is Featured",
    "Is Combo",
    "Cracker Type",
    "GST Rate (%)",
    "HSN Code",
    "Tags",
  ];

  // Sample data — two categories, mixed rows
  const DATA: (string | number)[][] = [
    // ── Category section ──
    ["SOUND CRACKERS", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "Classic Thunder 10s",   "Pack of 10 thunder shots — intense sound effect", 250, 199, "1 PKT", 50,  10, "https://example.com/img/thunder.jpg", "", "", "Yes", "No",  "No",  "TRADITIONAL", 18, "3604100", "sound,popular"],
    ["", "Mega Bomb Single",      "",                                                 180, 149, "1 PKT", 80,  10, "", "", "", "Yes", "No",  "No",  "TRADITIONAL", 18, "",         "bomb"],
    ["", "Super Deluxe Thunder",  "Top seller — super loud, 5 rounds",                320, 279, "1 PKT", 30,   5, "", "", "", "Yes", "Yes", "No",  "TRADITIONAL", 18, "3604100", "featured,deluxe"],
    // ── Category section ──
    ["FANCY FLOWER POTS", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "Rainbow Flower Pot",    "Eco-friendly rainbow flower pot",                  120,  99, "1 BOX", 60,  10, "", "", "", "Yes", "No",  "No",  "GREEN",        12, "3604900", "eco,flower"],
    ["", "Jumbo Golden Fountain", "",                                                  200, 169, "1 BOX", 40,   5, "", "", "", "Yes", "Yes", "No",  "GREEN",        12, "",         "featured,fountain"],
    // ── Category section ──
    ["KIDS ITEMS (NO DISCOUNT)", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "Sparkle Wand 12pc",     "Safe sparkler sticks for kids, pack of 12",         80,   "", "1 BOX", 100, 20, "", "", "", "Yes", "No",  "No",  "GREEN",         5, "3604900", "kids,safe,sparkler"],
    // ── Category section ──
    ["FANCY GIFT BOXES (NO DISCOUNT)", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "Diwali Bumper Gift Box","Premium assorted crackers gift box",                999,   "", "1 BOX",  20,   5, "", "", "", "Yes", "Yes", "Yes", "TRADITIONAL",  18, "3604100", "gift,combo,diwali"],
  ];

  const rows: (string | number)[][] = [HEADER, ...DATA];
  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws["!cols"] = [
    { wch: 36 },  // A Category
    { wch: 34 },  // B Product Name
    { wch: 45 },  // C Description
    { wch: 10 },  // D MRP
    { wch: 14 },  // E Sale Price
    { wch: 13 },  // F Unit
    { wch: 8  },  // G Stock
    { wch: 15 },  // H Low Stock
    { wch: 45 },  // I Image 1
    { wch: 45 },  // J Image 2
    { wch: 45 },  // K Image 3
    { wch: 10 },  // L Is Active
    { wch: 12 },  // M Is Featured
    { wch: 10 },  // N Is Combo
    { wch: 14 },  // O Cracker Type
    { wch: 12 },  // P GST Rate
    { wch: 12 },  // Q HSN Code
    { wch: 30 },  // R Tags
  ];

  // Freeze header row
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };

  XLSX.utils.book_append_sheet(wb, ws, "Products");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="StarCracker_BulkUpload_Template.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
