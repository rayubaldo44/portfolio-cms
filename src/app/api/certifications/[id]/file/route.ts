import { db } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { certificateFileError, certificateSignatureMatches } from "@/lib/certificate-file";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const settings = await db.siteSettings.findUnique({ where: { id: "singleton" }, select: { showCertifications: true } });
  if (settings?.showCertifications === false && !(await isAuthenticated())) {
    return new Response("Not found", { status: 404 });
  }
  const { id } = await params;
  const certificate = await db.certification.findUnique({ where: { id }, select: { imageUrl: true } });
  const match = certificate?.imageUrl?.match(/^data:(image\/(?:png|jpeg|webp|gif)|application\/pdf);base64,([A-Za-z0-9+/]+={0,2})$/);
  if (!match) return new Response("Not found", { status: 404 });
  const [, type, encoded] = match;
  const bytes = Buffer.from(encoded, "base64");
  if (certificateFileError({ type, size: bytes.length }) || !certificateSignatureMatches(bytes, type)) {
    return new Response("Not found", { status: 404 });
  }
  const extension = type === "application/pdf" ? "pdf" : type.split("/")[1];
  return new Response(bytes, {
    headers: {
      "Content-Type": type,
      "Content-Length": String(bytes.length),
      "Content-Disposition": `inline; filename="certificate.${extension}"`,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox",
      "Cache-Control": "private, no-store",
    },
  });
}
