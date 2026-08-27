import React from "react";
import { cn } from "@/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}) => {
  const baseStyles = "font-inter font-semibold transition-all duration-200 inline-flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-accent-teal text-bg-primary hover:bg-accent-teal-dim rounded-full shadow-[0_0_15px_rgba(0,180,166,0.3)] hover:scale-[1.02]",
    secondary: "bg-bg-tertiary text-text-primary hover:bg-border rounded-xl border border-border",
    danger: "border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-xl",
    outline: "border border-border text-text-primary hover:border-accent-teal hover:text-accent-teal rounded-full",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-6 py-2.5",
    lg: "text-base px-8 py-3.5",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};
