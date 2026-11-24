"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";
import type { ChatWidgetProps } from "./chat-widget";

/** Keep the chat SDK out of the initial route bundle. */
export function ChatLoader({ enabled = false }: { enabled?: boolean }) {
  const [Widget, setWidget] = useState<ComponentType<ChatWidgetProps> | null>(null);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const isOpen = useRef(false);
  const retryButton = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    isOpen.current = false;
    setOpen(false);
    const target = opener.current;
    if (target?.isConnected && !target.closest("[inert]") && target.getClientRects().length) {
      target.focus();
    } else {
      // The mobile drawer closes when its chat action is selected.
      document.querySelector<HTMLButtonElement>('button[aria-controls="sidebar-drawer"]')?.focus();
    }
  }, []);

  useEffect(() => {
    let disposed = false;
    let loading = false;
    let loaded = false;

    async function requestOpen() {
      if (!isOpen.current) {
        opener.current = document.activeElement as HTMLElement | null;
      }
      isOpen.current = true;
      setOpen(true);
      if (!enabled || loaded || loading) return;
      loading = true;
      setFailed(false);
      try {
        const { ChatWidget } = await import("./chat-widget");
        if (!disposed) {
          loaded = true;
          setWidget(() => ChatWidget);
        }
      } catch {
        if (!disposed) setFailed(true);
      } finally {
        loading = false;
      }
    }

    document.addEventListener("portfolio:open-chat", requestOpen);
    return () => {
      disposed = true;
      document.removeEventListener("portfolio:open-chat", requestOpen);
    };
  }, [enabled]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (open && failed) retryButton.current?.focus();
  }, [open, failed]);

  return (
    <>
      {Widget && <Widget open={open} onClose={close} />}
      {open && !Widget && (
        <div
          role="dialog"
          aria-label="Portfolio assistant"
          className="fixed inset-x-0 bottom-24 z-[60] mx-auto flex w-80 max-w-[calc(100vw-3rem)] flex-col gap-3 rounded-2xl border border-gray-200 bg-background p-5 dark:border-gray-800"
        >
          <p role="status" className="type-body-compact">
            {!enabled ? "The portfolio assistant is unavailable on this site." : failed ? "Chat could not load. Please try again." : "Loading chat…"}
          </p>
          {failed && (
            <button
              ref={retryButton}
              type="button"
              onClick={() => document.dispatchEvent(new Event("portfolio:open-chat"))}
              className="type-ui self-start text-accent underline underline-offset-4"
            >
              Retry
            </button>
          )}
          <button type="button" onClick={close} className="type-ui self-start">
            Close chat
          </button>
        </div>
      )}
    </>
  );
}
