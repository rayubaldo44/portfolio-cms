/**
 * Actions: Stack (Skills) | Type: Server | Deps: db, validations, revalidatePath
 */
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { skillSchema } from "@/lib/validations";
import type { FormState } from "@/components/admin/form-wrapper";

export async function createSkill(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth();

  const parsed = skillSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    category: String(formData.get("category") ?? ""),
    icon: String(formData.get("icon") ?? "").trim() || undefined,
    order: Number(formData.get("order") ?? 0),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid skill data.",
    };
  }

  const data = parsed.data;

  try {
    await db.skill.create({
      data: {
        name: data.name,
        category: data.category,
        icon: data.icon ?? null,
        order: data.order,
      },
    });
  } catch {
    return { error: "Failed to save skill. Name may already be in use." };
  }

  revalidatePath("/admin/stack");
  revalidatePath("/");
  revalidatePath("/stack");
  redirect("/admin/stack");
}

export async function updateSkill(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing skill id." };

  const parsed = skillSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    category: String(formData.get("category") ?? ""),
    icon: String(formData.get("icon") ?? "").trim() || undefined,
    order: Number(formData.get("order") ?? 0),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid skill data.",
    };
  }

  const data = parsed.data;

  try {
    await db.skill.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        icon: data.icon ?? null,
        order: data.order,
      },
    });
  } catch {
    return { error: "Failed to update skill. Name may already be in use." };
  }

  revalidatePath("/admin/stack");
  revalidatePath("/");
  revalidatePath("/stack");
  redirect("/admin/stack");
}

export async function deleteSkill(formData: FormData): Promise<void> {
  await requireAuth();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await db.skill.delete({ where: { id } });
  revalidatePath("/admin/stack");
  revalidatePath("/");
  revalidatePath("/stack");
}
