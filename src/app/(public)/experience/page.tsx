import { requireVisibleSection } from "@/lib/section-visibility-server";
/**
 * Page: Experience | Type: Server | Deps: ExperienceSection
 */
import { publicMetadata } from "@/lib/site";
import { ExperienceSection } from "@/components/sections/experience";

export const metadata = publicMetadata("/experience", "Experience",
  "Explore Alex Morgan’s engineering experience and professional journey.",
);

export default async function ExperiencePage() {
  await requireVisibleSection("experience");
  return <ExperienceSection standalone />;
}
