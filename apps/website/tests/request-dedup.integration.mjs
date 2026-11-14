import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const appDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const counts = new Map();
let failBranding = false;
let failHomepage = false;
const homepage = {
  presentation: { heroMedia: null, floatingVideo: null, statisticsMotionEnabled: true },
  statistics: [1, 2, 3, 4].map((slotNumber) => ({
    slotNumber,
    value: String(slotNumber),
    suffix: null,
  })),
  currentEvents: [],
  previousEvents: [],
  galleryPreview: null,
  partners: [],
};
const branding = {
  primaryLogo: null,
  alternateLogo: null,
  favicon: null,
  socialImage: null,
  publicEmail: null,
  publicPhone: null,
  whatsApp: null,
  publicAddress: null,
  socialLinks: {},
};

const api = http.createServer((request, response) => {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
  counts.set(pathname, (counts.get(pathname) ?? 0) + 1);
  if (
    (pathname === "/api/public/branding" && failBranding) ||
    (pathname === "/api/public/homepage" && failHomepage)
  ) {
    response.writeHead(503, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "intentional test failure" }));
    return;
  }
  const body =
    pathname === "/api/public/homepage"
      ? homepage
      : pathname === "/api/public/branding"
        ? branding
        : null;
  response.writeHead(body ? 200 : 404, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body ?? { error: "not found" }));
});

await listen(api);
const apiAddress = api.address();
assert(apiAddress && typeof apiAddress !== "string");
const websitePort = 3217;
const next = spawn(
  process.execPath,
  [
    path.join(appDirectory, "node_modules/next/dist/bin/next"),
    "start",
    "--port",
    String(websitePort),
  ],
  {
    cwd: appDirectory,
    env: { ...process.env, THE_DOMAIN_API_BASE_URL: `http://127.0.0.1:${apiAddress.port}` },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let diagnostics = "";
next.stdout.on("data", (chunk) => {
  diagnostics += chunk;
});
next.stderr.on("data", (chunk) => {
  diagnostics += chunk;
});

try {
  await waitForReady(`http://127.0.0.1:${websitePort}/robots.txt`, next);
  counts.clear();

  const first = await fetch(`http://127.0.0.1:${websitePort}/`);
  const html = await first.text();
  assert.equal(first.status, 200);
  assert.match(html, /Where unforgettable moments begin/);
  const footerIndex = html.indexOf("<footer");
  assert.ok(footerIndex > 0, "Initial HTML omitted the Footer.");
  for (const section of [
    "statistics",
    "events",
    "why",
    "previous",
    "gallery",
    "services",
    "partners",
    "contact",
  ]) {
    const marker = `data-home-section="${section}"`;
    assert.match(html, new RegExp(marker), `Initial HTML omitted the ${section} section.`);
    assert.ok(html.indexOf(marker) < footerIndex, `${section} was streamed after the Footer.`);
  }
  for (const heading of [
    "We create moments that move with you",
    "Experiences on the horizon",
    "Moments with their own afterlife",
    "From first idea to final atmosphere",
    "Created with trusted collaborators",
    "Let us create what comes next",
  ])
    assert.match(html, new RegExp(heading), `Initial HTML omitted ${heading}.`);
  assert.doesNotMatch(html, /sectionOrder|disabledSections/);
  assert.doesNotMatch(html, /Framing the experience/);
  assert.equal(
    counts.get("/api/public/homepage"),
    1,
    "Homepage getter executed more than once in one SSR request.",
  );
  assert.equal(
    counts.get("/api/public/branding"),
    1,
    "Branding getter executed more than once across metadata, Header, and Footer.",
  );

  const second = await fetch(`http://127.0.0.1:${websitePort}/`);
  await second.arrayBuffer();
  assert.equal(second.status, 200);
  assert.equal(
    counts.get("/api/public/homepage"),
    2,
    "A second SSR request did not create a new request scope.",
  );
  assert.equal(
    counts.get("/api/public/branding"),
    2,
    "Branding memoization leaked across SSR requests.",
  );
  failBranding = true;
  const brandingFailure = await fetch(`http://127.0.0.1:${websitePort}/`);
  const brandingFailureHtml = await brandingFailure.text();
  assert.equal(brandingFailure.status, 200);
  assert.match(brandingFailureHtml, /Where unforgettable moments begin/);
  assert.match(brandingFailureHtml, /the-domain-logo\.png/);
  assert.equal(
    counts.get("/api/public/branding"),
    3,
    "Branding failure was requested more than once.",
  );
  failBranding = false;

  failHomepage = true;
  const homepageFailure = await fetch(`http://127.0.0.1:${websitePort}/`);
  const homepageFailureHtml = await homepageFailure.text();
  assert.equal(homepageFailure.status, 200);
  assert.match(homepageFailureHtml, /Where unforgettable moments begin/);
  assert.match(homepageFailureHtml, /data-home-section="contact"/);
  assert.doesNotMatch(homepageFailureHtml, /Framing the experience/);
  assert.equal(
    counts.get("/api/public/homepage"),
    4,
    "Homepage failure escaped request-scoped deduplication.",
  );
  console.log("React.cache deduplicated Homepage and Branding once per production SSR request.");
} finally {
  next.kill();
  api.close();
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
}

async function waitForReady(url, process) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (process.exitCode !== null)
      throw new Error(`Next exited before becoming ready.\n${diagnostics}`);
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Next did not become ready.\n${diagnostics}`);
}
