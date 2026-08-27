import React from "react";
import { cn } from "@/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "teal" | "orange" | "neutral";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  className,
}) => {
  const variants = {
    teal: "bg-accent-teal/10 border-accent-teal/30 text-accent-teal",
    orange: "bg-accent-orange/10 border-accent-orange/30 text-accent-orange",
    neutral: "bg-bg-tertiary border-border text-text-secondary",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full border text-xs font-inter font-semibold uppercase tracking-wider",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
