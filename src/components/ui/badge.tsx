/**
 * Section: UI Primitives | Type: Both | Deps: cn
 */
import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "outline" | "accent";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900",
  secondary:
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  outline:
    "border border-gray-200 text-gray-600 dark:border-gray-800 dark:text-gray-400",
  accent:
    "bg-accent-subtle text-accent dark:text-accent-muted",
};

export function Badge({
  className,
  variant = "secondary",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium leading-4 tracking-wide",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
