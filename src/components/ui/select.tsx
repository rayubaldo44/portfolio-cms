/**
 * Section: UI Primitives | Type: Both | Deps: cn
 */
import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-800 dark:text-gray-200"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={cn(
            "h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900",
            "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 focus:border-gray-400",
            "dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100",
            "dark:focus:ring-gray-600 dark:focus:border-gray-600 dark:focus:ring-offset-gray-900",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500",
            className,
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
