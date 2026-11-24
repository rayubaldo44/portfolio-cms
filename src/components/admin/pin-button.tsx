/**
 * Component: Pin Button | Type: Client | Deps: useFormStatus, toggleFeatured, Phosphor icons
 *
 * Inline push-pin toggle that flips a project's `featured` flag from the
 * admin table without opening the edit form.
 */
"use client";

import { useFormStatus } from "react-dom";
import { PushPin, PushPinSlash } from "@phosphor-icons/react";
import { toggleFeatured } from "@/app/(admin)/admin/projects/actions";
import { cn } from "@/lib/utils";

interface PinButtonProps {
  id: string;
  pinned: boolean;
}

function PinIcon({ pinned }: Pick<PinButtonProps, "pinned">) {
  const { pending } = useFormStatus();
  if (pending) {
    return (
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-accent dark:border-gray-600 dark:border-t-accent-muted" />
    );
  }
  return pinned ? <PushPin size={16} weight="fill" /> : <PushPinSlash size={16} />;
}

export function PinButton({ id, pinned }: PinButtonProps) {
  return (
    <form action={toggleFeatured}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label={pinned ? "Unpin project" : "Pin project"}
        aria-pressed={pinned}
        title={pinned ? "Unpin from portfolio" : "Pin to portfolio"}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
          pinned
            ? "text-accent hover:bg-gray-100 dark:hover:bg-gray-800"
            : "text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300",
        )}
      >
        <PinIcon pinned={pinned} />
      </button>
    </form>
  );
}