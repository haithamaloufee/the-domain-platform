"use client";

import {
  HomepageSectionKey,
  MediaApprovalStatus,
  MediaType,
  type AdminHomepageContent,
  type AdminMediaListItem,
  type GalleryAdminCollection,
  type UpdateHomepageContentRequest,
} from "@the-domain/types";
import { Card, Input, Select, Textarea, buttonClasses } from "@the-domain/ui";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CmsCheckbox, CmsFeedback, CmsField, CmsStatusBadge } from "@/components/cms/cms-controls";
import { getAdminHomepage, updateAdminHomepage } from "@/lib/cms/admin-cms-client";
import { listAdminMedia, uploadAdminMedia } from "@/lib/media/admin-media-client";
import { getAdminGallery } from "@/lib/gallery/admin-gallery-client";

type TextFieldName = Exclude<keyof UpdateHomepageContentRequest, "isPublished">;
type FieldErrors = Partial<Record<TextFieldName, string>>;

const emptyContent: UpdateHomepageContentRequest = {
  heroEyebrow: "",
  heroTitle: "",
  heroAccent: null,
  heroDescription: "",
  primaryCtaLabel: "",
  primaryCtaHref: "",
  secondaryCtaLabel: null,
  secondaryCtaHref: null,
  whyTitle: "",
  whyDescription: "",
  servicesTitle: "",
  servicesDescription: "",
  partnersTitle: "",
  partnersDescription: "",
  contactTitle: "",
  contactDescription: "",
  contactCtaLabel: "",
  contactCtaHref: "",
  isPublished: false,
  heroMediaAssetId: null,
  galleryCollectionId: null,
  sectionOrder: Object.values(HomepageSectionKey),
  disabledSections: [],
  eventsTitle: "Upcoming experiences",
  eventsDescription: "The next Domain experiences.",
  previousEventsTitle: "Previous events",
  previousEventsDescription: "Moments that continue to shape The Domain.",
  galleryTitle: "Gallery highlights",
  galleryDescription: "Curated photography and film from The Domain.",
};

