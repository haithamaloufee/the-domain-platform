export type AdminEventRequestErrorKind =
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "conflict"
  | "rate-limit"
  | "service-unavailable"
  | "unexpected";

export function eventRequestErrorKind(status: number): AdminEventRequestErrorKind {
  if (status === 400 || status === 422) return "validation";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not-found";
  if (status === 409) return "conflict";
  if (status === 429) return "rate-limit";
  if (status === 502 || status === 503 || status === 504) return "service-unavailable";
  return "unexpected";
}

export function eventRequestFallbackMessage(status: number): string {
  const kind = eventRequestErrorKind(status);
  if (kind === "rate-limit") return "Too many event requests. Please wait and try again.";
  if (kind === "service-unavailable") return "Event services are unavailable. Please try again.";
  return "Unable to complete the event request.";
}
