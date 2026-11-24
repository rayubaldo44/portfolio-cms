import { NextResponse } from "next/server";
import { getSpotifyNowPlaying, SpotifyApiError } from "@/lib/spotify";
import type { SpotifyNowPlayingResponse } from "@/lib/spotify-types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const body: SpotifyNowPlayingResponse = {
      track: await getSpotifyNowPlaying(),
    };
    return NextResponse.json(body, {
      headers: {
        "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    const rateLimitError =
      error instanceof SpotifyApiError && error.status === 429 ? error : null;
    const headers: Record<string, string> = { "Cache-Control": "no-store" };

    if (rateLimitError?.retryAfterSeconds) {
      headers["Retry-After"] = String(rateLimitError.retryAfterSeconds);
    }

    return NextResponse.json(
      { track: null } satisfies SpotifyNowPlayingResponse,
      {
        status: rateLimitError ? 429 : 503,
        headers,
      },
    );
  }
}
