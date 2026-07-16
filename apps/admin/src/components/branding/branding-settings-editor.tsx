"use client";
import {
  MediaApprovalStatus,
  MediaType,
  type AdminMediaListItem,
  type BrandingSettings,
} from "@the-domain/types";
import { buttonClasses, Card, Input, Textarea } from "@the-domain/ui";
import { brandingChanged, brandingRequest } from "@the-domain/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getBrandingSettings, updateBrandingSettings } from "@/lib/branding/admin-branding-client";
import { listAdminMedia, uploadAdminMedia } from "@/lib/media/admin-media-client";
const platforms = [
  "instagram",
  "facebook",
  "youtube",
  "tiktok",
  "linkedin",
  "x",
  "snapchat",
] as const;
type Role =
  | "primaryLogoMediaAssetId"
  | "alternateLogoMediaAssetId"
  | "faviconMediaAssetId"
  | "socialImageMediaAssetId";
export function BrandingSettingsEditor() {
  const [saved, setSaved] = useState<BrandingSettings | null>(null);
  const [draft, setDraft] = useState<BrandingSettings | null>(null);
  const [media, setMedia] = useState<AdminMediaListItem[]>([]);
  const [role, setRole] = useState<Role | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    Promise.all([
      getBrandingSettings(),
      listAdminMedia({
        pageNumber: 1,
        pageSize: 100,
        mediaType: String(MediaType.Image),
        isArchived: null,
      }),
    ])
      .then(([settings, assets]) => {
        setSaved(settings);
        setDraft(settings);
        setMedia([...assets.items]);
      })
      .catch((reason: unknown) =>
        setError(reason instanceof Error ? reason.message : "Unable to load Branding Settings."),
      );
  }, []);
  useEffect(() => {
    if (!saved || !draft || !brandingChanged(draft, saved)) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [draft, saved]);
  if (!draft || !saved)
    return <p className="text-sm text-ink-muted">{error || "Loading Branding Settings…"}</p>;
  const current = draft;
  const canonicalSaved = saved;
  const dirty = brandingChanged(current, canonicalSaved);
  const change = <K extends keyof BrandingSettings>(key: K, value: BrandingSettings[K]) =>
    setDraft({ ...current, [key]: value });
  async function save() {
    setPending(true);
    setError("");
    try {
      const canonical = await updateBrandingSettings(brandingRequest(current));
      setSaved(canonical);
      setDraft(canonical);
      setMessage("Branding Settings saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save Branding Settings.");
    } finally {
      setPending(false);
    }
  }
  async function upload(file: File) {
    setPending(true);
    setError("");
    try {
      const item = await uploadAdminMedia(file, {
        approvalStatus: MediaApprovalStatus.Approved,
        category: "Branding",
        altText: current.siteName,
      });
      setMedia((items) => [item, ...items.filter((value) => value.id !== item.id)]);
      if (role) change(role, item.id);
      setMessage("Image uploaded and selected. Save Branding Settings to publish it.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Image upload failed.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,.8fr)]">
      <div className="space-y-7">
        {dirty && (
          <p className="border-l-2 border-gold bg-gold/10 p-3 text-sm" role="status">
            Unsaved changes
          </p>
        )}
        {message && (
          <p className="border-l-2 border-gold p-3 text-sm" role="status">
            {message}
          </p>
        )}
        {error && (
          <p className="border-l-2 border-error p-3 text-sm text-error" role="alert">
            {error}
          </p>
        )}
        <Section title="Brand identity">
          <Field label="Site name">
            <Input
              maxLength={100}
              onChange={(event) => change("siteName", event.target.value)}
              value={draft.siteName}
            />
          </Field>
          <Field label="Short brand description">
            <Textarea
              maxLength={240}
              onChange={(event) => change("brandDescription", event.target.value || null)}
              value={draft.brandDescription ?? ""}
            />
          </Field>
          <MediaRoles draft={draft} onChoose={setRole} onClear={(key) => change(key, null)} />
        </Section>
        <Section title="Website icons and social image">
          <p className="text-sm text-ink-muted">
            Favicons work best as square images. Social cards work best in a landscape ratio.
          </p>
          <MediaRole
            label="Favicon"
            role="faviconMediaAssetId"
            value={draft.faviconMediaAssetId}
            onChoose={setRole}
            onClear={() => change("faviconMediaAssetId", null)}
          />
          <MediaRole
            label="Default social image"
            role="socialImageMediaAssetId"
            value={draft.socialImageMediaAssetId}
            onChoose={setRole}
            onClear={() => change("socialImageMediaAssetId", null)}
          />
        </Section>
        <Section title="Default SEO">
          <Field label={`Default title · ${draft.defaultSeoTitle.length}/120`}>
            <Input
              maxLength={120}
              onChange={(event) => change("defaultSeoTitle", event.target.value)}
              value={draft.defaultSeoTitle}
            />
          </Field>
          <Field label={`Default description · ${draft.defaultSeoDescription.length}/320`}>
            <Textarea
              maxLength={320}
              onChange={(event) => change("defaultSeoDescription", event.target.value)}
              value={draft.defaultSeoDescription}
            />
          </Field>
        </Section>
        <Section title="Public contact">
          {(["publicEmail", "publicPhone", "whatsApp", "publicAddress"] as const).map((key) => (
            <Field key={key} label={key.replace(/([A-Z])/g, " $1")}>
              <Input
                onChange={(event) => change(key, event.target.value || null)}
                value={draft[key] ?? ""}
              />
            </Field>
          ))}
        </Section>
        <Section title="Social links">
          {platforms.map((platform) => (
            <Field key={platform} label={platform}>
              <Input
                inputMode="url"
                onChange={(event) =>
                  change("socialLinks", { ...draft.socialLinks, [platform]: event.target.value })
                }
                placeholder="https://"
                value={draft.socialLinks[platform] ?? ""}
              />
            </Field>
          ))}
        </Section>
        <div className="flex flex-wrap gap-2">
          <button
            className={buttonClasses("primary")}
            disabled={!dirty || pending}
            onClick={() => void save()}
            type="button"
          >
            {pending ? "Saving…" : "Save settings"}
          </button>
          <button
            className={buttonClasses("secondary")}
            disabled={!dirty || pending}
            onClick={() => setDraft(saved)}
            type="button"
          >
            Cancel changes
          </button>
        </div>
      </div>
      <aside>
        <div className="sticky top-6">
          <div className="flex gap-2" role="group" aria-label="Preview size">
            <button
              aria-pressed={!mobile}
              className={buttonClasses(!mobile ? "primary" : "secondary")}
              onClick={() => setMobile(false)}
              type="button"
            >
              Desktop
            </button>
            <button
              aria-pressed={mobile}
              className={buttonClasses(mobile ? "primary" : "secondary")}
              onClick={() => setMobile(true)}
              type="button"
            >
              Mobile
            </button>
          </div>
          <Card className={`mt-4 overflow-hidden p-5 ${mobile ? "max-w-xs" : "max-w-xl"}`}>
            <p className="text-xs uppercase text-gold">Live approximation</p>
            <BrandMark draft={draft} media={media} id={draft.primaryLogoMediaAssetId} />
            <div className="mt-6 border border-line bg-white p-4 text-black">
              <p className="text-blue-700">{draft.defaultSeoTitle}</p>
              <p className="mt-1 text-sm">{draft.defaultSeoDescription}</p>
            </div>
            <div className="mt-4 border border-line p-4">
              <p className="font-display text-xl font-bold">{draft.siteName}</p>
              <p className="mt-2 text-sm text-ink-muted">{draft.brandDescription}</p>
              <p className="mt-4 text-xs">
                {draft.publicEmail || "Contact details not configured"}
              </p>
            </div>
          </Card>
        </div>
      </aside>
      {role && (
        <Picker
          assets={media}
          onClose={() => setRole(null)}
          onSelect={(item) => {
            change(role, item.id);
            setRole(null);
          }}
          onUpload={upload}
        />
      )}
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="space-y-5 p-5 sm:p-7">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      {children}
    </Card>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase text-ink-muted">{label}</span>
      {children}
    </label>
  );
}
function MediaRoles({
  draft,
  onChoose,
  onClear,
}: {
  draft: BrandingSettings;
  onChoose: (role: Role) => void;
  onClear: (role: Role) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <MediaRole
        label="Primary logo"
        role="primaryLogoMediaAssetId"
        value={draft.primaryLogoMediaAssetId}
        onChoose={onChoose}
        onClear={() => onClear("primaryLogoMediaAssetId")}
      />
      <MediaRole
        label="Alternate logo"
        role="alternateLogoMediaAssetId"
        value={draft.alternateLogoMediaAssetId}
        onChoose={onChoose}
        onClear={() => onClear("alternateLogoMediaAssetId")}
      />
    </div>
  );
}
function MediaRole({
  label,
  role,
  value,
  onChoose,
  onClear,
}: {
  label: string;
  role: Role;
  value: string | null;
  onChoose: (role: Role) => void;
  onClear: () => void;
}) {
  return (
    <div className="border border-line p-4">
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-1 break-all text-xs text-ink-muted">{value || "Intentional fallback"}</p>
      <div className="mt-3 flex gap-2">
        <button
          className={buttonClasses("secondary", "px-3")}
          onClick={() => onChoose(role)}
          type="button"
        >
          Select or upload
        </button>
        {value && (
          <button className={buttonClasses("ghost", "px-3")} onClick={onClear} type="button">
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
function Picker({
  assets,
  onClose,
  onSelect,
  onUpload,
}: {
  assets: AdminMediaListItem[];
  onClose: () => void;
  onSelect: (item: AdminMediaListItem) => void;
  onUpload: (file: File) => void;
}) {
  const [search, setSearch] = useState("");
  const visible = assets.filter((item) =>
    `${item.originalFileName} ${item.caption ?? ""}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-canvas/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Choose branding image"
    >
      <Card className="mx-auto max-w-4xl p-6">
        <div className="flex justify-between">
          <h2 className="font-display text-2xl font-bold">Choose an image</h2>
          <button className={buttonClasses("ghost")} onClick={onClose} type="button">
            Close
          </button>
        </div>
        <label className="mt-5 block border border-dashed border-line p-4 text-sm">
          Upload a new approved branding image
          <input
            accept="image/*"
            className="mt-2 block"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUpload(file);
            }}
            type="file"
          />
        </label>
        <label className="mt-5 block text-sm">
          <span className="mb-2 block text-xs uppercase text-ink-muted">
            Search existing images
          </span>
          <Input onChange={(event) => setSearch(event.target.value)} type="search" value={search} />
        </label>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {visible.map((item) => {
            const eligible =
              !item.isArchived &&
              item.approvalStatus === MediaApprovalStatus.Approved &&
              item.mediaType === MediaType.Image &&
              item.url.startsWith("https://");
            return (
              <button
                className="border border-line p-2 text-left disabled:opacity-50"
                disabled={!eligible}
                key={item.id}
                onClick={() => onSelect(item)}
                type="button"
              >
                <div className="relative aspect-square overflow-hidden bg-surface">
                  {item.url.startsWith("https://") && (
                    <Image
                      alt={item.altText ?? ""}
                      fill
                      className="object-contain"
                      sizes="12rem"
                      src={item.url}
                    />
                  )}
                </div>
                <p className="mt-2 truncate text-xs">{item.caption || item.originalFileName}</p>
                <p className="mt-1 text-[.65rem] text-ink-muted">
                  {eligible
                    ? "Eligible"
                    : item.isArchived
                      ? "Archived"
                      : item.approvalStatus === MediaApprovalStatus.Hidden
                        ? "Hidden"
                        : "Draft"}
                </p>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
function BrandMark({
  draft,
  media,
  id,
}: {
  draft: BrandingSettings;
  media: AdminMediaListItem[];
  id: string | null;
}) {
  const item = media.find((value) => value.id === id);
  return (
    <div className="mt-5 flex min-h-16 items-center">
      {item?.url.startsWith("https://") ? (
        <Image
          alt={`${draft.siteName} logo`}
          height={64}
          width={220}
          className="h-16 w-auto object-contain"
          src={item.url}
        />
      ) : (
        <p className="font-display text-xl font-bold">{draft.siteName}</p>
      )}
    </div>
  );
}
