"use client";

import type { AdminPartner, CreatePartnerRequest } from "@the-domain/types";
import { Card, EmptyState, Input, Textarea, buttonClasses } from "@the-domain/ui";
import Image, { type ImageLoaderProps } from "next/image";
import { useEffect, useState } from "react";
import {
  CmsCheckbox,
  CmsFeedback,
  CmsField,
  CmsStatusBadge,
  ConfirmAction,
} from "@/components/cms/cms-controls";
import {
  createAdminPartner,
  deleteAdminPartner,
  hideAdminPartner,
  listAdminPartners,
  showAdminPartner,
  updateAdminPartner,
} from "@/lib/cms/admin-cms-client";

const emptyPartner: CreatePartnerRequest = {
  name: "",
  slug: "",
  logoUrl: null,
  websiteUrl: null,
  description: null,
  sortOrder: 0,
  isVisible: false,
  isFeatured: false,
};

export function PartnersManager() {
  const [items, setItems] = useState<AdminPartner[]>([]);
  const [editing, setEditing] = useState<AdminPartner | "create" | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [feedback, setFeedback] = useState<{ message: string; tone: "error" | "success" }>({
    message: "",
    tone: "success",
  });
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listAdminPartners()
      .then((values) => {
        if (!active) return;
        setItems(sortPartners(values));
        setState("ready");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setFeedback({
          message: error instanceof Error ? error.message : "Unable to load partners.",
          tone: "error",
        });
        setState("error");
      });
    return () => {
      active = false;
    };
  }, []);

  function replace(updated: AdminPartner) {
    setItems((current) =>
      sortPartners(current.map((item) => (item.id === updated.id ? updated : item))),
    );
  }

  async function runAction(id: string, action: () => Promise<AdminPartner>, message: string) {
    setBusyId(id);
    setFeedback({ message: "", tone: "success" });
    try {
      replace(await action());
      setFeedback({ message, tone: "success" });
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : "Unable to update the partner.",
        tone: "error",
      });
    } finally {
      setBusyId(null);
    }
  }

  if (state === "loading")
    return (
      <div
        aria-label="Loading partners"
        className="h-72 animate-pulse border border-line bg-surface"
        role="status"
      />
    );
  if (state === "error")
    return (
      <Card className="p-6 sm:p-8">
        <CmsFeedback message={feedback.message} tone="error" />
        <button
          className={buttonClasses("secondary", "mt-6")}
          onClick={() => location.reload()}
          type="button"
        >
          Try again
        </button>
      </Card>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-3xl text-sm leading-6 text-ink-muted">
          Only visible partners appear publicly. Logo URLs reference approved external assets; logo
          uploading remains in the media workflow, outside this sprint.
        </p>
        <button
          className={buttonClasses("primary", "shrink-0")}
          onClick={() => setEditing("create")}
          type="button"
        >
          Create partner
        </button>
      </div>

      <CmsFeedback message={feedback.message} tone={feedback.tone} />

      {editing && (
        <PartnerForm
          item={editing === "create" ? null : editing}
          onCancel={() => setEditing(null)}
          onSaved={(saved, created) => {
            setItems((current) =>
              sortPartners(
                created
                  ? [...current, saved]
                  : current.map((item) => (item.id === saved.id ? saved : item)),
              ),
            );
            setEditing(null);
            setFeedback({
              message: created ? "Partner created." : "Partner updated.",
              tone: "success",
            });
          }}
        />
      )}

      {items.length === 0 ? (
        <EmptyState
          title="No partners yet"
          description="Add verified partner details when they are available. No names, logos, or relationships are generated automatically."
        />
      ) : (
        <div className="border-t border-line">
          {items.map((item) => (
            <article
              className="grid gap-5 border-b border-x border-line bg-surface p-5 lg:grid-cols-[6rem_minmax(12rem,0.65fr)_minmax(0,1fr)_auto] lg:items-center"
              key={item.id}
            >
              <div className="flex h-20 items-center justify-center border border-line bg-canvas p-3">
                {item.logoUrl ? (
                  <Image
                    alt={`${item.name} logo`}
                    className="h-full w-full object-contain"
                    height={64}
                    loader={externalImageLoader}
                    src={item.logoUrl}
                    unoptimized
                    width={96}
                  />
                ) : (
                  <span className="font-label text-[0.625rem] uppercase tracking-[0.12em] text-ink-muted">
                    No logo
                  </span>
                )}
              </div>
              <div>
                <p className="font-label text-[0.625rem] uppercase tracking-[0.14em] text-gold">
                  Order {item.sortOrder}
                </p>
                <h2 className="mt-2 font-display text-xl font-bold text-ink">{item.name}</h2>
                <p className="mt-1 text-xs text-ink-muted">/{item.slug}</p>
              </div>
              <div>
                <div className="flex flex-wrap gap-2">
                  <CmsStatusBadge
                    active={item.isVisible}
                    activeLabel="Visible"
                    inactiveLabel="Hidden"
                  />
                  <CmsStatusBadge
                    active={item.isFeatured}
                    activeLabel="Featured"
                    inactiveLabel="Standard"
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-ink-muted">
                  {item.description || "No partner description."}
                </p>
                {item.websiteUrl && (
                  <a
                    className="mt-2 inline-block text-sm text-gold underline-offset-4 hover:underline"
                    href={item.websiteUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open website
                  </a>
                )}
              </div>
              <div className="flex flex-wrap gap-2 lg:max-w-72 lg:justify-end">
                <button
                  className={buttonClasses("secondary", "min-h-10 px-3")}
                  disabled={busyId === item.id}
                  onClick={() => setEditing(item)}
                  type="button"
                >
                  Edit
                </button>
                {item.isVisible ? (
                  <ConfirmAction
                    description="Hiding removes this partner from the public homepage while preserving the record and logo URL."
                    label="Hide"
                    onConfirm={() =>
                      runAction(item.id, () => hideAdminPartner(item.id), "Partner hidden.")
                    }
                    title={`Hide ${item.name}?`}
                  />
                ) : (
                  <button
                    className={buttonClasses("ghost", "min-h-10 px-3")}
                    disabled={busyId === item.id}
                    onClick={() =>
                      void runAction(
                        item.id,
                        () => showAdminPartner(item.id),
                        "Partner made visible.",
                      )
                    }
                    type="button"
                  >
                    Show
                  </button>
                )}
                <ConfirmAction
                  description="This is a reversible soft delete. The partner will be hidden, not removed from the database or external storage."
                  label="Soft delete"
                  onConfirm={() =>
                    runAction(
                      item.id,
                      () => deleteAdminPartner(item.id),
                      "Partner soft-deleted and hidden.",
                    )
                  }
                  title={`Soft-delete ${item.name}?`}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function PartnerForm({
  item,
  onCancel,
  onSaved,
}: {
  item: AdminPartner | null;
  onCancel: () => void;
  onSaved: (saved: AdminPartner, created: boolean) => void;
}) {
  const [fields, setFields] = useState<CreatePartnerRequest>(item ? toRequest(item) : emptyPartner);
  const [errors, setErrors] = useState<
    Partial<Record<"name" | "slug" | "logoUrl" | "websiteUrl" | "sortOrder", string>>
  >({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update<K extends keyof CreatePartnerRequest>(name: K, value: CreatePartnerRequest[K]) {
    setFields((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validatePartner(fields);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return setError("Please correct the highlighted fields.");
    setSaving(true);
    setError("");
    try {
      const request = normalizePartner(fields);
      const saved = item
        ? await updateAdminPartner(item.id, request)
        : await createAdminPartner(request);
      onSaved(saved, !item);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save the partner.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-6 sm:p-8">
      <form className="space-y-6" noValidate onSubmit={(event) => void submit(event)}>
        <div className="border-b border-line pb-5">
          <h2 className="font-display text-2xl font-bold text-ink">
            {item ? "Edit partner" : "Create partner"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            External URLs must use HTTP or HTTPS. This form does not upload logo files.
          </p>
        </div>
        <CmsFeedback message={error} tone="error" />
        <div className="grid gap-6 md:grid-cols-2">
          <CmsField error={errors.name} label="Name" name="partner-name" required>
            <Input
              id="partner-name"
              maxLength={150}
              onChange={(event) => update("name", event.target.value)}
              value={fields.name}
            />
          </CmsField>
          <CmsField
            error={errors.slug}
            hint="Lowercase letters, numbers, and single hyphens."
            label="Slug"
            name="partner-slug"
            required
          >
            <Input
              id="partner-slug"
              maxLength={160}
              onChange={(event) => update("slug", event.target.value)}
              value={fields.slug}
            />
          </CmsField>
          <CmsField error={errors.logoUrl} label="Logo URL" name="partner-logo">
            <Input
              id="partner-logo"
              maxLength={2_048}
              onChange={(event) => update("logoUrl", event.target.value)}
              placeholder="https://…"
              type="url"
              value={fields.logoUrl ?? ""}
            />
          </CmsField>
          <CmsField error={errors.websiteUrl} label="Website URL" name="partner-website">
            <Input
              id="partner-website"
              maxLength={2_048}
              onChange={(event) => update("websiteUrl", event.target.value)}
              placeholder="https://…"
              type="url"
              value={fields.websiteUrl ?? ""}
            />
          </CmsField>
          <CmsField
            error={errors.sortOrder}
            hint="Zero or a positive whole number."
            label="Sort order"
            name="partner-order"
            required
          >
            <Input
              id="partner-order"
              min={0}
              onChange={(event) => update("sortOrder", Number(event.target.value))}
              type="number"
              value={fields.sortOrder}
            />
          </CmsField>
          <div className="md:col-span-2">
            <CmsField label="Description" name="partner-description">
              <Textarea
                id="partner-description"
                maxLength={500}
                onChange={(event) => update("description", event.target.value)}
                value={fields.description ?? ""}
              />
            </CmsField>
          </div>
        </div>
        {fields.logoUrl && validAbsoluteUrl(fields.logoUrl) && (
          <div className="flex min-h-28 items-center justify-center border border-line bg-canvas p-5">
            <Image
              alt={`${fields.name || "Partner"} logo preview`}
              className="max-h-20 w-auto object-contain"
              height={80}
              loader={externalImageLoader}
              src={fields.logoUrl}
              unoptimized
              width={180}
            />
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <CmsCheckbox
            checked={fields.isVisible}
            description="Visible partners appear on the public homepage."
            label="Visible"
            name="partner-visible"
            onChange={(value) => update("isVisible", value)}
          />
          <CmsCheckbox
            checked={fields.isFeatured}
            description="Marks this partner for priority presentation."
            label="Featured"
            name="partner-featured"
            onChange={(value) => update("isFeatured", value)}
          />
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
          <button
            className={buttonClasses("ghost")}
            disabled={saving}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button className={buttonClasses("primary")} disabled={saving} type="submit">
            {saving ? "Saving…" : item ? "Save partner" : "Create partner"}
          </button>
        </div>
      </form>
    </Card>
  );
}

function validatePartner(fields: CreatePartnerRequest) {
  const errors: Partial<Record<"name" | "slug" | "logoUrl" | "websiteUrl" | "sortOrder", string>> =
    {};
  if (!fields.name.trim()) errors.name = "Name is required.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.slug))
    errors.slug = "Use lowercase letters, numbers, and single hyphens.";
  if (fields.logoUrl && !validAbsoluteUrl(fields.logoUrl))
    errors.logoUrl = "Enter an absolute HTTP(S) URL.";
  if (fields.websiteUrl && !validAbsoluteUrl(fields.websiteUrl))
    errors.websiteUrl = "Enter an absolute HTTP(S) URL.";
  if (!Number.isInteger(fields.sortOrder) || fields.sortOrder < 0)
    errors.sortOrder = "Enter a non-negative whole number.";
  return errors;
}

function validAbsoluteUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizePartner(fields: CreatePartnerRequest): CreatePartnerRequest {
  return {
    ...fields,
    name: fields.name.trim(),
    slug: fields.slug.trim(),
    logoUrl: fields.logoUrl?.trim() || null,
    websiteUrl: fields.websiteUrl?.trim() || null,
    description: fields.description?.trim() || null,
  };
}

function toRequest(item: AdminPartner): CreatePartnerRequest {
  return {
    name: item.name,
    slug: item.slug,
    logoUrl: item.logoUrl,
    websiteUrl: item.websiteUrl,
    description: item.description,
    sortOrder: item.sortOrder,
    isVisible: item.isVisible,
    isFeatured: item.isFeatured,
  };
}

function sortPartners(items: AdminPartner[]) {
  return [...items].sort(
    (left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name),
  );
}

function externalImageLoader({ src }: ImageLoaderProps) {
  return src;
}
