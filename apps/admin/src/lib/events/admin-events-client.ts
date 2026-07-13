import type {
  AdminEventDetails,
  AdminEventErrorResponse,
  AdminEventListItem,
  CreateEventRequest,
  UpdateEventRequest,
} from "@the-domain/types";
import { parseAdminEvent, parseAdminEvents } from "./event-contract";

export function listAdminEvents(): Promise<AdminEventListItem[]> {
  return request("/api/admin/events", { method: "GET" }, parseAdminEvents);
}

export function getAdminEvent(id: string): Promise<AdminEventDetails> {
  return request(`/api/admin/events/${encodeURIComponent(id)}`, { method: "GET" }, parseAdminEvent);
}

export function createAdminEvent(input: CreateEventRequest): Promise<AdminEventDetails> {
  return request(
    "/api/admin/events",
    { method: "POST", headers: jsonHeaders, body: JSON.stringify(input) },
    parseAdminEvent,
  );
}

export function updateAdminEvent(
  id: string,
  input: UpdateEventRequest,
): Promise<AdminEventDetails> {
  return request(
    `/api/admin/events/${encodeURIComponent(id)}`,
    { method: "PUT", headers: jsonHeaders, body: JSON.stringify(input) },
    parseAdminEvent,
  );
}

export function publishAdminEvent(id: string): Promise<AdminEventDetails> {
  return runAction(id, "publish");
}

export function archiveAdminEvent(id: string): Promise<AdminEventDetails> {
  return runAction(id, "archive");
}

export function cancelAdminEvent(id: string): Promise<AdminEventDetails> {
  return runAction(id, "cancel");
}

const jsonHeaders = { "Content-Type": "application/json" };

function runAction(id: string, action: "publish" | "archive" | "cancel") {
  return request(
    `/api/admin/events/${encodeURIComponent(id)}/${action}`,
    { method: "POST" },
    parseAdminEvent,
  );
}

async function request<T>(
  path: string,
  init: RequestInit,
  parse: (value: unknown) => T,
): Promise<T> {
  const response = await fetch(path, { ...init, cache: "no-store" });
  const value = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const error = value as Partial<AdminEventErrorResponse> | null;
    throw new Error(error?.message ?? "Unable to complete the event request.");
  }

  return parse(value);
}
