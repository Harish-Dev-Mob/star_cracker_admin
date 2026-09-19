"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "./actions";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

interface Category {
  id: string;
  name: string;
}

interface InitialData {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  discountPrice: string;
  categoryId: string;
  images: string;
  stock: string;
  weight: string;
  isActive: boolean;
  isCombo: boolean;
  isFeatured: boolean;
  crackerType: string;
  lowStockThreshold: string;
  gstRate: string;
  hsnCode: string;
}

export default function ProductCreateForm({ 
  categories,
  initialData,
}: { 
  categories: Category[];
  initialData?: InitialData;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialData || {
    name: "",
    slug: "",
    description: "",
    price: "",
    discountPrice: "",
    categoryId: categories.length > 0 ? categories[0].id : "",
    images: "",
    stock: "0",
    weight: "",
    isActive: true,
    isCombo: false,
    isFeatured: false,
    crackerType: "TRADITIONAL",
    lowStockThreshold: "10",
    gstRate: "18",
    hsnCode: "",
  });

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !formData.slug.includes("-user-modified")) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      if (!initialData) {
        setFormData((prev) => ({ ...prev, slug: generatedSlug }));
      }
    }
  }, [formData.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
        stock: parseInt(formData.stock, 10),
        images: formData.images.split(",").map(url => url.trim()).filter(url => url !== ""),
        crackerType: formData.crackerType,
        lowStockThreshold: parseInt(formData.lowStockThreshold, 10) || 10,
        gstRate: parseFloat(formData.gstRate) || 18,
        hsnCode: formData.hsnCode,
      };

      let res;
      if (initialData?.id) {
        res = await updateProduct(initialData.id, payload);
      } else {
        res = await createProduct(payload);
      }

      if (res.success) {
        toast.success("Success", initialData ? "Product updated successfully!" : "Product created successfully!");
        router.push("/admin/products");
      } else {
        toast.error("Error", res.error || "Failed to save product.");
      }
    } catch (err: any) {
      toast.error("Error", err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none overflow-hidden p-6 md:p-8">
      <h2 className="text-xl font-black text-gray-900 dark:text-white font-display mb-6 tracking-tight flex items-center gap-2">
        <span className="text-2xl">📦</span> Basic Information
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-medium"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Jumbo Sparklers"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Slug (URL) *
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-medium"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value + "-user-modified" })}
            placeholder="jumbo-sparklers"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            required
            rows={4}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-medium resize-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the product..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Category *
          </label>
          <select
            required
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-medium appearance-none"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Images (Comma separated URLs) *
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-medium"
            value={formData.images}
            onChange={(e) => setFormData({ ...formData, images: e.target.value })}
            placeholder="/images/products/sparkler.jpg, ..."
          />
        </div>
      </div>

      <h2 className="text-xl font-black text-gray-900 dark:text-white font-display mb-6 tracking-tight flex items-center gap-2 pt-6 border-t border-gray-100 dark:border-gray-800">
        <span className="text-2xl">💰</span> Pricing & Inventory
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Price (₹) *
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-medium"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="0.00"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Discount Price (₹)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-medium"
            value={formData.discountPrice}
            onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
            placeholder="Optional"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Stock Quantity *
          </label>
          <input
            type="number"
            required
            min="0"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-medium"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Weight
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-medium"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            placeholder="e.g. 500g"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Cracker Type *
          </label>
          <select
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-medium appearance-none"
            value={formData.crackerType}
            onChange={(e) => setFormData({ ...formData, crackerType: e.target.value })}
          >
            <option value="TRADITIONAL">Traditional</option>
            <option value="GREEN">Green Cracker</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Low Stock Threshold
          </label>
          <input
            type="number"
            min="0"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-medium"
            value={formData.lowStockThreshold}
            onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            GST Rate (%) *
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-medium"
            value={formData.gstRate}
            onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            HSN Code
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-medium"
            value={formData.hsnCode}
            onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
          />
        </div>
      </div>

      <h2 className="text-xl font-black text-gray-900 dark:text-white font-display mb-6 tracking-tight flex items-center gap-2 pt-6 border-t border-gray-100 dark:border-gray-800">
        <span className="text-2xl">✨</span> Product Flags
      </h2>

      <div className="flex flex-wrap gap-8 mb-8">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="sr-only"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
          <div className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 shadow-inner ${formData.isActive ? 'bg-[var(--color-primary)]' : 'bg-gray-200 dark:bg-gray-700'}`}>
            <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Active
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="sr-only"
            checked={formData.isFeatured}
            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
          />
          <div className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 shadow-inner ${formData.isFeatured ? 'bg-[var(--color-primary)]' : 'bg-gray-200 dark:bg-gray-700'}`}>
            <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${formData.isFeatured ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Featured
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="sr-only"
            checked={formData.isCombo}
            onChange={(e) => setFormData({ ...formData, isCombo: e.target.checked })}
          />
          <div className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 shadow-inner ${formData.isCombo ? 'bg-[var(--color-primary)]' : 'bg-gray-200 dark:bg-gray-700'}`}>
            <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${formData.isCombo ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Combo Pack
          </span>
        </label>
      </div>

      <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/products")}
          className="px-6 h-12 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="px-8 h-12 rounded-xl text-sm uppercase tracking-wider font-bold shadow-lg hover:shadow-[var(--color-primary)]/20 transition-all"
        >
          {isSubmitting ? "Saving..." : (initialData ? "Update Product" : "Create Product")}
        </Button>
      </div>
    </form>
  );
}
