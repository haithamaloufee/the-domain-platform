import { getPublicApiBaseUrl } from "@/lib/environment";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (
    !origin ||
    fetchSite === "cross-site" ||
    fetchSite === "same-site" ||
    (origin !== new URL(request.url).origin && !matchesBrowserHost(origin, request, fetchSite))
  ) {
    return Response.json({ message: "Please submit the form from this website." }, { status: 403 });
  }

  const body = await request.text();
  if (body.length > 16_384) {
    return Response.json({ message: "The message is too large." }, { status: 413 });
  }

  try {
    const response = await fetch(`${getPublicApiBaseUrl()}/api/public/contact`, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    if (response.status === 202) return new Response(null, { status: 202 });
    if (response.status === 400 || response.status === 429) {
      const message =
        response.status === 400
          ? "Check your name, email and message, then try again."
          : "Too many messages. Please try again in a minute.";
      return Response.json({ message }, { status: response.status });
    }
  } catch {
    // The form retains its values so visitors can retry.
  }
  return Response.json(
    { message: "The inbox is temporarily unavailable. Please try again shortly." },
    { status: 503 },
  );
}

function matchesBrowserHost(origin: string, request: Request, fetchSite: string | null) {
  try {
    const source = new URL(origin);
    return (
      source.host === request.headers.get("host") &&
      (fetchSite === "same-origin" || source.protocol === new URL(request.url).protocol)
    );
  } catch {
    return false;
  }
}
