/**
 * Page: Admin Settings | Type: Server | Deps: db, AvailabilityForm
 */
import { db } from "@/lib/db";
import Link from "next/link";
import { SpotifyLogo } from "@phosphor-icons/react/dist/ssr";
import { AvailabilityForm } from "@/components/admin/availability-form";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_AVAILABILITY_STATUS } from "@/lib/availability";
import { SectionVisibilityForm } from "@/components/admin/section-visibility-form";
import { getSectionVisibility } from "@/lib/section-visibility";
import { updateAvailability, updateSectionVisibility } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  let settings;
  try {
    settings = await db.siteSettings.findUnique({ where: { id: "singleton" } });
  } catch {
    return <p role="alert" className="text-sm text-red-600 dark:text-red-400">Settings unavailable right now. Reload to try again.</p>;
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          Settings
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Control what visitors see on your portfolio.
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <SectionVisibilityForm action={updateSectionVisibility} initialVisibility={getSectionVisibility(settings)} />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <AvailabilityForm
            action={updateAvailability}
            initialStatus={
              settings?.availabilityStatus ?? DEFAULT_AVAILABILITY_STATUS
            }
          />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col items-start gap-4 p-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
              Spotify
            </h2>
            <p className="mt-1 max-w-lg text-sm text-gray-600 dark:text-gray-400">
              Authorize your Spotify account to generate the refresh token used
              by your portfolio&apos;s now-playing feature.
            </p>
          </div>
          <Link
            href="/api/spotify/authorize"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-900 transition-all hover:-translate-y-0.5 hover:bg-gray-100 active:translate-y-0 active:scale-[0.98] dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            <SpotifyLogo aria-hidden="true" size={17} weight="regular" />
            Connect Spotify
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
