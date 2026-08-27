import React from "react";
import { cn } from "@/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-inter uppercase tracking-wider text-text-secondary">
          {label}
        </label>
      )}
      <input
        className={cn(
          "bg-bg-tertiary border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-teal transition-colors",
          error && "border-accent-orange",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-accent-orange">{error}</span>}
    </div>
  );
};
