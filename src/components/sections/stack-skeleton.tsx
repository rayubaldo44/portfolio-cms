import { Section } from "@/components/layout/section";

export function StackSkeleton() {
  return (
    <Section role="status" aria-label="Loading stack" className="animate-pulse pt-4 pb-8 motion-reduce:animate-none md:pt-4 md:pb-10">
      <div aria-hidden="true">
        <div className="flex items-center justify-between gap-6">
          <div className="h-4 w-12 rounded bg-gray-200/70 dark:bg-gray-800/70" />
          <div className="h-4 w-20 rounded bg-gray-200/70 dark:bg-gray-800/70" />
        </div>
        <div className="mt-5 flex max-h-[78px] flex-wrap gap-2.5 overflow-hidden">
          {Array.from({ length: 18 }).map((_, index) => (
            <div key={index} className={`h-[34px] rounded-md border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900 ${index % 3 === 0 ? "w-28" : "w-20"}`} />
          ))}
        </div>
      </div>
    </Section>
  );
}
