export default function RootLoading() {
  return (
    <div
      className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-16 sm:px-8 lg:px-10 md:py-24"
      role="status"
      aria-label="Loading page"
    >
      <div className="grid items-center gap-14 md:grid-cols-[auto_1fr] md:gap-20">
        <div className="mx-auto h-72 w-72 animate-pulse rounded-[2rem] bg-gray-200/70 ring-1 ring-gray-950/[0.02] dark:bg-gray-800/70 md:mx-0 md:h-80 md:w-80" />
        <div className="flex flex-col gap-5">
          <div className="h-12 w-2/3 animate-pulse rounded-lg bg-gray-200/70 dark:bg-gray-800/70" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200/70 dark:bg-gray-800/70" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200/70 dark:bg-gray-800/70" />
          <div className="mt-2 flex gap-3">
            <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200/70 dark:bg-gray-800/70" />
            <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200/70 dark:bg-gray-800/70" />
            <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200/70 dark:bg-gray-800/70" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200/70 dark:bg-gray-800/70" />
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="h-36 animate-pulse rounded-2xl bg-gray-200/70 dark:bg-gray-800/70" />
          <div className="h-36 animate-pulse rounded-2xl bg-gray-200/70 dark:bg-gray-800/70" />
        </div>
      </div>
    </div>
  );
}
