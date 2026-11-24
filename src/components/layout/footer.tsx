/**
 * Section: Layout | Type: Server | Deps: Link
 */
import Link from "next/link";

export function Footer() {
  return (
<footer className="border-t border-gray-200/80 dark:border-gray-800/80">
  <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-5 px-5 py-10 sm:px-8 md:flex-row lg:px-10">
    <div className="flex flex-col items-center gap-1 text-center md:items-start md:text-left">
      <p className="type-body-compact text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} Alex Morgan. Sample portfolio.
      </p>
      <p className="type-meta text-gray-400 dark:text-gray-500">
        Built with Next.js, Tailwind, and Prisma.
      </p>
    </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:justify-end">
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="type-ui text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
          >
            GitHub
          </Link>
          <Link
            href="https://www.linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="type-ui text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
          >
            LinkedIn
          </Link>
          <Link
            href="#main-content"
            className="type-ui text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
          >
            Back to top
          </Link>
          <Link
            href="/privacy"
            className="type-ui text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
