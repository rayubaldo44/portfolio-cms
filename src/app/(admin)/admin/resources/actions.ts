"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { resourceSchema } from "@/lib/validations";
import type { FormState } from "@/components/admin/form-wrapper";

function parseResource(formData: FormData) {
  return resourceSchema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    url: String(formData.get("url") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    category: String(formData.get("category") ?? ""),
    order: Number(formData.get("order") ?? 0),
  });
}

function revalidateResources() {
  revalidatePath("/resources");
  revalidatePath("/admin/resources");
}

export async function createResource(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth();
  const parsed = parseResource(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid resource." };
  try {
    await db.resource.create({ data: { ...parsed.data, description: parsed.data.description || null } });
  } catch {
    return { error: "Failed to save resource. Please try again." };
  }
  revalidateResources();
  redirect("/admin/resources");
}

export async function updateResource(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing resource id." };
  const parsed = parseResource(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid resource." };
  try {
    await db.resource.update({ where: { id }, data: { ...parsed.data, description: parsed.data.description || null } });
  } catch {
    return { error: "Failed to update resource. Please try again." };
  }
  revalidateResources();
  redirect("/admin/resources");
}

export async function deleteResource(formData: FormData): Promise<void> {
  await requireAuth();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await db.resource.delete({ where: { id } });
  revalidateResources();
}
