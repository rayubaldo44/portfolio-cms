/**
 * Component: Project Image Picker | Type: Client | Deps: Input, downscaleImageToDataUrl
 */
"use client";

import { useRef, useState } from "react";
import { TrashSimple, UploadSimple } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { downscaleImageToDataUrl } from "@/lib/image-client";

interface ProjectImagePickerProps {
  urlName: string;
  dataName: string;
  initialUrl?: string;
  initialData?: string;
}

type ImageMode = "url" | "data" | "none";

export function ProjectImagePicker({
  urlName,
  dataName,
  initialUrl = "",
  initialData = "",
}: ProjectImagePickerProps) {
  const [mode, setMode] = useState<ImageMode>(
    initialData ? "data" : initialUrl ? "url" : "none",
  );
  const [urlValue, setUrlValue] = useState(initialUrl);
  const [dataValue, setDataValue] = useState(initialData);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const previewSrc =
    mode === "data" ? dataValue : mode === "url" ? urlValue : null;

  async function handleBlob(blob: Blob) {
    setUploading(true);
    setError(null);
    try {
      const dataUrl = await downscaleImageToDataUrl(blob);
      setDataValue(dataUrl);
      setUrlValue("");
      setMode("data");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not process that image.");
    } finally {
      setUploading(false);
    }
  }

  function clear() {
    setMode("none");
    setUrlValue("");
    setDataValue("");
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
        Cover image
      </span>

      <div
        onPaste={(e) => {
          const file = Array.from(e.clipboardData.files)[0];
          if (file) {
            e.preventDefault();
            void handleBlob(file);
          }
        }}
        className="overflow-hidden rounded-xl border border-dashed border-gray-300 transition-colors dark:border-gray-700"
      >
        {previewSrc ? (
          <div className="flex flex-col gap-2 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt="Project image preview"
              className="aspect-video w-full rounded-lg border border-gray-200 bg-gray-100 object-cover dark:border-gray-800 dark:bg-gray-950"
            />
            <div className="flex items-center justify-between gap-2 px-1 pb-1">
              <span className="truncate font-mono text-xs text-gray-500 dark:text-gray-400">
                {mode === "data"
                  ? "Uploaded image · stored in your portfolio"
                  : urlValue}
              </span>
              <button
                type="button"
                onClick={clear}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/60"
              >
                <TrashSimple size={12} />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 p-6 text-center">
            <UploadSimple size={20} className="text-gray-400 dark:text-gray-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {uploading ? "Processing image…" : "Click to upload or paste (Ctrl+V)"}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              PNG, JPG, WebP or GIF. Resized automatically.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex h-9 w-fit cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800">
          <UploadSimple size={14} />
          {uploading ? "Processing…" : "Upload image"}
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleBlob(file);
            }}
          />
        </label>
        {mode !== "none" && (
          <button
            type="button"
            onClick={clear}
            className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <TrashSimple size={14} />
            Clear
          </button>
        )}
      </div>

      <Input
        name={urlName}
        label="Or use an image URL"
        placeholder="https://…"
        value={urlValue}
        onChange={(e) => {
          setUrlValue(e.target.value);
          if (e.target.value) {
            setDataValue("");
            setMode("url");
          }
        }}
        helper="Paste a hosted image URL instead. Clears any uploaded image."
      />

      <input type="hidden" name={dataName} value={dataValue} />

      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
