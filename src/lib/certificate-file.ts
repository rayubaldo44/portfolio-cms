export const MAX_CERTIFICATE_BYTES = 1.5 * 1024 * 1024;
export const CERTIFICATE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"] as const;
export const CERTIFICATE_ACCEPT = CERTIFICATE_TYPES.join(",");

export function certificateFileError(file: Pick<File, "type" | "size">): string | null {
  if (!CERTIFICATE_TYPES.some((type) => type === file.type)) {
    return "Choose a PNG, JPEG, WebP, GIF, or PDF file.";
  }
  if (file.size === 0) return "The certificate file is empty.";
  if (file.size > MAX_CERTIFICATE_BYTES) return "Certificate too large. Choose a file under 1.5 MB.";
  return null;
}

// Check the contents as well as the browser-supplied MIME type.
export function certificateSignatureMatches(bytes: Uint8Array, type: string): boolean {
  const startsWith = (...signature: number[]) => signature.every((byte, i) => bytes[i] === byte);
  switch (type) {
    case "image/png": return startsWith(137, 80, 78, 71, 13, 10, 26, 10);
    case "image/jpeg": return startsWith(255, 216, 255);
    case "image/gif": return startsWith(71, 73, 70, 56) && (bytes[4] === 55 || bytes[4] === 57) && bytes[5] === 97;
    case "image/webp": return startsWith(82, 73, 70, 70) && bytes[8] === 87 && bytes[9] === 69 && bytes[10] === 66 && bytes[11] === 80;
    case "application/pdf": return startsWith(37, 80, 68, 70, 45);
    default: return false;
  }
}

export function certificateFileUrl(id: string): string {
  return `/api/certifications/${encodeURIComponent(id)}/file`;
}
