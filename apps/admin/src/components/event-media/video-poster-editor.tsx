"use client";

import {
  MediaApprovalStatus,
  MediaType,
  VideoPosterMode,
  type AdminEventMediaItem,
  type AdminMediaListItem,
  type VideoPosterModeValue,
} from "@the-domain/types";
import { buttonClasses, Card, Input, Select } from "@the-domain/ui";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { MediaPreview } from "@/components/media/media-preview";
import {
  listAdminMedia,
  updateEventVideoPoster,
  uploadAdminMedia,
} from "@/lib/media/admin-media-client";

export function VideoPosterEditor({
  eventId,
  items,
  onSaved,
}: {
  eventId: string;
  items: AdminEventMediaItem[];
  onSaved: () => void;
}) {
  const videos = useMemo(
    () => items.filter((item) => item.media.mediaType === MediaType.Video),
    [items],
  );
  const [selectedId, setSelectedId] = useState(videos[0]?.id ?? "");
  const selected = videos.find((item) => item.id === selectedId) ?? videos[0] ?? null;
  const [mode, setMode] = useState<VideoPosterModeValue>(
    videos[0]?.videoPoster.mode ?? VideoPosterMode.Automatic,
  );
  const [timestamp, setTimestamp] = useState(videos[0]?.videoPoster.timestampSeconds ?? 0);
  const [customId, setCustomId] = useState(videos[0]?.videoPoster.customPosterMediaAssetId ?? "");
  const [images, setImages] = useState<AdminMediaListItem[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (mode !== VideoPosterMode.CustomImage) return;
    let active = true;
    listAdminMedia({ mediaType: "Image", approvalStatus: "Approved", pageNumber: 1, pageSize: 50 })
      .then((page) => {
        if (active) setImages([...page.items]);
      })
      .catch((reason: unknown) => {
        if (active)
          setError(reason instanceof Error ? reason.message : "Unable to load poster images.");
      });
    return () => {
      active = false;
    };
  }, [mode]);

  if (!videos.length) return null;

  const custom = images.find((item) => item.id === customId) ?? null;
  const posterUrl =
    mode === VideoPosterMode.CustomImage
      ? (custom?.url ?? selected?.videoPoster.posterUrl ?? null)
      : mode === VideoPosterMode.Automatic
        ? (selected?.media.thumbnailUrl ?? null)
        : null;
  const duration = selected?.media.durationSeconds ?? 0;

  async function save(nextMode = mode) {
    if (!selected) return;
    setPending(true);
    setError("");
    setNotice("");
    try {
      await updateEventVideoPoster(eventId, selected.id, {
        mode: nextMode,
        timestampSeconds: nextMode === VideoPosterMode.Timestamp ? timestamp : null,
        customPosterMediaAssetId:
          nextMode === VideoPosterMode.CustomImage ? customId || null : null,
      });
      setNotice(
        nextMode === VideoPosterMode.Automatic
          ? "Automatic poster restored."
          : "Video poster saved for this event.",
      );
      onSaved();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save the video poster.");
    } finally {
      setPending(false);
    }
  }

  async function upload(file: File | undefined) {
    if (!file) return;
    setPending(true);
    setError("");
    try {
      const uploaded = await uploadAdminMedia(file, {
        approvalStatus: MediaApprovalStatus.Approved,
      });
      if (uploaded.mediaType !== MediaType.Image)
        throw new Error("Custom posters must be image files.");
      setImages((current) => [uploaded, ...current.filter((item) => item.id !== uploaded.id)]);
      setCustomId(uploaded.id);
      setNotice("Poster image uploaded. Save the poster choice when the preview is ready.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to upload the poster image.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section aria-labelledby="video-poster-title">
      <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">Video presentation</p>
      <h2 className="mt-2 font-display text-3xl font-bold text-ink" id="video-poster-title">
        Playback posters
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted">
        Choose what visitors see before each assigned event video starts. The choice applies only to
        this event.
      </p>
      <Card className="mt-6 p-5 sm:p-7">
        <div className="grid gap-5 lg:grid-cols-3">
          <label>
            <span className="font-label text-xs uppercase tracking-[0.12em] text-ink-muted">
              Video
            </span>
            <Select
              className="mt-2"
              onChange={(event) => {
                const next = videos.find((item) => item.id === event.target.value);
                setSelectedId(event.target.value);
                setMode(next?.videoPoster.mode ?? VideoPosterMode.Automatic);
                setTimestamp(next?.videoPoster.timestampSeconds ?? 0);
                setCustomId(next?.videoPoster.customPosterMediaAssetId ?? "");
                setError("");
                setNotice("");
              }}
              value={selected?.id}
            >
              {videos.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.media.caption || item.media.originalFileName}
                </option>
              ))}
            </Select>
          </label>
          <label>
            <span className="font-label text-xs uppercase tracking-[0.12em] text-ink-muted">
              Poster source
            </span>
            <Select
              className="mt-2"
              onChange={(event) => setMode(Number(event.target.value) as VideoPosterModeValue)}
              value={mode}
            >
              <option value={VideoPosterMode.Automatic}>Automatic poster</option>
              <option value={VideoPosterMode.Timestamp}>Frame from video</option>
              <option value={VideoPosterMode.CustomImage}>Custom image</option>
            </Select>
          </label>
          {mode === VideoPosterMode.Timestamp && (
            <label>
              <span className="font-label text-xs uppercase tracking-[0.12em] text-ink-muted">
                Timestamp (seconds)
              </span>
              <Input
                className="mt-2"
                max={duration || undefined}
                min={0}
                onChange={(event) => setTimestamp(Number(event.target.value))}
                step="0.1"
                type="number"
                value={timestamp}
              />
            </label>
          )}
          {mode === VideoPosterMode.CustomImage && (
            <label>
              <span className="font-label text-xs uppercase tracking-[0.12em] text-ink-muted">
                Approved image
              </span>
              <Select
                className="mt-2"
                onChange={(event) => setCustomId(event.target.value)}
                value={customId}
              >
                <option value="">Choose an image</option>
                {images.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.caption || item.originalFileName}
                  </option>
                ))}
              </Select>
            </label>
          )}
        </div>
        {mode === VideoPosterMode.CustomImage && (
          <label className="mt-5 block border border-dashed border-line p-4 text-sm text-ink-muted">
            Upload a new approved poster image
            <input
              accept="image/jpeg,image/png,image/webp"
              className="mt-3 block w-full text-sm"
              disabled={pending}
              onChange={(event) => void upload(event.target.files?.[0])}
              type="file"
            />
          </label>
        )}
        {error && (
          <p
            className="mt-5 border-l-2 border-error bg-error/10 px-4 py-3 text-sm text-error"
            role="alert"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            className="mt-5 border-l-2 border-gold bg-gold/10 px-4 py-3 text-sm text-ink"
            role="status"
          >
            {notice}
          </p>
        )}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <PosterPreview
            item={selected!}
            mode={mode}
            posterUrl={posterUrl}
            timestamp={timestamp}
            label="Event gallery"
            className="aspect-[4/5]"
          />
          <PosterPreview
            item={selected!}
            mode={mode}
            posterUrl={posterUrl}
            timestamp={timestamp}
            label="Video card"
            className="aspect-video"
          />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className={buttonClasses("primary")}
            disabled={pending || (mode === VideoPosterMode.CustomImage && !customId)}
            onClick={() => void save()}
            type="button"
          >
            {pending ? "Saving…" : "Save poster"}
          </button>
          <button
            className={buttonClasses("secondary")}
            disabled={pending}
            onClick={() => {
              setMode(VideoPosterMode.Automatic);
              void save(VideoPosterMode.Automatic);
            }}
            type="button"
          >
            Reset to automatic
          </button>
        </div>
      </Card>
    </section>
  );
}

