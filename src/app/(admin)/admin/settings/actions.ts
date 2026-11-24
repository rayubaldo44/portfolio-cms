/**
 * Actions: Settings | Type: Server | Deps: auth, db, validations, revalidatePath
 */
"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SECTION_OPTIONS } from "@/lib/section-visibility";
import { availabilitySchema, sectionVisibilitySchema } from "@/lib/validations";
import type { FormState } from "@/components/admin/form-wrapper";

export async function updateAvailability(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth();

  const parsed = availabilitySchema.safeParse({
    availabilityStatus: String(formData.get("availabilityStatus") ?? ""),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid availability status.",
    };
  }

  try {
    await db.siteSettings.upsert({
      where: { id: "singleton" },
      create: {
        id: "singleton",
        availabilityStatus: parsed.data.availabilityStatus,
      },
      update: {
        availabilityStatus: parsed.data.availabilityStatus,
      },
    });
  } catch {
    return { error: "Failed to update availability." };
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");

  return { success: "Availability updated." };
}

export async function updateSectionVisibility(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth();
  const values = Object.fromEntries(SECTION_OPTIONS.map(({ field }) => {
    const value = formData.get(field);
    return [field, value === "true" ? true : value === "false" ? false : value];
  }));
  const parsed = sectionVisibilitySchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid section visibility. Please reload and try again." };

  try {
    await db.siteSettings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", ...parsed.data },
      update: parsed.data,
    });
  } catch {
    return { error: "Failed to save section visibility. Your saved settings have not changed." };
  }
  revalidatePath("/(public)", "layout");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/settings");
  return { success: "Section visibility saved." };
}
