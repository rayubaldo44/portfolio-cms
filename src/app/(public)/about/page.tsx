import { requireVisibleSection } from "@/lib/section-visibility-server";
/**
 * Page: About | Type: Server | Deps: AboutSection
 */
import { publicMetadata } from "@/lib/site";
import { AboutSection } from "@/components/sections/about";

export const metadata = publicMetadata("/about", "About",
  "About Alex Morgan, a full-stack engineer building useful AI products.",
);

export default async function AboutPage() {
  await requireVisibleSection("about");
  return <AboutSection standalone />;
}
