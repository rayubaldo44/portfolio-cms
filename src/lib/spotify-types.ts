export type SpotifyPlaybackStatus = "playing" | "paused" | "recent";

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  imageUrl: string | null;
  spotifyUrl: string;
  status: SpotifyPlaybackStatus;
  progressMs: number | null;
}

export interface SpotifyNowPlayingResponse {
  track: SpotifyTrack | null;
}
