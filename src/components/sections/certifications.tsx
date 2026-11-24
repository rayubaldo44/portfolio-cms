/**
 * Section: Certifications | Type: Server | Deps: db, Section, SectionHeading
 */
import Link from "next/link";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/lib/db";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { RevealItem } from "@/components/motion/reveal-stagger";
import { CertificationList } from "@/components/sections/certification-list";
import { certificationCategoryLabel } from "@/lib/certification-categories";
import { formatDate } from "@/lib/utils";
import type { Certification } from "@/types";
import { certificateFileUrl } from "@/lib/certificate-file";

interface CertificationsSectionProps {
  standalone?: boolean;
}

export async function CertificationsSection({
  standalone = false,
}: CertificationsSectionProps = {}) {
  let certifications: Certification[] = [];

  try {
    certifications = await db.certification.findMany({
      orderBy: { order: "asc" },
    });
  } catch {
    // DB unavailable during build/prerender
  }

  return (
    <Section id="certifications">
      <Reveal>
        <SectionHeading
          title="Certifications"
          description="Credentials and courses I've completed."
          action={
            standalone
              ? { label: "Back to Site", href: "/" }
              : { label: "All Certifications", href: "/certifications" }
          }
        />
      </Reveal>
      {certifications.length === 0 ? (
        <Reveal>
          <p className="type-body-compact mt-8 text-gray-500 dark:text-gray-400">
            No certifications yet. Add some in the admin dashboard.
          </p>
        </Reveal>
      ) : (
        <CertificationList items={certifications.map((cert) => {
            const inner = (
              <>
                <h3 className="type-content-title text-gray-900 dark:text-gray-50">
                  {cert.name}
                  {cert.url && (
                    <ArrowSquareOut
                      size={14}
                      className="ml-1.5 inline-block text-accent opacity-60 transition-opacity group-hover:opacity-100"
                    />
                  )}
                </h3>
                <p className="type-body-compact text-gray-600 dark:text-gray-400">
                  {cert.issuer}
                </p>
                {cert.category && <p className="type-meta mt-2 text-gray-500 dark:text-gray-400">{certificationCategoryLabel(cert.category)}</p>}
                <div className="mt-auto pt-3">
                  <span className="type-meta type-numeric text-gray-500 dark:text-gray-400">
                    {formatDate(cert.date)}
                  </span>
                </div>
              </>
            );

            const base = "group flex h-full flex-col";

            return { id: cert.id, category: cert.category, content: (
              <RevealItem key={cert.id} className="flex h-full flex-col gap-3">
                {cert.url ? (
                  <Link
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={base}
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className={base}>{inner}</div>
                )}
                {cert.imageUrl && (
                  <a
                    href={cert.imageUrl.startsWith("data:") ? certificateFileUrl(cert.id) : cert.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="type-body-compact w-fit rounded text-accent underline underline-offset-4 focus-visible:outline-2"
                  >
                    View certificate
                  </a>
                )}
              </RevealItem>
            ) };
          })} />
      )}
    </Section>
  );
}
