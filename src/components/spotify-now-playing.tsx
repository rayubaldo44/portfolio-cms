/**
 * Component: Spotify Now Playing | Type: Client | Deps: Spotify API, Phosphor
 */
"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowSquareOut,
  MusicNotes,
  Pause,
  Play,
} from "@phosphor-icons/react";
import type {
  SpotifyNowPlayingResponse,
  SpotifyTrack,
} from "@/lib/spotify-types";

const ACTIVE_POLL_INTERVAL_MS = 30_000;
const IDLE_POLL_INTERVAL_MS = 120_000;
const TRACK_CACHE_KEY = "portfolio:last-spotify-track";
const PLAYER_LOAD_TIMEOUT_MS = 20_000;
const STATUS_LABEL: Record<SpotifyTrack["status"], string> = {
  playing: "Now listening",
  paused: "Paused on Spotify",
  recent: "Recently played",
};

function asRecentlyPlayed(track: SpotifyTrack): SpotifyTrack {
  return track.status === "recent"
    ? track
    : { ...track, status: "recent", progressMs: null };
}

function readCachedTrack(): SpotifyTrack | null {
  try {
    const value = JSON.parse(
      window.localStorage.getItem(TRACK_CACHE_KEY) ?? "null",
    ) as Partial<SpotifyTrack> | null;

    if (
      !value ||
      typeof value.id !== "string" ||
      typeof value.name !== "string" ||
      typeof value.artist !== "string" ||
      typeof value.album !== "string" ||
      typeof value.spotifyUrl !== "string"
    ) {
      return null;
    }

    return asRecentlyPlayed(value as SpotifyTrack);
  } catch {
    return null;
  }
}

function cacheTrack(track: SpotifyTrack) {
  try {
    window.localStorage.setItem(TRACK_CACHE_KEY, JSON.stringify(track));
  } catch {
    // Storage may be unavailable in private browsing or hardened browsers.
  }
}

interface SpotifyPlaybackEvent {
  data: { duration: number; isPaused: boolean; position: number };
}

interface SpotifyEmbedController {
  destroy: () => void;
  loadEntity: (uri: string) => void;
  restart: () => void;
  togglePlay: () => void;
  addListener: (
    event: "ready" | "error" | "playback_update",
    callback: (event: SpotifyPlaybackEvent) => void,
  ) => void;
}

interface SpotifyIframeApi {
  createController: (
    element: HTMLElement,
    options: { uri: string; width: string; height: string },
    callback: (controller: SpotifyEmbedController) => void,
  ) => void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
  }
}

let spotifyIframeApi: SpotifyIframeApi | null = null;
let spotifyIframeApiPromise: Promise<SpotifyIframeApi> | null = null;

function loadSpotifyIframeApi() {
  if (spotifyIframeApi) return Promise.resolve(spotifyIframeApi);
  if (spotifyIframeApiPromise) return spotifyIframeApiPromise;

  spotifyIframeApiPromise = new Promise<SpotifyIframeApi>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error("Spotify player initialization timed out"));
    }, PLAYER_LOAD_TIMEOUT_MS);
    window.onSpotifyIframeApiReady = (api) => {
      window.clearTimeout(timeoutId);
      spotifyIframeApi = api;
      resolve(api);
    };

    if (!document.querySelector('script[src="https://open.spotify.com/embed/iframe-api/v1"]')) {
      const script = document.createElement("script");
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      script.nonce = document.querySelector<HTMLScriptElement>("script[nonce]")?.nonce ?? "";
      script.onerror = () => {
        window.clearTimeout(timeoutId);
        reject(new Error("Spotify player script failed to load"));
      };
      document.body.appendChild(script);
    }
  });

  return spotifyIframeApiPromise;
}

