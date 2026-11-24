/**
 * Actions: Projects Import | Type: Server | Deps: db, projectSchema, utils, revalidatePath
 */
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { projectSchema } from "@/lib/validations";
import { serializeTags, slugify } from "@/lib/utils";

export type ImportRowStatus = "created" | "updated" | "skipped" | "failed";

export interface ImportRowResult {
  slug: string;
  title: string;
  status: ImportRowStatus;
  message?: string;
}

export interface ImportState {
  error?: string;
  summary?: {
    created: number;
    updated: number;
    skipped: number;
    failed: number;
  };
  results?: ImportRowResult[];
}

function normalizeTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map(String).map((t) => t.trim()).filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

export async function importProjects(
  _prev: ImportState,
  formData: FormData,
): Promise<ImportState> {
  await requireAuth();
  const raw = String(formData.get("projects") ?? "").trim();
  const overwrite =
    formData.get("overwrite") === "on" || formData.get("overwrite") === "true";

  if (!raw) {
    return { error: "Paste a JSON array of projects." };
  }

  let rows: unknown;
  try {
    rows = JSON.parse(raw);
  } catch {
    return { error: "Invalid JSON. Make sure you pasted a valid array." };
  }

  if (!Array.isArray(rows)) {
    return { error: "The JSON must be an array of projects." };
  }
  if (rows.length === 0) {
    return { error: "The array is empty. Add at least one project." };
  }

  const results: ImportRowResult[] = [];
  const seen = new Set<string>();

  try {
    await db.$transaction(async (tx) => {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const label = `Row ${i + 1}`;

        if (typeof row !== "object" || row === null) {
          results.push({
            slug: "",
            title: label,
            status: "failed",
            message: "Not an object.",
          });
          continue;
        }

        const obj = row as Record<string, unknown>;
        const title = typeof obj.title === "string" ? obj.title.trim() : "";
        const rawSlug = typeof obj.slug === "string" ? obj.slug : "";
        const slug = rawSlug.trim() ? slugify(rawSlug) : slugify(title);

        if (!slug) {
          results.push({
            slug: "",
            title: label,
            status: "failed",
            message: "Missing title or slug.",
          });
          continue;
        }

        if (seen.has(slug)) {
          results.push({
            slug,
            title: label,
            status: "skipped",
            message: "Duplicate slug within the batch.",
          });
          continue;
        }
        seen.add(slug);

        const parsed = projectSchema.safeParse({
          title,
          slug,
          description:
            typeof obj.description === "string" ? obj.description.trim() : "",
          content:
            typeof obj.content === "string" && obj.content.trim()
              ? obj.content.trim()
              : undefined,
          imageUrl: typeof obj.imageUrl === "string" ? obj.imageUrl : "",
          imageData: typeof obj.imageData === "string" ? obj.imageData : "",
          screenshots: obj.screenshots,
          liveUrl: typeof obj.liveUrl === "string" ? obj.liveUrl : "",
          githubUrl: typeof obj.githubUrl === "string" ? obj.githubUrl : "",
          tags: normalizeTags(obj.tags),
          featured: obj.featured === true,
          order: typeof obj.order === "number" ? obj.order : 0,
        });

        if (!parsed.success) {
          results.push({
            slug,
            title: label,
            status: "failed",
            message: parsed.error.issues[0]?.message ?? "Invalid project data.",
          });
          continue;
        }

        const data = parsed.data;
        const values = {
          title: data.title,
          description: data.description,
          content: data.content ?? null,
          imageUrl: data.imageUrl || null,
          imageData: data.imageData || null,
          screenshots: data.screenshots,
          liveUrl: data.liveUrl || null,
          githubUrl: data.githubUrl || null,
          tags: serializeTags(data.tags),
          featured: data.featured,
          order: data.order,
        };

        try {
          const existing = await tx.project.findUnique({
            where: { slug },
            select: { id: true },
          });

          if (existing && !overwrite) {
            results.push({
              slug,
              title: label,
              status: "skipped",
              message: "Already in portfolio.",
            });
            continue;
          }

          await tx.project.upsert({
            where: { slug },
            update: values,
            create: { ...values, slug },
          });

          results.push({
            slug,
            title: label,
            status: existing ? "updated" : "created",
          });
        } catch {
          results.push({
            slug,
            title: label,
            status: "failed",
            message: "Database error while saving.",
          });
        }
      }
    });
  } catch {
    return { error: "Failed to save projects. Check the database connection." };
  }

  const summary = { created: 0, updated: 0, skipped: 0, failed: 0 };
  for (const result of results) {
    summary[result.status] += 1;
  }

  revalidatePath("/admin/projects");
  revalidatePath("/");

  return { summary, results };
}
