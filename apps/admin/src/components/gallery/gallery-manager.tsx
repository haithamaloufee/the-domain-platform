"use client";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GalleryLayoutPreset,
  MediaType,
  type GalleryAdminCollection,
  type GalleryAdminMedia,
  type GalleryLayoutPresetValue,
} from "@the-domain/types";
import { buttonClasses, Card, EmptyState, Input, Select, Textarea } from "@the-domain/ui";
import { galleryLayoutPresets, galleryLayoutPresetValues, galleryUnsaved } from "@the-domain/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getAdminGallery,
  galleryPublication,
  reorderGalleryCollections,
  resetGalleryPresentation,
  saveGalleryPresentation,
} from "@/lib/gallery/admin-gallery-client";
import { reorderMediaCollection } from "@/lib/media/admin-media-client";

type PreviewMode = "desktop" | "tablet" | "mobile";
export function GalleryManager() {
  const [collections, setCollections] = useState<GalleryAdminCollection[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<GalleryAdminCollection | null>(null);
  const [mode, setMode] = useState<PreviewMode>("desktop");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  async function load(select?: string) {
    const result = await getAdminGallery();
    setCollections(result);
    const id =
      select ?? (selectedId || result.find((item) => item.isPublished)?.id || result[0]?.id || "");
    setSelectedId(id);
    setDraft(result.find((item) => item.id === id) ?? null);
  }
  useEffect(() => {
    let active = true;
    getAdminGallery()
      .then((result) => {
        if (!active) return;
        setCollections(result);
        const first = result.find((item) => item.isPublished) ?? result[0];
        setSelectedId(first?.id ?? "");
        setDraft(first ?? null);
      })
      .catch((reason: unknown) => {
        if (active)
          setError(reason instanceof Error ? reason.message : "Unable to load the Gallery.");
      });
    return () => {
      active = false;
    };
  }, []);
  const published = useMemo(
    () =>
      collections
        .filter((item) => item.isPublished && !item.isArchived)
        .sort((a, b) => a.gallerySortOrder - b.gallerySortOrder),
    [collections],
  );
  const unpublished = collections.filter((item) => !item.isPublished && !item.isArchived);
  const archived = collections.filter((item) => item.isArchived);
  async function mutate(action: () => Promise<unknown>, message: string) {
    setPending(true);
    setError("");
    setNotice("");
    try {
      await action();
      await load();
      setNotice(message);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save the Gallery.");
      try {
        await load();
      } catch {}
    } finally {
      setPending(false);
    }
  }
  function choose(item: GalleryAdminCollection) {
    setSelectedId(item.id);
    setDraft(item);
    setNotice("");
    setError("");
  }
  function movePublished(activeId: string, overId: string) {
    const from = published.findIndex((item) => item.id === activeId);
    const to = published.findIndex((item) => item.id === overId);
    if (from < 0 || to < 0 || from === to) return;
    const next = [...published];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    const ids = next.map((item) => item.id);
    setCollections((current) =>
      current.map((item) => ({
        ...item,
        gallerySortOrder: ids.indexOf(item.id) >= 0 ? ids.indexOf(item.id) : item.gallerySortOrder,
      })),
    );
  }
  function dragCollections(event: DragEndEvent) {
    if (event.over) movePublished(String(event.active.id), String(event.over.id));
  }
  const structureDirty = published.some((item, index) => item.gallerySortOrder !== index);
  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(18rem,0.72fr)_minmax(24rem,1fr)_minmax(24rem,1.15fr)]">
      <section aria-labelledby="gallery-structure-title">
        <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">
          Gallery structure
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-ink" id="gallery-structure-title">
          Published collections
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          Publishing controls Gallery visibility only. It does not approve, restore, or change
          media.
        </p>
        {error && (
          <p
            className="mt-4 border-l-2 border-error bg-error/10 p-3 text-sm text-error"
            role="alert"
          >
            {error}
          </p>
        )}
        {notice && (
          <p className="mt-4 border-l-2 border-gold bg-gold/10 p-3 text-sm text-ink" role="status">
            {notice}
          </p>
        )}
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={dragCollections}
          sensors={sensors}
        >
          <SortableContext
            items={published.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <ol className="mt-5 space-y-2">
              {published.map((item, index) => (
                <StructureItem
                  index={index}
                  item={item}
                  key={item.id}
                  onChoose={choose}
                  onMove={(direction) => {
                    const target = published[index + direction];
                    if (target) movePublished(item.id, target.id);
                  }}
                  selected={selectedId === item.id}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
        <button
          className={buttonClasses("primary", "mt-4 w-full")}
          disabled={pending || !structureDirty}
          onClick={() =>
            void mutate(
              () => reorderGalleryCollections(published.map((item) => item.id)),
              "Gallery collection order saved.",
            )
          }
          type="button"
        >
          Save Gallery order
        </button>
        <CollectionBucket
          items={unpublished}
          label="Unpublished eligible collections"
          onAction={(item) =>
            void mutate(
              () => galleryPublication(item.id, "publish"),
              `${item.name} published to the Gallery.`,
            )
          }
          onChoose={choose}
          action="Publish"
        />
        <CollectionBucket items={archived} label="Archived collections" onChoose={choose} />
        <Link className={buttonClasses("ghost", "mt-5 w-full")} href="/dashboard/media">
          Open full Media Library
        </Link>
      </section>
      <CollectionEditor
        collection={draft}
        onChange={setDraft}
        onReset={() =>
          draft &&
          void mutate(() => resetGalleryPresentation(draft.id), "Gallery presentation reset.")
        }
        onSave={() =>
          draft &&
          void mutate(async () => {
            await reorderMediaCollection(
              draft.id,
              draft.media.map((item) => item.id),
            );
            await saveGalleryPresentation(draft.id, {
              title: draft.publicTitle,
              description: draft.publicDescription,
              layoutPreset: draft.layoutPreset,
              featuredMediaAssetId: draft.featuredMediaAssetId,
            });
          }, "Collection presentation saved.")
        }
        onToggle={() =>
          draft &&
          void mutate(
            () => galleryPublication(draft.id, draft.isPublished ? "unpublish" : "publish"),
            draft.isPublished
              ? "Collection hidden from the Gallery."
              : "Collection published to the Gallery.",
          )
        }
        pending={pending}
        server={collections.find((item) => item.id === draft?.id) ?? null}
      />
      <GalleryPreview collection={draft} mode={mode} onMode={setMode} />
    </div>
  );
}

function StructureItem({
  item,
  index,
  selected,
  onChoose,
  onMove,
}: {
  item: GalleryAdminCollection;
  index: number;
  selected: boolean;
  onChoose: (item: GalleryAdminCollection) => void;
  onMove: (direction: -1 | 1) => void;
}) {
  const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform, transition } =
    useSortable({ id: item.id });
  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <Card className={`p-3 ${selected ? "border-gold" : ""}`}>
        <button className="w-full text-left" onClick={() => onChoose(item)} type="button">
          <span className="font-label text-xs uppercase text-ink-muted">Position {index + 1}</span>
          <span className="mt-1 block font-display text-lg font-bold text-ink">
            {item.publicTitle || item.name}
          </span>
        </button>
        <div className="mt-3 flex gap-1">
          <button
            aria-label={`Drag ${item.name}`}
            className={buttonClasses("ghost", "touch-none px-2")}
            ref={setActivatorNodeRef}
            type="button"
            {...attributes}
            {...listeners}
          >
            Drag
          </button>
          <button
            className={buttonClasses("ghost", "px-2")}
            disabled={index === 0}
            onClick={() => onMove(-1)}
            type="button"
          >
            Up
          </button>
          <button
            className={buttonClasses("ghost", "px-2")}
            onClick={() => onMove(1)}
            type="button"
          >
            Down
          </button>
        </div>
      </Card>
    </li>
  );
}
function CollectionBucket({
  items,
  label,
  onChoose,
  onAction,
  action,
}: {
  items: GalleryAdminCollection[];
  label: string;
  onChoose: (item: GalleryAdminCollection) => void;
  onAction?: (item: GalleryAdminCollection) => void;
  action?: string;
}) {
  return (
    <div className="mt-7">
      <h3 className="font-label text-xs uppercase tracking-[0.12em] text-ink-muted">{label}</h3>
      {items.length ? (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li
              className="flex items-center justify-between gap-2 border border-line p-3"
              key={item.id}
            >
              <button
                className="text-left text-sm text-ink"
                onClick={() => onChoose(item)}
                type="button"
              >
                {item.name}
              </button>
              {onAction && (
                <button
                  className={buttonClasses("secondary", "px-2")}
                  onClick={() => onAction(item)}
                  type="button"
                >
                  {action}
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-ink-muted">None.</p>
      )}
    </div>
  );
}

function CollectionEditor({
  collection,
  server,
  pending,
  onChange,
  onSave,
  onReset,
  onToggle,
}: {
  collection: GalleryAdminCollection | null;
  server: GalleryAdminCollection | null;
  pending: boolean;
  onChange: (item: GalleryAdminCollection) => void;
  onSave: () => void;
  onReset: () => void;
  onToggle: () => void;
}) {
  if (!collection)
    return (
      <section>
        <EmptyState
          title="Choose a collection"
          description="Select a collection to edit its public presentation."
        />
      </section>
    );
  const current = collection;
  const dirty = server
    ? galleryUnsaved(current, server) ||
      current.media.some((item, index) => item.id !== server.media[index]?.id)
    : false;
  function move(index: number, direction: -1 | 1) {
    const next = [...current.media];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const [moved] = next.splice(index, 1);
    if (!moved) return;
    next.splice(target, 0, moved);
    onChange({ ...current, media: next });
  }
  return (
    <section aria-labelledby="collection-editor-title">
      <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">Collection editor</p>
      <h2 className="mt-2 font-display text-2xl font-bold text-ink" id="collection-editor-title">
        {collection.name}
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="border border-line px-2 py-1 text-xs text-ink-muted">
          {collection.eligibleMediaCount} of {collection.totalMediaCount} public
        </span>
        <span className="border border-line px-2 py-1 text-xs text-ink-muted">
          {collection.isPublished ? "Published" : "Not published"}
        </span>
        {dirty && (
          <span className="border border-gold px-2 py-1 text-xs text-gold">Unsaved changes</span>
        )}
      </div>
      <Card className="mt-5 space-y-5 p-5">
        <label>
          <span className="text-xs uppercase text-ink-muted">Public display title</span>
          <Input
            className="mt-2"
            maxLength={120}
            onChange={(event) =>
              onChange({ ...collection, publicTitle: event.target.value || null })
            }
            placeholder={collection.name}
            value={collection.publicTitle ?? ""}
          />
        </label>
        <label>
          <span className="text-xs uppercase text-ink-muted">Short description</span>
          <Textarea
            className="mt-2"
            maxLength={500}
            onChange={(event) =>
              onChange({ ...collection, publicDescription: event.target.value || null })
            }
            value={collection.publicDescription ?? ""}
          />
        </label>
        <label>
          <span className="text-xs uppercase text-ink-muted">Gallery layout</span>
          <Select
            className="mt-2"
            onChange={(event) =>
              onChange({
                ...collection,
                layoutPreset: Number(event.target.value) as GalleryLayoutPresetValue,
              })
            }
            value={collection.layoutPreset}
          >
            {galleryLayoutPresetValues.map((value) => (
              <option key={value} value={value}>
                {galleryLayoutPresets[value].label}
              </option>
            ))}
          </Select>
          <span className="mt-2 block text-xs text-ink-muted">
            {galleryLayoutPresets[collection.layoutPreset].description}
          </span>
        </label>
        <label>
          <span className="text-xs uppercase text-ink-muted">Featured media</span>
          <Select
            className="mt-2"
            onChange={(event) =>
              onChange({ ...collection, featuredMediaAssetId: event.target.value || null })
            }
            value={collection.featuredMediaAssetId ?? ""}
          >
            <option value="">Automatic first eligible item</option>
            {collection.media
              .filter((item) => item.isPubliclyEligible)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.caption || item.originalFileName}
                </option>
              ))}
          </Select>
        </label>
      </Card>
      <h3 className="mt-6 font-display text-lg font-bold text-ink">Gallery media order</h3>
      <p className="mt-1 text-xs text-ink-muted">
        This intentionally uses the Collection’s canonical order.
      </p>
      <ol className="mt-3 space-y-2">
        {collection.media.map((item, index) => (
          <li
            className="flex items-center justify-between gap-3 border border-line p-3"
            key={item.id}
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-ink">{item.caption || item.originalFileName}</p>
              <p className={`mt-1 text-xs ${item.isPubliclyEligible ? "text-gold" : "text-error"}`}>
                {item.isPubliclyEligible ? "Visible publicly" : item.exclusionReason}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                className={buttonClasses("ghost", "px-2")}
                disabled={index === 0}
                onClick={() => move(index, -1)}
                type="button"
              >
                Up
              </button>
              <button
                className={buttonClasses("ghost", "px-2")}
                disabled={index === collection.media.length - 1}
                onClick={() => move(index, 1)}
                type="button"
              >
                Down
              </button>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          className={buttonClasses("primary")}
          disabled={pending || !dirty}
          onClick={onSave}
          type="button"
        >
          Save collection
        </button>
        <button
          className={buttonClasses("secondary")}
          disabled={pending}
          onClick={() => server && onChange(server)}
          type="button"
        >
          Cancel
        </button>
        <button
          className={buttonClasses("ghost")}
          disabled={pending}
          onClick={onReset}
          type="button"
        >
          Reset presentation
        </button>
        <button
          className={buttonClasses("ghost")}
          disabled={pending || collection.isArchived}
          onClick={onToggle}
          type="button"
        >
          {collection.isPublished ? "Hide from Gallery" : "Publish to Gallery"}
        </button>
      </div>
    </section>
  );
}

function GalleryPreview({
  collection,
  mode,
  onMode,
}: {
  collection: GalleryAdminCollection | null;
  mode: PreviewMode;
  onMode: (mode: PreviewMode) => void;
}) {
  const widths: Record<PreviewMode, string> = {
    desktop: "max-w-full",
    tablet: "max-w-2xl",
    mobile: "max-w-xs",
  };
  if (!collection) return <section />;
  const eligible = collection.media.filter((item) => item.isPubliclyEligible);
  const featured =
    eligible.find((item) => item.id === collection.featuredMediaAssetId) ?? eligible[0];
  return (
    <section aria-labelledby="gallery-preview-title">
      <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">Live preview</p>
      <h2 className="mt-2 font-display text-2xl font-bold text-ink" id="gallery-preview-title">
        Visitor approximation
      </h2>
      <div aria-label="Preview size" className="mt-4 flex gap-2" role="group">
        {(["desktop", "tablet", "mobile"] as const).map((value) => (
          <button
            aria-pressed={mode === value}
            className={buttonClasses(mode === value ? "primary" : "secondary", "px-3")}
            key={value}
            onClick={() => onMode(value)}
            type="button"
          >
            {value}
          </button>
        ))}
      </div>
      <Card
        className={`mx-auto mt-5 overflow-hidden p-4 transition-[max-width] motion-reduce:transition-none ${widths[mode]}`}
      >
        <p className="text-xs uppercase text-gold">Gallery collection</p>
        <h3 className="mt-2 font-display text-3xl font-bold text-ink">
          {collection.publicTitle || collection.name}
        </h3>
        {collection.publicDescription && (
          <p className="mt-3 text-sm text-ink-muted">{collection.publicDescription}</p>
        )}
        {eligible.length ? (
          <div className={`mt-5 gap-2 ${galleryLayoutPresets[collection.layoutPreset].gridClass}`}>
            {featured && collection.layoutPreset === GalleryLayoutPreset.FeatureFirst && (
              <PreviewMedia className="col-span-2 aspect-video" media={featured} />
            )}
            {eligible
              .filter(
                (item) =>
                  item.id !==
                  (collection.layoutPreset === GalleryLayoutPreset.FeatureFirst
                    ? featured?.id
                    : ""),
              )
              .map((item) => (
                <PreviewMedia className="mb-2 aspect-[4/5]" key={item.id} media={item} />
              ))}
          </div>
        ) : (
          <div className="mt-5 border border-dashed border-line p-8 text-center text-sm text-ink-muted">
            No publicly eligible media in this collection.
          </div>
        )}
      </Card>
    </section>
  );
}
function PreviewMedia({ media, className }: { media: GalleryAdminMedia; className: string }) {
  const source = media.mediaType === MediaType.Image ? media.url : media.posterUrl;
  return (
    <div className={`relative overflow-hidden border border-line bg-surface ${className}`}>
      {source ? (
        <Image alt={media.altText ?? ""} className="object-cover" fill sizes="30vw" src={source} />
      ) : (
        <div className="grid h-full place-items-center p-3 text-center text-xs text-ink-muted">
          Video poster unavailable
        </div>
      )}
      {media.mediaType === MediaType.Video && (
        <span className="absolute left-2 top-2 bg-canvas/80 px-2 py-1 text-xs text-ink">Video</span>
      )}
    </div>
  );
}