function RollingText({ text, className }: { text: string; className: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const textElement = textRef.current;
    if (!container || !textElement) return;

    const measure = () => {
      setOverflowing(textElement.scrollWidth > container.clientWidth + 1);
    };
    const frame = window.requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(textElement);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [text]);

  const style = {
    "--spotify-marquee-duration": `${Math.max(8, text.length * 0.32)}s`,
  } as CSSProperties;

  return (
    <div
      ref={containerRef}
      title={text}
      className={`group overflow-hidden whitespace-nowrap ${className}`}
    >
      <div className={overflowing ? "spotify-marquee-track" : ""} style={style}>
        <span ref={textRef} className={overflowing ? "pr-6" : ""}>
          {text}
        </span>
        {overflowing && (
          <span aria-hidden="true" className="pr-6 motion-reduce:hidden">
            {text}
          </span>
        )}
      </div>
    </div>
  );
}

export function SpotifyNowPlaying() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerFailed, setPlayerFailed] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const embedTargetRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);
  const activeTrackIdRef = useRef<string | null>(null);
  const playerEndedRef = useRef(false);
  const trackId = track?.id;
  const previewPlaying = Boolean(trackId && playingTrackId === trackId);

  useEffect(() => {
    let active = true;
    let timeoutId: number | undefined;
    let cacheFrameId: number | undefined;
    let requestInFlight = false;
    let requestController: AbortController | null = null;

    const cachedTrack = readCachedTrack();
    if (cachedTrack) {
      cacheFrameId = window.requestAnimationFrame(() => {
        if (!active) return;
        setTrack(cachedTrack);
        setLoading(false);
      });
    }

    function scheduleNextPoll(delay: number) {
      if (!active) return;
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => void loadTrack(), delay);
    }

    async function loadTrack() {
      if (!active || requestInFlight) return;
      if (document.visibilityState === "hidden") {
        scheduleNextPoll(IDLE_POLL_INTERVAL_MS);
        return;
      }

      requestInFlight = true;
      requestController = new AbortController();
      let nextPollDelay = IDLE_POLL_INTERVAL_MS;

      try {
        const response = await fetch("/api/spotify/now-playing", {
          signal: AbortSignal.any([
            requestController.signal,
            AbortSignal.timeout(PLAYER_LOAD_TIMEOUT_MS),
          ]),
        });
        if (!response.ok) {
          const retryAfterSeconds = Number(response.headers.get("retry-after"));
          if (
            response.status === 429 &&
            Number.isFinite(retryAfterSeconds) &&
            retryAfterSeconds > 0
          ) {
            nextPollDelay = Math.max(
              IDLE_POLL_INTERVAL_MS,
              retryAfterSeconds * 1000,
            );
          }
          throw new Error("Spotify unavailable");
        }

        const data = (await response.json()) as SpotifyNowPlayingResponse;
        if (!active) return;

        if (data.track) {
          setTrack(data.track);
          cacheTrack(data.track);
          nextPollDelay =
            data.track.status === "playing"
              ? ACTIVE_POLL_INTERVAL_MS
              : IDLE_POLL_INTERVAL_MS;
        } else {
          setTrack((currentTrack) => {
            if (!currentTrack) return null;
            const recentTrack = asRecentlyPlayed(currentTrack);
            cacheTrack(recentTrack);
            return recentTrack;
          });
        }
      } catch {
        // Keep the last successful track during temporary Spotify failures.
      } finally {
        requestInFlight = false;
        if (active) {
          setLoading(false);
          scheduleNextPoll(nextPollDelay);
        }
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") return;
      window.clearTimeout(timeoutId);
      void loadTrack();
    }

    void loadTrack();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      requestController?.abort();
      window.clearTimeout(timeoutId);
      if (cacheFrameId !== undefined) {
        window.cancelAnimationFrame(cacheFrameId);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!trackId || !embedTargetRef.current) return;

    activeTrackIdRef.current = trackId;
    const uri = `spotify:track:${trackId}`;
    const existingController = controllerRef.current;
    if (existingController) {
      existingController.loadEntity(uri);
      playerEndedRef.current = false;
      return;
    }

    let cancelled = false;
    const target = embedTargetRef.current;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) setPlayerFailed(true);
    }, PLAYER_LOAD_TIMEOUT_MS);

    void loadSpotifyIframeApi().then((api) => {
      if (cancelled) return;
      api.createController(
        target,
        { uri, width: "100%", height: "152" },
        (controller) => {
          if (cancelled) {
            controller.destroy();
            return;
          }

          controllerRef.current = controller;
          controller.addListener("ready", () => {
            if (controllerRef.current !== controller) return;
            window.clearTimeout(timeoutId);
            setPlayerFailed(false);
            setPlayerReady(true);
          });
          controller.addListener("error", () => {
            if (controllerRef.current === controller) setPlayerFailed(true);
          });
          controller.addListener("playback_update", ({ data }) => {
            playerEndedRef.current =
              data.duration > 0 && data.position >= data.duration - 1_000;
            setPlayingTrackId(
              data.isPaused ? null : activeTrackIdRef.current,
            );
          });
        },
      );
    }).catch(() => {
      window.clearTimeout(timeoutId);
      if (!cancelled) setPlayerFailed(true);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [trackId]);

  useEffect(() => {
    return () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, []);

  if (loading) {
    return (
      <div
        aria-label="Loading Spotify activity"
        role="status"
        className="px-3"
      >
        <p className="type-label text-gray-400 dark:text-gray-500">
          Now listening
        </p>
        <div className="mt-2 flex items-center gap-2.5">
          <div className="size-9 shrink-0 animate-pulse rounded-lg bg-gray-200 motion-reduce:animate-none dark:bg-gray-800" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="h-3 w-24 animate-pulse rounded bg-gray-200 motion-reduce:animate-none dark:bg-gray-800" />
            <div className="h-2.5 w-16 animate-pulse rounded bg-gray-200 motion-reduce:animate-none dark:bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  if (!track) return null;

  function togglePreview() {
    if (playerFailed) {
      window.open(track!.spotifyUrl, "_blank", "noopener,noreferrer");
      return;
    }
    const controller = controllerRef.current;
    if (!controller) return;

    if (playerEndedRef.current) {
      playerEndedRef.current = false;
      controller.restart();
      return;
    }
    controller.togglePlay();
  }

  return (
    <section aria-label="Spotify activity" className="px-3">
      <p className="type-label text-gray-400 dark:text-gray-500">
        {STATUS_LABEL[track.status]}
      </p>
      <div className="mt-2 flex items-center gap-2.5">
        <button
          type="button"
          onClick={togglePreview}
          disabled={!playerReady && !playerFailed}
          title={playerFailed ? "Preview unavailable. Open in Spotify" : undefined}
          aria-label={playerFailed ? `Open ${track.name} in Spotify` : previewPlaying ? `Pause ${track.name} preview` : `Play ${track.name} preview`}
          aria-pressed={previewPlaying}
          className="group relative size-9 shrink-0 overflow-hidden rounded-lg bg-gray-100 text-white disabled:cursor-wait dark:bg-gray-800"
        >
          {track.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={track.imageUrl}
              alt=""
              width={36}
              height={36}
              className="size-9 object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <span className="flex size-9 items-center justify-center text-gray-500 dark:text-gray-400">
              <MusicNotes aria-hidden="true" size={17} weight="regular" />
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100 group-disabled:opacity-0">
            {previewPlaying ? (
              <Pause aria-hidden="true" size={15} weight="fill" />
            ) : (
              <Play aria-hidden="true" size={15} weight="fill" />
            )}
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <RollingText
            text={track.name}
            className="type-body-compact font-medium text-gray-900 dark:text-gray-50"
          />
          <RollingText
            text={track.artist}
            className="type-caption mt-0.5 text-gray-500 dark:text-gray-400"
          />
        </div>

        <a
          href={track.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${track.name} by ${track.artist} in Spotify`}
          title="Open in Spotify"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-50"
        >
          <ArrowSquareOut aria-hidden="true" size={16} weight="regular" />
        </a>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute size-px overflow-hidden opacity-0"
      >
        <div ref={embedTargetRef} />
      </div>
    </section>
  );
}
