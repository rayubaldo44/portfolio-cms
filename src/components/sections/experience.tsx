/**
 * Section: Experience | Type: Server | Deps: db, Section, SectionHeading
 */
import { MapPin } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/lib/db";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { RevealStagger, RevealItem } from "@/components/motion/reveal-stagger";
import { formatDateRange } from "@/lib/utils";
import type { Experience } from "@/types";

interface ExperienceSectionProps {
  standalone?: boolean;
}

export async function ExperienceSection({ standalone = false }: ExperienceSectionProps = {}) {
  let experiences: Experience[] | null = null;

  try {
    experiences = await db.experience.findMany({
      orderBy: { order: "asc" },
      take: standalone ? undefined : 3,
    });
  } catch {
    // DB unavailable during build/prerender
  }

  return (
    <Section id="experience" className={standalone ? undefined : "pb-0 md:pb-0"}>
      <Reveal>
        <SectionHeading
          title="Experience"
          description="Where I've worked."
          action={
            standalone
              ? { label: "Back to Site", href: "/" }
              : { label: "All Experience", href: "/experience" }
          }
        />
      </Reveal>
      {experiences === null ? (
        <Reveal>
          <p className="type-body-compact mt-8 text-gray-500 dark:text-gray-400">
            Experience unavailable right now.
          </p>
        </Reveal>
      ) : experiences.length === 0 ? (
        <Reveal>
          <p className="type-body-compact mt-8 text-gray-500 dark:text-gray-400">
            No experience listed yet.
          </p>
        </Reveal>
      ) : (
        <RevealStagger className="mt-10">
          {experiences.map((exp) => (
            <RevealItem key={exp.id}>
              <article className="grid gap-3 border-t border-gray-200/80 py-8 dark:border-gray-800/80 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-8">
                <div className="flex flex-col gap-2">
                  <span className="type-meta type-numeric text-gray-500 dark:text-gray-400">
                    {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                  </span>
                  {exp.location && (
                    <div className="type-meta flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <MapPin aria-hidden="true" size={12} />
                      {exp.location}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="type-content-title text-gray-900 dark:text-gray-50">
                    {exp.role}
                  </h3>
                  <p className="type-body-compact text-gray-600 dark:text-gray-400">
                    {exp.company}
                  </p>
                  {exp.description && (
                    <p className="type-body-compact mt-3 max-w-[65ch] text-gray-600 dark:text-gray-400">
                      {exp.description}
                    </p>
                  )}
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealStagger>
      )}
    </Section>
  );
}
