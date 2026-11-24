/**
 * Component: Admin Header | Type: Server | Deps: Link
 */
import Link from "next/link";

interface AdminHeaderProps {
  title: string;
  description?: string;
  newHref?: string;
  newLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function AdminHeader({
  title,
  description,
  newHref,
  newLabel = "New",
  secondaryHref,
  secondaryLabel,
}: AdminHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {secondaryHref && secondaryLabel && (
          <Link
            href={secondaryHref}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            {secondaryLabel}
          </Link>
        )}
        {newHref && (
          <Link
            href={newHref}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-700 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            {newLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
