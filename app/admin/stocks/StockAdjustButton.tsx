"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toast";

interface Props {
  productId: string;
  currentStock: number;
}

export default function StockAdjustButton({ productId, currentStock }: Props) {
  const router = useRouter();
  const [stock, setStock] = useState(currentStock);
  const [isPending, startTransition] = useTransition();

  const adjust = async (delta: number) => {
    const res = await fetch("/api/admin/stocks/adjust", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, delta }),
    });

    if (!res.ok) {
      toast.error("Failed", "Could not update stock.");
      return;
    }

    const data = await res.json();
    setStock(data.stock);
    toast.success("Stock updated", `New stock: ${data.stock} units`);
    startTransition(() => router.refresh());
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => adjust(-1)}
        disabled={isPending || stock === 0}
        title="Remove 1 unit"
        className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 text-red-600 font-black text-sm
          hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all
          flex items-center justify-center cursor-pointer"
      >
        −
      </button>
      <span className="w-10 text-center text-sm font-black text-gray-900 tabular-nums">
        {stock}
      </span>
      <button
        onClick={() => adjust(1)}
        disabled={isPending}
        title="Add 1 unit"
        className="w-7 h-7 rounded-lg bg-green-50 border border-green-200 text-green-700 font-black text-sm
          hover:bg-green-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all
          flex items-center justify-center cursor-pointer"
      >
        +
      </button>
    </div>
  );
}
