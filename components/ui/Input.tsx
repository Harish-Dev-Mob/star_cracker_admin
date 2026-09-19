import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftAddon, rightAddon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-bold text-slate-500 uppercase tracking-wide"
          >
            {label}
            {props.required && (
              <span className="text-[#b91c1c] ml-1">*</span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {leftAddon && (
            <div className="absolute left-3 text-[var(--color-text-muted)] pointer-events-none">
              {leftAddon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-12 px-4 rounded-xl text-base font-medium",
              "bg-white",
              "text-[var(--color-text)] placeholder:text-gray-400",
              leftAddon && "pl-10",
              rightAddon && "pr-10",
              className
            )}
            {...props}
          />

          {rightAddon && (
            <div className="absolute right-3 text-[var(--color-text-muted)]">
              {rightAddon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-[var(--color-error)] flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
