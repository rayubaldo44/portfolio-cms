/**
 * Component: Form Wrapper | Type: Client | Deps: useActionState, Button, cn
 *
 * Wraps a server-action form, showing a global error banner and a pending
 * submit state. Field-level errors are rendered by the passed-in inputs via
 * the `error` prop (derived from `state.errors`).
 */
"use client";

import { useActionState, type FormEventHandler } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FormState {
  error?: string;
  errors?: Record<string, string>;
  success?: string;
}

interface FormWrapperProps {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submitLabel?: string;
  pendingLabel?: string;
  className?: string;
  onReset?: FormEventHandler<HTMLFormElement>;
  disabled?: boolean;
}

export function FormWrapper({
  action,
  children,
  submitLabel = "Save",
  pendingLabel = "Saving…",
  className,
  onReset,
  disabled = false,
}: FormWrapperProps) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} onReset={onReset} onSubmit={(event) => { if (disabled) event.preventDefault(); }} className={cn("flex flex-col gap-4", className)}>
      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {state.error}
        </p>
      )}
      {state.success && (
        <p
          role="status"
          className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300"
        >
          {state.success}
        </p>
      )}
      {children}
      <Button type="submit" disabled={pending || disabled} className="mt-2 w-fit">
        {pending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
