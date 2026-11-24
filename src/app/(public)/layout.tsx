/**
 * Layout: Public | Type: Server | Deps: Sidebar, Footer
 */
import { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/layout/container";
import { ChatLoader } from "@/components/chat/chat-loader";
import { getPublicSectionVisibility } from "@/lib/section-visibility-server";
import { getAvailabilityStatus } from "@/lib/availability-server";

async function SidebarWithAvailability() {
  const [availabilityStatus, visibility] = await Promise.all([getAvailabilityStatus(), getPublicSectionVisibility()]);
  return <Sidebar availabilityStatus={availabilityStatus} visibility={visibility} spotifyEnabled={Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET && process.env.SPOTIFY_REFRESH_TOKEN)} />;
}

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Suspense fallback={<Sidebar availabilityStatus={null} />}>
        <SidebarWithAvailability />
      </Suspense>
      <div className="page-content flex min-h-full flex-1 flex-col lg:pl-72">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <main id="main-content" className="flex-1">
          <Container>{children}</Container>
        </main>
        <Footer />
      </div>
      <ChatLoader enabled={Boolean(process.env.GEMINI_API_KEY)} />
    </>
  );
}
