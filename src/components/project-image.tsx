"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowsOut, ArrowLeft, ArrowRight, X } from "@phosphor-icons/react";
import type { ProjectScreenshot } from "@/lib/project-screenshots";
import styles from "./project-image.module.css";

interface ProjectImageProps {
  images: ProjectScreenshot[];
  title: string;
}

export function ProjectImage({ images, title }: ProjectImageProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [phase, setPhase] = useState<"closed" | "open" | "closing">("closed");
  const isOpen = phase !== "closed";
  const [index, setIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const active = images[index] ?? images[0];

  function navigate(direction: number) {
    if (phase !== "closing") setIndex(current => (current + direction + images.length) % images.length);
  }

  function closeViewer() {
    setPhase("closing");
  }

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!active) return null;
  const { src, caption } = active;

  return (
    <>
      <div className="space-y-4">
      <button
        type="button"
        aria-label={`View ${title} image full screen`}
        aria-haspopup="dialog"
        onClick={() => {
          dialogRef.current?.showModal();
          setPhase("open");
        }}
        className="group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-gray-200/80 ring-1 ring-gray-950/[0.02] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent dark:border-gray-800 dark:ring-white/[0.02]"
      >
        {/* Project images can be remote URLs or uploaded data URLs. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={caption || `${title} preview`}
          className="aspect-video w-full object-cover"
        />
        <span className="type-caption absolute right-3 bottom-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/65 px-3 py-2 text-white backdrop-blur-md transition-[background-color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:bg-black/80 group-focus-visible:bg-black/80 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 sm:right-4 sm:bottom-4">
          <ArrowsOut size={16} aria-hidden="true" />
          View full screen
        </span>
      </button>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-1" role="group" aria-label="Project screenshots">
          {images.map((image, imageIndex) => (
            <button key={imageIndex} type="button" aria-label={`View screenshot ${imageIndex + 1}${image.caption ? `: ${image.caption}` : ""}`} aria-pressed={index === imageIndex} onClick={() => setIndex(imageIndex)} className={`relative w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-24 ${index === imageIndex ? "border-accent" : "border-transparent opacity-60 hover:opacity-100"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.src} alt="" loading="lazy" className="aspect-video w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {(caption || images.length > 1) && <p aria-live="polite" className="type-caption flex items-start justify-between gap-4 text-gray-500 dark:text-gray-400"><span>{caption}</span><span className="shrink-0 font-mono">{index + 1} / {images.length}</span></p>}
      </div>

      <dialog
        ref={dialogRef}
        aria-label={`${title} image viewer`}
        data-closing={phase === "closing"}
        onKeyDown={(event) => {
          if (images.length > 1 && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
            event.preventDefault();
            navigate(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          touchStart.current = event.target instanceof HTMLImageElement && event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          touchStart.current = null;
          const touch = event.changedTouches[0];
          if (!start || !touch || images.length < 2) return;
          const dx = touch.clientX - start.x;
          const dy = touch.clientY - start.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) navigate(dx < 0 ? 1 : -1);
        }}
        onTouchCancel={() => { touchStart.current = null; }}
        onClose={() => setPhase("closed")}
        onCancel={(event) => {
          event.preventDefault();
          closeViewer();
        }}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && phase === "closing") {
            event.currentTarget.close();
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeViewer();
          }
        }}
        className={`${styles.viewer} fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none grid-rows-[auto_minmax(0,1fr)_auto] gap-6 border-0 bg-transparent p-4 text-white open:grid sm:gap-8 sm:p-8`}
      >
        <div className="flex items-center justify-between gap-6 border-b border-white/10 pb-4 sm:pb-5">
          <div className="min-w-0">
            <p className="mb-1 font-mono text-[10px] leading-4 tracking-[0.16em] text-white/45 uppercase">Project preview{images.length > 1 ? ` · ${index + 1} / ${images.length}` : ""}</p>
            <p className="line-clamp-2 text-base leading-snug font-medium tracking-tight text-white/90 sm:text-lg">{title}</p>
          </div>
          <button
            type="button"
            aria-label="Close image viewer"
            autoFocus
            onClick={closeViewer}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="pointer-events-none flex min-h-0 min-w-0 items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={index}
            src={src}
            alt={caption || `${title} preview`}
            className={`${styles.image} pointer-events-auto max-h-full max-w-full rounded-lg object-contain shadow-2xl ring-1 ring-white/10 sm:rounded-xl`}
          />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex min-w-0 items-center justify-center gap-4 sm:gap-8">
            {images.length > 1 && <button type="button" aria-label="Previous screenshot" onClick={() => navigate(-1)} className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"><ArrowLeft size={20} aria-hidden="true" /></button>}
            <p aria-live="polite" className="max-w-lg text-center text-sm leading-5 text-white/70">{caption || (images.length > 1 ? `Screenshot ${index + 1} of ${images.length}` : "Project preview")}</p>
            {images.length > 1 && <button type="button" aria-label="Next screenshot" onClick={() => navigate(1)} className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"><ArrowRight size={20} aria-hidden="true" /></button>}
          </div>
          <p className="pointer-events-none text-center text-xs text-white/40">
            <span className="sm:hidden">{images.length > 1 ? "Swipe to browse · " : ""}Tap outside to close</span>
            <span className="hidden sm:inline">{images.length > 1 ? "← → to browse · " : ""}Press Esc or click outside to close</span>
          </p>
        </div>
      </dialog>
    </>
  );
}
