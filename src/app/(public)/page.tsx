/**
 * Section: Home | Type: Server | Deps: none (hero + social links)
 */
import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  GithubLogo,
  LinkedinLogo,
} from "@phosphor-icons/react/dist/ssr";
import { GitHubContributions } from "@/components/sections/github-contributions";
import { AboutSection } from "@/components/sections/about";
import { ProjectsSection } from "@/components/sections/projects";
import { ExperienceSection } from "@/components/sections/experience";
import { StackSection } from "@/components/sections/stack";
import { StackSkeleton } from "@/components/sections/stack-skeleton";
import { CertificationsSection } from "@/components/sections/certifications";
import { TypeWriter } from "@/components/type-writer";
import { Reveal } from "@/components/motion/reveal";
import { AvailabilityIndicator } from "@/components/availability-indicator";
import { HeroPortrait } from "@/components/hero-portrait";
import { getPublicSectionVisibility } from "@/lib/section-visibility-server";
import { getAvailabilityStatus } from "@/lib/availability-server";
import { db } from "@/lib/db";
import { publicMetadata } from "@/lib/site";

export const metadata = publicMetadata("/", "Alex Morgan - Developer Portfolio");

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com",
    Icon: GithubLogo,
    priority: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/",
    Icon: LinkedinLogo,
    priority: true,
  },
] as const;

async function getLeadFeaturedProject() {
  try {
    return await db.project.findFirst({
      where: { featured: true },
      orderBy: { order: "asc" },
      select: { slug: true },
    });
  } catch {
    return null;
  }
}

async function HeroAvailability() {
  const status = await getAvailabilityStatus();
  return status ? <AvailabilityIndicator status={status} /> : null;
}

async function FeaturedProjectLink() {
  const visibility = await getPublicSectionVisibility();
  if (!visibility.projects) return null;
  const project = await getLeadFeaturedProject();
  return project ? (
    <Link
      href={`/projects/${project.slug}`}
      className="type-ui inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-700 transition-all hover:-translate-y-0.5 hover:border-gray-400 hover:bg-gray-100 active:translate-y-0 active:scale-[0.98] dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-900"
    >
      Read case study
      <ArrowRight aria-hidden="true" size={16} weight="bold" />
    </Link>
  ) : null;
}

export default function HomePage() {
  return (
    <div className="home-page">
      {/* Hero */}
      <section className="flex min-h-[calc(100dvh-4rem)] items-center py-7 sm:py-10 lg:min-h-[100dvh] lg:py-16">
        <div className="grid w-full items-center gap-7 md:grid-cols-[minmax(0,3fr)_minmax(16rem,2fr)] md:gap-12 lg:gap-16">
          <div className="flex flex-col items-start gap-5 md:gap-7">
            <div className="min-h-5 lg:hidden">
              <Suspense fallback={null}>
                <HeroAvailability />
              </Suspense>
            </div>
            <div>
              <h1 className="type-hero-statement max-w-[15ch] text-gray-900 dark:text-gray-50">
                Alex Morgan builds useful AI products.
              </h1>
            </div>
            <Reveal delay={0.1}>
              <p className="type-role max-w-[42ch] text-gray-500 dark:text-gray-400">
                <TypeWriter />
              </p>
            </Reveal>
            <div>
              <p className="type-lead max-w-[48ch] text-gray-600 dark:text-gray-400">
                A sample developer portfolio. Projects, experience, and credentials
                shown here are fictional examples you can replace with your own.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="min-h-11 w-44">
                <Suspense fallback={null}>
                  <FeaturedProjectLink />
                </Suspense>
              </div>
            </div>
            <Reveal delay={0.26}>
              <nav aria-label="Social profiles" className="flex items-center gap-2">
                {socialLinks.map(({ name, href, Icon, priority }, index) => (
                  <Link
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    title={name}
                    className={`inline-flex size-9 items-center justify-center rounded-lg border transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.96] ${
                      priority
                        ? "border-gray-300 bg-gray-100 text-gray-800 hover:border-gray-400 hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-800"
                        : "border-transparent text-gray-400 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-500 dark:hover:border-gray-700 dark:hover:bg-gray-900 dark:hover:text-gray-300"
                    } ${index === 2 ? "ml-1" : ""}`}
                  >
                    <Icon aria-hidden="true" size={17} weight={priority ? "bold" : "regular"} />
                  </Link>
                ))}
              </nav>
            </Reveal>
          </div>

          <Reveal
            className="mx-auto w-48 sm:w-60 md:mx-0 md:w-72 md:justify-self-end lg:w-full lg:max-w-96"
            delay={0.3}
            y={12}
          >
            <HeroPortrait />
          </Reveal>
        </div>
      </section>

      <Suspense fallback={null}>
        <VisibleSections />
      </Suspense>
    </div>
  );
}

async function VisibleSections() {
  const visibility = await getPublicSectionVisibility();
  return (
    <>
      {visibility.projects && (
        <Suspense fallback={<SectionSkeleton />}>
          <ProjectsSection />
        </Suspense>
      )}
      {visibility.experience && (
        <Suspense fallback={<SectionSkeleton />}>
          <ExperienceSection />
        </Suspense>
      )}
      {visibility.stack && (
        <Suspense fallback={<StackSkeleton />}>
          <StackSection />
        </Suspense>
      )}
      {visibility.about && (
        <Suspense fallback={<SectionSkeleton />}>
          <AboutSection />
        </Suspense>
      )}
      {visibility.certifications && (
        <Suspense fallback={<SectionSkeleton />}>
          <CertificationsSection />
        </Suspense>
      )}
      {visibility.githubContributions && (
        <Suspense fallback={<SectionSkeleton />}>
          <GitHubContributions />
        </Suspense>
      )}
    </>
  );
}

function SectionSkeleton() {
  return (
    <div
      className="flex flex-col gap-4 py-16"
      role="status"
      aria-label="Loading section"
    >
      <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200/70 dark:bg-gray-800/70" />
      <div className="h-44 animate-pulse rounded-2xl bg-gray-200/70 dark:bg-gray-800/70" />
    </div>
  );
}
