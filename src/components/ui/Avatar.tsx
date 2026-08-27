import React from "react";
import { cn } from "@/utils";
import { INITIALS_MAP } from "@/utils";

interface AvatarProps {
  src?: string;
  name: string;
  slug?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  slug,
  size = "md",
  className,
}) => {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-28 h-28 text-2xl",
    xl: "w-40 h-40 text-4xl",
  };

  const initials = slug && INITIALS_MAP[slug] ? INITIALS_MAP[slug] : name.slice(0, 2).toUpperCase();

  return (
    <div
      className={cn(
        "relative rounded-full border-2 border-accent-teal overflow-hidden flex items-center justify-center bg-bg-tertiary text-accent-teal font-display font-bold select-none",
        sizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
