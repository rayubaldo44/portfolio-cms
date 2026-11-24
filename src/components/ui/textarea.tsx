/**
 * Section: UI Primitives | Type: Both | Deps: cn
 */
import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helper, id, ...props }, ref) => {
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
        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          rows={props.rows ?? 4}
          aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
          className={cn(
            "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900",
            "placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 focus:border-gray-400",
            "dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500",
            "dark:focus:ring-gray-600 dark:focus:border-gray-600 dark:focus:ring-offset-gray-900",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500",
            className,
          )}
          {...props}
        />
        {helper && !error && (
          <p id={`${inputId}-helper`} className="text-xs text-gray-500 dark:text-gray-400">
            {helper}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
