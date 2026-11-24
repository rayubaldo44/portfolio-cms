/**
 * Actions: Experience | Type: Server | Deps: db, validations, revalidatePath
 */
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { experienceSchema } from "@/lib/validations";
import type { FormState } from "@/components/admin/form-wrapper";

function parseField(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function createExperience(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth();

  const current = formData.get("current") === "on";

  const parsed = experienceSchema.safeParse({
    company: parseField(formData, "company"),
    role: parseField(formData, "role"),
    description: parseField(formData, "description") || undefined,
    location: parseField(formData, "location") || undefined,
    startDate: parseField(formData, "startDate"),
    endDate: current ? undefined : parseField(formData, "endDate") || null,
    current,
    order: Number(formData.get("order") ?? 0),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid experience data.",
    };
  }

  const data = parsed.data;

  try {
    await db.experience.create({
      data: {
        company: data.company,
        role: data.role,
        description: data.description ?? null,
        location: data.location ?? null,
        startDate: data.startDate,
        endDate: data.endDate ?? null,
        current: data.current,
        order: data.order,
      },
    });
  } catch {
    return { error: "Failed to save experience." };
  }

  revalidatePath("/admin/experience");
  revalidatePath("/");
  revalidatePath("/experience");
  redirect("/admin/experience");
}

export async function updateExperience(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth();

  const id = parseField(formData, "id");
  if (!id) return { error: "Missing experience id." };

  const current = formData.get("current") === "on";

  const parsed = experienceSchema.safeParse({
    company: parseField(formData, "company"),
    role: parseField(formData, "role"),
    description: parseField(formData, "description") || undefined,
    location: parseField(formData, "location") || undefined,
    startDate: parseField(formData, "startDate"),
    endDate: current ? undefined : parseField(formData, "endDate") || null,
    current,
    order: Number(formData.get("order") ?? 0),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid experience data.",
    };
  }

  const data = parsed.data;

  try {
    await db.experience.update({
      where: { id },
      data: {
        company: data.company,
        role: data.role,
        description: data.description ?? null,
        location: data.location ?? null,
        startDate: data.startDate,
        endDate: data.endDate ?? null,
        current: data.current,
        order: data.order,
      },
    });
  } catch {
    return { error: "Failed to update experience." };
  }

  revalidatePath("/admin/experience");
  revalidatePath("/");
  revalidatePath("/experience");
  redirect("/admin/experience");
}

export async function deleteExperience(formData: FormData): Promise<void> {
  await requireAuth();

  const id = parseField(formData, "id");
  if (!id) return;

  await db.experience.delete({ where: { id } });
  revalidatePath("/admin/experience");
  revalidatePath("/");
  revalidatePath("/experience");
}
