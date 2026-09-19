"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  hideCloseButton?: boolean;
}

const sizeClasses = {
  sm:   "max-w-sm",
  md:   "max-w-md",
  lg:   "max-w-lg",
  xl:   "max-w-2xl",
  full: "max-w-5xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className,
  hideCloseButton = false,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKey]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        ref={contentRef}
        className={cn(
          "relative w-full bg-[var(--color-bg-card)] rounded-[var(--radius-xl)]",
          "shadow-[var(--shadow-lg)] border border-[var(--color-border)]",
          "flex flex-col max-h-[90vh]",
          "animate-slide-up",
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {(title || !hideCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
            {title && (
              <h2 className="text-lg font-bold text-[var(--color-text)] font-display">
                {title}
              </h2>
            )}
            {!hideCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close modal"
                className="ml-auto text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                ✕
              </Button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
