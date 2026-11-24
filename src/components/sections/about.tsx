/**
 * Section: About | Type: Server | Deps: db, Section, SectionHeading, Reveal
 */
import { db } from "@/lib/db";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { PersonalPhotoSwap } from "@/components/personal-photo-swap";

const FALLBACK_BIO = [
  "Hi, I'm Alex Morgan, a fictional developer used to demonstrate this portfolio CMS.",
  "This sample shows how to present projects, skills, and experience. All sample achievements and credentials are illustrative.",
  "Replace this biography and the example branding before deploying your own portfolio.",
].join("\n\n");

interface AboutSectionProps {
  standalone?: boolean;
}

export async function AboutSection({ standalone = false }: AboutSectionProps = {}) {
  let bio = FALLBACK_BIO;

  try {
    const settings = await db.siteSettings.findUnique({
      where: { id: "singleton" },
    });
    if (settings?.bio) bio = settings.bio;
  } catch {
    // DB unavailable during build/prerender - use fallback
  }

  const paragraphs = bio.split(/\n\s*\n/).filter(Boolean);

  return (
    <Section id="about">
      <Reveal>
        <div className="flex flex-col gap-8">
          <SectionHeading
            title="About"
            action={
              standalone
                ? { label: "Back to Site", href: "/" }
                : { label: "More About", href: "/about" }
            }
          />
          <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_12rem] md:gap-10 lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-14">
            <div className="order-2 flex flex-col gap-5 md:order-1">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="type-editorial-lead text-gray-800 dark:text-gray-200"
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <PersonalPhotoSwap />
          </div>
          {standalone && (
            <div className="flex flex-col gap-10 pt-4 md:gap-12 md:pt-8">
              <section aria-labelledby="outside-dev-life" className="flex flex-col gap-4">
                <h3
                  id="outside-dev-life"
                  className="type-content-title text-gray-900 dark:text-gray-50"
                >
                  Outside Dev Life
                </h3>
                <p className="type-editorial-lead text-gray-800 dark:text-gray-200">
                  This is example personal content. Add your own interests,
                  activities, and a photo or illustration you have permission to share.
                </p>
              </section>
              <section aria-labelledby="what-im-learning" className="flex flex-col gap-4">
                <h3
                  id="what-im-learning"
                  className="type-content-title text-gray-900 dark:text-gray-50"
                >
                  What I’m Learning
                </h3>
                <p className="type-editorial-lead text-gray-800 dark:text-gray-200">
                  Use this space to describe what you are learning and how
                  it connects to the projects you want to build next.
                </p>
              </section>
            </div>
          )}
        </div>
      </Reveal>
    </Section>
  );
}
