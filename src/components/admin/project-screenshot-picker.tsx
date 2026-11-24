"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, DotsSixVertical, TrashSimple, UploadSimple } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { downscaleImageToDataUrl } from "@/lib/image-client";
import { MAX_PROJECT_SCREENSHOTS, MAX_PROJECT_IMAGE_CHARACTERS, type ProjectScreenshot } from "@/lib/project-screenshots";

interface Props {
  initial?: ProjectScreenshot[];
  onProcessingChange: (processing: boolean) => void;
}

export function ProjectScreenshotPicker({ initial = [], onProcessingChange }: Props) {
  const [images, setImages] = useState(() => initial.map((image, index) => ({ ...image, id: `initial-${index}` })));
  const [url, setUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const dragged = useRef<number | null>(null);
  const busy = useRef(false);
  const buttonClass = "inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-30 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800";

  function append(next: ProjectScreenshot[]) {
    if (images.length + next.length > MAX_PROJECT_SCREENSHOTS) {
      throw new Error("Add up to 8 screenshots. Remove one before adding more.");
    }
    if ([...images, ...next].reduce((sum, image) => sum + image.src.length, 0) > MAX_PROJECT_IMAGE_CHARACTERS) {
      throw new Error("These screenshots are too large together. Choose fewer or smaller images (3MB total including the cover).");
    }
    setImages(current => [...current, ...next.map(image => ({ ...image, id: crypto.randomUUID() }))]);
  }

  async function upload(files: File[]) {
    if (!files.length || busy.current) return;
    busy.current = true;
    setProcessing(true);
    onProcessingChange(true);
    setError("");
    try {
      if (images.length + files.length > MAX_PROJECT_SCREENSHOTS) throw new Error("Add up to 8 screenshots.");
      const next: ProjectScreenshot[] = [];
      for (const file of files) {
        if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) throw new Error("Choose PNG, JPEG, WebP or GIF images.");
        next.push({ src: await downscaleImageToDataUrl(file), caption: "" });
      }
      append(next);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not upload screenshots.");
    } finally {
      busy.current = false;
      setProcessing(false);
      onProcessingChange(false);
    }
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length || processing) return;
    setImages(current => {
      const next = [...current];
      next.splice(to, 0, next.splice(from, 1)[0]);
      return next;
    });
  }

  return (
    <fieldset disabled={processing} onPaste={event => {
      const files = Array.from(event.clipboardData.files).filter(file => file.type.startsWith("image/"));
      if (!files.length) return;
      event.preventDefault();
      void upload(files);
    }} className="min-w-0 space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
      <legend className="px-1 text-sm font-medium text-gray-900 dark:text-gray-100">Project screenshots</legend>
      <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">Add up to 8 screenshots after the cover. Drag to reorder or use the arrow buttons. Images are resized automatically; keep all images including the cover under 3MB.</p>
      <div role="group" aria-label="Paste screenshots" tabIndex={processing ? -1 : 0} className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:border-gray-700 dark:bg-gray-950/50">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Paste screenshots here</p>
        <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">Click this area, then press Ctrl+V (⌘V on Mac). Each paste adds to your gallery.</p>
      </div>
      <input type="hidden" name="screenshots" value={JSON.stringify(images.map(({ src, caption }) => ({ src, caption })))} />
      <ol className="space-y-3" aria-label="Screenshot order">
        {images.map((image, index) => (
          <li key={image.id} onDragOver={event => event.preventDefault()} onDrop={event => {
            event.preventDefault();
            if (dragged.current !== null) move(dragged.current, index);
            dragged.current = null;
          }} className="flex min-w-0 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950/50">
            <button type="button" draggable={!processing} onDragStart={event => {
              dragged.current = index;
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", image.id);
            }} onDragEnd={() => { dragged.current = null; }} aria-label={`Drag screenshot ${index + 1} to reorder`} className="self-start rounded p-1 text-gray-400 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-accent dark:hover:text-gray-200">
              <DotsSixVertical size={18} />
            </button>
            <div className="min-w-0 flex-1 space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.src} alt={`Screenshot ${index + 1} preview`} className="aspect-video w-full rounded-md bg-gray-100 object-contain dark:bg-gray-900" />
              <Input id={`caption-${image.id}`} label={`Screenshot ${index + 1} caption`} placeholder="e.g. Dashboard overview" maxLength={200} value={image.caption} onChange={event => setImages(current => current.map(item => item.id === image.id ? { ...item, caption: event.target.value } : item))} />
              <div className="flex items-center gap-2">
                <span className="mr-auto font-mono text-xs text-gray-500">{index + 1} / {images.length}</span>
                <button type="button" className={buttonClass} aria-label={`Move screenshot ${index + 1} up`} disabled={index === 0} onClick={() => move(index, index - 1)}><ArrowUp size={15} /></button>
                <button type="button" className={buttonClass} aria-label={`Move screenshot ${index + 1} down`} disabled={index === images.length - 1} onClick={() => move(index, index + 1)}><ArrowDown size={15} /></button>
                <button type="button" className={buttonClass} aria-label={`Remove screenshot ${index + 1}`} onClick={() => setImages(current => current.filter(item => item.id !== image.id))}><TrashSimple size={15} /></button>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <label className={`inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-300 px-3 text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200 ${processing || images.length >= MAX_PROJECT_SCREENSHOTS ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
        <UploadSimple size={16} />{processing ? "Processing screenshots…" : "Upload screenshots"}
        <input type="file" aria-label="Upload screenshots" accept="image/png,image/jpeg,image/webp,image/gif" multiple disabled={processing || images.length >= MAX_PROJECT_SCREENSHOTS} className="sr-only" onChange={event => {
          void upload(Array.from(event.target.files ?? []));
          event.target.value = "";
        }} />
      </label>
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1"><Input id="screenshot-url" label="Or add a screenshot URL" type="url" placeholder="https://…" value={url} onChange={event => setUrl(event.target.value)} /></div>
        <button type="button" disabled={!url.trim() || images.length >= MAX_PROJECT_SCREENSHOTS} className="h-10 shrink-0 rounded-md border border-gray-300 px-3 text-sm text-gray-800 disabled:opacity-40 dark:border-gray-700 dark:text-gray-200" onClick={() => {
          setError("");
          try {
            const parsed = new URL(url.trim());
            if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Use an http or https screenshot URL.");
            append([{ src: parsed.href, caption: "" }]);
            setUrl("");
          } catch (error) { setError(error instanceof Error ? error.message : "Enter a valid image URL."); }
        }}>Add screenshot</button>
      </div>
      {processing && <p role="status" className="text-xs text-gray-500">Processing images. Saving will be available when they’re ready.</p>}
      {error && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </fieldset>
  );
}