export function HomepageEditor() {
  const [fields, setFields] = useState<UpdateHomepageContentRequest>(emptyContent);
  const [saved, setSaved] = useState<AdminHomepageContent | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success">("success");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getAdminHomepage()
      .then((content) => {
        if (!active) return;
        setSaved(content);
        setFields(content ? toRequest(content) : emptyContent);
        setState("ready");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setMessage(error instanceof Error ? error.message : "Unable to load homepage content.");
        setMessageTone("error");
        setState("error");
      });
    return () => {
      active = false;
    };
  }, []);

  function update<K extends keyof UpdateHomepageContentRequest>(
    name: K,
    value: UpdateHomepageContentRequest[K],
  ) {
    setFields((current) => ({ ...current, [name]: value }));
    if (name !== "isPublished")
      setErrors((current) => ({ ...current, [name as TextFieldName]: undefined }));
    setMessage("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validate(fields);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setMessage("Please correct the highlighted homepage fields.");
      setMessageTone("error");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const content = await updateAdminHomepage(normalize(fields));
      setSaved(content);
      setFields(toRequest(content));
      setMessage(
        content.isPublished ? "Homepage content saved and published." : "Homepage draft saved.",
      );
      setMessageTone("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save homepage content.");
      setMessageTone("error");
    } finally {
      setSaving(false);
    }
  }

  if (state === "loading") return <HomepageLoading />;
  if (state === "error") {
    return (
      <Card className="p-6 sm:p-8">
        <CmsFeedback message={message} tone="error" />
        <button
          className={buttonClasses("secondary", "mt-6")}
          onClick={() => location.reload()}
          type="button"
        >
          Try again
        </button>
      </Card>
    );
  }

  return (
    <form className="space-y-6" noValidate onSubmit={(event) => void submit(event)}>
      <div className="flex flex-col gap-4 border border-line bg-surface px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <CmsStatusBadge
              active={fields.isPublished}
              activeLabel="Published"
              inactiveLabel="Draft"
            />
            {!saved && <span className="text-xs text-ink-muted">No homepage record saved yet</span>}
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">
            Published content appears on the public homepage. Draft content remains available only
            here.
          </p>
        </div>
        {saved && (
          <p className="font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
            Updated {formatDate(saved.updatedAtUtc)}
          </p>
        )}
      </div>

      <CmsFeedback message={message} tone={messageTone} />
      <HomepageVisualBuilder fields={fields} onChange={update} />

      <EditorSection
        description="The opening editorial statement shown above the event programme."
        title="Hero narrative"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <TextControl
            fields={fields}
            label="Eyebrow"
            maxLength={100}
            name="heroEyebrow"
            onChange={update}
          />
          <TextControl
            fields={fields}
            label="Accent line"
            maxLength={200}
            name="heroAccent"
            onChange={update}
          />
        </div>
        <TextControl
          error={errors.heroTitle}
          fields={fields}
          label="Hero title"
          maxLength={200}
          name="heroTitle"
          onChange={update}
          required
        />
        <TextControl
          error={errors.heroDescription}
          fields={fields}
          label="Hero description"
          maxLength={1_000}
          multiline
          name="heroDescription"
          onChange={update}
          required
        />
      </EditorSection>

      <EditorSection
        description="Use a root-relative path such as /events or an absolute HTTP(S) URL. Secondary fields must be completed together."
        title="Hero actions"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <TextControl
            error={errors.primaryCtaLabel}
            fields={fields}
            label="Primary label"
            maxLength={100}
            name="primaryCtaLabel"
            onChange={update}
            required
          />
          <TextControl
            error={errors.primaryCtaHref}
            fields={fields}
            label="Primary href"
            maxLength={2_048}
            name="primaryCtaHref"
            onChange={update}
            required
          />
          <TextControl
            error={errors.secondaryCtaLabel}
            fields={fields}
            label="Secondary label"
            maxLength={100}
            name="secondaryCtaLabel"
            onChange={update}
          />
          <TextControl
            error={errors.secondaryCtaHref}
            fields={fields}
            label="Secondary href"
            maxLength={2_048}
            name="secondaryCtaHref"
            onChange={update}
          />
        </div>
      </EditorSection>

      <EditorSection
        description="Section-level copy changes without replacing the established homepage composition."
        title="Editorial sections"
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <SectionCopy
            descriptionError={errors.whyDescription}
            descriptionName="whyDescription"
            fields={fields}
            onChange={update}
            titleError={errors.whyTitle}
            titleLabel="Why The Domain"
            titleName="whyTitle"
          />
          <SectionCopy
            descriptionError={errors.servicesDescription}
            descriptionName="servicesDescription"
            fields={fields}
            onChange={update}
            titleError={errors.servicesTitle}
            titleLabel="Services"
            titleName="servicesTitle"
          />
          <SectionCopy
            descriptionError={errors.partnersDescription}
            descriptionName="partnersDescription"
            fields={fields}
            onChange={update}
            titleError={errors.partnersTitle}
            titleLabel="Partners"
            titleName="partnersTitle"
          />
        </div>
      </EditorSection>

      <EditorSection
        description="The closing invitation and its public destination."
        title="Contact call to action"
      >
        <TextControl
          error={errors.contactTitle}
          fields={fields}
          label="Contact title"
          maxLength={200}
          name="contactTitle"
          onChange={update}
          required
        />
        <TextControl
          error={errors.contactDescription}
          fields={fields}
          label="Contact description"
          maxLength={1_000}
          multiline
          name="contactDescription"
          onChange={update}
          required
        />
        <div className="grid gap-6 md:grid-cols-2">
          <TextControl
            error={errors.contactCtaLabel}
            fields={fields}
            label="CTA label"
            maxLength={100}
            name="contactCtaLabel"
            onChange={update}
            required
          />
          <TextControl
            error={errors.contactCtaHref}
            fields={fields}
            label="CTA href"
            maxLength={2_048}
            name="contactCtaHref"
            onChange={update}
            required
          />
        </div>
      </EditorSection>

      <Card className="p-5 sm:p-6">
        <CmsCheckbox
          checked={fields.isPublished}
          description="When enabled, this content becomes eligible for the public homepage immediately after saving."
          label="Publish homepage content"
          name="isPublished"
          onChange={(checked) => update("isPublished", checked)}
        />
      </Card>

      <div className="sticky bottom-0 z-10 flex justify-end border-t border-line bg-canvas/95 py-4 backdrop-blur">
        <button
          className={buttonClasses("primary", "w-full sm:w-auto sm:min-w-44")}
          disabled={saving}
          type="submit"
        >
          {saving ? "Saving…" : fields.isPublished ? "Save & publish" : "Save draft"}
        </button>
      </div>
    </form>
  );
}

