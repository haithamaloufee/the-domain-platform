"use client";

import {
  MediaApprovalStatus,
  MediaType,
  type AdminMediaDetails,
  type MediaCollection,
  type MediaUsage,
} from "@the-domain/types";
import { buttonClasses, Card, EmptyState, Input, MediaFrame, Textarea } from "@the-domain/ui";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  approveAdminMedia,
  archiveAdminMedia,
  restoreAdminMedia,
  getMediaUsage,
  permanentlyDeleteAdminMedia,
  listMediaCollections,
  createMediaCollection,
  addMediaToCollection,
  getAdminMedia,
  hideAdminMedia,
  updateAdminMediaMetadata,
} from "@/lib/media/admin-media-client";
import { MediaApprovalBadge, mediaTypeLabels, orientationLabels } from "./media-labels";
import { MediaAssignmentForm } from "./media-assignment-form";

export function MediaDetails({ eventId, mediaId }: { eventId?: string; mediaId: string }) {
  const [media, setMedia] = useState<AdminMediaDetails | null>(null);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [usage, setUsage] = useState<MediaUsage | null>(null);
  const [collections, setCollections] = useState<MediaCollection[]>([]);
  const router = useRouter();

  useEffect(() => {
    let isActive = true;
    getAdminMedia(mediaId)
      .then((item) => {
        if (isActive) setMedia(item);
      })
      .catch((loadError: unknown) => {
        if (isActive)
          setError(loadError instanceof Error ? loadError.message : "Unable to load media.");
      });
    return () => {
      isActive = false;
    };
  }, [mediaId]);
  useEffect(() => {
    let active = true;
    Promise.all([getMediaUsage(mediaId), listMediaCollections(false)])
      .then(([nextUsage, nextCollections]) => {
        if (active) {
          setUsage(nextUsage);
          setCollections(nextCollections);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [mediaId]);

  async function run(action: "approve" | "hide" | "archive" | "restore") {
    const message =
      action === "archive"
        ? "Archive this asset? Existing event links remain recorded, while public delivery will stop until it is restored."
        : `${action === "approve" ? "Approve" : action === "restore" ? "Restore" : "Hide"} this media asset?`;
    if (!window.confirm(message)) return;
    setIsPending(true);
    setError("");
    try {
      const updated =
        action === "approve"
          ? await approveAdminMedia(mediaId)
          : action === "hide"
            ? await hideAdminMedia(mediaId)
            : action === "archive"
              ? await archiveAdminMedia(mediaId)
              : await restoreAdminMedia(mediaId);
      setMedia(updated);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to update media.");
    } finally {
      setIsPending(false);
    }
  }

  if (error && !media)
    return (
      <EmptyState
        title="Media could not be loaded"
        description={error}
        action={
          <Link className={buttonClasses("secondary")} href="/dashboard/media">
            Back to media
          </Link>
        }
      />
    );
  if (!media)
    return (
      <div className="h-[32rem] animate-pulse border border-line bg-surface-raised" role="status">
        <span className="sr-only">Loading media details</span>
      </div>
    );

  return (
    <article>
      {error && (
        <p
          className="mb-5 border-l-2 border-error bg-error/10 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {error}
        </p>
      )}
      <header className="flex flex-col justify-between gap-6 border-b border-line pb-8 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap gap-2">
            <MediaApprovalBadge status={media.approvalStatus} />
          </div>
          <p className="mt-5 font-label text-xs uppercase tracking-[0.14em] text-gold">
            {mediaTypeLabels[media.mediaType]} / {orientationLabels[media.orientation]}
          </p>
          <h1 className="mt-3 break-words font-display text-3xl font-bold text-ink sm:text-5xl">
            {media.originalFileName}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            className={buttonClasses("ghost")}
            href={
              eventId
                ? `/dashboard/media?eventId=${encodeURIComponent(eventId)}`
                : "/dashboard/media"
            }
          >
            Back to library
          </Link>
          {media.approvalStatus !== MediaApprovalStatus.Approved && (
            <button
              className={buttonClasses("primary")}
              disabled={isPending}
              onClick={() => void run("approve")}
              type="button"
            >
              Approve
            </button>
          )}
          {media.approvalStatus !== MediaApprovalStatus.Hidden && (
            <button
              className={buttonClasses("secondary")}
              disabled={isPending}
              onClick={() => void run("hide")}
              type="button"
            >
              Hide
            </button>
          )}
          <button
            className={buttonClasses("ghost")}
            disabled={isPending}
            onClick={() => void run(media.isArchived ? "restore" : "archive")}
            type="button"
          >
            {media.isArchived ? "Restore from archive" : "Archive"}
          </button>
        </div>
      </header>

      <div className="grid gap-6 pt-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
        <div className="space-y-6">
          <Card className="p-4 sm:p-6">
            <MediaFrame className="aspect-video">
              {media.mediaType === MediaType.Image ? (
                <Image
                  alt={media.altText ?? ""}
                  className="object-contain"
                  fill
                  sizes="(max-width: 1280px) 100vw, 60vw"
                  src={media.url}
                />
              ) : (
                <video
                  controls
                  playsInline
                  poster={media.thumbnailUrl ?? undefined}
                  preload="metadata"
                  src={media.url}
                >
                  Your browser does not support video preview.
                </video>
              )}
            </MediaFrame>
          </Card>
          <Card className="p-6 sm:p-8">
            <h2 className="border-b border-line pb-4 font-display text-2xl font-bold text-ink">
              File information
            </h2>
            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
              <Detail label="Stored filename" value={media.fileName} />
              <Detail label="Original filename" value={media.originalFileName} />
              <Detail
                label="Dimensions"
                value={
                  media.width && media.height ? `${media.width} x ${media.height}` : "Not available"
                }
              />
              <Detail
                label="Duration"
                value={
                  media.durationSeconds !== null
                    ? `${media.durationSeconds.toFixed(1)} seconds`
                    : "Not applicable"
                }
              />
              <Detail label="Created" value={formatDate(media.createdAtUtc)} />
              <Detail label="Updated" value={formatDate(media.updatedAtUtc)} />
            </dl>
            <a
              className={buttonClasses("secondary", "mt-6")}
              href={media.url}
              rel="noreferrer"
              target="_blank"
            >
              Open original asset
            </a>
          </Card>
        </div>
        <aside className="space-y-6" aria-label="Media administration">
          <Card className="p-6">
            <h2 className="font-display text-xl font-bold text-ink">Metadata</h2>
            <MetadataForm media={media} onSaved={setMedia} />
          </Card>
          <Card className="p-6">
            <h2 className="font-display text-xl font-bold text-ink">Collections</h2>
            <CollectionAssignment
              mediaId={media.id}
              collections={collections}
              onCreated={(item) => setCollections((current) => [...current, item])}
            />
          </Card>
          <Card className="p-6">
            <h2 className="font-display text-xl font-bold text-ink">Where this media is used</h2>
            {!usage ? (
              <p className="mt-3 text-sm text-ink-muted">Loading usage…</p>
            ) : (
              <>
                <ul className="mt-4 space-y-2 text-sm text-ink-muted">
                  {usage.events.map((item) => (
                    <li key={`${item.eventId}-${item.usage}-${item.isCustomPoster}`}>
                      <Link
                        className="text-ink underline decoration-line"
                        href={`/dashboard/events/${item.eventId}/media`}
                      >
                        {item.eventTitle}
                      </Link>{" "}
                      ·{" "}
                      {item.isCustomPoster
                        ? "Custom video poster"
                        : `Event placement ${item.usage}`}
                    </li>
                  ))}
                  {usage.collections.map((item) => (
                    <li key={item.id}>Collection · {item.name}</li>
                  ))}
                  {usage.events.length === 0 && usage.collections.length === 0 && (
                    <li>Not currently used.</li>
                  )}
                </ul>
                <PermanentDelete
                  media={media}
                  canDelete={usage.canPermanentlyDelete}
                  onDeleted={() => router.push("/dashboard/media")}
                />
              </>
            )}
          </Card>
          <Card className="p-6">
            <h2 className="font-display text-xl font-bold text-ink">Assign to event</h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Connect this asset to an event usage without moving or duplicating the file.
            </p>
            <div className="mt-6">
              <MediaAssignmentForm eventId={eventId} mediaId={media.id} />
            </div>
          </Card>
        </aside>
      </div>
    </article>
  );
}

function CollectionAssignment({
  mediaId,
  collections,
  onCreated,
}: {
  mediaId: string;
  collections: MediaCollection[];
  onCreated: (item: MediaCollection) => void;
}) {
  const [selected, setSelected] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  async function assign() {
    if (!selected) return;
    await addMediaToCollection(selected, mediaId);
    setMessage("Added to collection.");
  }
  async function createAndAssign() {
    if (!name.trim()) return;
    const collection = await createMediaCollection(name.trim());
    onCreated(collection);
    setSelected(collection.id);
    setName("");
    await addMediaToCollection(collection.id, mediaId);
    setMessage("Collection created and media added.");
  }
  return (
    <div className="mt-4 space-y-3">
      <select
        className="min-h-11 w-full border border-line bg-surface px-3 text-ink"
        onChange={(event) => setSelected(event.target.value)}
        value={selected}
      >
        <option value="">Choose collection</option>
        {collections.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      <button className={buttonClasses("secondary")} onClick={() => void assign()} type="button">
        Add to collection
      </button>
      <div className="border-t border-line pt-3">
        <Input
          maxLength={120}
          onChange={(event) => setName(event.target.value)}
          placeholder="Or create a collection"
          value={name}
        />
        <button
          className={buttonClasses("ghost", "mt-2")}
          onClick={() => void createAndAssign()}
          type="button"
        >
          Create and add
        </button>
      </div>
      {message && (
        <p className="text-sm text-gold" role="status">
          {message}
        </p>
      )}
    </div>
  );
}

function PermanentDelete({
  media,
  canDelete,
  onDeleted,
}: {
  media: AdminMediaDetails;
  canDelete: boolean;
  onDeleted: () => void;
}) {
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  if (!media.isArchived)
    return (
      <p className="mt-5 border-t border-line pt-4 text-sm text-ink-muted">
        Archive this asset before permanent deletion becomes available.
      </p>
    );
  return (
    <div className="mt-5 border-t border-error/40 pt-4">
      <h3 className="font-display text-lg font-bold text-error">Permanent deletion</h3>
      <p className="mt-2 text-sm leading-6 text-ink-muted">
        This removes the Cloudinary asset and database record. It cannot be undone.
      </p>
      {!canDelete ? (
        <p className="mt-3 text-sm text-error">
          Remove all event and poster usages before deleting.
        </p>
      ) : (
        <>
          <label className="mt-4 block text-xs text-ink-muted">
            Type <strong className="text-ink">{media.originalFileName}</strong>
            <Input
              className="mt-2"
              onChange={(event) => setConfirmation(event.target.value)}
              value={confirmation}
            />
          </label>
          <button
            className={buttonClasses("secondary", "mt-3 border-error text-error")}
            disabled={confirmation !== media.originalFileName}
            onClick={() =>
              void permanentlyDeleteAdminMedia(media.id, confirmation)
                .then(onDeleted)
                .catch((reason: unknown) =>
                  setError(
                    reason instanceof Error
                      ? reason.message
                      : "Unable to permanently delete media.",
                  ),
                )
            }
            type="button"
          >
            Permanently delete asset
          </button>
          {error && (
            <p className="mt-2 text-sm text-error" role="alert">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function MetadataForm({
  media,
  onSaved,
}: {
  media: AdminMediaDetails;
  onSaved: (media: AdminMediaDetails) => void;
}) {
  const [category, setCategory] = useState(media.category ?? "");
  const [caption, setCaption] = useState(media.caption ?? "");
  const [altText, setAltText] = useState(media.altText ?? "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function save() {
    setPending(true);
    setError("");
    try {
      onSaved(
        await updateAdminMediaMetadata(media.id, {
          category: category.trim() || null,
          caption: caption.trim() || null,
          altText: altText.trim() || null,
        }),
      );
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save metadata.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="mt-6 space-y-5">
      <Field label="Category">
        <Input
          maxLength={100}
          onChange={(event) => setCategory(event.target.value)}
          value={category}
        />
      </Field>
      <Field label="Caption">
        <Textarea
          maxLength={1_000}
          onChange={(event) => setCaption(event.target.value)}
          value={caption}
        />
      </Field>
      <Field label="Alt text">
        <Textarea
          maxLength={500}
          onChange={(event) => setAltText(event.target.value)}
          value={altText}
        />
      </Field>
      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
      <button
        className={buttonClasses("secondary")}
        disabled={pending}
        onClick={() => void save()}
        type="button"
      >
        {pending ? "Saving..." : "Save metadata"}
      </button>
    </div>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label>
      <span className="font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </dt>
      <dd className="mt-2 break-words text-sm text-ink">{value}</dd>
    </div>
  );
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}
