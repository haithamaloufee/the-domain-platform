"use client";

import {
  EventMediaUsage,
  MediaApprovalStatus,
  type AdminEventListItem,
  type EventMediaUsageValue,
  type MediaApprovalStatusValue,
} from "@the-domain/types";
import { buttonClasses, Card, Input, Select, Textarea } from "@the-domain/ui";
import { useEffect, useRef, useState } from "react";
import { listAdminEvents } from "@/lib/events/admin-events-client";
import { uploadAdminMedia } from "@/lib/media/admin-media-client";
import { eventMediaUsageLabels } from "./media-labels";

type UploadStatus = "waiting" | "uploading" | "success" | "failed";
interface QueueItem {
  id: string;
  file: File;
  status: UploadStatus;
  error?: string;
}

const allowedFiles: Record<string, { label: string; maximumBytes: number }> = {
  "image/jpeg": { label: "JPEG", maximumBytes: 15 * 1024 * 1024 },
  "image/png": { label: "PNG", maximumBytes: 15 * 1024 * 1024 },
  "image/webp": { label: "WebP", maximumBytes: 15 * 1024 * 1024 },
  "video/mp4": { label: "MP4", maximumBytes: 100 * 1024 * 1024 },
  "video/webm": { label: "WebM", maximumBytes: 100 * 1024 * 1024 },
};

