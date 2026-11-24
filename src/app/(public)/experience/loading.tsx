export default function ExperienceLoading() {
  return (
    <section
      className="animate-pulse py-20 motion-reduce:animate-none md:py-28"
      role="status"
      aria-label="Loading experience"
    >
      <div className="h-10 w-48 rounded-lg bg-gray-200/70 dark:bg-gray-800/70" />
      <div className="mt-4 h-5 w-44 rounded bg-gray-200/70 dark:bg-gray-800/70" />
      <div className="mt-10 space-y-1">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="grid gap-3 border-t border-gray-200/80 py-8 dark:border-gray-800/80 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-8"
          >
            <div className="space-y-2">
              <div className="h-3 w-32 rounded bg-gray-200/70 dark:bg-gray-800/70" />
              <div className="h-3 w-28 rounded bg-gray-200/70 dark:bg-gray-800/70" />
            </div>
            <div className="space-y-2">
              <div className="h-6 w-56 max-w-full rounded bg-gray-200/70 dark:bg-gray-800/70" />
              <div className="h-4 w-40 rounded bg-gray-200/70 dark:bg-gray-800/70" />
              <div className="mt-3 h-4 w-full max-w-[65ch] rounded bg-gray-200/70 dark:bg-gray-800/70" />
              <div className="h-4 w-4/5 max-w-[52ch] rounded bg-gray-200/70 dark:bg-gray-800/70" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
