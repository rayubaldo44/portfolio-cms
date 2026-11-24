import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-5 px-4 py-32 text-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_40%,rgba(91,91,214,0.06),transparent)]"
      />
      <p className="font-pixel text-6xl tracking-tight text-gray-900 dark:text-gray-50 md:text-7xl">
        404
      </p>
      <h2 className="font-serif text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
        Page not found
      </h2>
      <p className="max-w-sm text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        The page you&apos;re looking for doesn&apos;t exist. It may have moved,
        or the link is broken.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gray-700 hover:shadow-md active:translate-y-0 active:scale-[0.98] dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200"
      >
        Go home
      </Link>
    </div>
  );
}
