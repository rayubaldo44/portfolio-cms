import { NextResponse, type NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  createSpotifyOAuthState,
  getSpotifyAppOrigin,
  getSpotifyOAuthConfig,
  SPOTIFY_OAUTH_SCOPES,
} from "@/lib/spotify-oauth";

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    const loginUrl = new URL("/admin-login", getSpotifyAppOrigin(request.url));
    loginUrl.searchParams.set("from", "/api/spotify/authorize");
    return NextResponse.redirect(loginUrl);
  }

  let config: ReturnType<typeof getSpotifyOAuthConfig>;
  try {
    config = getSpotifyOAuthConfig(request.url);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Spotify OAuth is not configured." },
      { status: 500 },
    );
  }

  const state = await createSpotifyOAuthState(config.clientSecret);
  const authorizeUrl = new URL("https://accounts.spotify.com/authorize");
  authorizeUrl.search = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    redirect_uri: config.redirectUri,
    scope: SPOTIFY_OAUTH_SCOPES.join(" "),
    state,
    show_dialog: "true",
  }).toString();

  return NextResponse.redirect(authorizeUrl);
}
