import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  children,
  className,
  hoverable = false,
  padding = "md",
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)]",
        "shadow-[var(--shadow-sm)] transition-all duration-[var(--transition-normal)]",
        hoverable && "hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 cursor-pointer",
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-[var(--color-border)] px-5 py-4", className)}>
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}
