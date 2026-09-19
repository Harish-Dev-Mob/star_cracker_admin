"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { bulkCreateProductsFromExcel, ExcelProductRow } from "./actions";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

// ─── Category icon map (client-side) ─────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function yn(val: string): boolean {
  return val.toLowerCase() === "yes" || val.toLowerCase() === "y";
}

function numOrDefault(val: unknown, def: number): number {
  if (typeof val === "number" && isFinite(val)) return val;
  const n = parseFloat(String(val ?? ""));
  return isFinite(n) ? n : def;
}

// ─── Excel parser (runs in the browser) ──────────────────────────────────────
//
// Template column layout (Products sheet):
//   A  Category         (section header row — leave blank on product rows)
//   B  Product Name     *
//   C  Description
//   D  MRP (₹)          *
//   E  Sale Price (₹)
//   F  Unit / Weight
//   G  Stock            (default 100)
//   H  Low Stock Alert  (default 10)
//   I  Image URL 1
//   J  Image URL 2
//   K  Image URL 3
//   L  Is Active        (Yes/No, default Yes)
//   M  Is Featured      (Yes/No, default No)
//   N  Is Combo         (Yes/No, default No)
//   O  Cracker Type     (TRADITIONAL/GREEN, default TRADITIONAL)
//   P  GST Rate (%)     (default 18)
//   Q  HSN Code
//   R  Tags             (comma-separated)
//
// Backwards-compatible with the legacy 5-column format
// (S.NO | Name | MRP | Unit | Sale Price):
//   A  S.NO  (number) → product row in legacy mode
//   B  Name, C MRP, D Unit, E Sale Price

async function parseExcelFile(file: File): Promise<{
  rows: ExcelProductRow[];
  categories: string[];
  errors: string[];
}> {
  const XLSX = await import("xlsx");

  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });

  // Prefer sheet named "Products"; fall back to the first sheet
  const sheetName = wb.SheetNames.includes("Products")
    ? "Products"
    : wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  const rawRows: (string | number | null)[][] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: "",
  }) as (string | number | null)[][];

  const rows: ExcelProductRow[] = [];
  const categories: string[] = [];
  const errors: string[] = [];

  let currentCategory = "";

  rawRows.forEach((row, i) => {
    if (i === 0) return; // skip header

    const col0 = row[0];  // A  Category / S.NO (legacy)
    const col1 = String(row[1]  ?? "").trim(); // B  Product Name
    const col2 = row[2];  // C  Description  (or MRP in legacy)
    const col3 = row[3];  // D  MRP          (or Unit in legacy)
    const col4 = row[4];  // E  Sale Price
    const col5 = row[5];  // F  Unit / Weight (or Stock in legacy)
    const col6 = row[6];  // G  Stock
    const col7 = row[7];  // H  Low Stock Alert
    const col8  = String(row[8]  ?? "").trim(); // I  Image URL 1
    const col9  = String(row[9]  ?? "").trim(); // J  Image URL 2
    const col10 = String(row[10] ?? "").trim(); // K  Image URL 3
    const col11 = String(row[11] ?? "").trim(); // L  Is Active
    const col12 = String(row[12] ?? "").trim(); // M  Is Featured
    const col13 = String(row[13] ?? "").trim(); // N  Is Combo
    const col14 = String(row[14] ?? "").trim(); // O  Cracker Type
    const col15 = row[15]; // P  GST Rate
    const col16 = String(row[16] ?? "").trim(); // Q  HSN Code
    const col17 = String(row[17] ?? "").trim(); // R  Tags

    // ── Detect category-section row ──────────────────────────────────
    // New format:  col0 = category name (string), col1 = "" (product name blank)
    // Legacy format: col0 = category name (string), col1 = "" also works
    if (typeof col0 === "string" && col0.trim() !== "" && col1 === "") {
      currentCategory = col0.trim();
      if (!categories.includes(currentCategory)) {
        categories.push(currentCategory);
      }
      return;
    }

    // ── Detect legacy product row (S.NO is a number, Name in col1) ───
    const isLegacyRow = typeof col0 === "number" && col1 !== "";

    // ── Detect new-format product row (col0 is empty, Name in col1) ──
    const isNewRow = (col0 === "" || col0 === null) && col1 !== "";

    if (!isLegacyRow && !isNewRow) return; // skip anything else

    if (!currentCategory) {
      errors.push(`Row ${i + 1}: "${col1}" has no category section above it.`);
      return;
    }

    let price: number;
    let discountPrice: number | null;
    let unit: string;
    let description: string;

    if (isLegacyRow) {
      // Legacy: A=S.NO, B=Name, C=MRP, D=Unit, E=SalePrice
      price         = numOrDefault(col2, 0);
      discountPrice = typeof col4 === "number" && col4 > 0 ? col4 : null;
      unit          = String(col3 ?? "").trim() || "1 PKT";
      description   = "";
    } else {
      // New: A=empty, B=Name, C=Description, D=MRP, E=SalePrice, F=Unit
      description   = String(col2 ?? "").trim();
      price         = numOrDefault(col3, 0);
      discountPrice = typeof col4 === "number" && col4 > 0 ? col4 : null;
      unit          = String(col5 ?? "").trim() || "1 PKT";
    }

    if (price <= 0) {
      errors.push(`Row ${i + 1}: "${col1}" has no valid MRP — skipped.`);
      return;
    }

    const stock             = isLegacyRow ? numOrDefault(col5, 100) : numOrDefault(col6, 100);
    const lowStockThreshold = isLegacyRow ? 10                      : numOrDefault(col7, 10);
    const images            = [col8, col9, col10].filter(Boolean);
    const isActive          = isLegacyRow ? true : (col11 === "" ? true : yn(col11));
    const isFeatured        = isLegacyRow ? false : yn(col12);
    const isCombo           = isLegacyRow ? false : yn(col13);
    const crackerType       = isLegacyRow ? "TRADITIONAL" : (col14.toUpperCase() === "GREEN" ? "GREEN" : "TRADITIONAL");
    const gstRate           = isLegacyRow ? 18 : numOrDefault(col15, 18);
    const hsnCode           = isLegacyRow ? "" : col16;
    const tags              = isLegacyRow ? [] : col17.split(",").map((t) => t.trim()).filter(Boolean);

    rows.push({
      name:             col1,
      categoryName:     currentCategory,
      price,
      description,
      discountPrice,
      unit,
      stock,
      lowStockThreshold,
      images,
      isActive,
      isFeatured,
      isCombo,
      crackerType,
      gstRate,
      hsnCode,
      tags,
    });
  });

  return { rows, categories, errors };
}

