import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.number().positive("Price must be a positive number"),
  discountPrice: z.number().positive().optional(),
  categoryId: z.string().min(1, "Category is required"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  weight: z.string().optional(),
  isActive: z.boolean().default(true),
  isCombo: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string()).min(1, "At least one image is required"),
});

export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  icon: z.string().optional(),
  image: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, "Coupon code must be at least 3 characters")
    .max(20, "Coupon code cannot exceed 20 characters")
    .regex(/^[A-Z0-9]+$/, "Coupon code must be uppercase letters and numbers only")
    .toUpperCase(),
  type: z.enum(["PERCENT", "FLAT"]),
  value: z.number().positive("Value must be positive"),
  minOrderValue: z.number().min(0).default(0),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
  usageLimit: z.number().int().positive().optional(),
});

export type CouponInput = z.infer<typeof couponSchema>;
