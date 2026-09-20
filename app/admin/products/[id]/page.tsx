import { prisma } from "@/lib/prisma";
import ProductCreateForm from "../new/ProductCreateForm";
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
    <div className="max-w-5xl mx-auto pb-8">
      <ProductCreateForm categories={categories} initialData={initialData} />
    </div>
  );
}
