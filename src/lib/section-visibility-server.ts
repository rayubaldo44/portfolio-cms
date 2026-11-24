import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSectionVisibility, HIDDEN_SECTION_VISIBILITY, type SectionKey, type SectionVisibility } from "@/lib/section-visibility";

export const getPublicSectionVisibility = cache(async (): Promise<SectionVisibility> => {
  try {
    const settings = await db.siteSettings.findUnique({ where: { id: "singleton" } });
    return getSectionVisibility(settings);
  } catch {
    // Do not expose hidden sections when their saved visibility cannot be read.
    return HIDDEN_SECTION_VISIBILITY;
  }
});

export async function requireVisibleSection(section: SectionKey): Promise<void> {
  const visibility = await getPublicSectionVisibility();
  if (!visibility[section]) notFound();
}
