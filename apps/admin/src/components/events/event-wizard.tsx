"use client";

import {
  EventPublicationStatus,
  type AdminEventDetails,
  type AdminEventMediaItem,
} from "@the-domain/types";
import { buttonClasses, Card, InlineAlert, LoadingButton } from "@the-domain/ui";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  archiveAdminEvent,
  cancelAdminEvent,
  createAdminEvent,
  publishAdminEvent,
  updateAdminEvent,
} from "@/lib/events/admin-events-client";
import { listEventMedia } from "@/lib/media/admin-media-client";
import {
  firstInvalidField,
  initialWizardFields,
  routeAfterDraftCreation,
  toSaveEventRequest,
  validateWizardStep,
  wizardSteps,
  type EventWizardErrors,
  type EventWizardFieldName,
  type EventWizardFields,
  type WizardStepId,
} from "@/lib/events/event-wizard-model";
import { EventBasicStep } from "./event-basic-step";
import { EventMediaStep } from "./event-media-step";
import { EventPreview } from "./event-preview";
import { EventReviewStep } from "./event-review-step";
import { EventScheduleStep } from "./event-schedule-step";
import { EventWizardStepper } from "./event-wizard-stepper";

type ServerOperation = "idle" | "loading-media" | "creating" | "saving" | "publishing";