function HomepageVisualBuilder({
  fields,
  onChange,
}: {
  fields: UpdateHomepageContentRequest;
  onChange: <K extends keyof UpdateHomepageContentRequest>(
    name: K,
    value: UpdateHomepageContentRequest[K],
  ) => void;
}) {
  const [media, setMedia] = useState<AdminMediaListItem[]>([]);
  const [collections, setCollections] = useState<GalleryAdminCollection[]>([]);
  const [mode, setMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    void Promise.all([
      listAdminMedia({ pageNumber: 1, pageSize: 100, isArchived: false }),
      getAdminGallery(),
    ]).then(([assets, gallery]) => {
      setMedia([...assets.items]);
      setCollections(gallery.filter((item) => item.isPublished && !item.isArchived));
    });
  }, []);
  const hero = media.find((item) => item.id === fields.heroMediaAssetId);
  const widths = { desktop: "max-w-full", tablet: "max-w-2xl", mobile: "max-w-xs" };
  function move(key: string, direction: -1 | 1) {
    const next = [...fields.sectionOrder];
    const index = next.indexOf(key as never);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= next.length) return;
    const [item] = next.splice(index, 1);
    if (item) next.splice(target, 0, item);
    onChange("sectionOrder", next);
  }
  async function upload(file: File) {
    setUploading(true);
    try {
      const item = await uploadAdminMedia(file, {
        approvalStatus: MediaApprovalStatus.Approved,
        category: "Homepage hero",
        altText: fields.heroTitle,
      });
      setMedia((current) => [item, ...current]);
      onChange("heroMediaAssetId", item.id);
    } finally {
      setUploading(false);
    }
  }
  return (
    <Card className="p-6 sm:p-8">
      <div className="border-b border-line pb-5">
        <p className="font-label text-xs uppercase tracking-[.14em] text-gold">
          Guided visual builder
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold">Homepage composition</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Select media and arrange predefined sections. Underlying Events, Statistics, Partners, and
          Gallery records remain owned by their managers.
        </p>
      </div>
      <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(20rem,.8fr)_minmax(24rem,1.2fr)]">
        <div className="space-y-6">
          <div>
            <h3 className="font-display text-xl font-bold">Hero media</h3>
            <Select
              className="mt-3"
              onChange={(event) => onChange("heroMediaAssetId", event.target.value || null)}
              value={fields.heroMediaAssetId ?? ""}
            >
              <option value="">Text-only intentional fallback</option>
              {media
                .filter(
                  (item) =>
                    !item.isArchived &&
                    item.approvalStatus === MediaApprovalStatus.Approved &&
                    item.url.startsWith("https://"),
                )
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.caption || item.originalFileName} ·{" "}
                    {item.mediaType === MediaType.Video ? "Video" : "Image"}
                  </option>
                ))}
            </Select>
            <label className="mt-3 block border border-dashed border-line p-3 text-xs">
              Upload image or video
              <input
                accept="image/*,video/*"
                className="mt-2 block"
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void upload(file);
                }}
                type="file"
              />
            </label>
          </div>
          <div>
            <h3 className="font-display text-xl font-bold">Gallery highlight</h3>
            <Select
              className="mt-3"
              onChange={(event) => onChange("galleryCollectionId", event.target.value || null)}
              value={fields.galleryCollectionId ?? ""}
            >
              <option value="">Automatic Gallery preview</option>
              {collections.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.publicTitle || item.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <h3 className="font-display text-xl font-bold">Section structure</h3>
            <ol className="mt-3 space-y-2">
              {fields.sectionOrder.map((key, index) => {
                const disabled = fields.disabledSections.includes(key);
                return (
                  <li
                    className="flex items-center justify-between gap-3 border border-line p-3"
                    key={key}
                  >
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        checked={!disabled}
                        onChange={(event) =>
                          onChange(
                            "disabledSections",
                            event.target.checked
                              ? fields.disabledSections.filter((item) => item !== key)
                              : [...fields.disabledSections, key],
                          )
                        }
                        type="checkbox"
                      />
                      {key}
                    </label>
                    <div className="flex gap-1">
                      <button
                        aria-label={`Move ${key} up`}
                        className={buttonClasses("ghost", "px-2")}
                        disabled={index === 0}
                        onClick={() => move(key, -1)}
                        type="button"
                      >
                        Up
                      </button>
                      <button
                        aria-label={`Move ${key} down`}
                        className={buttonClasses("ghost", "px-2")}
                        disabled={index === fields.sectionOrder.length - 1}
                        onClick={() => move(key, 1)}
                        type="button"
                      >
                        Down
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          <div>
            <h3 className="font-display text-xl font-bold">Curated section copy</h3>
            <div className="mt-3 space-y-5">
              {(
                [
                  ["Events", "eventsTitle", "eventsDescription"],
                  ["Previous events", "previousEventsTitle", "previousEventsDescription"],
                  ["Gallery", "galleryTitle", "galleryDescription"],
                ] as const
              ).map(([label, titleName, descriptionName]) => (
                <div className="space-y-3 border-l border-line pl-4" key={titleName}>
                  <p className="font-label text-xs uppercase tracking-[.14em] text-gold">{label}</p>
                  <TextControl
                    fields={fields}
                    label="Heading"
                    maxLength={160}
                    name={titleName}
                    onChange={onChange}
                    required
                  />
                  <TextControl
                    fields={fields}
                    label="Supporting copy"
                    maxLength={500}
                    multiline
                    name={descriptionName}
                    onChange={onChange}
                    required
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="flex gap-2" role="group" aria-label="Homepage preview width">
            {(["desktop", "tablet", "mobile"] as const).map((value) => (
              <button
                aria-pressed={mode === value}
                className={buttonClasses(mode === value ? "primary" : "secondary", "px-3")}
                key={value}
                onClick={() => setMode(value)}
                type="button"
              >
                {value}
              </button>
            ))}
          </div>
          <div
            className={`mx-auto mt-4 overflow-hidden border border-line bg-canvas transition-[max-width] ${widths[mode]}`}
          >
            <div className="relative min-h-72 p-6">
              {hero &&
                (hero.mediaType === MediaType.Video ? (
                  <video
                    className="absolute inset-0 h-full w-full object-cover opacity-45"
                    muted
                    playsInline
                    poster={hero.thumbnailUrl ?? undefined}
                    preload="metadata"
                    src={hero.url}
                  />
                ) : (
                  <Image
                    alt={hero.altText ?? ""}
                    className="object-cover opacity-45"
                    fill
                    sizes="60vw"
                    src={hero.url}
                  />
                ))}
              <div className="relative">
                <p className="text-xs uppercase text-gold">{fields.heroEyebrow}</p>
                <h3 className="mt-4 max-w-lg font-display text-4xl font-bold">
                  {fields.heroTitle || "Homepage hero"}
                </h3>
                <p className="mt-3 max-w-lg text-sm text-ink-muted">{fields.heroDescription}</p>
                <div className="mt-5 flex gap-2">
                  <span className={buttonClasses("primary")}>
                    {fields.primaryCtaLabel || "Primary action"}
                  </span>
                  {fields.secondaryCtaLabel && (
                    <span className={buttonClasses("secondary")}>{fields.secondaryCtaLabel}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2 p-4">
              {fields.sectionOrder
                .filter((key) => !fields.disabledSections.includes(key))
                .map((key) => (
                  <div className="border border-line bg-surface p-4" key={key}>
                    <p className="font-display text-lg font-bold capitalize">{key}</p>
                    <p className="mt-1 text-xs text-ink-muted">Configured public section</p>
                  </div>
                ))}
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-muted">
            Approximation only. Save the complete homepage form to persist changes.
          </p>
        </div>
      </div>
    </Card>
  );
}

function EditorSection({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <Card className="p-6 sm:p-8">
      <section className="space-y-6">
        <div className="border-b border-line pb-5">
          <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted">{description}</p>
        </div>
        {children}
      </section>
    </Card>
  );
}

function TextControl({
  error,
  fields,
  label,
  maxLength,
  multiline = false,
  name,
  onChange,
  required = false,
}: {
  error?: string;
  fields: UpdateHomepageContentRequest;
  label: string;
  maxLength: number;
  multiline?: boolean;
  name: TextFieldName;
  onChange: <K extends keyof UpdateHomepageContentRequest>(
    name: K,
    value: UpdateHomepageContentRequest[K],
  ) => void;
  required?: boolean;
}) {
  const props = {
    id: name,
    maxLength,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(name, event.target.value),
    value: fields[name] ?? "",
  };
  return (
    <CmsField error={error} label={label} name={name} required={required}>
      {multiline ? <Textarea className="min-h-28" {...props} /> : <Input {...props} />}
    </CmsField>
  );
}

function SectionCopy({
  descriptionError,
  descriptionName,
  fields,
  onChange,
  titleError,
  titleLabel,
  titleName,
}: {
  descriptionError?: string;
  descriptionName: "whyDescription" | "servicesDescription" | "partnersDescription";
  fields: UpdateHomepageContentRequest;
  onChange: <K extends keyof UpdateHomepageContentRequest>(
    name: K,
    value: UpdateHomepageContentRequest[K],
  ) => void;
  titleError?: string;
  titleLabel: string;
  titleName: "whyTitle" | "servicesTitle" | "partnersTitle";
}) {
  return (
    <div className="space-y-5 border-l border-line pl-5">
      <p className="font-label text-xs font-semibold uppercase tracking-[0.14em] text-gold">
        {titleLabel}
      </p>
      <TextControl
        error={titleError}
        fields={fields}
        label="Title"
        maxLength={200}
        name={titleName}
        onChange={onChange}
        required
      />
      <TextControl
        error={descriptionError}
        fields={fields}
        label="Description"
        maxLength={descriptionName === "whyDescription" ? 2_000 : 1_000}
        multiline
        name={descriptionName}
        onChange={onChange}
        required
      />
    </div>
  );
}

function validate(fields: UpdateHomepageContentRequest): FieldErrors {
  const errors: FieldErrors = {};
  for (const name of [
    "heroTitle",
    "heroDescription",
    "primaryCtaLabel",
    "whyTitle",
    "whyDescription",
    "servicesTitle",
    "servicesDescription",
    "partnersTitle",
    "partnersDescription",
    "contactTitle",
    "contactDescription",
    "contactCtaLabel",
    "eventsTitle",
    "eventsDescription",
    "previousEventsTitle",
    "previousEventsDescription",
    "galleryTitle",
    "galleryDescription",
  ] as const) {
    if (!fields[name].trim()) errors[name] = "This field is required.";
  }
  if (!validHref(fields.primaryCtaHref))
    errors.primaryCtaHref = "Enter a root-relative path or absolute HTTP(S) URL.";
  if (!validHref(fields.contactCtaHref))
    errors.contactCtaHref = "Enter a root-relative path or absolute HTTP(S) URL.";
  const secondaryLabel = fields.secondaryCtaLabel?.trim() ?? "";
  const secondaryHref = fields.secondaryCtaHref?.trim() ?? "";
  if (Boolean(secondaryLabel) !== Boolean(secondaryHref)) {
    errors.secondaryCtaLabel = "Provide both secondary CTA fields or leave both empty.";
    errors.secondaryCtaHref = "Provide both secondary CTA fields or leave both empty.";
  } else if (secondaryHref && !validHref(secondaryHref)) {
    errors.secondaryCtaHref = "Enter a root-relative path or absolute HTTP(S) URL.";
  }
  return errors;
}

function validHref(value: string): boolean {
  const input = value.trim();
  if (input.startsWith("/") && !input.startsWith("//")) return true;
  try {
    const url = new URL(input);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalize(fields: UpdateHomepageContentRequest): UpdateHomepageContentRequest {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      typeof value === "string" ? value.trim() : value,
    ]),
  ) as unknown as UpdateHomepageContentRequest;
}

function toRequest(content: AdminHomepageContent): UpdateHomepageContentRequest {
  return {
    heroEyebrow: content.heroEyebrow,
    heroTitle: content.heroTitle,
    heroAccent: content.heroAccent,
    heroDescription: content.heroDescription,
    primaryCtaLabel: content.primaryCtaLabel,
    primaryCtaHref: content.primaryCtaHref,
    secondaryCtaLabel: content.secondaryCtaLabel,
    secondaryCtaHref: content.secondaryCtaHref,
    whyTitle: content.whyTitle,
    whyDescription: content.whyDescription,
    servicesTitle: content.servicesTitle,
    servicesDescription: content.servicesDescription,
    partnersTitle: content.partnersTitle,
    partnersDescription: content.partnersDescription,
    contactTitle: content.contactTitle,
    contactDescription: content.contactDescription,
    contactCtaLabel: content.contactCtaLabel,
    contactCtaHref: content.contactCtaHref,
    isPublished: content.isPublished,
    heroMediaAssetId: content.builder.heroMediaAssetId,
    galleryCollectionId: content.builder.galleryCollectionId,
    sectionOrder: content.builder.sectionOrder,
    disabledSections: content.builder.disabledSections,
    eventsTitle: content.builder.eventsTitle,
    eventsDescription: content.builder.eventsDescription,
    previousEventsTitle: content.builder.previousEventsTitle,
    previousEventsDescription: content.builder.previousEventsDescription,
    galleryTitle: content.builder.galleryTitle,
    galleryDescription: content.builder.galleryDescription,
  };
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-JO", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

function HomepageLoading() {
  return (
    <div aria-label="Loading homepage content" className="space-y-6" role="status">
      {[0, 1, 2].map((item) => (
        <div className="h-56 animate-pulse border border-line bg-surface" key={item} />
      ))}
    </div>
  );
}
