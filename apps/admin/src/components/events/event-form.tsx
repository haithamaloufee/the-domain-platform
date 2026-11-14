"use client";

import type { AdminEventDetails } from "@the-domain/types";
import { EventWizard } from "./event-wizard";
import type { WizardStepId } from "@/lib/events/event-wizard-model";

// Kept as a compatibility boundary for existing imports while the experience is now a wizard.
export function EventForm({
  event,
  initialStep,
}: {
  event?: AdminEventDetails;
  initialStep?: WizardStepId;
}) {
  return <EventWizard event={event} initialStep={initialStep} />;
}
