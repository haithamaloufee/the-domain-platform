"use client";

import type { AdminStatisticItem, CreateStatisticRequest } from "@the-domain/types";
import { Card, EmptyState, Input, Textarea, buttonClasses } from "@the-domain/ui";
import { useEffect, useState } from "react";
import {
  CmsCheckbox,
  CmsFeedback,
  CmsField,
  CmsStatusBadge,
  ConfirmAction,
} from "@/components/cms/cms-controls";
import {
  createAdminStatistic,
  deleteAdminStatistic,
  hideAdminStatistic,
  listAdminStatistics,
  showAdminStatistic,
  updateAdminStatistic,
} from "@/lib/cms/admin-cms-client";

const emptyStatistic: CreateStatisticRequest = {
  label: "",
  value: "",
  suffix: null,
  description: null,
  sortOrder: 0,
  isVisible: false,
  isVerified: false,
};

export function StatisticsManager() {
  const [items, setItems] = useState<AdminStatisticItem[]>([]);
  const [editing, setEditing] = useState<AdminStatisticItem | "create" | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [feedback, setFeedback] = useState<{ message: string; tone: "error" | "success" }>({
    message: "",
    tone: "success",
  });
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listAdminStatistics()
      .then((values) => {
        if (!active) return;
        setItems(sortStatistics(values));
        setState("ready");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setFeedback({
          message: error instanceof Error ? error.message : "Unable to load statistics.",
          tone: "error",
        });
        setState("error");
      });
    return () => {
      active = false;
    };
  }, []);

  function replace(updated: AdminStatisticItem) {
    setItems((current) =>
      sortStatistics(current.map((item) => (item.id === updated.id ? updated : item))),
    );
  }

  async function runAction(id: string, action: () => Promise<AdminStatisticItem>, message: string) {
    setBusyId(id);
    setFeedback({ message: "", tone: "success" });
    try {
      replace(await action());
      setFeedback({ message, tone: "success" });
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : "Unable to update the statistic.",
        tone: "error",
      });
    } finally {
      setBusyId(null);
    }
  }

  if (state === "loading") return <ManagerLoading label="statistics" />;
  if (state === "error") return <LoadError feedback={feedback.message} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-3xl text-sm leading-6 text-ink-muted">
          Only records that are both <strong className="text-ink">visible</strong> and{" "}
          <strong className="text-ink">verified</strong> appear publicly. Verification is an
          editorial approval, not an analytics calculation.
        </p>
        <button
          className={buttonClasses("primary", "shrink-0")}
          onClick={() => setEditing("create")}
          type="button"
        >
          Create statistic
        </button>
      </div>

      <CmsFeedback message={feedback.message} tone={feedback.tone} />

      {editing && (
        <StatisticForm
          item={editing === "create" ? null : editing}
          onCancel={() => setEditing(null)}
          onSaved={(saved, created) => {
            setItems((current) =>
              sortStatistics(
                created
                  ? [...current, saved]
                  : current.map((item) => (item.id === saved.id ? saved : item)),
              ),
            );
            setEditing(null);
            setFeedback({
              message: created ? "Statistic created." : "Statistic updated.",
              tone: "success",
            });
          }}
        />
      )}

      {items.length === 0 ? (
        <EmptyState
          title="No statistics yet"
          description="Create a statistic when a factual value is ready for editorial review. Nothing is fabricated or published by default."
        />
      ) : (
        <div className="border-t border-line">
          {items.map((item) => (
            <article
              className="grid gap-5 border-b border-x border-line bg-surface p-5 lg:grid-cols-[5rem_minmax(12rem,0.7fr)_minmax(0,1fr)_auto] lg:items-center"
              key={item.id}
            >
              <div>
                <span className="font-label text-[0.625rem] uppercase tracking-[0.14em] text-ink-muted">
                  Order
                </span>
                <p className="mt-1 font-display text-2xl font-bold text-gold">{item.sortOrder}</p>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-ink">{item.label}</h2>
                <p className="mt-2 text-2xl font-semibold text-ink">
                  {item.value}
                  {item.suffix}
                </p>
              </div>
              <div>
                <div className="flex flex-wrap gap-2">
                  <CmsStatusBadge
                    active={item.isVisible}
                    activeLabel="Visible"
                    inactiveLabel="Hidden"
                  />
                  <CmsStatusBadge
                    active={item.isVerified}
                    activeLabel="Verified"
                    inactiveLabel="Unverified"
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-ink-muted">
                  {item.description || "No supporting description."}
                </p>
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
                    description="Hiding removes this statistic from the public homepage while preserving it for later editing."
                    label="Hide"
                    onConfirm={() =>
                      runAction(item.id, () => hideAdminStatistic(item.id), "Statistic hidden.")
                    }
                    title={`Hide ${item.label}?`}
                  />
                ) : (
                  <button
                    className={buttonClasses("ghost", "min-h-10 px-3")}
                    disabled={busyId === item.id}
                    onClick={() =>
                      void runAction(
                        item.id,
                        () => showAdminStatistic(item.id),
                        "Statistic made visible.",
                      )
                    }
                    type="button"
                  >
                    Show
                  </button>
                )}
                <ConfirmAction
                  description="This is a reversible soft delete. The statistic will be hidden, not removed from the database."
                  label="Soft delete"
                  onConfirm={() =>
                    runAction(
                      item.id,
                      () => deleteAdminStatistic(item.id),
                      "Statistic soft-deleted and hidden.",
                    )
                  }
                  title={`Soft-delete ${item.label}?`}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function StatisticForm({
  item,
  onCancel,
  onSaved,
}: {
  item: AdminStatisticItem | null;
  onCancel: () => void;
  onSaved: (saved: AdminStatisticItem, created: boolean) => void;
}) {
  const [fields, setFields] = useState<CreateStatisticRequest>(
    item ? toRequest(item) : emptyStatistic,
  );
  const [errors, setErrors] = useState<Partial<Record<"label" | "value" | "sortOrder", string>>>(
    {},
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update<K extends keyof CreateStatisticRequest>(
    name: K,
    value: CreateStatisticRequest[K],
  ) {
    setFields((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateStatistic(fields);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return setError("Please correct the highlighted fields.");
    setSaving(true);
    setError("");
    try {
      const request = normalizeStatistic(fields);
      const saved = item
        ? await updateAdminStatistic(item.id, request)
        : await createAdminStatistic(request);
      onSaved(saved, !item);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save the statistic.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-6 sm:p-8">
      <form className="space-y-6" noValidate onSubmit={(event) => void submit(event)}>
        <div className="border-b border-line pb-5">
          <h2 className="font-display text-2xl font-bold text-ink">
            {item ? "Edit statistic" : "Create statistic"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            Values remain private unless both visibility and verification are enabled.
          </p>
        </div>
        <CmsFeedback message={error} tone="error" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <CmsField error={errors.label} label="Label" name="stat-label" required>
            <Input
              id="stat-label"
              maxLength={100}
              onChange={(event) => update("label", event.target.value)}
              value={fields.label}
            />
          </CmsField>
          <CmsField error={errors.value} label="Value" name="stat-value" required>
            <Input
              id="stat-value"
              maxLength={50}
              onChange={(event) => update("value", event.target.value)}
              value={fields.value}
            />
          </CmsField>
          <CmsField label="Suffix" name="stat-suffix">
            <Input
              id="stat-suffix"
              maxLength={20}
              onChange={(event) => update("suffix", event.target.value)}
              value={fields.suffix ?? ""}
            />
          </CmsField>
          <CmsField
            error={errors.sortOrder}
            hint="Zero or a positive whole number."
            label="Sort order"
            name="stat-order"
            required
          >
            <Input
              id="stat-order"
              min={0}
              onChange={(event) => update("sortOrder", Number(event.target.value))}
              type="number"
              value={fields.sortOrder}
            />
          </CmsField>
          <div className="md:col-span-2">
            <CmsField label="Description" name="stat-description">
              <Textarea
                id="stat-description"
                maxLength={500}
                onChange={(event) => update("description", event.target.value)}
                value={fields.description ?? ""}
              />
            </CmsField>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <CmsCheckbox
            checked={fields.isVisible}
            description="Visibility is required for public display."
            label="Visible"
            name="stat-visible"
            onChange={(value) => update("isVisible", value)}
          />
          <CmsCheckbox
            checked={fields.isVerified}
            description="Confirm that this value is factually approved."
            label="Verified"
            name="stat-verified"
            onChange={(value) => update("isVerified", value)}
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
            {saving ? "Saving…" : item ? "Save statistic" : "Create statistic"}
          </button>
        </div>
      </form>
    </Card>
  );
}

function validateStatistic(fields: CreateStatisticRequest) {
  const errors: Partial<Record<"label" | "value" | "sortOrder", string>> = {};
  if (!fields.label.trim()) errors.label = "Label is required.";
  if (!fields.value.trim()) errors.value = "Value is required.";
  if (!Number.isInteger(fields.sortOrder) || fields.sortOrder < 0)
    errors.sortOrder = "Enter a non-negative whole number.";
  return errors;
}

function normalizeStatistic(fields: CreateStatisticRequest): CreateStatisticRequest {
  return {
    ...fields,
    label: fields.label.trim(),
    value: fields.value.trim(),
    suffix: fields.suffix?.trim() || null,
    description: fields.description?.trim() || null,
  };
}

function toRequest(item: AdminStatisticItem): CreateStatisticRequest {
  return {
    label: item.label,
    value: item.value,
    suffix: item.suffix,
    description: item.description,
    sortOrder: item.sortOrder,
    isVisible: item.isVisible,
    isVerified: item.isVerified,
  };
}

function sortStatistics(items: AdminStatisticItem[]) {
  return [...items].sort(
    (left, right) => left.sortOrder - right.sortOrder || left.label.localeCompare(right.label),
  );
}

function ManagerLoading({ label }: { label: string }) {
  return (
    <div
      aria-label={`Loading ${label}`}
      className="h-72 animate-pulse border border-line bg-surface"
      role="status"
    />
  );
}

function LoadError({ feedback }: { feedback: string }) {
  return (
    <Card className="p-6 sm:p-8">
      <CmsFeedback message={feedback} tone="error" />
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
