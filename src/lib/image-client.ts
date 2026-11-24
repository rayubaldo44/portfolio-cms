/**
 * Util: Client Image | Type: Client | Deps: none
 *
 * Downscales a pasted/chosen image client-side and encodes it as a WebP
 * data URL, keeping stored images small enough to live in the database.
 */
export const MAX_UPLOAD_DIMENSION = 1280;

export async function downscaleImageToDataUrl(
  source: Blob,
  maxDimension = MAX_UPLOAD_DIMENSION,
  quality = 0.82,
): Promise<string> {
  if (!source.type.startsWith("image/")) {
    throw new Error("Paste or choose an image file.");
  }

  const bitmap = await createImageBitmap(source);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Canvas is not supported.");
  }

  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/webp", quality);
}