export const AVAILABILITY_VALUES = [
  "AVAILABLE",
  "LIMITED",
  "UNAVAILABLE",
] as const;

export type AvailabilityStatus = (typeof AVAILABILITY_VALUES)[number];

export const DEFAULT_AVAILABILITY_STATUS: AvailabilityStatus = "AVAILABLE";

export const AVAILABILITY_OPTIONS: readonly {
  value: AvailabilityStatus;
  label: string;
}[] = [
  { value: "AVAILABLE", label: "Available for opportunities" },
  { value: "LIMITED", label: "Limited availability" },
  { value: "UNAVAILABLE", label: "Not available right now" },
];

export const AVAILABILITY_DETAILS: Record<
  AvailabilityStatus,
  { label: string; dotClassName: string }
> = {
  AVAILABLE: {
    label: "Available for opportunities",
    dotClassName: "bg-emerald-500 dark:bg-emerald-400",
  },
  LIMITED: {
    label: "Limited availability",
    dotClassName: "bg-amber-500 dark:bg-amber-400",
  },
  UNAVAILABLE: {
    label: "Not available right now",
    dotClassName: "bg-gray-400 dark:bg-gray-500",
  },
};

export function getAvailabilityLabel(status: AvailabilityStatus): string {
  return AVAILABILITY_DETAILS[status].label;
}
