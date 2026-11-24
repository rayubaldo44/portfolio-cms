export default function ProjectDetailLoading() {
  return (
    <div
      aria-label="Loading project"
      aria-busy="true"
      className="flex animate-pulse flex-col gap-10 py-20 motion-reduce:animate-none md:py-28"
    >
      <div className="h-5 w-24 rounded bg-gray-200 dark:bg-gray-800" />

      <div className="flex max-w-3xl flex-col gap-4">
        <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-10 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="flex flex-col gap-2">
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>

      <div className="flex gap-2">
        <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>

      <div className="aspect-video w-full rounded-2xl bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}
