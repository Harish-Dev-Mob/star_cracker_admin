import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const checkId = id ?? (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={checkId}
          className={cn(
            "flex items-start gap-3 cursor-pointer group",
            props.disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <input
            ref={ref}
            id={checkId}
            type="checkbox"
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--color-border)]",
              "accent-[var(--color-primary)] cursor-pointer",
              "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]",
              error && "border-[var(--color-error)]",
              className
            )}
            {...props}
          />
          {label && (
            <span className="text-sm text-[var(--color-text)] leading-snug">
              {label}
            </span>
          )}
        </label>
        {error && (
          <p className="text-xs text-[var(--color-error)] ml-7">⚠ {error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
export { Checkbox };
