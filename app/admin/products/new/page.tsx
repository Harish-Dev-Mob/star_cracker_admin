import { prisma } from "@/lib/prisma";
import ProductCreateForm from "./ProductCreateForm";

export default async function AdminProductCreatePage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="max-w-5xl mx-auto pb-8">
      <ProductCreateForm categories={categories} />
    </div>
  );
}
