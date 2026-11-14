"use client";
import type { MediaCollection, MediaCollectionItem } from "@the-domain/types";
import { buttonClasses, Card, Input } from "@the-domain/ui";
import { useEffect, useState } from "react";
import {
  collectionAction,
  createMediaCollection,
  deleteMediaCollection,
  listMediaCollectionItems,
  listMediaCollections,
  removeMediaFromCollection,
  renameMediaCollection,
  reorderMediaCollection,
} from "@/lib/media/admin-media-client";

export function MediaCollections({
  activeId,
  onSelect,
}: {
  activeId?: string;
  onSelect: (id?: string) => void;
}) {
  const [collections, setCollections] = useState<MediaCollection[]>([]);
  const [items, setItems] = useState<MediaCollectionItem[]>([]);
  const [name, setName] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [error, setError] = useState("");
  async function load() {
    setCollections(await listMediaCollections(showArchived));
  }
  useEffect(() => {
    let active = true;
    listMediaCollections(showArchived)
      .then((result) => {
        if (active) setCollections(result);
      })
      .catch((reason: unknown) => {
        if (active)
          setError(reason instanceof Error ? reason.message : "Unable to load collections.");
      });
    return () => {
      active = false;
    };
  }, [showArchived]);
  useEffect(() => {
    if (!activeId) return;
    let active = true;
    listMediaCollectionItems(activeId)
      .then((result) => {
        if (active) setItems(result);
      })
      .catch((reason: unknown) => {
        if (active)
          setError(reason instanceof Error ? reason.message : "Unable to load collection.");
      });
    return () => {
      active = false;
    };
  }, [activeId]);
  async function create() {
    if (!name.trim()) return;
    try {
      const item = await createMediaCollection(name.trim());
      setName("");
      await load();
      onSelect(item.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create collection.");
    }
  }
  async function act(item: MediaCollection, action: "rename" | "archive" | "restore" | "delete") {
    try {
      if (action === "rename") {
        const next = window.prompt("Collection name", item.name);
        if (!next) return;
        await renameMediaCollection(item.id, next);
      } else if (action === "delete") {
        if (
          !window.confirm(
            `Delete archived collection “${item.name}”? Media assets will remain in the library.`,
          )
        )
          return;
        await deleteMediaCollection(item.id);
        if (activeId === item.id) onSelect(undefined);
      } else await collectionAction(item.id, action);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update collection.");
    }
  }
  async function move(index: number, direction: -1 | 1) {
    if (!activeId) return;
    const next = [...items];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const [moved] = next.splice(index, 1);
    if (!moved) return;
    next.splice(target, 0, moved);
    setItems(next);
    try {
      setItems(
        await reorderMediaCollection(
          activeId,
          next.map((item) => item.mediaAssetId),
        ),
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to reorder collection.");
    }
  }
  return (
    <section aria-labelledby="collections-title">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">Organization</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink" id="collections-title">
            Collections
          </h2>
        </div>
        <label className="text-sm text-ink-muted">
          <input
            checked={showArchived}
            className="mr-2"
            onChange={(event) => setShowArchived(event.target.checked)}
            type="checkbox"
          />
          Show archived
        </label>
      </div>
      <Card className="mt-5 p-5">
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void create();
          }}
        >
          <Input
            aria-label="New collection name"
            maxLength={120}
            onChange={(event) => setName(event.target.value)}
            placeholder="New collection name"
            value={name}
          />
          <button className={buttonClasses("primary", "shrink-0")} type="submit">
            Create collection
          </button>
        </form>
        {error && (
          <p className="mt-4 text-sm text-error" role="alert">
            {error}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            className={buttonClasses(!activeId ? "primary" : "ghost", "px-3")}
            onClick={() => onSelect(undefined)}
            type="button"
          >
            All media
          </button>
          {collections.map((item) => (
            <div className="flex border border-line" key={item.id}>
              <button
                className={buttonClasses(
                  activeId === item.id ? "primary" : "ghost",
                  "border-0 px-3",
                )}
                onClick={() => onSelect(item.id)}
                type="button"
              >
                {item.name} ({item.itemCount}){item.isArchived ? " · Archived" : ""}
              </button>
              <button
                aria-label={`Actions for ${item.name}`}
                className={buttonClasses("ghost", "border-0 border-l border-line px-3")}
                onClick={() => void act(item, item.isArchived ? "restore" : "rename")}
                type="button"
              >
                {item.isArchived ? "Restore" : "Rename"}
              </button>
              <button
                className={buttonClasses("ghost", "border-0 border-l border-line px-3")}
                onClick={() => void act(item, item.isArchived ? "delete" : "archive")}
                type="button"
              >
                {item.isArchived ? "Delete" : "Archive"}
              </button>
            </div>
          ))}
        </div>
        {activeId && items.length > 0 && (
          <ol className="mt-6 space-y-2 border-t border-line pt-5">
            {items.map((item, index) => (
              <li
                className="flex items-center justify-between gap-3 text-sm"
                key={item.mediaAssetId}
              >
                <span className="truncate text-ink">
                  {index + 1}. {item.media.caption || item.media.originalFileName}
                </span>
                <span className="flex gap-1">
                  <button
                    className={buttonClasses("ghost", "px-2")}
                    disabled={index === 0}
                    onClick={() => void move(index, -1)}
                    type="button"
                  >
                    Up
                  </button>
                  <button
                    className={buttonClasses("ghost", "px-2")}
                    disabled={index === items.length - 1}
                    onClick={() => void move(index, 1)}
                    type="button"
                  >
                    Down
                  </button>
                  <button
                    className={buttonClasses("ghost", "px-2")}
                    onClick={() =>
                      void removeMediaFromCollection(activeId, item.mediaAssetId).then(setItems)
                    }
                    type="button"
                  >
                    Remove
                  </button>
                </span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </section>
  );
}
