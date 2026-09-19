"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProduct(data: {
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  categoryId: string;
  images: string[];
  stock: number;
  weight?: string;
  isActive: boolean;
  isCombo: boolean;
  isFeatured: boolean;
  crackerType?: string;
  lowStockThreshold?: number;
  gstRate?: number;
  hsnCode?: string;
}) {
  try {
    // Basic validation
    if (!data.name || !data.slug || !data.categoryId || !data.price) {
      return { success: false, error: "Missing required fields" };
    }

    // Check if slug already exists
    const existing = await prisma.product.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return { success: false, error: "A product with this slug already exists. Please choose a different one." };
    }

    await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        discountPrice: data.discountPrice || null,
        categoryId: data.categoryId,
        images: JSON.stringify(data.images),
        stock: data.stock,
        weight: data.weight || null,
        isActive: data.isActive,
        isCombo: data.isCombo,
        isFeatured: data.isFeatured,
        crackerType: data.crackerType || "TRADITIONAL",
        lowStockThreshold: data.lowStockThreshold || 10,
        gstRate: data.gstRate || 18,
        hsnCode: data.hsnCode || null,
        tags: JSON.stringify([]), // Default empty tags for now
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return { success: false, error: error.message || "Failed to create product" };
  }
}

export async function updateProduct(id: string, data: {
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  categoryId: string;
  images: string[];
  stock: number;
  weight?: string;
  isActive: boolean;
  isCombo: boolean;
  isFeatured: boolean;
  crackerType?: string;
  lowStockThreshold?: number;
  gstRate?: number;
  hsnCode?: string;
}) {
  try {
    if (!id) {
      return { success: false, error: "Missing product ID" };
    }

    if (!data.name || !data.slug || !data.categoryId || !data.price) {
      return { success: false, error: "Missing required fields" };
    }

    // Check if slug already exists for ANOTHER product
    const existing = await prisma.product.findUnique({
      where: { slug: data.slug },
    });
    if (existing && existing.id !== id) {
      return { success: false, error: "A product with this slug already exists. Please choose a different one." };
    }

    await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        discountPrice: data.discountPrice || null,
        categoryId: data.categoryId,
        images: JSON.stringify(data.images),
        stock: data.stock,
        weight: data.weight || null,
        isActive: data.isActive,
        isCombo: data.isCombo,
        isFeatured: data.isFeatured,
        crackerType: data.crackerType || "TRADITIONAL",
        lowStockThreshold: data.lowStockThreshold || 10,
        gstRate: data.gstRate || 18,
        hsnCode: data.hsnCode || null,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${data.slug}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating product:", error);
    return { success: false, error: error.message || "Failed to update product" };
  }
}
