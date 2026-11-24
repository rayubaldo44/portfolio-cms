/**
 * Section: Layout | Type: Server | Deps: cn, Link
 */
import Link from "next/link";
import { type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  children?: ReactNode;
}

export function Section({
  as: Component = "section",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <Component className={cn("py-20 md:py-28", className)} {...props}>
      {children}
    </Component>
  );
}

interface SectionHeadingProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  align?: "left" | "center";
  action?: { label: string; href: string };
}

export function SectionHeading({
  title,
  description,
  align = "left",
  action,
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
      {...props}
    >
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <h2 className="type-section-title text-gray-900 dark:text-gray-50">
          {title}
        </h2>
        {action && (
          <Link
            href={action.href}
            className="type-action group shrink-0 text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
          >
            {action.label}{" "}
            <span aria-hidden="true" className="ml-1 inline-block font-sans text-base font-semibold text-gray-700 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none dark:text-gray-300">
              →
            </span>
          </Link>
        )}
      </div>
      {description && (
        <p className="type-body text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
}
