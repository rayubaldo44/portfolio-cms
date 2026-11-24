/**
 * Component: Availability Indicator | Type: Both | Deps: availability, cn
 */
import { AVAILABILITY_DETAILS, type AvailabilityStatus } from "@/lib/availability";
import { cn } from "@/lib/utils";

interface AvailabilityIndicatorProps {
  status: AvailabilityStatus;
  className?: string;
}

export function AvailabilityIndicator({
  status,
  className,
}: AvailabilityIndicatorProps) {
  const availability = AVAILABILITY_DETAILS[status];

  return (
    <p
      aria-label={`Availability: ${availability.label}`}
      className={cn(
        "type-meta flex items-center gap-2 text-gray-500 dark:text-gray-400",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-2 shrink-0 rounded-full", availability.dotClassName)}
      />
      <span>{availability.label}</span>
    </p>
  );
}
