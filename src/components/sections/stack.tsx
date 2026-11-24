/**
 * Section: Stack | Type: Server | Deps: db, Section, SectionHeading, Badge
 */
import { db } from "@/lib/db";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { RevealStagger, RevealItem } from "@/components/motion/reveal-stagger";
import { TiltCard } from "@/components/motion/tilt-card";
import { StackPreview } from "@/components/sections/stack-preview";
import type { Skill, SkillCategory } from "@/types";

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  frontend: "Frontend",
  backend: "Backend",
  tools: "Dev Tools",
  ai_ml: "AI & Machine Learning",
};

const CATEGORY_ORDER: SkillCategory[] = ["frontend", "backend", "ai_ml", "tools"];

const CATEGORY_DESCRIPTIONS: Record<SkillCategory, string> = {
  frontend: "Interfaces and interactions",
  backend: "Services and application data",
  ai_ml: "AI models and integrations",
  tools: "Development and delivery",
};

const MAX_VISIBLE_BADGES = 8;
const MAX_HOME_SKILLS = 18;
// Highlight the stack used in this example portfolio.
// Names only affect priority; every displayed skill still comes from the CMS.
const HOME_SKILL_PRIORITY = [
  "React",
  "Next.js",
  "SvelteKit",
  "Tailwind CSS",
  "Python",
  "FastAPI",
  "Supabase",
  "PostgreSQL",
  "RAG",
  "pgvector",
  "Docker",
  "Vercel",
  "Node.js",
  "Express.js",
  "OpenAI",
  "LangChain",
  "Git & GitHub",
  "GitHub Actions",
];

interface StackSectionProps {
  standalone?: boolean;
}

export async function StackSection({
  standalone = false,
}: StackSectionProps = {}) {
  let skills: Skill[] | null = null;

  try {
    const raw = await db.skill.findMany({
      orderBy: { order: "asc" },
    });
    skills = raw as Skill[];
  } catch {
    // DB unavailable during build/prerender
  }

  if (!standalone) {
    const priority = (skill: Skill) => {
      const index = HOME_SKILL_PRIORITY.indexOf(skill.name);
      return index === -1 ? HOME_SKILL_PRIORITY.length : index;
    };
    const visibleSkills = [...(skills ?? [])]
      .sort((a, b) => priority(a) - priority(b))
      .slice(0, MAX_HOME_SKILLS);
    const hasMore = (skills?.length ?? 0) > visibleSkills.length;

    return (
      <Section id="stack" aria-labelledby="stack-heading" className="pt-4 pb-8 md:pt-4 md:pb-10">
        <Reveal>
          <div className="flex items-center justify-between gap-6 font-mono text-xs font-normal uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <h2 id="stack-heading">Stack</h2>
            <Link
              href="/stack"
              className="group rounded-sm transition-colors hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent dark:hover:text-gray-50"
            >
              View all <span aria-hidden="true" className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
          {skills === null || skills.length === 0 ? (
            <p className="type-body-compact mt-5 text-gray-500 dark:text-gray-400">
              {skills === null ? "Stack unavailable right now." : "No skills listed yet."}
            </p>
          ) : (
            <StackPreview skills={visibleSkills.map(({ id, name }) => ({ id, name }))} hasMore={hasMore} />
          )}
        </Reveal>
      </Section>
    );
  }

  const grouped: Record<SkillCategory, Skill[]> = {
    frontend: [],
    backend: [],
    ai_ml: [],
    tools: [],
  };

  for (const skill of skills ?? []) {
    if (skill.category in grouped) grouped[skill.category].push(skill);
  }

  return (
    <Section id="stack">
      <Reveal>
        <SectionHeading
          title="Stack"
          description="Languages, frameworks, and tools I work with."
          action={
            standalone
              ? { label: "Back to Site", href: "/" }
              : { label: "All Stack", href: "/stack" }
          }
        />
      </Reveal>
      {skills === null ? (
        <Reveal>
          <p className="type-body-compact mt-8 text-gray-500 dark:text-gray-400">
            Stack unavailable right now.
          </p>
        </Reveal>
      ) : skills.length === 0 ? (
        <Reveal>
          <p className="type-body-compact mt-8 text-gray-500 dark:text-gray-400">
            No skills listed yet.
          </p>
        </Reveal>
      ) : (
        <RevealStagger className="mt-10 grid grid-cols-1 auto-rows-fr gap-5 md:grid-cols-2">
          {CATEGORY_ORDER.map((category) => {
            const categorySkills = grouped[category];
            const visibleSkills = standalone
              ? categorySkills
              : categorySkills.slice(0, MAX_VISIBLE_BADGES);
            const hiddenCount = categorySkills.length - visibleSkills.length;

            return (
              <RevealItem key={category} className="h-full min-w-0">
                <TiltCard className="h-full" maxTilt={1}>
                  <div className="h-full min-h-48 rounded-2xl border border-gray-200 bg-gray-50 p-5 transition-colors hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-sans text-lg font-semibold leading-7 tracking-tight text-gray-900 dark:text-gray-50">
                        {CATEGORY_LABELS[category]}
                      </h3>
                      <span className="type-meta type-numeric shrink-0 pt-1.5 text-gray-600 dark:text-gray-400">
                        {categorySkills.length} {categorySkills.length === 1 ? "skill" : "skills"}
                      </span>
                    </div>
                    <p className="type-body-compact mt-1 text-gray-600 dark:text-gray-400">
                      {CATEGORY_DESCRIPTIONS[category]}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {visibleSkills.map((skill) => (
                        <Badge key={skill.id} variant="outline" className="max-w-full px-2.5 py-1 text-[13px] leading-5 tracking-normal [overflow-wrap:anywhere] dark:border-gray-700">
                          {skill.name}
                        </Badge>
                      ))}
                      {hiddenCount > 0 && (
                        <Link
                          href="/stack"
                          aria-label={`View ${hiddenCount} more ${CATEGORY_LABELS[category]} skills`}
                          className="inline-flex items-center rounded-md border border-gray-200 px-2.5 py-1 text-[13px] font-medium leading-5 text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-50 dark:focus-visible:outline-accent-muted"
                        >
                          +{hiddenCount} more
                        </Link>
                      )}
                      {categorySkills.length === 0 && (
                        <p className="type-body-compact text-gray-600 dark:text-gray-400">
                          No skills listed in this category.
                        </p>
                      )}
                    </div>
                  </div>
                </TiltCard>
              </RevealItem>
            );
          })}
        </RevealStagger>
      )}
    </Section>
  );
}
