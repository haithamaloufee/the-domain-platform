import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [url, executablePath, screenshotPath, widthSource = "390", heightSource = "844"] =
  process.argv.slice(2);
if (!url || !executablePath) {
  throw new Error(
    "Usage: node collect-browser-metrics.mjs <url> <browser-executable> [screenshot-path]",
  );
}

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const playwrightPath = process.env.THE_DOMAIN_PLAYWRIGHT_PATH || findWorkspacePlaywright();
const playwright = await import(pathToFileURL(playwrightPath).href);

function findWorkspacePlaywright() {
  const pnpmDirectory = path.join(repositoryRoot, "node_modules/.pnpm");
  const playwrightDirectory = fs.existsSync(pnpmDirectory)
    ? fs
        .readdirSync(pnpmDirectory, { withFileTypes: true })
        .find((entry) => entry.isDirectory() && entry.name.startsWith("playwright@"))
    : undefined;
  if (!playwrightDirectory) {
    throw new Error("Set THE_DOMAIN_PLAYWRIGHT_PATH to the installed Playwright index.mjs.");
  }
  return path.join(pnpmDirectory, playwrightDirectory.name, "node_modules/playwright/index.mjs");
}

const viewport = { width: Number(widthSource), height: Number(heightSource) };
const browser = await playwright.chromium.launch({ executablePath, headless: true });
const context = await browser.newContext({ viewport });
const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];
const requests = [];
let loadedAt = Number.POSITIVE_INFINITY;
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => pageErrors.push(error.message));
page.on("request", (request) => {
  requests.push({ at: Date.now(), type: request.resourceType(), url: request.url() });
});
page.on("load", () => {
  loadedAt = Date.now();
});
await page.addInitScript(() => {
  window.__domainMetrics = { cls: 0, lcp: 0, longTasks: 0 };
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__domainMetrics.lcp = entry.startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) window.__domainMetrics.cls += entry.value;
    }
  }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((list) => {
    window.__domainMetrics.longTasks += list.getEntries().length;
  }).observe({ type: "longtask", buffered: true });
});

try {
  const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForTimeout(5_000);
  const runtime = await page.evaluate(() => ({
    ...window.__domainMetrics,
    navigationEntries: performance.getEntriesByType("navigation").length,
    sections: document.querySelectorAll("[data-home-section]").length,
    footerPresent: Boolean(document.querySelector("footer")),
    resourceBytes: performance
      .getEntriesByType("resource")
      .reduce((total, entry) => total + (entry.transferSize || 0), 0),
  }));
  const initialRequests = [...requests];
  const idleRequests = initialRequests.filter((request) => request.at > loadedAt + 2_000);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  if (viewport.width < 768) {
    await page.getByRole("button", { name: "Open navigation menu" }).click();
  }
  await page.locator("[data-home-logo]").click();
  await page
    .waitForFunction(() => window.scrollY <= 1, undefined, { timeout: 5_000 })
    .catch(() => {});
  const logoResult = await page.evaluate(() => ({
    menuExpanded:
      document
        .querySelector('button[aria-controls="mobile-navigation"]')
        ?.getAttribute("aria-expanded") ?? "false",
    navigationEntries: performance.getEntriesByType("navigation").length,
    scrollY: window.scrollY,
  }));
  if (screenshotPath && screenshotPath !== "-") {
    await page.screenshot({ path: screenshotPath, fullPage: true });
  }
  await page.goto(new URL("/about", url).href, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForTimeout(500);
  const internalNavigationEntries = await page.evaluate(
    () => performance.getEntriesByType("navigation").length,
  );
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.locator("[data-home-logo]").click();
  await page.waitForURL(new URL("/", url).href, { timeout: 10_000 });
  await page
    .waitForFunction(() => window.scrollY <= 1, undefined, { timeout: 5_000 })
    .catch(() => {});
  await page.waitForTimeout(250);
  const internalLogoResult = await page.evaluate(() => ({
    navigationEntries: performance.getEntriesByType("navigation").length,
    overlayPresent: Boolean(document.querySelector("[data-route-transition-overlay]")),
    pathname: window.location.pathname,
    scrollY: window.scrollY,
  }));
  console.log(
    JSON.stringify({
      status: response?.status() ?? null,
      lcpMs: Math.round(runtime.lcp * 10) / 10,
      cls: Math.round(runtime.cls * 10_000) / 10_000,
      longTasks: runtime.longTasks,
      sections: runtime.sections,
      footerPresent: runtime.footerPresent,
      requests: initialRequests.length,
      mediaRequests: initialRequests.filter((request) => ["image", "media"].includes(request.type))
        .length,
      idleRequestsAfterTwoSeconds: idleRequests.length,
      idleRequestTypes: [...new Set(idleRequests.map((request) => request.type))],
      resourceTransferBytes: runtime.resourceBytes,
      consoleErrors,
      pageErrors,
      logoScrollY: logoResult.scrollY,
      logoHardReloaded: logoResult.navigationEntries !== runtime.navigationEntries,
      mobileMenuClosed: logoResult.menuExpanded === "false",
      internalLogoPathname: internalLogoResult.pathname,
      internalLogoScrollY: internalLogoResult.scrollY,
      internalLogoHardReloaded: internalLogoResult.navigationEntries !== internalNavigationEntries,
      navigationOverlayStuck: internalLogoResult.overlayPresent,
    }),
  );
} finally {
  await browser.close();
}
