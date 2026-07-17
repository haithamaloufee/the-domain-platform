"use client";

import type { AdminStatisticItem, UpdateStatisticRequest } from "@the-domain/types";
import { Card, Input, buttonClasses } from "@the-domain/ui";
import { useEffect, useState } from "react";
import { CmsCheckbox, CmsFeedback, CmsField } from "@/components/cms/cms-controls";
import {
  getStatisticsPresentation,
  listAdminStatistics,
  saveStatisticsPresentation,
  updateAdminStatistic,
} from "@/lib/cms/admin-cms-client";

const numericValue = /^[+-]?\d+(?:\.\d+)?$/;

export function StatisticsManager() {
  const [items, setItems] = useState<AdminStatisticItem[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; tone: "error" | "success" }>({
    message: "",
    tone: "success",
  });
  const [phrase, setPhrase] = useState({ phrase: "Moments that move with us", isEnabled: true });

  useEffect(() => {
    let active = true;
    Promise.all([listAdminStatistics(), getStatisticsPresentation()])
      .then(([statistics, presentation]) => {
        if (!active) return;
        setItems(sortSlots(statistics));
        setPhrase(presentation);
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

  function change<K extends keyof AdminStatisticItem>(
    id: string,
    name: K,
    value: AdminStatisticItem[K],
  ) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [name]: value } : item)),
    );
    setFeedback({ message: "", tone: "success" });
  }

  async function save(item: AdminStatisticItem) {
    if (!item.label.trim()) {
      setFeedback({ message: `Slot ${item.slotNumber}: label is required.`, tone: "error" });
      return;
    }
    if (!numericValue.test(item.value.trim())) {
      setFeedback({
        message: `Slot ${item.slotNumber}: enter numbers only in Value; put +, K, or % in Suffix.`,
        tone: "error",
      });
      return;
    }

    setBusyId(item.id);
    try {
      const saved = await updateAdminStatistic(item.id, toRequest(item));
      setItems((current) =>
        sortSlots(current.map((value) => (value.id === saved.id ? saved : value))),
      );
      setFeedback({ message: `Statistic slot ${item.slotNumber} saved.`, tone: "success" });
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : "Unable to save the statistic.",
        tone: "error",
      });
    } finally {
      setBusyId(null);
    }
  }

  if (state === "loading") {
    return (
      <div
        aria-label="Loading statistics"
        className="h-72 animate-pulse border border-line bg-surface"
        role="status"
      />
    );
  }
  if (state === "error") {
    return (
      <Card className="p-6">
        <CmsFeedback message={feedback.message} tone="error" />
        <button
          className={buttonClasses("secondary", "mt-5")}
          onClick={() => location.reload()}
          type="button"
        >
          Try again
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border border-line bg-surface p-5">
        <p className="max-w-3xl text-sm leading-6 text-ink-muted">
          The homepage always uses these four permanent slots in this fixed order. Edit the label,
          numeric value, and suffix; slots cannot be added, hidden, deleted, or reordered.
        </p>
      </div>

      <CmsFeedback message={feedback.message} tone={feedback.tone} />

      <Card className="p-6">
        <h2 className="font-display text-2xl font-bold text-ink">Scroll-path phrase</h2>
        <p className="mt-2 text-sm text-ink-muted">
          This phrase follows the gold path behind the four statistics. Reduced-motion visitors see
          the same phrase in a static position.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto]">
          <Input
            aria-label="Statistics path phrase"
            maxLength={180}
            onChange={(event) => setPhrase({ ...phrase, phrase: event.target.value })}
            value={phrase.phrase}
          />
          <CmsCheckbox
            checked={phrase.isEnabled}
            description="Show the path phrase publicly."
            label="Enabled"
            name="statistics-phrase-enabled"
            onChange={(value) => setPhrase({ ...phrase, isEnabled: value })}
          />
        </div>
        <button
          className={buttonClasses("secondary", "mt-4")}
          onClick={() =>
            void saveStatisticsPresentation({ ...phrase, phrase: phrase.phrase.trim() })
              .then((saved) => {
                setPhrase(saved);
                setFeedback({ message: "Statistics path phrase saved.", tone: "success" });
              })
              .catch((error: unknown) =>
                setFeedback({
                  message: error instanceof Error ? error.message : "Unable to save the phrase.",
                  tone: "error",
                }),
              )
          }
          type="button"
        >
          Save phrase
        </button>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {items.map((item) => (
          <Card className="p-5 sm:p-6" key={item.id}>
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <p className="font-label text-[0.6875rem] uppercase tracking-[0.14em] text-gold">
                  Permanent slot {item.slotNumber}
                </p>
                <h2 className="mt-1 font-display text-xl font-bold text-ink">{item.label}</h2>
              </div>
              <p className="font-display text-3xl font-bold text-ink">
                {item.value}
                {item.suffix}
              </p>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_.55fr_.45fr]">
              <CmsField label="Label" name={`stat-label-${item.id}`} required>
                <Input
                  id={`stat-label-${item.id}`}
                  maxLength={100}
                  onChange={(event) => change(item.id, "label", event.target.value)}
                  value={item.label}
                />
              </CmsField>
              <CmsField
                hint="Numeric text only"
                label="Value"
                name={`stat-value-${item.id}`}
                required
              >
                <Input
                  id={`stat-value-${item.id}`}
                  inputMode="decimal"
                  maxLength={50}
                  onChange={(event) => change(item.id, "value", event.target.value)}
                  value={item.value}
                />
              </CmsField>
              <CmsField hint="+, K, %" label="Suffix" name={`stat-suffix-${item.id}`}>
                <Input
                  id={`stat-suffix-${item.id}`}
                  maxLength={20}
                  onChange={(event) => change(item.id, "suffix", event.target.value || null)}
                  value={item.suffix ?? ""}
                />
              </CmsField>
            </div>
            <div className="mt-5 flex justify-end border-t border-line pt-4">
              <button
                className={buttonClasses("primary")}
                disabled={busyId === item.id}
                onClick={() => void save(item)}
                type="button"
              >
                {busyId === item.id ? "Saving…" : `Save slot ${item.slotNumber}`}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function toRequest(item: AdminStatisticItem): UpdateStatisticRequest {
  return {
    label: item.label.trim(),
    value: item.value.trim(),
    suffix: item.suffix?.trim() || null,
    description: null,
    sortOrder: item.slotNumber - 1,
    isVisible: true,
    isVerified: true,
  };
}

function sortSlots(items: AdminStatisticItem[]) {
  return [...items].sort((left, right) => left.slotNumber - right.slotNumber);
}
