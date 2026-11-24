/**
 * Section: Layout | Type: Client | Deps: cn, Link, phosphor, ThemeToggle, SidebarLinks
 */
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Briefcase,
  Books,
  Certificate,
  ChatCircleDots,
  EnvelopeSimple,
  FolderOpen,
  List,
  Stack,
  UserCircle,
  X,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SidebarLinks } from "@/components/layout/sidebar-links";
import { AvailabilityIndicator } from "@/components/availability-indicator";
import { SpotifyNowPlaying } from "@/components/spotify-now-playing";
import type { AvailabilityStatus } from "@/lib/availability";
import { useDesktopBreakpoint } from "@/hooks/use-desktop-breakpoint";

import { HIDDEN_SECTION_VISIBILITY, type SectionVisibility } from "@/lib/section-visibility";

const navItems = [
  { section: "about", href: "/about", label: "about", icon: UserCircle },
  { section: "projects", href: "/projects", label: "projects", icon: FolderOpen },
  { section: "experience", href: "/experience", label: "experience", icon: Briefcase },
  { section: "stack", href: "/stack", label: "stack", icon: Stack },
  { section: null, href: "/resources", label: "resources", icon: Books },
  { section: "certifications", href: "/certifications", label: "certifications", icon: Certificate },
] as const;

function SidebarFooter({ onAsk, spotifyEnabled }: { onAsk: () => void; spotifyEnabled: boolean }) {
  return (
    <div className="mt-auto flex flex-col gap-4 pt-6">
      {spotifyEnabled && <SpotifyNowPlaying />}
      <div className="h-px w-full bg-gray-200/80 dark:bg-gray-800/80" />
      <button
        type="button"
        aria-label="Ask about Alex"
        onClick={onAsk}
        className="type-ui flex items-center gap-2.5 self-start rounded-md px-3 py-2.5 text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
      >
        <ChatCircleDots aria-hidden="true" size={16} weight="regular" className="shrink-0" />
        ask me anything
      </button>
      <div className="px-3">
        <ThemeToggle />
      </div>
      <div className="px-3 pb-1">
        <p className="type-label text-gray-400 dark:text-gray-500">
          Get in touch
        </p>
        <a
          href="mailto:alex@example.com"
          className="type-body-compact type-break mt-1.5 flex items-center gap-2 text-gray-700 transition-colors hover:text-accent dark:text-gray-300"
        >
          <EnvelopeSimple aria-hidden="true" size={16} weight="regular" className="shrink-0" />
          alex@example.com
        </a>
      </div>
    </div>
  );
}

interface SidebarProps {
  availabilityStatus: AvailabilityStatus | null;
  visibility?: SectionVisibility;
  spotifyEnabled?: boolean;
}

export function Sidebar({ availabilityStatus, visibility = HIDDEN_SECTION_VISIBILITY, spotifyEnabled = false }: SidebarProps) {
  const visibleNavItems = navItems.filter(item => item.section === null || visibility[item.section]);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isDesktop = useDesktopBreakpoint();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onDesktop = () => {
      if (mql.matches) setOpen(false);
    };
    mql.addEventListener("change", onDesktop);
    return () => mql.removeEventListener("change", onDesktop);
  }, []);

  function openChat() {
    document.dispatchEvent(new CustomEvent("portfolio:open-chat"));
  }

  return (
    <>
      {/* Mobile top bar */}
      <header className="site-nav sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between border-b border-gray-200/80 bg-background/80 px-5 backdrop-blur-xl dark:border-gray-800/80 lg:hidden">
        <Link
          href="/"
          className="text-base font-bold tracking-tight text-gray-900 transition-colors hover:text-accent dark:text-gray-50"
          onClick={() => setOpen(false)}
        >
          Alex Morgan
        </Link>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="sidebar-drawer"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {open ? <X size={20} /> : <List size={20} />}
        </button>
      </header>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Off-canvas drawer */}
      <div
        id="sidebar-drawer"
        inert={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-y-auto border-r border-gray-200/80 bg-background/95 px-4 py-6 backdrop-blur-xl transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col items-start px-3">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="text-base font-bold tracking-tight text-gray-900 transition-colors hover:text-accent dark:text-gray-50"
            >
              Alex Morgan
            </Link>
            {availabilityStatus && (
              <AvailabilityIndicator
                status={availabilityStatus}
                className="mt-3"
              />
            )}
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="rounded-md p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-8 flex-1">
          <SidebarLinks items={visibleNavItems} activePath={pathname} onNavigate={() => setOpen(false)} />
        </div>
        {!isDesktop && (
          <SidebarFooter
            spotifyEnabled={spotifyEnabled}
            onAsk={() => {
              openChat();
              setOpen(false);
            }}
          />
        )}
      </div>

      {/* Desktop rail */}
      <aside
        aria-label="Main navigation"
        className="site-nav fixed inset-y-4 left-4 z-40 hidden w-64 flex-col overflow-y-auto rounded-2xl border border-gray-300/80 bg-white/95 px-4 py-6 shadow-[0_8px_30px_rgba(0,0,0,0.07)] backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/95 dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] lg:flex"
      >
        <div className="flex flex-col items-start px-3">
          <Link
            href="/"
            className="text-base font-bold tracking-tight text-gray-900 transition-colors hover:text-accent dark:text-gray-50"
          >
            Alex Morgan
          </Link>
          {availabilityStatus && (
            <AvailabilityIndicator
              status={availabilityStatus}
              className="mt-3"
            />
          )}
        </div>
        <div className="mt-8 flex-1">
          <SidebarLinks items={visibleNavItems} activePath={pathname} />
        </div>
        {isDesktop && <SidebarFooter onAsk={openChat} spotifyEnabled={spotifyEnabled} />}
      </aside>
    </>
  );
}
