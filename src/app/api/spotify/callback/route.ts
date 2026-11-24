import { NextResponse, type NextRequest } from "next/server";
import {
  getSpotifyOAuthConfig,
  verifySpotifyOAuthState,
} from "@/lib/spotify-oauth";

interface SpotifyTokenResponse {
  access_token?: string;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

function noStoreJson(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}

export async function GET(request: NextRequest) {
  const returnedState = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  const spotifyError = request.nextUrl.searchParams.get("error");

  if (spotifyError) {
    return noStoreJson({ error: `Spotify authorization failed: ${spotifyError}` }, 400);
  }

  if (!code) {
    return noStoreJson({ error: "Spotify did not return an authorization code." }, 400);
  }

  let config: ReturnType<typeof getSpotifyOAuthConfig>;
  try {
    config = getSpotifyOAuthConfig(request.url);
  } catch (error) {
    return noStoreJson(
      { error: error instanceof Error ? error.message : "Spotify OAuth is not configured." },
      500,
    );
  }

  if (
    !returnedState ||
    !(await verifySpotifyOAuthState(returnedState, config.clientSecret))
  ) {
    return noStoreJson({ error: "Invalid or expired Spotify OAuth state." }, 400);
  }

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: config.redirectUri,
    }),
    cache: "no-store",
  });

  const token = (await tokenResponse.json()) as SpotifyTokenResponse;
  if (!tokenResponse.ok) {
    return noStoreJson(
      {
        error:
          token.error_description ??
          token.error ??
          "Spotify rejected the authorization code.",
      },
      tokenResponse.status,
    );
  }

  if (!token.refresh_token) {
    return noStoreJson(
      { error: "Spotify did not issue a refresh token. Restart authorization and approve access again." },
      502,
    );
  }

  return noStoreJson({
    success: true,
    refresh_token: token.refresh_token,
    scope: token.scope,
    next: "Add this value to Vercel as SPOTIFY_REFRESH_TOKEN, then redeploy. Keep it private.",
  });
}
