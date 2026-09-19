import { prisma } from "@/lib/prisma";
import ProductCreateForm from "../new/ProductCreateForm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProductEditPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) return notFound();

  let imagesStr = "";
  try {
    const images = JSON.parse(product.images);
    imagesStr = images.join(", ");
  } catch {
    imagesStr = product.images;
  }

  const initialData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price.toString(),
    discountPrice: product.discountPrice?.toString() || "",
    categoryId: product.categoryId,
    images: imagesStr,
    stock: product.stock.toString(),
    weight: product.weight || "",
    isActive: product.isActive,
    isCombo: product.isCombo,
    isFeatured: product.isFeatured,
    crackerType: product.crackerType,
    lowStockThreshold: product.lowStockThreshold.toString(),
    gstRate: product.gstRate.toString(),
    hsnCode: product.hsnCode || "",
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
        <Link href="/admin/products" className="hover:text-gray-700 transition-colors">
          Products
        </Link>
        <span>/</span>
        <span className="text-gray-700">Edit</span>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200/60 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-60" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 font-display tracking-tight">Edit Product</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Update details for {product.name}.</p>
        </div>
      </div>

      <ProductCreateForm categories={categories} initialData={initialData} />
    </div>
  );
}
