import { requireVisibleSection } from "@/lib/section-visibility-server";
/**
 * Page: Certifications | Type: Server | Deps: CertificationsSection
 */
import { publicMetadata } from "@/lib/site";
import { CertificationsSection } from "@/components/sections/certifications";

export const metadata = publicMetadata("/certifications", "Certifications",
  "Explore Alex Morgan’s technical certifications and credentials.",
);

export default async function CertificationsPage() {
  await requireVisibleSection("certifications");
  return <CertificationsSection standalone />;
}
