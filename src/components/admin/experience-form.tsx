/**
 * Component: Experience Form | Type: Client | Deps: FormWrapper, Input, Textarea, Checkbox
 */
"use client";

import { FormWrapper, type FormState } from "@/components/admin/form-wrapper";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface ExperienceFormInitial {
  company?: string;
  role?: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  order?: number;
}

interface ExperienceFormProps {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial?: ExperienceFormInitial;
  id?: string;
  submitLabel?: string;
}

export function ExperienceForm({
  action,
  initial,
  id,
  submitLabel,
}: ExperienceFormProps) {
  return (
    <FormWrapper action={action} submitLabel={submitLabel}>
      {id && <input type="hidden" name="id" value={id} />}
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="role"
            label="Role"
            placeholder="Full-Stack Engineer"
            required
            defaultValue={initial?.role ?? ""}
          />
          <Input
            name="company"
            label="Company"
            placeholder="Acme Corp"
            required
            defaultValue={initial?.company ?? ""}
          />
        </div>
        <Input
          name="location"
          label="Location"
          placeholder="Remote · Manila, PH"
          defaultValue={initial?.location ?? ""}
        />
        <Textarea
          name="description"
          label="Description"
          placeholder="What did you do?"
          rows={5}
          defaultValue={initial?.description ?? ""}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="startDate"
            label="Start Date"
            type="date"
            required
            defaultValue={initial?.startDate ?? ""}
          />
          <Input
            name="endDate"
            label="End Date"
            type="date"
            helper="Ignored when marked as current."
            defaultValue={initial?.endDate ?? ""}
          />
        </div>
        <Checkbox
          name="current"
          label="I currently work here"
          defaultChecked={initial?.current ?? false}
        />
        <Input
          name="order"
          label="Order"
          type="number"
          min={0}
          defaultValue={initial?.order ?? 0}
        />
      </div>
    </FormWrapper>
  );
}