import { requireVisibleSection } from "@/lib/section-visibility-server";
/**
 * Page: Stack | Type: Server | Deps: StackSection
 */
import { publicMetadata } from "@/lib/site";
import { StackSection } from "@/components/sections/stack";

export const metadata = publicMetadata("/stack", "Stack",
  "The frontend, backend, AI, and development tools Alex Morgan works with.",
);

export default async function StackPage() {
  await requireVisibleSection("stack");
  return <StackSection standalone />;
}
