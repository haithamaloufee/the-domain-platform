"use client";

import {
  MediaApprovalStatus,
  MediaType,
  type AdminMediaListItem,
  type BrandingSettings,
} from "@the-domain/types";
import { Card, Input, buttonClasses } from "@the-domain/ui";
import { brandingChanged, brandingRequest } from "@the-domain/utils";
import { useEffect, useMemo, useState } from "react";
import { CmsFeedback, CmsField } from "@/components/cms/cms-controls";
import { getBrandingSettings, updateBrandingSettings } from "@/lib/branding/admin-branding-client";
import { listAdminMedia } from "@/lib/media/admin-media-client";

const platforms = [
  "instagram",
  "facebook",
  "youtube",
  "tiktok",
  "linkedin",
  "x",
  "snapchat",
] as const;
type MediaRole =
  | "primaryLogoMediaAssetId"
  | "alternateLogoMediaAssetId"
  | "faviconMediaAssetId"
  | "socialImageMediaAssetId";

export function BrandingSettingsEditor() {
  const [saved, setSaved] = useState<BrandingSettings | null>(null);
  const [draft, setDraft] = useState<BrandingSettings | null>(null);
  const [media, setMedia] = useState<AdminMediaListItem[]>([]);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", tone: "success" as "success" | "error" });
  useEffect(() => {
    Promise.all([
      getBrandingSettings(),
      listAdminMedia({
        pageNumber: 1,
        pageSize: 100,
        mediaType: String(MediaType.Image),
        isArchived: false,
      }),
    ])
      .then(([settings, assets]) => {
        setSaved(settings);
        setDraft(settings);
        setMedia([...assets.items]);
      })
      .catch((error: unknown) =>
        setFeedback({
          message: error instanceof Error ? error.message : "Unable to load Branding Settings.",
          tone: "error",
        }),
      );
  }, []);
  const images = useMemo(
    () =>
      media.filter(
        (item) =>
          item.mediaType === MediaType.Image &&
          !item.isArchived &&
          item.approvalStatus === MediaApprovalStatus.Approved,
      ),
    [media],
  );
  if (!draft || !saved)
    return (
      <p className="text-sm text-ink-muted">{feedback.message || "Loading Branding Settings…"}</p>
    );
  const dirty = brandingChanged(draft, saved);
  const change = <K extends keyof BrandingSettings>(key: K, value: BrandingSettings[K]) =>
    setDraft({ ...draft, [key]: value });
  async function save() {
    setPending(true);
    setFeedback({ message: "", tone: "success" });
    try {
      const canonical = await updateBrandingSettings(brandingRequest(draft!));
      setSaved(canonical);
      setDraft(canonical);
      setFeedback({ message: "Branding media and operational details saved.", tone: "success" });
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : "Unable to save Branding Settings.",
        tone: "error",
      });
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="space-y-7">
      <CmsFeedback message={feedback.message} tone={feedback.tone} />
      <Card className="p-5 sm:p-7">
        <p className="text-xs uppercase tracking-[.14em] text-gold">CMS ownership</p>
        <h2 className="mt-2 font-display text-2xl font-bold">Brand assets</h2>
        <p className="mt-2 max-w-3xl text-sm text-ink-muted">
          Logo, favicon and social image remain Media-owned. Site name, tagline and default SEO copy
          are code-owned and intentionally no longer editable here.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <MediaSelect
            label="Primary logo"
            role="primaryLogoMediaAssetId"
            images={images}
            value={draft.primaryLogoMediaAssetId}
            onChange={change}
          />
          <MediaSelect
            label="Alternate logo"
            role="alternateLogoMediaAssetId"
            images={images}
            value={draft.alternateLogoMediaAssetId}
            onChange={change}
          />
          <MediaSelect
            label="Favicon"
            role="faviconMediaAssetId"
            images={images}
            value={draft.faviconMediaAssetId}
            onChange={change}
          />
          <MediaSelect
            label="Social image"
            role="socialImageMediaAssetId"
            images={images}
            value={draft.socialImageMediaAssetId}
            onChange={change}
          />
        </div>
      </Card>
      <Card className="grid gap-5 p-5 sm:p-7 md:grid-cols-2">
        <h2 className="font-display text-2xl font-bold md:col-span-2">Public contact details</h2>
        <TextField
          label="Public email"
          value={draft.publicEmail}
          onChange={(value) => change("publicEmail", value)}
        />
        <TextField
          label="Public phone"
          value={draft.publicPhone}
          onChange={(value) => change("publicPhone", value)}
        />
        <TextField
          label="WhatsApp"
          value={draft.whatsApp}
          onChange={(value) => change("whatsApp", value)}
        />
        <TextField
          label="Public address"
          value={draft.publicAddress}
          onChange={(value) => change("publicAddress", value)}
        />
      </Card>
      <Card className="grid gap-5 p-5 sm:p-7 md:grid-cols-2">
        <h2 className="font-display text-2xl font-bold md:col-span-2">Social links</h2>
        {platforms.map((platform) => (
          <TextField
            key={platform}
            label={platform}
            value={draft.socialLinks[platform] ?? null}
            onChange={(value) =>
              change("socialLinks", { ...draft.socialLinks, [platform]: value ?? "" })
            }
          />
        ))}
      </Card>
      <div className="flex items-center justify-end gap-4">
        <span className="text-xs text-ink-muted">{dirty ? "Unsaved changes" : "Saved"}</span>
        <button
          className={buttonClasses("primary")}
          disabled={!dirty || pending}
          onClick={() => void save()}
          type="button"
        >
          {pending ? "Saving…" : "Save branding"}
        </button>
      </div>
    </div>
  );
}

function MediaSelect({
  label,
  role,
  images,
  value,
  onChange,
}: {
  label: string;
  role: MediaRole;
  images: AdminMediaListItem[];
  value: string | null;
  onChange: <K extends keyof BrandingSettings>(key: K, value: BrandingSettings[K]) => void;
}) {
  return (
    <CmsField label={label} name={`branding-media-${role}`}>
      <select
        className="min-h-11 w-full border border-line bg-canvas px-3"
        value={value ?? ""}
        onChange={(event) => onChange(role, event.target.value || null)}
      >
        <option value="">Use bundled fallback / none</option>
        {images.map((item) => (
          <option key={item.id} value={item.id}>
            {item.originalFileName}
          </option>
        ))}
      </select>
    </CmsField>
  );
}
function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <CmsField label={label} name={`branding-${label.toLowerCase().replaceAll(" ", "-")}`}>
      <Input value={value ?? ""} onChange={(event) => onChange(event.target.value || null)} />
    </CmsField>
  );
}