function PosterPreview({
  item,
  mode,
  posterUrl,
  timestamp,
  label,
  className,
}: {
  item: AdminEventMediaItem;
  mode: VideoPosterModeValue;
  posterUrl: string | null;
  timestamp: number;
  label: string;
  className: string;
}) {
  return (
    <div>
      <p className="mb-2 font-label text-xs uppercase tracking-[0.12em] text-ink-muted">{label}</p>
      <div className={`relative overflow-hidden border border-line bg-surface ${className}`}>
        {mode === VideoPosterMode.Timestamp ? (
          <video
            className="h-full w-full object-cover"
            key={`${item.id}-${timestamp}`}
            muted
            playsInline
            preload="metadata"
            src={`${item.media.url}#t=${Math.max(0, timestamp)}`}
            onLoadedMetadata={(event) => {
              event.currentTarget.currentTime = Math.max(0, timestamp);
            }}
          />
        ) : posterUrl ? (
          <Image
            alt=""
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            src={posterUrl}
          />
        ) : (
          <MediaPreview className="h-full border-0" item={item.media} />
        )}
        <span className="absolute bottom-3 left-3 bg-canvas/80 px-2 py-1 font-label text-[0.65rem] uppercase tracking-[0.12em] text-ink">
          Before playback
        </span>
      </div>
    </div>
  );
}
