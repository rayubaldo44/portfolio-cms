import "server-only";

import type { SpotifyTrack } from "@/lib/spotify-types";

interface SpotifyTokenResponse {
  access_token?: string;
  expires_in?: number;
  error_description?: string;
}

interface SpotifyTrackItem {
  type: "track";
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string; width: number | null; height: number | null }>;
  };
  external_urls: { spotify: string };
}

interface SpotifyCurrentlyPlayingResponse {
  is_playing: boolean;
  progress_ms: number | null;
  item: SpotifyTrackItem | { type: string } | null;
}

interface SpotifyRecentlyPlayedResponse {
  items: Array<{ track: SpotifyTrackItem }>;
}

export class SpotifyApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryAfterSeconds: number | null,
  ) {
    super(message);
    this.name = "SpotifyApiError";
  }
}

let accessTokenCache: { token: string; expiresAt: number } | null = null;
let nowPlayingCache: {
  track: SpotifyTrack | null;
  expiresAt: number;
} | null = null;
let nowPlayingRequest: Promise<SpotifyTrack | null> | null = null;
let spotifyBlockedUntil = 0;

const NOW_PLAYING_CACHE_MS = 25_000;
const DEFAULT_RATE_LIMIT_SECONDS = 60;

function getSpotifyCredentials() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) return null;
  return { clientId, clientSecret, refreshToken };
}

async function getAccessToken() {
  if (accessTokenCache && accessTokenCache.expiresAt > Date.now() + 60_000) {
    return accessTokenCache.token;
  }

  const credentials = getSpotifyCredentials();
  if (!credentials) return null;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: credentials.refreshToken,
    }),
    cache: "no-store",
  });
  const token = (await response.json()) as SpotifyTokenResponse;

  if (!response.ok || !token.access_token) {
    throw new Error(token.error_description ?? "Spotify token refresh failed.");
  }

  accessTokenCache = {
    token: token.access_token,
    expiresAt: Date.now() + (token.expires_in ?? 3600) * 1000,
  };
  return token.access_token;
}

async function spotifyFetch(path: string, retry = true): Promise<Response | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const response = await fetch(`https://api.spotify.com${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (response.status === 401 && retry) {
    accessTokenCache = null;
    return spotifyFetch(path, false);
  }
  return response;
}

function toTrack(
  item: SpotifyTrackItem,
  status: SpotifyTrack["status"],
  progressMs: number | null = null,
): SpotifyTrack {
  return {
    id: item.id,
    name: item.name,
    artist: item.artists.map((artist) => artist.name).join(", "),
    album: item.album.name,
    imageUrl: item.album.images[0]?.url ?? null,
    spotifyUrl: item.external_urls.spotify,
    status,
    progressMs,
  };
}

function createSpotifyApiError(resource: string, response: Response) {
  const retryAfter = Number(response.headers.get("retry-after"));
  return new SpotifyApiError(
    `Spotify ${resource} request failed (${response.status}).`,
    response.status,
    Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : null,
  );
}

async function fetchSpotifyNowPlaying(): Promise<SpotifyTrack | null> {
  const currentResponse = await spotifyFetch("/v1/me/player/currently-playing");
  if (!currentResponse) return null;

  if (currentResponse.ok && currentResponse.status !== 204) {
    const current =
      (await currentResponse.json()) as SpotifyCurrentlyPlayingResponse;
    if (current.item?.type === "track") {
      return toTrack(
        current.item as SpotifyTrackItem,
        current.is_playing ? "playing" : "paused",
        current.progress_ms,
      );
    }
  } else if (currentResponse.status !== 204) {
    throw createSpotifyApiError("currently-playing", currentResponse);
  }

  const recentResponse = await spotifyFetch("/v1/me/player/recently-played?limit=1");
  if (!recentResponse) return null;
  if (!recentResponse.ok) {
    throw createSpotifyApiError("recently-played", recentResponse);
  }

  const recent = (await recentResponse.json()) as SpotifyRecentlyPlayedResponse;
  const item = recent.items[0]?.track;
  return item ? toTrack(item, "recent") : null;
}

function asRecentlyPlayed(track: SpotifyTrack): SpotifyTrack {
  return {
    ...track,
    status: "recent",
    progressMs: null,
  };
}

export async function getSpotifyNowPlaying(): Promise<SpotifyTrack | null> {
  const now = Date.now();

  if (nowPlayingCache && nowPlayingCache.expiresAt > now) {
    return nowPlayingCache.track;
  }

  if (spotifyBlockedUntil > now) {
    if (nowPlayingCache?.track) {
      return asRecentlyPlayed(nowPlayingCache.track);
    }

    throw new SpotifyApiError(
      "Spotify rate limit is still active.",
      429,
      Math.max(1, Math.ceil((spotifyBlockedUntil - now) / 1000)),
    );
  }

  if (nowPlayingRequest) return nowPlayingRequest;

  nowPlayingRequest = fetchSpotifyNowPlaying()
    .then((track) => {
      nowPlayingCache = {
        track,
        expiresAt: Date.now() + NOW_PLAYING_CACHE_MS,
      };
      return track;
    })
    .catch((error: unknown) => {
      if (error instanceof SpotifyApiError && error.status === 429) {
        const retryAfterSeconds =
          error.retryAfterSeconds ?? DEFAULT_RATE_LIMIT_SECONDS;
        spotifyBlockedUntil = Date.now() + retryAfterSeconds * 1000;

        if (nowPlayingCache?.track) {
          return asRecentlyPlayed(nowPlayingCache.track);
        }
      }
      throw error;
    })
    .finally(() => {
      nowPlayingRequest = null;
    });

  return nowPlayingRequest;
}
