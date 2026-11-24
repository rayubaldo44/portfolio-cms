/**
 * Section: Chat | Type: Client | Deps: @ai-sdk/react, ai, phosphor icons, cn
 */
"use client";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowUp, X } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const SUGGESTED_PROMPTS = [
  "What projects have you built?",
  "What's your tech stack?",
  "Tell me about your experience.",
  "How can I contact you?",
] as const;

export interface ChatWidgetProps {
  open: boolean;
  onClose: () => void;
}

export function ChatWidget({ open, onClose }: ChatWidgetProps) {
  const { messages, sendMessage, status, error, stop, regenerate } = useChat({ transport: new DefaultChatTransport({ api: "/api/chat" }) });
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("chat-open", open);
    return () => root.classList.remove("chat-open");
  }, [open]);

  const busy = status === "submitted" || status === "streaming";
  const rateLimited = error?.message.startsWith("Too many messages.") ?? false;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput("");
  }

  useEffect(() => {
    if (!open) return;
    const photo = document.querySelector<HTMLElement>("[data-hero-photo]");
    if (!photo) {
      if (window.scrollY <= 0) {
        window.scrollTo({ top: 320, behavior: reduce ? "auto" : "smooth" });
      }
      return;
    }

    const dialogHeight = Math.min(480, window.innerHeight - 144);
    const dialogTop = window.innerHeight - 96 - dialogHeight;
    const headerTop = dialogTop + 16;
    const headerBottom = headerTop + 168;
    const rect = photo.getBoundingClientRect();

    const overlaps =
      rect.height > 0 && rect.top < headerBottom && rect.bottom > headerTop;
    if (!overlaps) return;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const target = Math.max(
      0,
      Math.min(rect.bottom - dialogTop + 56, maxScroll),
    );

    window.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" });
  }, [open, reduce]);

  return (
    <>
      {open && (
        <>
          <motion.div
            aria-hidden="true"
            className="fixed inset-0 z-[59] bg-black/10 dark:bg-black/30"
            onClick={onClose}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: EASE }}
          />
          <motion.div
            role="dialog"
            aria-label="Chat with Alex's portfolio assistant"
            className="fixed inset-x-0 bottom-24 z-[60] mx-auto flex w-[50rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl"
            style={{ height: "min(30rem, calc(100vh - 9rem))" }}
            initial={reduce ? false : { opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
          <header className="flex items-center px-4 py-4">
            <span className="whitespace-nowrap font-pixel text-[clamp(1.5rem,8vw,4.125rem)] font-medium uppercase tracking-[0.2em] text-gray-900 dark:text-gray-100">
              ask about alex
            </span>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-2">
            {messages.length === 0 && (
              <div className="space-y-2">
                <motion.p
                  className="type-body text-gray-600 dark:text-gray-400"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  Hi! Ask me about Alex&apos;s projects, skills, or experience.
                </motion.p>
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <motion.button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage({ text: prompt })}
                    initial={reduce ? false : { opacity: 0, y: 10, x: -6 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{ duration: 0.4, ease: EASE, delay: 0.1 + index * 0.08 }}
                    whileHover={reduce ? undefined : { x: 6, transition: { duration: 0.2, ease: EASE } }}
                    whileTap={reduce ? undefined : { x: 3, scale: 0.99 }}
                    className="type-body flex w-full max-w-none items-center gap-2 rounded-lg px-2 py-1 text-left text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-50"
                  >
                    <span className="h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {prompt}
                  </motion.button>
                ))}
              </div>
            )}

            {messages.map((message) => {
              const text = message.parts
                .filter((part) => part.type === "text")
                .map((part) => ("text" in part ? part.text : ""))
                .join("");
              return (
                <div
                  key={message.id}
                  className={cn(
                    "type-body type-break max-w-[85%] whitespace-pre-line px-3",
                    message.role === "user"
                      ? "ml-auto text-gray-900 dark:text-gray-50"
                      : "mr-auto text-foreground",
                  )}
                >
                  {text}
                </div>
              );
            })}

            {busy && (
              <div className="mr-auto flex items-center gap-1 px-3 text-gray-500 dark:text-gray-400">
                <span className="h-1.5 w-1.5 animate-[pulse-dot_1s_ease-in-out_infinite] rounded-full bg-current" />
                <span className="h-1.5 w-1.5 animate-[pulse-dot_1s_ease-in-out_0.2s_infinite] rounded-full bg-current" />
                <span className="h-1.5 w-1.5 animate-[pulse-dot_1s_ease-in-out_0.4s_infinite] rounded-full bg-current" />
              </div>
            )}

            {error && !busy && messages.length > 0 && (
              <div className="space-y-2">
                <p className="type-body-compact text-red-500">
                  {rateLimited
                    ? error.message
                    : "Something went wrong. Please try again."}
                </p>
                {!rateLimited && (
                  <button
                    type="button"
                    onClick={() => regenerate()}
                    className="type-caption rounded-md px-2 py-1 text-accent underline-offset-4 hover:underline"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-4 py-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
              aria-label="Type your question"
              placeholder="Ask about projects, skills, experience…"
              className="flex-1 bg-transparent px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-50 dark:placeholder:text-gray-500"
            />
            {busy ? (
              <button
                type="button"
                aria-label="Stop generating"
                onClick={() => stop()}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <X size={16} weight="bold" />
              </button>
            ) : (
              <button
                type="submit"
                aria-label="Send message"
                disabled={!input.trim() || busy}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-accent transition-all hover:opacity-80 disabled:opacity-40"
              >
                <ArrowUp size={16} weight="bold" />
              </button>
            )}
          </form>
          <p className="type-meta px-4 pb-3 text-gray-400 dark:text-gray-500">
            AI-generated answers based on portfolio content only. Don&apos;t
            share personal or confidential information here.
          </p>
          </motion.div>
        </>
      )}
    </>
  );
}
