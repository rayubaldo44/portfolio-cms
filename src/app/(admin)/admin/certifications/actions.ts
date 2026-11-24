/**
 * Actions: Certifications | Type: Server | Deps: db, validations, revalidatePath
 */
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { certificationSchema } from "@/lib/validations";
import { certificateFileError, certificateSignatureMatches } from "@/lib/certificate-file";
import type { FormState } from "@/components/admin/form-wrapper";

function parseField(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function parseOptionalUrl(formData: FormData, key: string): string | undefined {
  const value = parseField(formData, key);
  return value === "" ? undefined : value;
}

async function readCertificateUpload(formData: FormData): Promise<{ data?: string; error?: string }> {
  const file = formData.get("certificateFile");
  if (!(file instanceof File) || (file.size === 0 && file.name === "")) return {};
  const error = certificateFileError(file);
  if (error) return { error };
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!certificateSignatureMatches(bytes, file.type)) {
    return { error: "The file contents do not match its type. Choose a valid image or PDF." };
  }
  // Reuse the certificate's existing image field; files persist with the record.
  return { data: `data:${file.type};base64,${bytes.toString("base64")}` };
}

export async function createCertification(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth();

  const parsed = certificationSchema.safeParse({
    name: parseField(formData, "name"),
    issuer: parseField(formData, "issuer"),
    category: parseField(formData, "category"),
    date: parseField(formData, "date"),
    url: parseOptionalUrl(formData, "url"),
    imageUrl: parseOptionalUrl(formData, "imageUrl"),
    order: Number(formData.get("order") ?? 0),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid certification data.",
    };
  }

  const data = parsed.data;

  const upload = await readCertificateUpload(formData);
  if (upload.error) return { error: upload.error };

  try {
    await db.certification.create({
      data: {
        name: data.name,
        issuer: data.issuer,
        category: data.category,
        date: data.date,
        url: data.url ?? null,
        imageUrl: upload.data ?? data.imageUrl ?? null,
        order: data.order,
      },
    });
  } catch {
    return { error: "Failed to save certification." };
  }

  revalidatePath("/admin/certifications");
  revalidatePath("/certifications");
  revalidatePath("/");
  redirect("/admin/certifications");
}

export async function updateCertification(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth();

  const id = parseField(formData, "id");
  if (!id) return { error: "Missing certification id." };

  const parsed = certificationSchema.safeParse({
    name: parseField(formData, "name"),
    issuer: parseField(formData, "issuer"),
    category: parseField(formData, "category"),
    date: parseField(formData, "date"),
    url: parseOptionalUrl(formData, "url"),
    imageUrl: parseOptionalUrl(formData, "imageUrl"),
    order: Number(formData.get("order") ?? 0),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid certification data.",
    };
  }

  const data = parsed.data;

  const upload = await readCertificateUpload(formData);
  if (upload.error) return { error: upload.error };

  try {
    const existing = await db.certification.findUnique({ where: { id }, select: { imageUrl: true } });
    if (!existing) return { error: "Certification not found." };
    const retainedUpload = formData.get("removeCertificate") !== "true" && existing.imageUrl?.startsWith("data:")
      ? existing.imageUrl
      : null;
    await db.certification.update({
      where: { id },
      data: {
        name: data.name,
        issuer: data.issuer,
        category: data.category,
        date: data.date,
        url: data.url ?? null,
        imageUrl: upload.data ?? retainedUpload ?? data.imageUrl ?? null,
        order: data.order,
      },
    });
  } catch {
    return { error: "Failed to update certification." };
  }

  revalidatePath("/admin/certifications");
  revalidatePath("/certifications");
  revalidatePath("/");
  redirect("/admin/certifications");
}

export async function deleteCertification(formData: FormData): Promise<void> {
  await requireAuth();

  const id = parseField(formData, "id");
  if (!id) return;

  await db.certification.delete({ where: { id } });
  revalidatePath("/admin/certifications");
  revalidatePath("/certifications");
  revalidatePath("/");
}
