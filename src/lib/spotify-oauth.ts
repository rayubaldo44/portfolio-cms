import "server-only";

export const SPOTIFY_OAUTH_SCOPES = [
  "user-read-currently-playing",
  "user-read-recently-played",
] as const;

const STATE_TTL_MS = 10 * 60 * 1000;

async function getStateKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSpotifyOAuthState(secret: string) {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + STATE_TTL_MS, nonce: crypto.randomUUID() }),
  ).toString("base64url");
  const signature = await crypto.subtle.sign(
    "HMAC",
    await getStateKey(secret),
    new TextEncoder().encode(payload),
  );

  return `${payload}.${Buffer.from(signature).toString("base64url")}`;
}

export async function verifySpotifyOAuthState(state: string, secret: string) {
  const [payload, signature] = state.split(".");
  if (!payload || !signature) return false;

  const validSignature = await crypto.subtle.verify(
    "HMAC",
    await getStateKey(secret),
    Buffer.from(signature, "base64url"),
    new TextEncoder().encode(payload),
  );
  if (!validSignature) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      exp?: number;
    };
    return typeof parsed.exp === "number" && parsed.exp >= Date.now();
  } catch {
    return false;
  }
}

export function getSpotifyAppOrigin(requestUrl: string) {
  const requestOrigin = new URL(requestUrl);
  return process.env.NODE_ENV === "development"
    ? `http://127.0.0.1:${requestOrigin.port || "3000"}`
    : requestOrigin.origin;
}

export function getSpotifyOAuthConfig(requestUrl?: string) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const configuredRedirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || !clientSecret || !configuredRedirectUri) {
    throw new Error(
      "Spotify OAuth is not configured. Set SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SPOTIFY_REDIRECT_URI.",
    );
  }

  const requestOrigin = requestUrl ? getSpotifyAppOrigin(requestUrl) : null;
  const redirectUri =
    requestOrigin && process.env.NODE_ENV === "development"
      ? `${requestOrigin}/api/spotify/callback`
      : configuredRedirectUri;

  return { clientId, clientSecret, redirectUri };
}
