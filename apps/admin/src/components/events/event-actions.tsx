"use client";

import { EventPublicationStatus, type AdminEventDetails } from "@the-domain/types";
import { buttonClasses } from "@the-domain/ui";
import { useState } from "react";
import {
  archiveAdminEvent,
  cancelAdminEvent,
  publishAdminEvent,
} from "@/lib/events/admin-events-client";

type EventAction = "publish" | "archive" | "cancel";

interface EventActionsProps {
  event: AdminEventDetails;
  onChanged: (event: AdminEventDetails) => void;
  onError?: (message: string) => void;
}

const actionLabels: Record<EventAction, string> = {
  publish: "Publish",
  archive: "Archive",
  cancel: "Cancel event",
};

export function EventActions({ event, onChanged, onError }: EventActionsProps) {
  const [pendingAction, setPendingAction] = useState<EventAction | null>(null);
  const actions = availableActions(event);

  async function run(action: EventAction) {
    const confirmed = window.confirm(confirmationMessage(action, event.title));
    if (!confirmed) return;

    setPendingAction(action);
    onError?.("");
    try {
      const updated = await actionRequest(action, event.id);
      onChanged(updated);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Unable to update this event.");
    } finally {
      setPendingAction(null);
    }
  }

  if (actions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2" aria-label={`Actions for ${event.title}`}>
      {actions.map((action) => (
        <button
          className={buttonClasses(
            action === "publish" ? "primary" : "secondary",
            "min-h-11 px-3 text-[0.625rem]",
          )}
          disabled={pendingAction !== null}
          key={action}
          onClick={() => void run(action)}
          type="button"
        >
          {pendingAction === action ? "Working…" : actionLabels[action]}
        </button>
      ))}
    </div>
  );
}

function availableActions(event: AdminEventDetails): EventAction[] {
  if (event.publicationStatus === EventPublicationStatus.Archived) return [];
  if (event.publicationStatus === EventPublicationStatus.Draft)
    return ["publish", "archive", "cancel"];
  if (event.publicationStatus === EventPublicationStatus.Published) return ["archive", "cancel"];
  return ["archive"];
}

function actionRequest(action: EventAction, id: string) {
  if (action === "publish") return publishAdminEvent(id);
  if (action === "archive") return archiveAdminEvent(id);
  return cancelAdminEvent(id);
}

function confirmationMessage(action: EventAction, title: string): string {
  if (action === "publish") return `Publish “${title}” to the public website?`;
  if (action === "archive") return `Archive “${title}”? It will no longer be publicly visible.`;
  return `Cancel “${title}”? This will mark the event as cancelled.`;
}
