/**
 * Actions: Projects | Type: Server | Deps: db, validations, utils, revalidatePath
 */
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projectSchema } from "@/lib/validations";
import { serializeTags } from "@/lib/utils";
import type { FormState } from "@/components/admin/form-wrapper";

function parseField(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function parseOptionalUrl(formData: FormData, key: string): string | undefined {
  const value = parseField(formData, key);
  return value === "" ? undefined : value;
}

function parseScreenshots(formData: FormData): unknown {
  if (!formData.has("screenshots")) return undefined;
  try {
    return JSON.parse(String(formData.get("screenshots")));
  } catch {
    return null; // Invalid JSON must fail validation, never clear stored screenshots.
  }
}

function projectSaveErrorMessage(e: unknown): string {
  const err = e as { code?: string; meta?: { modelName?: string }; message?: string };
  if (err?.code === "P2002") {
    const name = err.meta?.modelName ?? "project";
    return `A ${name} with this slug already exists. Use a different slug or edit the existing one.`;
  }
  const detail = typeof err?.message === "string" ? err.message.trim() : "";
  if (detail) {
    const firstLine = detail.split("\n").find((line) => line.trim().length > 0) ?? "";
    if (firstLine.length > 0) {
      return `Failed to save project: ${firstLine.slice(0, 200)}`;
    }
  }
  return "Failed to save project. Try again.";
}

export async function createProject(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth();

  const liveUrl = formData.get("hasLiveDemo") === "on" ? parseOptionalUrl(formData, "liveUrl") : undefined;
  if (formData.get("hasLiveDemo") === "on" && !liveUrl) {
    return { error: "Live URL is required when the project has a live demo." };
  }

  const parsed = projectSchema.safeParse({
    title: parseField(formData, "title"),
    slug: parseField(formData, "slug"),
    description: parseField(formData, "description"),
    content: parseField(formData, "content") || undefined,
    imageUrl: parseOptionalUrl(formData, "imageUrl"),
    imageData: parseField(formData, "imageData"),
    screenshots: parseScreenshots(formData),
    liveUrl,
    githubUrl: parseOptionalUrl(formData, "githubUrl"),
    tags: parseField(formData, "tags")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    featured: formData.get("featured") === "on",
    order: Number(formData.get("order") ?? 0),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid project data.",
    };
  }

  const data = parsed.data;

  try {
    await db.project.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        content: data.content ?? null,
        imageUrl: data.imageUrl ?? null,
        imageData: data.imageData || null,
        screenshots: data.screenshots,
        liveUrl: data.liveUrl ?? null,
        githubUrl: data.githubUrl ?? null,
        tags: serializeTags(data.tags),
        featured: data.featured,
        order: data.order,
      },
    });
  } catch (e) {
    return { error: projectSaveErrorMessage(e) };
  }

  revalidatePath("/admin/projects");
  revalidatePath("/");
  redirect("/admin/projects");
}

export async function updateProject(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth();

  const id = parseField(formData, "id");
  if (!id) return { error: "Missing project id." };

  const liveUrl = formData.get("hasLiveDemo") === "on" ? parseOptionalUrl(formData, "liveUrl") : undefined;
  if (formData.get("hasLiveDemo") === "on" && !liveUrl) {
    return { error: "Live URL is required when the project has a live demo." };
  }

  const parsed = projectSchema.safeParse({
    title: parseField(formData, "title"),
    slug: parseField(formData, "slug"),
    description: parseField(formData, "description"),
    content: parseField(formData, "content") || undefined,
    imageUrl: parseOptionalUrl(formData, "imageUrl"),
    imageData: parseField(formData, "imageData"),
    screenshots: parseScreenshots(formData),
    liveUrl,
    githubUrl: parseOptionalUrl(formData, "githubUrl"),
    tags: parseField(formData, "tags")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    featured: formData.get("featured") === "on",
    order: Number(formData.get("order") ?? 0),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid project data.",
    };
  }

  const data = parsed.data;

  try {
    await db.project.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        content: data.content ?? null,
        imageUrl: data.imageUrl ?? null,
        imageData: data.imageData || null,
        screenshots: data.screenshots,
        liveUrl: data.liveUrl ?? null,
        githubUrl: data.githubUrl ?? null,
        tags: serializeTags(data.tags),
        featured: data.featured,
        order: data.order,
      },
    });
  } catch (e) {
    return { error: projectSaveErrorMessage(e) };
  }

  revalidatePath("/admin/projects");
  revalidatePath("/");
  redirect("/admin/projects");
}

export async function deleteProject(formData: FormData): Promise<void> {
  await requireAuth();

  const id = parseField(formData, "id");
  if (!id) return;

  await db.project.delete({ where: { id } });
  revalidatePath("/admin/projects");
  revalidatePath("/");
}

export async function toggleFeatured(formData: FormData): Promise<void> {
  await requireAuth();

  const id = parseField(formData, "id");
  if (!id) return;

  const project = await db.project.findUnique({
    where: { id },
    select: { featured: true },
  });
  if (!project) return;

  await db.project.update({
    where: { id },
    data: { featured: !project.featured },
  });
  revalidatePath("/admin/projects");
  revalidatePath("/");
}
