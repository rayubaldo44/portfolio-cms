/**
 * Component: Confirm Dialog | Type: Client | Deps: useState, Button, cn
 *
 * Renders a danger trigger that opens a `<dialog>` whose confirm button
 * submits a server-action `<form>` to delete an item.
 */
"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  /** Message shown in the dialog body. */
  message: string;
  /** The trigger control (e.g. a danger button). */
  trigger: React.ReactNode;
  /** The delete Server Action. */
  action: (formData: FormData) => void | Promise<void>;
  /** The id of the item being deleted. */
  id: string;
}

export function ConfirmDialog({ message, trigger, action, id }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <span
        className="inline-flex cursor-pointer"
        onClick={() => dialogRef.current?.showModal()}
      >
        {trigger}
      </span>
      <dialog
        ref={dialogRef}
        className="m-auto w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 backdrop:bg-black/50 dark:border-gray-800 dark:bg-gray-900"
      >
        <form
          action={action}
          onSubmit={() => dialogRef.current?.close()}
          className="flex flex-col gap-6"
        >
          <input type="hidden" name="id" value={id} />
          <p className="text-sm text-gray-900 dark:text-gray-50">{message}</p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => dialogRef.current?.close()}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm">
              Confirm
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
