"use client";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { FormWrapper, type FormState } from "@/components/admin/form-wrapper";
import { SECTION_OPTIONS, type SectionVisibility } from "@/lib/section-visibility";

interface SectionVisibilityFormProps {
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  initialVisibility: SectionVisibility;
}

export function SectionVisibilityForm({ action, initialVisibility }: SectionVisibilityFormProps) {
  return (
    <FormWrapper
      action={action}
      submitLabel="Save section visibility"
      onReset={event => event.preventDefault()}
    >
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">Section visibility</h2>
        <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          Choose which sections visitors can see. Hidden sections stay available to edit in admin.
        </p>
      </div>
      <VisibilitySwitches initialVisibility={initialVisibility} />
      <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        Save to apply changes to your homepage, navigation, section pages, and assistant knowledge.
      </p>
    </FormWrapper>
  );
}

function VisibilitySwitches({ initialVisibility }: { initialVisibility: SectionVisibility }) {
  const [visibility, setVisibility] = useState(initialVisibility);
  const { pending } = useFormStatus();
  return (
      <fieldset disabled={pending} aria-label="Portfolio sections" className="min-w-0 divide-y divide-gray-200 dark:divide-gray-800 disabled:opacity-60">
        {SECTION_OPTIONS.map(({ key, field, label }) => (
          <div key={key} className="flex items-center justify-between gap-4 py-4">
            <div>
              <label htmlFor={field} className="cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-100">{label}</label>
              <p id={`${field}-status`} className="mt-1 text-xs text-gray-500 dark:text-gray-400">{visibility[key] ? "Visible" : "Hidden"}</p>
            </div>
            <input type="hidden" name={field} value={String(visibility[key])} />
            <input
              id={field}
              type="checkbox"
              role="switch"
              aria-describedby={`${field}-status`}
              checked={visibility[key]}
              onChange={event => {
                const checked = event.target.checked;
                setVisibility(prev => ({ ...prev, [key]: checked }));
              }}
              className="h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full bg-gray-300 p-0.5 transition-colors before:block before:size-5 before:rounded-full before:bg-white before:shadow-sm before:transition-transform checked:bg-gray-900 checked:before:translate-x-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none motion-reduce:before:transition-none dark:bg-gray-700 dark:checked:bg-gray-200 dark:checked:before:bg-gray-900"
            />
          </div>
        ))}
      </fieldset>
  );
}
