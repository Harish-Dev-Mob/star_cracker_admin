import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
  icon: string;
}

const ORDER_STEPS: Step[] = [
  { id: "PLACED",    label: "Placed",    icon: "📝" },
  { id: "CONFIRMED", label: "Confirmed", icon: "✅" },
  { id: "PACKED",    label: "Packed",    icon: "📦" },
  { id: "SHIPPED",   label: "Shipped",   icon: "🚚" },
  { id: "DELIVERED", label: "Delivered", icon: "🎉" },
];

interface StatusTrackerProps {
  currentStatus: string;
  className?: string;
}

export function StatusTracker({ currentStatus, className }: StatusTrackerProps) {
  const isCancelled = currentStatus === "CANCELLED";
  const currentIdx = ORDER_STEPS.findIndex((s) => s.id === currentStatus);

  return (
    <div className={cn("w-full", className)}>
      {isCancelled ? (
        <div className="flex items-center justify-center gap-3 py-6 px-4 bg-red-50 border border-red-200 rounded-[var(--radius-lg)]">
          <span className="text-2xl">❌</span>
          <div>
            <p className="font-semibold text-red-700">Order Cancelled</p>
            <p className="text-sm text-red-500">This order has been cancelled.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          {ORDER_STEPS.map((step, i) => {
            const isComplete = i <= currentIdx;
            const isCurrent = i === currentIdx;
            const isLast = i === ORDER_STEPS.length - 1;

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                {/* Step circle */}
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center text-lg",
                      "transition-all duration-300 border-2",
                      isComplete
                        ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-[var(--shadow-sm)]"
                        : "bg-white border-[var(--color-border)] text-[var(--color-text-light)]",
                      isCurrent && "ring-4 ring-[var(--color-primary)]/20 animate-pulse-glow"
                    )}
                  >
                    {isComplete ? step.icon : (i + 1)}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium whitespace-nowrap",
                      isComplete ? "text-[var(--color-primary)]" : "text-[var(--color-text-light)]"
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div className="flex-1 mx-2 h-0.5 rounded-full mt-[-18px]">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        i < currentIdx
                          ? "bg-[var(--color-primary)]"
                          : "bg-[var(--color-border)]"
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
