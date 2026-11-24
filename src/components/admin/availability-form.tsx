/**
 * Component: Availability Form | Type: Client | Deps: FormWrapper, Select
 */
"use client";

import { FormWrapper, type FormState } from "@/components/admin/form-wrapper";
import { Select } from "@/components/ui/select";
import {
  AVAILABILITY_OPTIONS,
  type AvailabilityStatus,
} from "@/lib/availability";

interface AvailabilityFormProps {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initialStatus: AvailabilityStatus;
}

export function AvailabilityForm({
  action,
  initialStatus,
}: AvailabilityFormProps) {
  return (
    <FormWrapper action={action} submitLabel="Save availability">
      <Select
        name="availabilityStatus"
        label="Current availability"
        defaultValue={initialStatus}
        required
      >
        {AVAILABILITY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        This status appears beneath your role on the portfolio homepage and is
        included in the assistant&apos;s portfolio context.
      </p>
    </FormWrapper>
  );
}
