/**
 * Component: Project Import Form | Type: Client | Deps: useActionState, Textarea, Checkbox, Button
 */
"use client";

import { useActionState, useState } from "react";
import {
  importProjects,
  type ImportState,
  type ImportRowResult,
} from "@/app/(admin)/admin/projects/import-actions";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SAMPLE_JSON = `[
  {
    "title": "My Cool Project",
    "slug": "my-cool-project",
    "description": "A short, punchy summary.",
    "content": "An optional longer write-up.",
    "imageUrl": "https://example.com/cover.png",
    "liveUrl": "https://example.com",
    "githubUrl": "https://github.com/you/repo",
    "tags": ["React", "Next.js"],
    "featured": false,
    "order": 0
  }
]`;

const statusStyles: Record<ImportRowResult["status"], string> = {
  created:
    "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  updated:
    "bg-accent-subtle text-accent dark:text-accent-muted",
  skipped:
    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

function StatusBadge({ status }: { status: ImportRowResult["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-md px-2 py-0.5 text-[11px] font-medium leading-4 tracking-wide capitalize",
        statusStyles[status],
      )}
    >
      {status}
    </span>
  );
}

function ResultTable({ results }: { results: ImportRowResult[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
            <th className="px-3 py-2 font-medium">#</th>
            <th className="px-3 py-2 font-medium">Row</th>
            <th className="px-3 py-2 font-medium">Slug</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Details</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr
              key={index}
              className="border-b border-gray-100 last:border-0 dark:border-gray-900"
            >
              <td className="px-3 py-2 text-gray-400">{index + 1}</td>
              <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">
                {result.title}
              </td>
              <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                {result.slug || "-"}
              </td>
              <td className="px-3 py-2">
                <StatusBadge status={result.status} />
              </td>
              <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                {result.message ?? ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProjectImportForm() {
  const [state, formAction, pending] = useActionState<
    ImportState,
    FormData
  >(importProjects, {});
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-4">
        {state.error && (
          <p
            role="alert"
            className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-300"
          >
            {state.error}
          </p>
        )}
        <Textarea
          name="projects"
          label="Projects (JSON array)"
          helper="Paste a JSON array of projects. Slugs are optional; they're auto-generated from the title. Tags accept an array or a comma-separated string."
          rows={14}
          placeholder={SAMPLE_JSON}
          className="font-mono text-xs leading-relaxed"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />
        <div className="flex flex-wrap items-center gap-4">
          <Checkbox
            name="overwrite"
            label="Overwrite matching slugs"
            helper="When checked, projects with an existing slug are updated instead of skipped."
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setValue(SAMPLE_JSON)}
          >
            Load sample
          </Button>
        </div>
        <Button type="submit" disabled={pending} className="mt-2 w-fit">
          {pending ? "Importing…" : "Import Projects"}
        </Button>
      </form>

      {state.summary && state.results && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-md bg-green-100 px-2 py-1 font-medium text-green-800 dark:bg-green-950 dark:text-green-300">
              {state.summary.created} created
            </span>
            <span className="rounded-md bg-accent-subtle px-2 py-1 font-medium text-accent dark:text-accent-muted">
              {state.summary.updated} updated
            </span>
            <span className="rounded-md bg-gray-100 px-2 py-1 font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {state.summary.skipped} skipped
            </span>
            <span className="rounded-md bg-red-100 px-2 py-1 font-medium text-red-800 dark:bg-red-950 dark:text-red-300">
              {state.summary.failed} failed
            </span>
          </div>
          <ResultTable results={state.results} />
        </div>
      )}
    </div>
  );
}