export function EventWizard({
  event: initialEvent,
  initialStep = "basic",
}: {
  event?: AdminEventDetails;
  initialStep?: WizardStepId;
}) {
  const [event, setEvent] = useState<AdminEventDetails | undefined>(initialEvent);
  const [fields, setFields] = useState<EventWizardFields>(() => initialWizardFields(initialEvent));
  const [currentStep, setCurrentStep] = useState<WizardStepId>(initialStep);
  const [completed, setCompleted] = useState<Set<WizardStepId>>(
    () => new Set(initialEvent ? ["basic", "schedule"] : []),
  );
  const [errors, setErrors] = useState<EventWizardErrors>({});
  const [operation, setOperation] = useState<ServerOperation>(
    initialEvent ? "loading-media" : "idle",
  );
  const [media, setMedia] = useState<AdminEventMediaItem[]>([]);
  const [mediaLoaded, setMediaLoaded] = useState(!initialEvent);
  const [mediaLoadFailed, setMediaLoadFailed] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draftNotice, setDraftNotice] = useState("");
  const [coverWarningAcknowledged, setCoverWarningAcknowledged] = useState(false);
  const requestGuard = useRef(false);

  useEffect(() => {
    if (!initialEvent) return;
    let active = true;
    listEventMedia(initialEvent.id)
      .then((items) => {
        if (!active) return;
        setMedia(items);
        setMediaLoaded(true);
        setMediaLoadFailed(false);
        setOperation("idle");
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load assigned media.");
        setMediaLoaded(true);
        setMediaLoadFailed(true);
        setOperation("idle");
      });
    return () => {
      active = false;
    };
  }, [initialEvent]);

  useEffect(() => {
    function warnBeforeUnload(unloadEvent: BeforeUnloadEvent) {
      if (!dirty) return;
      unloadEvent.preventDefault();
      unloadEvent.returnValue = "";
    }
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;
    function warnBeforeLinkNavigation(clickEvent: MouseEvent) {
      if (clickEvent.defaultPrevented || clickEvent.button !== 0) return;
      const target = clickEvent.target;
      const link = target instanceof Element ? target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank") return;
      if (new URL(link.href, window.location.href).href === window.location.href) return;
      if (!window.confirm("Leave this wizard? Unsaved local event changes will be lost.")) {
        clickEvent.preventDefault();
        clickEvent.stopPropagation();
      }
    }
    document.addEventListener("click", warnBeforeLinkNavigation, true);
    return () => document.removeEventListener("click", warnBeforeLinkNavigation, true);
  }, [dirty]);

  const handleMediaChange = useCallback((items: AdminEventMediaItem[]) => {
    setMedia(items);
    setMediaLoaded(true);
    setMediaLoadFailed(false);
  }, []);

  function update<K extends EventWizardFieldName>(field: K, value: EventWizardFields[K]) {
    setFields((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setError("");
    setNotice("");
    setDirty(true);
  }

  function showValidation(validationErrors: EventWizardErrors) {
    setErrors(validationErrors);
    setError("Please correct the highlighted fields before continuing.");
    const first = firstInvalidField(validationErrors);
    if (first) window.setTimeout(() => document.getElementById(first)?.focus(), 0);
  }

  function validate(step: "basic" | "schedule"): boolean {
    const validationErrors = validateWizardStep(fields, step);
    if (Object.keys(validationErrors).length === 0) return true;
    showValidation(validationErrors);
    return false;
  }

  async function persistFields(): Promise<AdminEventDetails | null> {
    if (requestGuard.current) return null;
    if (!validate("basic") || !validate("schedule")) return null;
    const request = toSaveEventRequest(fields);
    if (!request) {
      setError("The schedule could not be converted. Review the local dates, times, and timezone.");
      return null;
    }
    requestGuard.current = true;
    setOperation(event ? "saving" : "creating");
    setError("");
    setNotice("");
    try {
      const saved = event
        ? await updateAdminEvent(event.id, request)
        : await createAdminEvent(request);
      setEvent(saved);
      setFields((current) => ({ ...current, slug: saved.slug }));
      setDirty(false);
      if (!event) {
        setMedia([]);
        setMediaLoaded(true);
        setMediaLoadFailed(false);
        setDraftNotice("Draft saved. You can now add event media.");
        window.history.replaceState(null, "", routeAfterDraftCreation(saved.id));
      }
      return saved;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save this event.");
      return null;
    } finally {
      requestGuard.current = false;
      setOperation("idle");
    }
  }

  async function next() {
    const index = wizardSteps.findIndex((step) => step.id === currentStep);
    if (currentStep === "basic") {
      if (!validate("basic")) return;
      markComplete("basic");
      setCurrentStep("schedule");
      return;
    }
    if (currentStep === "schedule") {
      if (!validate("schedule")) return;
      const saved = await persistFields();
      if (!saved) return;
      markComplete("schedule");
      setCurrentStep("media");
      return;
    }
    if (currentStep === "media") {
      markComplete("media");
      setCurrentStep("review");
      return;
    }
    if (index < wizardSteps.length - 1) setCurrentStep(wizardSteps[index + 1]!.id);
  }

  function back() {
    const index = wizardSteps.findIndex((step) => step.id === currentStep);
    if (index > 0) setCurrentStep(wizardSteps[index - 1]!.id);
  }

  function selectStep(step: WizardStepId) {
    const target = wizardSteps.findIndex((item) => item.id === step);
    const current = wizardSteps.findIndex((item) => item.id === currentStep);
    if (target <= current) {
      setCurrentStep(step);
      setError("");
      return;
    }
    if (target === current + 1) void next();
  }

  function markComplete(step: WizardStepId) {
    setCompleted((current) => new Set(current).add(step));
  }

  async function saveWithoutTransition() {
    const saved = await persistFields();
    if (saved) setNotice("Event changes saved. Lifecycle was left unchanged.");
  }

  async function saveAndApplyLifecycle() {
    if (requestGuard.current) return;
    const saved = await persistFields();
    if (!saved) return;
    const target = fields.publicationStatus;
    if (saved.publicationStatus === target) {
      setNotice(target === EventPublicationStatus.Draft ? "Draft saved." : "Event changes saved.");
      return;
    }
    requestGuard.current = true;
    setOperation("publishing");
    setError("");
    try {
      const canonical =
        target === EventPublicationStatus.Published
          ? await publishAdminEvent(saved.id)
          : target === EventPublicationStatus.Cancelled
            ? await cancelAdminEvent(saved.id)
            : await archiveAdminEvent(saved.id);
      setEvent(canonical);
      setFields((current) => ({
        ...current,
        publicationStatus: canonical.publicationStatus,
        slug: canonical.slug,
      }));
      setDirty(false);
      setNotice(
        `${publicationLabel(canonical.publicationStatus)} confirmed by the server. Public slug: /events/${canonical.slug}`,
      );
    } catch (publishError) {
      setError(
        publishError instanceof Error ? publishError.message : "Unable to change event lifecycle.",
      );
    } finally {
      requestGuard.current = false;
      setOperation("idle");
    }
  }

  const pending = operation !== "idle";
  const canonicalStatus = event?.publicationStatus ?? EventPublicationStatus.Draft;
  const knownVenues = event?.venueName ? [event.venueName] : [];
  const cancelHref = event ? `/dashboard/events/${event.id}` : "/dashboard/events";
  const publicUrl =
    event?.publicationStatus === EventPublicationStatus.Published
      ? publicEventUrl(event.slug)
      : undefined;

  return (
    <div className="space-y-8">
      <EventWizardStepper completed={completed} current={currentStep} onSelect={selectStep} />
      {(error || notice) && (
        <div aria-live="polite" className="space-y-3">
          {error && <InlineAlert tone="error">{error}</InlineAlert>}
          {notice && <InlineAlert tone="success">{notice}</InlineAlert>}
        </div>
      )}

      {currentStep === "basic" && (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)] xl:items-start">
          <Card className="p-5 sm:p-8">
            <EventBasicStep
              canonicalSlug={event?.slug}
              errors={errors}
              fields={fields}
              isExisting={Boolean(event)}
              knownVenues={knownVenues}
              onChange={update}
            />
          </Card>
          <div className="xl:sticky xl:top-6">
            <EventPreview fields={fields} media={media} modes={false} />
          </div>
        </div>
      )}
      {currentStep === "schedule" && (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)] xl:items-start">
          <Card className="p-5 sm:p-8">
            <EventScheduleStep
              canonicalStatus={canonicalStatus}
              errors={errors}
              fields={fields}
              onChange={update}
            />
          </Card>
          <div className="xl:sticky xl:top-6">
            <EventPreview fields={fields} media={media} modes={false} />
          </div>
        </div>
      )}
      {currentStep === "media" && event && mediaLoaded && (
        <EventMediaStep
          event={event}
          initialItems={mediaLoadFailed ? undefined : media}
          notice={draftNotice}
          onItemsChange={handleMediaChange}
        />
      )}
      {currentStep === "media" && (!event || !mediaLoaded) && (
        <div className="h-80 animate-pulse border border-line bg-surface-raised" role="status">
          <span className="sr-only">Loading event media</span>
        </div>
      )}
      {currentStep === "review" && (
        <EventReviewStep
          coverWarningAcknowledged={coverWarningAcknowledged}
          eventId={event?.id}
          fields={fields}
          media={media}
          onAcknowledgeCoverWarning={setCoverWarningAcknowledged}
          onMediaChange={handleMediaChange}
          onPublish={() => void saveAndApplyLifecycle()}
          onSave={() => void saveWithoutTransition()}
          pending={pending}
          publicUrl={publicUrl}
          savedSlug={event?.slug ?? ""}
        />
      )}

      <footer className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link className={buttonClasses("ghost")} href={cancelHref}>
          Exit wizard
        </Link>
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          {currentStep !== "basic" && (
            <button
              className={buttonClasses("secondary")}
              disabled={pending}
              onClick={back}
              type="button"
            >
              Back
            </button>
          )}
          {currentStep !== "review" && (
            <LoadingButton
              disabled={currentStep === "media" && !mediaLoaded}
              onClick={() => void next()}
              pending={pending}
              pendingLabel={operation === "creating" ? "Saving draft…" : "Saving…"}
            >
              {currentStep === "schedule"
                ? "Save draft and continue"
                : currentStep === "media"
                  ? "Review event"
                  : "Continue"}
            </LoadingButton>
          )}
        </div>
      </footer>
    </div>
  );
}

function publicationLabel(status: AdminEventDetails["publicationStatus"]): string {
  if (status === EventPublicationStatus.Published) return "Publication";
  if (status === EventPublicationStatus.Cancelled) return "Cancellation";
  if (status === EventPublicationStatus.Archived) return "Archive";
  return "Draft save";
}

function publicEventUrl(slug: string): string | undefined {
  const configuredOrigin = process.env.NEXT_PUBLIC_WEBSITE_URL?.trim();
  const origin =
    configuredOrigin || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");
  if (!origin) return undefined;
  try {
    return new URL(`/events/${encodeURIComponent(slug)}`, origin).toString();
  } catch {
    return undefined;
  }
}
