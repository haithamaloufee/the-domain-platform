"use client";

import {
  MediaApprovalStatus,
  MediaType,
  type AdminHomepageContent,
  type AdminMediaListItem,
  type GalleryAdminCollection,
  type UpdateHomepageContentRequest,
} from "@the-domain/types";
import { Card, buttonClasses } from "@the-domain/ui";
import { useEffect, useMemo, useState } from "react";
import { CmsCheckbox, CmsFeedback, CmsField, CmsStatusBadge } from "@/components/cms/cms-controls";
import { getAdminHomepage, updateAdminHomepage } from "@/lib/cms/admin-cms-client";
import { getAdminGallery } from "@/lib/gallery/admin-gallery-client";
import { listAdminMedia } from "@/lib/media/admin-media-client";

const emptyContent: UpdateHomepageContentRequest = {
  isPublished: false,
  heroMediaAssetId: null,
  galleryCollectionId: null,
  isFloatingVideoEnabled: false,
  floatingVideoMediaAssetId: null,
  floatingVideoPosterMediaAssetId: null,
};

export function HomepageEditor() {
  const [fields, setFields] = useState(emptyContent);
  const [saved, setSaved] = useState<AdminHomepageContent | null>(null);
  const [media, setMedia] = useState<AdminMediaListItem[]>([]);
  const [collections, setCollections] = useState<GalleryAdminCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", tone: "success" as "success" | "error" });

  useEffect(() => {
    let active = true;
    Promise.all([
      getAdminHomepage(),
      listAdminMedia({ pageNumber: 1, pageSize: 100, isArchived: false }),
      getAdminGallery(),
    ])
      .then(([content, assets, gallery]) => {
        if (!active) return;
        setSaved(content);
        setFields(content ? toRequest(content) : emptyContent);
        setMedia([...assets.items]);
        setCollections(gallery);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (active) {
          setFeedback({
            message:
              error instanceof Error ? error.message : "Unable to load Homepage presentation.",
            tone: "error",
          });
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const eligible = useMemo(
    () =>
      media.filter(
        (item) => !item.isArchived && item.approvalStatus === MediaApprovalStatus.Approved,
      ),
    [media],
  );
  const images = eligible.filter((item) => item.mediaType === MediaType.Image);
  const videos = eligible.filter((item) => item.mediaType === MediaType.Video);
  const update = <K extends keyof UpdateHomepageContentRequest>(
    key: K,
    value: UpdateHomepageContentRequest[K],
  ) => setFields((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFeedback({ message: "", tone: "success" });
    try {
      const content = await updateAdminHomepage(fields);
      setSaved(content);
      setFields(toRequest(content));
      setFeedback({
        message: "Homepage presentation saved. Static public copy remains code-owned.",
        tone: "success",
      });
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : "Unable to save Homepage presentation.",
        tone: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-ink-muted">Loading Homepage presentation…</p>;
  return (
    <form className="space-y-7" onSubmit={submit}>
      <CmsFeedback message={feedback.message} tone={feedback.tone} />
      <Card className="space-y-5 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[.14em] text-gold">Ownership boundary</p>
            <h2 className="mt-2 font-display text-2xl font-bold">Presentation and publication</h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-muted">
              Hero media, gallery selection, and video controls remain CMS-owned. Public wording,
              fixed links, section order, and section visibility are maintained in Website code.
            </p>
          </div>
          <CmsStatusBadge
            active={fields.isPublished}
            activeLabel="Published"
            inactiveLabel="Draft"
          />
        </div>
        <CmsCheckbox
          checked={fields.isPublished}
          label="Publish Homepage presentation"
          name="homepage-published"
          onChange={(value) => update("isPublished", value)}
        />
      </Card>

      <Card className="grid gap-5 p-5 sm:p-7 lg:grid-cols-2">
        <MediaSelect
          label="Hero media"
          items={eligible}
          value={fields.heroMediaAssetId}
          onChange={(value) => update("heroMediaAssetId", value)}
        />
        <CmsField label="Gallery preview collection" name="homepage-gallery-collection">
          <select
            className="min-h-11 w-full border border-line bg-canvas px-3"
            value={fields.galleryCollectionId ?? ""}
            onChange={(event) => update("galleryCollectionId", event.target.value || null)}
          >
            <option value="">Use the three-album fallback</option>
            {collections
              .filter((item) => item.isPublished && !item.isArchived)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.publicTitle ?? item.name}
                </option>
              ))}
          </select>
        </CmsField>
        <div className="lg:col-span-2">
          <CmsCheckbox
            checked={fields.isFloatingVideoEnabled}
            label="Enable floating video"
            name="homepage-floating-video"
            onChange={(value) => update("isFloatingVideoEnabled", value)}
          />
        </div>
        <MediaSelect
          label="Floating video"
          items={videos}
          value={fields.floatingVideoMediaAssetId}
          onChange={(value) => update("floatingVideoMediaAssetId", value)}
        />
        <MediaSelect
          label="Floating video poster"
          items={images}
          value={fields.floatingVideoPosterMediaAssetId}
          onChange={(value) => update("floatingVideoPosterMediaAssetId", value)}
        />
      </Card>

      <div className="flex justify-end">
        <button className={buttonClasses("primary")} disabled={saving} type="submit">
          {saving ? "Saving…" : "Save presentation"}
        </button>
      </div>
      {saved && (
        <p className="text-xs text-ink-muted">
          Last saved {new Date(saved.updatedAtUtc).toLocaleString()}
        </p>
      )}
    </form>
  );
}

function MediaSelect({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: AdminMediaListItem[];
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <CmsField label={label} name={`homepage-media-${label.toLowerCase().replaceAll(" ", "-")}`}>
      <select
        className="min-h-11 w-full border border-line bg-canvas px-3"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
      >
        <option value="">No media selected</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.originalFileName}
          </option>
        ))}
      </select>
    </CmsField>
  );
}
function toRequest(content: AdminHomepageContent): UpdateHomepageContentRequest {
  return {
    isPublished: content.isPublished,
    heroMediaAssetId: content.builder.heroMediaAssetId,
    galleryCollectionId: content.builder.galleryCollectionId,
    isFloatingVideoEnabled: content.builder.isFloatingVideoEnabled,
    floatingVideoMediaAssetId: content.builder.floatingVideoMediaAssetId,
    floatingVideoPosterMediaAssetId: content.builder.floatingVideoPosterMediaAssetId,
  };
}
