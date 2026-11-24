import { ArrowSquareOut, BookOpen } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/lib/db";
import { publicMetadata } from "@/lib/site";
import { RESOURCE_CATEGORIES } from "@/lib/resources";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import type { Resource } from "@prisma/client";

export const metadata = publicMetadata(
  "/resources",
  "Resources",
  "Courses, documentation, and references behind the skills Alex Morgan is building.",
);

export default async function ResourcesPage() {
  let resources: Resource[] | null = null;
  try {
    resources = await db.resource.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  } catch {
    // Keep database errors out of the public response.
  }

  return (
    <Section>
      <Reveal>
        <header className="max-w-[65ch]">
          <h1 className="type-section-title text-gray-900 dark:text-gray-50">Resources</h1>
          <p className="type-body mt-4 text-gray-600 dark:text-gray-400">
            Courses, documentation, and references behind the skills I’m building.
          </p>
        </header>
      </Reveal>
      {resources === null ? (
        <p className="type-body-compact mt-10 text-gray-500 dark:text-gray-400">
          Resources are unavailable right now. Please try again later.
        </p>
      ) : resources.length === 0 ? (
        <div className="mt-10 flex items-start gap-4 rounded-2xl border border-gray-200 p-6 dark:border-gray-800">
          <BookOpen aria-hidden="true" size={24} className="mt-0.5 shrink-0 text-gray-400 dark:text-gray-500" />
          <div>
            <h2 className="type-content-title text-gray-900 dark:text-gray-50">Building my resource library</h2>
            <p className="type-body-compact mt-2 max-w-[55ch] text-gray-600 dark:text-gray-400">
              I’m collecting the resources that have helped me learn. Check back soon.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-12 space-y-12">
          {RESOURCE_CATEGORIES.map(category => {
            const items = resources.filter(resource => resource.category === category.value);
            if (items.length === 0) return null;
            return (
              <section key={category.value} aria-labelledby={`resources-${category.value}`} className="grid gap-5 border-t border-gray-200 pt-6 dark:border-gray-800 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8">
                <h2 id={`resources-${category.value}`} className="type-ui font-semibold text-gray-900 dark:text-gray-50">{category.label}</h2>
                <ul className="min-w-0 divide-y divide-gray-200 dark:divide-gray-800">
                  {items.map(resource => (
                    <li key={resource.id} className="py-5 first:pt-0 last:pb-0">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex max-w-full items-start gap-2 rounded-sm font-sans text-base font-semibold leading-6 text-gray-900 transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent dark:text-gray-50"
                      >
                        <span className="min-w-0 break-words">{resource.title}</span>
                        <ArrowSquareOut aria-hidden="true" size={16} className="mt-1 shrink-0 text-gray-400 transition-colors group-hover:text-accent dark:text-gray-500" />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                      {resource.description && (
                        <p className="type-body-compact mt-2 max-w-[65ch] whitespace-pre-line break-words text-gray-600 dark:text-gray-400">{resource.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </Section>
  );
}
