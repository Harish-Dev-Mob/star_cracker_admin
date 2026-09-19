import { cn } from "@/lib/utils";
import { forwardRef, ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "accent";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] active:scale-[0.98] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
  secondary:
    "bg-transparent text-[var(--color-primary)] border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white",
  ghost:
    "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-bg-muted)]",
  destructive:
    "bg-[var(--color-error)] text-white hover:bg-red-700 active:scale-[0.98]",
  accent:
    "bg-[var(--color-accent)] text-[var(--color-primary-dark)] hover:bg-[var(--color-accent-dark)] hover:text-white font-bold shadow-[var(--shadow-sm)] animate-pulse-glow",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm:   "h-8  px-3  text-xs  gap-1.5",
  md:   "h-10 px-5  text-sm  gap-2",
  lg:   "h-12 px-7  text-base gap-2.5",
  icon: "h-10 w-10 p-0",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base
          "inline-flex items-center justify-center font-semibold rounded-[var(--radius-md)]",
          "transition-all duration-[var(--transition-fast)] cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2",
          // Variant + size
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading…</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