export function MediaUploadQueue({
  eventId,
  onCompleted,
}: {
  eventId?: string;
  onCompleted: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [events, setEvents] = useState<AdminEventListItem[]>([]);
  const [category, setCategory] = useState("");
  const [caption, setCaption] = useState("");
  const [altText, setAltText] = useState("");
  const [approvalStatus, setApprovalStatus] = useState<MediaApprovalStatusValue>(
    MediaApprovalStatus.Draft,
  );
  const [selectedEventId, setSelectedEventId] = useState(eventId ?? "");
  const [usage, setUsage] = useState<EventMediaUsageValue>(EventMediaUsage.Gallery);
  const [sortOrder, setSortOrder] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    let isActive = true;
    listAdminEvents()
      .then((items) => {
        if (isActive) setEvents(items);
      })
      .catch(() => undefined);
    return () => {
      isActive = false;
    };
  }, []);

  function addFiles(files: FileList | File[]) {
    const additions = Array.from(files).map((file) => {
      const validationError = validateFile(file);
      return {
        id: crypto.randomUUID(),
        file,
        status: validationError ? "failed" : "waiting",
        error: validationError,
      } satisfies QueueItem;
    });
    setQueue((current) => [...current, ...additions]);
  }

  async function uploadWaiting() {
    const waiting = queue.filter(isUploadCandidate);
    if (waiting.length === 0) return;
    setIsUploading(true);
    let completed = false;
    for (const item of waiting) {
      updateStatus(item.id, "uploading");
      try {
        await uploadAdminMedia(item.file, {
          category,
          caption,
          altText,
          approvalStatus,
          eventId: selectedEventId || undefined,
          usage: selectedEventId ? usage : undefined,
          sortOrder: selectedEventId ? sortOrder : undefined,
          isFeatured: selectedEventId ? isFeatured : undefined,
        });
        updateStatus(item.id, "success");
        completed = true;
      } catch (error) {
        updateStatus(item.id, "failed", error instanceof Error ? error.message : "Upload failed.");
      }
    }
    setIsUploading(false);
    if (completed) onCompleted();
  }

  function updateStatus(id: string, status: UploadStatus, error?: string) {
    setQueue((current) =>
      current.map((item) => (item.id === id ? { ...item, status, error } : item)),
    );
  }

  return (
    <Card className="p-5 sm:p-7">
      <div
        aria-label="Choose media files"
        className="grid min-h-44 cursor-pointer place-items-center border border-dashed border-line bg-surface p-6 text-center transition hover:border-gold focus-visible:border-gold focus-visible:outline-2 focus-visible:outline-offset-4"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addFiles(event.dataTransfer.files);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div>
          <p className="font-display text-xl font-bold text-ink">Drop files here</p>
          <p className="mt-2 text-sm text-ink-muted">
            or choose JPEG, PNG, WebP, MP4, or WebM files
          </p>
          <p className="mt-2 text-xs text-ink-muted">15 MB per image / 100 MB per video</p>
        </div>
        <input
          ref={inputRef}
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
          className="sr-only"
          multiple
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            event.target.value = "";
          }}
          type="file"
        />
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-3">
        <Field label="Category">
          <Input
            maxLength={100}
            onChange={(event) => setCategory(event.target.value)}
            value={category}
          />
        </Field>
        <Field label="Approval status">
          <Select
            onChange={(event) =>
              setApprovalStatus(Number(event.target.value) as MediaApprovalStatusValue)
            }
            value={approvalStatus}
          >
            <option value={MediaApprovalStatus.Draft}>Draft</option>
            <option value={MediaApprovalStatus.Approved}>Approved</option>
            <option value={MediaApprovalStatus.Hidden}>Hidden</option>
          </Select>
        </Field>
        <Field label="Assign to event">
          <Select
            onChange={(event) => setSelectedEventId(event.target.value)}
            value={selectedEventId}
          >
            <option value="">No event assignment</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field className="lg:col-span-2" label="Caption">
          <Textarea
            className="min-h-24"
            maxLength={1_000}
            onChange={(event) => setCaption(event.target.value)}
            value={caption}
          />
        </Field>
        <Field label="Alt text">
          <Textarea
            className="min-h-24"
            maxLength={500}
            onChange={(event) => setAltText(event.target.value)}
            value={altText}
          />
        </Field>
        {selectedEventId && (
          <>
            <Field label="Usage">
              <Select
                onChange={(event) => setUsage(Number(event.target.value) as EventMediaUsageValue)}
                value={usage}
              >
                {Object.entries(eventMediaUsageLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Sort order">
              <Input
                min={0}
                onChange={(event) => setSortOrder(Number(event.target.value))}
                type="number"
                value={sortOrder}
              />
            </Field>
            <label className="flex min-h-12 items-center gap-3 self-end border border-line bg-surface px-4 py-3 text-sm text-ink">
              <input
                checked={isFeatured}
                className="size-4 accent-[var(--td-color-gold)]"
                onChange={(event) => setIsFeatured(event.target.checked)}
                type="checkbox"
              />
              Featured in this usage
            </label>
          </>
        )}
      </div>

      {queue.length > 0 && (
        <div className="mt-7">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-display text-lg font-bold text-ink">Upload queue</h3>
            <button
              className={buttonClasses("ghost", "px-3")}
              disabled={isUploading || !queue.some((item) => item.status === "success")}
              onClick={() =>
                setQueue((current) => current.filter((item) => item.status !== "success"))
              }
              type="button"
            >
              Clear completed
            </button>
          </div>
          <ul aria-live="polite" className="mt-3 divide-y divide-line border border-line">
            {queue.map((item) => (
              <li
                className="flex flex-col justify-between gap-2 px-4 py-3 sm:flex-row sm:items-center"
                key={item.id}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink">{item.file.name}</p>
                  <p className="mt-1 text-xs text-ink-muted">{formatBytes(item.file.size)}</p>
                  {item.error && (
                    <p className="mt-1 text-xs text-error" role="alert">
                      {item.error}
                    </p>
                  )}
                </div>
                <span
                  className={`font-label text-[0.6875rem] uppercase tracking-[0.12em] ${item.status === "success" ? "text-gold" : item.status === "failed" ? "text-error" : "text-ink-muted"}`}
                >
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-7 flex flex-wrap justify-end gap-3">
        <button
          className={buttonClasses("secondary")}
          disabled={isUploading || !queue.some(isUploadCandidate)}
          onClick={() => void uploadWaiting()}
          type="button"
        >
          {isUploading ? "Uploading..." : "Upload waiting files"}
        </button>
      </div>
    </Card>
  );
}

function Field({
  children,
  className = "",
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <label className={className}>
      <span className="font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}
function validateFile(file: File): string | undefined {
  const allowed = allowedFiles[file.type];
  if (!allowed) return "Unsupported file type.";
  if (file.size <= 0) return "File is empty.";
  if (file.size > allowed.maximumBytes)
    return `File exceeds the ${allowed.maximumBytes / 1024 / 1024} MB ${allowed.label} limit.`;
  return undefined;
}
function isUploadCandidate(item: QueueItem): boolean {
  return (item.status === "waiting" || item.status === "failed") && !validateFile(item.file);
}
function formatBytes(value: number): string {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}
