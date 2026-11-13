const input = process.env;
const api = new URL(input.THE_DOMAIN_API_BASE_URL ?? "");
if (api.protocol !== "https:" && !["127.0.0.1", "localhost"].includes(api.hostname)) {
  throw new Error("Use the HTTPS API or an isolated localhost environment.");
}
const email = input.THE_DOMAIN_IMPORT_EMAIL;
const password = input.THE_DOMAIN_IMPORT_PASSWORD;
if (!email || !password)
  throw new Error("Provide the import administrator credentials in the process environment.");

const event = {
  slug: "diana-karazon-live-2026",
  title: "Diana Karazon Live",
  shortDescription: "Diana Karazon performed at The Domain Theatre in Amman on 14 February 2026.",
  longDescription:
    "Diana Karazon appeared live at The Domain Theatre in King Hussein Business Park. The performance ran from 8 to 10 pm local time on 14 February 2026.",
  eventType: "Live music",
  startAtUtc: "2026-02-14T17:00:00Z",
  endAtUtc: "2026-02-14T19:00:00Z",
  timeZoneId: "Asia/Amman",
  city: "Amman",
  venueName: "The Domain Theatre",
  venueAddress: "King Hussein Business Park",
  bookingStatus: 4,
  isFeatured: false,
  showOnHomepage: true,
};

async function request(path, method = "GET", body, token) {
  const response = await fetch(new URL(path, api), {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`${method} ${path} returned HTTP ${response.status}`);
  return response.status === 204 ? null : response.json();
}

const session = await request("/api/auth/login", "POST", { email, password });
try {
  const events = await request("/api/admin/events", "GET", undefined, session.accessToken);
  const existing = events.find((item) => item.slug === event.slug);
  if (existing) {
    process.stdout.write(`Found existing record: ${event.slug}\n`);
  } else {
    const draft = await request("/api/admin/events", "POST", event, session.accessToken);
    if (process.argv.includes("--publish")) {
      await request(
        `/api/admin/events/${draft.id}/publish`,
        "POST",
        undefined,
        session.accessToken,
      );
      process.stdout.write(`Published archived event: ${event.slug}\n`);
    } else {
      process.stdout.write(`Created draft: ${event.slug}\n`);
    }
  }
} finally {
  await request("/api/auth/logout", "POST", { refreshToken: session.refreshToken });
}
