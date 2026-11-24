/**
 * Section: UI Primitives | Type: Both | Deps: cn
 */
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, helper, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200"
        >
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className={cn(
              "size-4 rounded border-gray-300 text-gray-900 accent-gray-900 focus:ring-2 focus:ring-gray-400 dark:border-gray-700 dark:accent-gray-50",
              className,
            )}
            {...props}
          />
          {label}
        </label>
        {helper && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{helper}</p>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
