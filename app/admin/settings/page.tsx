"use client";

import { useEffect, useState } from "react";
import { toast } from "@/components/ui/Toast";

interface Settings {
  ageGateEnabled: string;
  ageGateText: string;
  licenseNumber: string;
  pesoCceDetails: string;
  disclaimerText: string;
  minOrderValueForDelivery: string;
  selfPickupEnabled: string;
  orderCutoffDate: string;
  deliveryDefaultAllow: string;
  defaultCourierPartner: string;
  deliveryFee: string;
  freeDeliveryThreshold: string;
  topBannerEnabled: string;
  topBannerText: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    ageGateEnabled: "false",
    ageGateText: "",
    licenseNumber: "",
    pesoCceDetails: "",
    disclaimerText: "",
    minOrderValueForDelivery: "0",
    selfPickupEnabled: "false",
    orderCutoffDate: "",
    deliveryDefaultAllow: "true",
    defaultCourierPartner: "",
    deliveryFee: "49",
    freeDeliveryThreshold: "999",
    topBannerEnabled: "true",
    topBannerText: "Festival Sale is LIVE! Up to 40% OFF on all Crackers",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setSettings((prev) => ({ ...prev, ...data }));
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to save");
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof Settings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="bg-white p-8 rounded-3xl border border-gray-200/60 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-center backdrop-blur-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 font-display">
            Site Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure compliance, delivery, and store rules
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Compliance Section */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm backdrop-blur-md">
          <h2 className="text-xl font-black text-gray-900 font-display mb-6 tracking-tight flex items-center gap-2 border-b border-gray-100 pb-4">
            <span className="text-xl">📜</span> Compliance & Legal
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Explosives License Number
              </label>
              <input
                type="text"
                value={settings.licenseNumber}
                onChange={(e) => handleChange("licenseNumber", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                PESO/CCE Details
              </label>
              <input
                type="text"
                value={settings.pesoCceDetails}
                onChange={(e) => handleChange("pesoCceDetails", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Footer Disclaimer Text
              </label>
              <textarea
                value={settings.disclaimerText}
                onChange={(e) => handleChange("disclaimerText", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Age Gate Section */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm backdrop-blur-md">
          <h2 className="text-xl font-black text-gray-900 font-display mb-6 tracking-tight flex items-center gap-2 border-b border-gray-100 pb-4">
            <span className="text-xl">🔞</span> Age Verification Gate
          </h2>
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50">
              <input
                type="checkbox"
                id="ageGateEnabled"
                checked={settings.ageGateEnabled === "true"}
                onChange={(e) =>
                  handleChange(
                    "ageGateEnabled",
                    e.target.checked ? "true" : "false",
                  )
                }
                className="w-5 h-5 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <label
                htmlFor="ageGateEnabled"
                className="text-sm font-bold text-gray-900 cursor-pointer select-none"
              >
                Enable Age Gate on first visit
              </label>
            </div>
            <div
              className={`transition-opacity ${settings.ageGateEnabled !== "true" ? "opacity-50" : ""}`}
            >
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Age Gate Text
              </label>
              <textarea
                value={settings.ageGateText}
                onChange={(e) => handleChange("ageGateText", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium resize-none"
                rows={2}
                placeholder="e.g. You must be 18+ to enter this site..."
                disabled={settings.ageGateEnabled !== "true"}
              />
            </div>
          </div>
        </div>

        {/* Delivery & Ordering Section */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm backdrop-blur-md">
          <h2 className="text-xl font-black text-gray-900 font-display mb-6 tracking-tight flex items-center gap-2 border-b border-gray-100 pb-4">
            <span className="text-xl">🚚</span> Delivery & Ordering Rules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Order Cutoff Date
              </label>
              <input
                type="datetime-local"
                value={settings.orderCutoffDate}
                onChange={(e) =>
                  handleChange("orderCutoffDate", e.target.value)
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium"
              />
              <p className="text-xs text-gray-500 mt-2 font-medium">
                Orders placed after this date will be blocked.
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Min Order Value (Delivery)
              </label>
              <input
                type="number"
                value={settings.minOrderValueForDelivery}
                onChange={(e) =>
                  handleChange("minOrderValueForDelivery", e.target.value)
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Delivery Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={settings.deliveryFee}
                onChange={(e) => handleChange("deliveryFee", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium"
              />
              <p className="text-xs text-gray-500 mt-2 font-medium">
                Flat fee charged on orders below the free delivery threshold.
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Free Delivery Threshold (₹)
              </label>
              <input
                type="number"
                min="0"
                value={settings.freeDeliveryThreshold}
                onChange={(e) => handleChange("freeDeliveryThreshold", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium"
              />
              <p className="text-xs text-gray-500 mt-2 font-medium">
                Orders above this amount get free delivery. Set 0 to always charge.
              </p>
            </div>
            <div className="md:col-span-2 flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50 mt-2">
              <input
                type="checkbox"
                id="selfPickupEnabled"
                checked={settings.selfPickupEnabled === "true"}
                onChange={(e) =>
                  handleChange(
                    "selfPickupEnabled",
                    e.target.checked ? "true" : "false",
                  )
                }
                className="w-5 h-5 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <label
                htmlFor="selfPickupEnabled"
                className="text-sm font-bold text-gray-900 cursor-pointer select-none"
              >
                Enable Self-Pickup Option at Checkout
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading || saving}
            className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-8 py-4 rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.23)] hover:-translate-y-0.5 transition-all uppercase tracking-wider disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? "Saving Changes..." : "Save All Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
