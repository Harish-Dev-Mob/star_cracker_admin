"use client";

import { useState } from "react";
import { updateCustomer } from "./actions";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

interface CustomerProps {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: "CUSTOMER" | "ADMIN";
  isBlocked: boolean;
}

export default function CustomerEditForm({ customer }: { customer: CustomerProps }) {
  const [formData, setFormData] = useState({
    name: customer.name,
    email: customer.email || "",
    phone: customer.phone || "",
    role: customer.role,
    isBlocked: customer.isBlocked,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await updateCustomer(customer.id, formData);
      if (res.success) {
        toast.success("Success", "Customer details updated.");
      } else {
        toast.error("Error", res.error || "Failed to update customer.");
      }
    } catch (err: any) {
      toast.error("Error", err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden mt-8 p-6 md:p-8">
      <h2 className="text-xl font-black text-gray-900 dark:text-white font-display mb-6 tracking-tight flex items-center gap-2">
        <span className="text-2xl">⚙️</span> Edit Details
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Role
          </label>
          <select
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium appearance-none"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as "CUSTOMER" | "ADMIN" })}
          >
            <option value="CUSTOMER">Customer</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-6 border-t border-gray-100 dark:border-gray-800">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="sr-only"
            checked={formData.isBlocked}
            onChange={(e) => setFormData({ ...formData, isBlocked: e.target.checked })}
          />
          <div className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 shadow-inner ${formData.isBlocked ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
            <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${formData.isBlocked ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Block Customer Account
          </span>
        </label>
        
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="w-full md:w-auto px-8 h-12 rounded-xl text-sm uppercase tracking-wider font-bold shadow-lg hover:shadow-[var(--color-primary)]/20 transition-all"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
