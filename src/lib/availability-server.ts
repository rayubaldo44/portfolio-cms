import "server-only";

import { cache } from "react";
import { db } from "@/lib/db";
import {
  DEFAULT_AVAILABILITY_STATUS,
  type AvailabilityStatus,
} from "@/lib/availability";

export const getAvailabilityStatus = cache(
  async (): Promise<AvailabilityStatus | null> => {
    try {
      const settings = await db.siteSettings.findUnique({
        where: { id: "singleton" },
      });

      return settings?.availabilityStatus ?? DEFAULT_AVAILABILITY_STATUS;
    } catch {
      return null;
    }
  },
);