// ─── Template download ────────────────────────────────────────────────────────

function downloadTemplate() {
  const a = document.createElement("a");
  a.href = "/api/admin/products/bulk-upload/template";
  a.download = "StarCracker_BulkUpload_Template.xlsx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", minimumFractionDigits: 0,
  }).format(n);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BulkUploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedRows, setParsedRows]           = useState<ExcelProductRow[]>([]);
  const [parsedCategories, setParsedCategories] = useState<string[]>([]);
  const [errors, setErrors]                   = useState<string[]>([]);
  const [fileName, setFileName]               = useState<string>("");
  const [isParsing, setIsParsing]             = useState(false);
  const [isSubmitting, setIsSubmitting]       = useState(false);

  // ── File handler ───────────────────────────────────────────────────────────

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setErrors([]);
    setParsedRows([]);
    setParsedCategories([]);
    setFileName(file.name);

    try {
      const { rows, categories, errors: parseErrors } = await parseExcelFile(file);
      if (parseErrors.length > 0) setErrors(parseErrors);
      if (rows.length > 0) {
        setParsedRows(rows);
        setParsedCategories(categories);
      } else if (parseErrors.length === 0) {
        setErrors(["No products could be extracted. Make sure the file matches the template format."]);
      }
    } catch (err: any) {
      setErrors([`Failed to parse file: ${err.message}`]);
    } finally {
      setIsParsing(false);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (parsedRows.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await bulkCreateProductsFromExcel(parsedRows);
      if (res.success) {
        toast.success(
          "Upload Complete 🎉",
          `Inserted ${res.inserted} products across ${res.categoriesCreated} categories.${res.skipped ? ` Skipped ${res.skipped} duplicates.` : ""}`
        );
        router.push("/admin/products");
      } else {
        toast.error("Upload Failed", res.error || "Failed to bulk upload products.");
      }
    } catch (err: any) {
      toast.error("Error", err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasData = parsedRows.length > 0 && errors.length === 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Format Guide + Download Template ──────────────────────────────── */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-800/40 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📋</span>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Excel Format Guide</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              Download the template, fill in your products, then upload it back here.
              Categories, slugs, and image arrays are handled <strong>automatically</strong>.
              All products are set to <strong>Active</strong> instantly — no extra approval needed.
            </p>

            {/* Full column reference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-6">
              {[
                { col: "A", name: "Category",        req: "section", note: "Category name row — leave blank on product rows" },
                { col: "B", name: "Product Name",    req: true,      note: "Full name of the product" },
                { col: "C", name: "Description",     req: false,     note: "Short description (auto-generated if blank)" },
                { col: "D", name: "MRP (₹)",         req: true,      note: "Original list price (number, no ₹ sign)" },
                { col: "E", name: "Sale Price (₹)",  req: false,     note: "Discounted price — leave blank = no discount" },
                { col: "F", name: "Unit / Weight",   req: false,     note: "e.g. '1 PKT', '1 BOX', '500g'" },
                { col: "G", name: "Stock",           req: false,     note: "Initial quantity (default: 100)" },
                { col: "H", name: "Low Stock Alert", req: false,     note: "Alert when stock drops below this (default: 10)" },
                { col: "I", name: "Image URL 1",     req: false,     note: "Main product image (public https:// URL or /images/…)" },
                { col: "J", name: "Image URL 2",     req: false,     note: "Additional image (optional)" },
                { col: "K", name: "Image URL 3",     req: false,     note: "Additional image (optional)" },
                { col: "L", name: "Is Active",       req: false,     note: "'Yes' / 'No' — visible on shop (default: Yes)" },
                { col: "M", name: "Is Featured",     req: false,     note: "'Yes' / 'No' — shown in featured sections (default: No)" },
                { col: "N", name: "Is Combo",        req: false,     note: "'Yes' / 'No' — combo/gift-box product (default: No)" },
                { col: "O", name: "Cracker Type",    req: false,     note: "'TRADITIONAL' or 'GREEN' (eco-friendly)" },
                { col: "P", name: "GST Rate (%)",    req: false,     note: "5 / 12 / 18 / 28 (default: 18)" },
                { col: "Q", name: "HSN Code",        req: false,     note: "HSN code for GST compliance (optional)" },
                { col: "R", name: "Tags",            req: false,     note: "Comma-separated: 'diwali,popular,bestseller'" },
              ].map(({ col, name, req, note }) => (
                <div key={col} className="flex items-start gap-2 text-xs">
                  <span className={`shrink-0 w-6 h-5 flex items-center justify-center rounded font-black text-[10px]
                    ${req === true ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                    : req === "section" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"}`}>
                    {col}
                  </span>
                  <span>
                    <span className="font-bold text-gray-800 dark:text-gray-100">{name}</span>
                    {req === true && <span className="ml-0.5 text-red-500 font-black">*</span>}
                    <span className="text-gray-500 dark:text-gray-400"> — {note}</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3">
              <span className="shrink-0 text-base">💡</span>
              <span>
                <strong className="text-gray-700 dark:text-gray-200">Legacy 5-column format still works</strong> — if your file has S.NO in column A and MRP in column C, the parser auto-detects it.
              </span>
            </div>
          </div>

          {/* Download button */}
          <div className="shrink-0 flex flex-col items-center gap-3">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 transition-all hover:-translate-y-0.5 whitespace-nowrap"
            >
              <span className="text-lg">⬇️</span> Download Template
            </button>
            <p className="text-[10px] text-center text-gray-400">.xlsx · all 18 columns · sample data included</p>
          </div>
        </div>
      </div>

      {/* ── Drop zone ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none overflow-hidden p-6 md:p-8">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
          Upload your filled Excel file
        </label>
        <div
          className="border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-2xl p-10 flex flex-col items-center justify-center bg-orange-50/40 dark:bg-orange-900/10 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform select-none">
            📊
          </div>
          <p className="font-bold text-gray-700 dark:text-gray-300 text-center">
            {fileName
              ? `📄 ${fileName} — click to change`
              : "Click to select your Excel file (.xlsx / .xls)"}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Use the template above for best results
          </p>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* ── Parsing spinner ────────────────────────────────────────────────── */}
      {isParsing && (
        <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="text-3xl animate-spin inline-block mb-3">⚙️</div>
          <p className="font-bold text-gray-600 dark:text-gray-300">Parsing file…</p>
        </div>
      )}

      {/* ── Errors ─────────────────────────────────────────────────────────── */}
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-2xl p-6">
          <h3 className="text-red-700 dark:text-red-400 font-bold mb-3 flex items-center gap-2">
            <span>⚠️</span> Parse issues — please check your file:
          </h3>
          <ul className="list-disc pl-5 text-sm text-red-600 dark:text-red-300 space-y-1">
            {errors.slice(0, 10).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
            {errors.length > 10 && <li>…and {errors.length - 10} more</li>}
          </ul>
        </div>
      )}

      {/* ── Preview ──────────────────────────────────────────────────────── */}
      {hasData && (
        <>
          {/* Summary + action bar */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
            <div className="text-white">
              <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Ready to upload</p>
              <p className="text-2xl font-black mt-0.5">
                {parsedRows.length} Products · {parsedCategories.length} Categories
              </p>
              <p className="text-xs opacity-70 mt-1">
                All products auto-approved (<strong>isActive = true</strong>) · images, GST, tags preserved
              </p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-white text-orange-600 hover:bg-orange-50 font-black px-8 h-12 rounded-xl text-sm shadow-md shrink-0 border-0"
            >
              {isSubmitting ? "Uploading…" : "✅ Confirm & Upload All"}
            </Button>
          </div>

          {/* Categories */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>🗂️</span> Categories ({parsedCategories.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {parsedCategories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-700 px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                  {iconForCategory(cat)} {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Products table */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span>📦</span> Products Preview
                {parsedRows.length > 50 && (
                  <span className="text-xs font-medium text-gray-400 ml-1">
                    (showing first 50 of {parsedRows.length})
                  </span>
                )}
              </h3>
            </div>
            <div className="overflow-x-auto max-h-[32rem]">
              <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                <thead className="text-[10px] text-gray-400 dark:text-gray-500 uppercase bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 font-bold">#</th>
                    <th className="px-4 py-3 font-bold">Product</th>
                    <th className="px-4 py-3 font-bold">Category</th>
                    <th className="px-4 py-3 font-bold text-right">MRP</th>
                    <th className="px-4 py-3 font-bold text-right">Sale</th>
                    <th className="px-4 py-3 font-bold">Unit</th>
                    <th className="px-4 py-3 font-bold text-center">Stock</th>
                    <th className="px-4 py-3 font-bold text-center">Imgs</th>
                    <th className="px-4 py-3 font-bold text-center">Active</th>
                    <th className="px-4 py-3 font-bold text-center">Featured</th>
                    <th className="px-4 py-3 font-bold text-center">Combo</th>
                    <th className="px-4 py-3 font-bold text-center">Type</th>
                    <th className="px-4 py-3 font-bold text-center">GST</th>
                    <th className="px-4 py-3 font-bold">Tags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {parsedRows.slice(0, 50).map((row, i) => (
                    <tr key={i} className="hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">{i + 1}</td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="font-bold text-gray-900 dark:text-white truncate">{row.name}</p>
                        {row.description && (
                          <p className="text-[10px] text-gray-400 truncate">{row.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap">
                          {iconForCategory(row.categoryName)} {row.categoryName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-500 whitespace-nowrap">
                        {row.price > 0 ? fmt(row.price) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-green-700 dark:text-green-400 whitespace-nowrap">
                        {row.discountPrice ? fmt(row.discountPrice) : <span className="text-gray-300 font-normal">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{row.unit || "—"}</td>
                      <td className="px-4 py-3 text-center text-xs font-bold text-gray-700 dark:text-gray-300">
                        {row.stock}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.images.length > 0 ? (
                          <span className="text-green-600 font-black text-xs">{row.images.length}</span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                          row.isActive
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}>
                          {row.isActive ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.isFeatured
                          ? <span className="text-amber-500 font-black text-xs">⭐</span>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.isCombo
                          ? <span className="text-indigo-500 font-black text-xs">🎁</span>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                          row.crackerType === "GREEN"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {row.crackerType === "GREEN" ? "🌿 Green" : "Trad."}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500">{row.gstRate}%</td>
                      <td className="px-4 py-3">
                        {row.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {row.tags.map((t) => (
                              <span key={t} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-1.5 py-px rounded text-[9px] font-medium">
                                {t}
                              </span>
                            ))}
                          </div>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedRows.length > 50 && (
              <div className="p-4 text-center text-sm text-gray-400 border-t border-gray-100 dark:border-gray-800">
                Showing 50 of {parsedRows.length} products — all will be uploaded.
              </div>
            )}
          </div>

          {/* Bottom action */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              variant="primary"
              className="px-10 h-12 rounded-xl text-sm font-black shadow-lg"
            >
              {isSubmitting ? "Uploading…" : `✅ Upload ${parsedRows.length} Products`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
