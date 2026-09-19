"use client";

import { useEffect, useState } from "react";
import { toast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  images: string;
  stock: number;
}

interface ComboItem {
  id?: string;
  productId: string;
  quantity: number;
  product?: Product;
}

interface Combo {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number | null;
  isActive: boolean;
  comboItems?: ComboItem[];
}

export default function CombosPage() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState<{
    name: string;
    slug: string;
    description: string;
    price: string;
    discountPrice: string;
    isActive: boolean;
    items: { productId: string; quantity: number }[];
  }>({
    name: "",
    slug: "",
    description: "",
    price: "",
    discountPrice: "",
    isActive: true,
    items: [],
  });

  const [productSearch, setProductSearch] = useState("");

  const fetchCombos = async () => {
    try {
      const res = await fetch("/api/admin/combos");
      const data = await res.json();
      setCombos(data);
    } catch {
      toast.error("Failed to load combos");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?limit=1000");
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch {
      console.error("Failed to load products");
    }
  };

  useEffect(() => {
    fetchCombos();
    fetchProducts();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);
    try {
      const res = await fetch(`/api/admin/combos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Success", "Combo deleted successfully");
      fetchCombos();
    } catch {
      toast.error("Error", "Failed to delete combo");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.items.length === 0) {
      toast.error("Error", "Please add at least one product to the combo.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        discountPrice: form.discountPrice
          ? parseFloat(form.discountPrice)
          : undefined,
      };

      const url = isEditing && editId ? `/api/admin/combos/${editId}` : "/api/admin/combos";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save");
      toast.success("Success", isEditing ? "Combo updated successfully" : "Combo created successfully");
      setModalOpen(false);
      fetchCombos();
    } catch {
      toast.error("Error", isEditing ? "Failed to update combo" : "Failed to create combo");
    } finally {
      setSaving(false);
    }
  };

  const openCreateModal = () => {
    setForm({
      name: "",
      slug: "",
      description: "",
      price: "",
      discountPrice: "",
      isActive: true,
      items: [],
    });
    setIsEditing(false);
    setEditId(null);
    setProductSearch("");
    setModalOpen(true);
  };

  const openEditModal = (combo: Combo) => {
    setForm({
      name: combo.name,
      slug: combo.slug,
      description: combo.description || "",
      price: combo.price.toString(),
      discountPrice: combo.discountPrice ? combo.discountPrice.toString() : "",
      isActive: combo.isActive,
      items: combo.comboItems ? combo.comboItems.map(item => ({ productId: item.productId, quantity: item.quantity })) : [],
    });
    setIsEditing(true);
    setEditId(combo.id);
    setProductSearch("");
    setModalOpen(true);
  };

  const handleAddItem = (productId: string) => {
    setForm(prev => {
      const existing = prev.items.find(i => i.productId === productId);
      if (existing) {
        return {
          ...prev,
          items: prev.items.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i)
        };
      } else {
        return {
          ...prev,
          items: [...prev.items, { productId, quantity: 1 }]
        };
      }
    });
  };

  const handleUpdateItemQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setForm(prev => ({ ...prev, items: prev.items.filter(i => i.productId !== productId) }));
      return;
    }
    setForm(prev => ({
      ...prev,
      items: prev.items.map(i => i.productId === productId ? { ...i, quantity: qty } : i)
    }));
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));

  const calculateAutoPrice = () => {
    const total = form.items.reduce((sum, item) => {
      const p = products.find(prod => prod.id === item.productId);
      if (!p) return sum;
      return sum + ((p.discountPrice ?? p.price) * item.quantity);
    }, 0);
    setForm(prev => ({ ...prev, price: total.toString() }));
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="bg-white p-8 rounded-3xl border border-gray-200/60 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-center backdrop-blur-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 font-display">
            Combo Packs
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage bundled products</p>
        </div>
        <button
          onClick={openCreateModal}
          className="relative z-10 bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.23)] hover:-translate-y-0.5 transition-all uppercase tracking-wider flex items-center gap-2 mt-4 md:mt-0"
        >
          <span className="text-lg">+</span> Add Combo
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50/50 border-b border-gray-100 uppercase text-[10px] font-black tracking-widest text-gray-500">
              <tr>
                <th className="px-6 py-5">Combo Pack</th>
                <th className="px-6 py-5 text-center">Items</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5 text-right">Pricing</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">
                    Loading combos...
                  </td>
                </tr>
              ) : combos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-400 font-medium">
                      <span className="text-5xl opacity-50">🎁</span>
                      <span className="mt-1">No combos defined yet. Start bundling!</span>
                    </div>
                  </td>
                </tr>
              ) : (
                combos.map((combo) => (
                  <tr key={combo.id} className="group hover:bg-amber-50/30 transition-all duration-300">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center border border-amber-200/50 group-hover:scale-105 transition-transform">
                          <span className="text-xl">🎁</span>
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-base group-hover:text-amber-600 transition-colors">
                            {combo.name}
                          </p>
                          <p className="text-xs text-gray-500 font-medium mt-1 tracking-wide">
                            {combo.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full border border-gray-200">
                        {combo.comboItems?.length || 0} items
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {combo.isActive ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-[10px] font-black uppercase tracking-wider text-green-600 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          Active
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-[10px] font-black uppercase tracking-wider text-gray-500 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                          Inactive
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex flex-col items-end">
                        <p className="font-black text-gray-900 text-lg tracking-tight">
                          ₹{combo.discountPrice ?? combo.price}
                        </p>
                        {combo.discountPrice && (
                          <p className="text-[11px] text-gray-400 line-through font-bold mt-0.5">
                            ₹{combo.price}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(combo)}
                          className="text-blue-600 font-bold text-[11px] uppercase tracking-wider hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(combo.id)}
                          className="text-red-600 font-bold text-[11px] uppercase tracking-wider hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Combo"
        message="Are you sure you want to delete this combo? This action cannot be undone."
      />

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl border border-gray-200 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-red-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="p-6 md:p-8 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-2xl font-black text-gray-900 font-display relative z-10 flex items-center gap-2">
                <span className="text-2xl">🪄</span> {isEditing ? "Edit Combo Pack" : "Create Combo Pack"}
              </h2>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
              <form id="combo-form" onSubmit={handleSave} className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Basic Info */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Basic Info</h3>
                    <div className="group">
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                        Combo Name *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                          setForm({ ...form, name, slug: isEditing ? form.slug : slug });
                        }}
                        className="w-full border border-gray-200 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-bold shadow-sm"
                        placeholder="e.g. Diwali Special Pack"
                        required
                      />
                    </div>
                    <div className="group">
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                        Slug URL *
                      </label>
                      <input
                        type="text"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        className="w-full border border-gray-200 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-bold shadow-sm"
                        placeholder="e.g. diwali-special-pack"
                        required
                      />
                    </div>
                    <div className="group">
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                        Description
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full border border-gray-200 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium shadow-sm resize-none"
                        placeholder="Combo description..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="group">
                        <label className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                          <span>Regular Price (₹) *</span>
                          <button type="button" onClick={calculateAutoPrice} className="text-[var(--color-primary)] lowercase text-[10px] hover:underline" title="Calculate from items sum">Auto</button>
                        </label>
                        <input
                          type="number"
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value })}
                          className="w-full border border-gray-200 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-bold shadow-sm"
                          required
                          min="0"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                          Discount Price (₹)
                        </label>
                        <input
                          type="number"
                          value={form.discountPrice}
                          onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                          className="w-full border border-gray-200 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-bold shadow-sm"
                          min="0"
                        />
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    >
                      <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${form.isActive ? "bg-[var(--color-primary)]" : "bg-gray-300 "}`}>
                        {form.isActive && <span className="text-white text-xs font-bold">✓</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-bold text-gray-900 cursor-pointer select-none">Active on Storefront</label>
                        <span className="text-xs text-gray-500">Combo will be visible to customers</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Items */}
                  <div className="space-y-6 flex flex-col h-full max-h-[600px]">
                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Included Products</h3>
                    
                    {/* Selected Items */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex-1 overflow-y-auto space-y-3 min-h-[200px]">
                      {form.items.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 py-8 font-medium">No products added yet.</p>
                      ) : (
                        form.items.map((item) => {
                          const product = products.find(p => p.id === item.productId);
                          if (!product) return null;
                          return (
                            <div key={item.productId} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                              <div className="flex-1 min-w-0 pr-4">
                                <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                                <p className="text-xs text-gray-500">₹{product.discountPrice ?? product.price}</p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <button type="button" onClick={() => handleUpdateItemQty(item.productId, item.quantity - 1)} className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 font-bold">-</button>
                                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                <button type="button" onClick={() => handleUpdateItemQty(item.productId, item.quantity + 1)} className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 font-bold">+</button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Product Search & List */}
                    <div className="space-y-3 border-t border-gray-100 pt-4">
                      <input
                        type="text"
                        placeholder="Search products to add..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full border border-gray-200 bg-white text-gray-900 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] shadow-sm"
                      />
                      <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar pr-2">
                        {filteredProducts.slice(0, 20).map(product => (
                          <div key={product.id} className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-100" onClick={() => handleAddItem(product.id)}>
                            <span className="truncate pr-4 text-gray-700 font-medium">{product.name}</span>
                            <button type="button" className="text-[var(--color-primary)] font-bold shrink-0 text-xs hover:underline">Add</button>
                          </div>
                        ))}
                        {filteredProducts.length === 0 && (
                          <p className="text-center text-xs text-gray-400 py-4">No products found.</p>
                        )}
                        {filteredProducts.length > 20 && (
                          <p className="text-center text-xs text-gray-400 py-2">...and {filteredProducts.length - 20} more</p>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50 flex-shrink-0 flex gap-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 bg-white border border-gray-200 text-gray-700 px-4 py-4 rounded-xl font-black uppercase tracking-wider text-xs hover:bg-gray-100 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                form="combo-form"
                type="submit"
                disabled={saving}
                className="flex-[2] bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-4 rounded-xl font-black uppercase tracking-wider text-xs shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.23)] hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : (isEditing ? "Update Combo Pack" : "Save Combo Pack")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
