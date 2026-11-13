import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "../..");
const apiUrl = process.env.THE_DOMAIN_API_BASE_URL || "http://127.0.0.1:5187";
const website = "http://127.0.0.1:3187";
const admin = "http://127.0.0.1:3188";
const artifactPath = path.join(root, ".cache", "browser-smoke");
const axePath = process.env.THE_DOMAIN_AXE_PATH;
await mkdir(artifactPath, { recursive: true });

const playwright = await import(
  process.env.THE_DOMAIN_PLAYWRIGHT_PATH
    ? pathToFileURL(process.env.THE_DOMAIN_PLAYWRIGHT_PATH).href
    : "playwright"
);
const services = [
  ["website", "3187"],
  ["admin", "3188"],
].map(([app, port]) => {
  const cwd = path.join(root, "apps", app);
  return spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", port],
    {
      cwd,
      env: { ...process.env, THE_DOMAIN_API_BASE_URL: apiUrl },
      stdio: "inherit",
    },
  );
});

let browser;
try {
  await Promise.all([ready(website), ready(admin)]);
  browser = await playwright.chromium.launch({
    executablePath: process.env.THE_DOMAIN_BROWSER_EXECUTABLE,
  });
  for (const width of [320, 390, 768, 1024, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const [route, heading] of [
      ["/", /Where unforgettable moments begin/i],
      ["/events", "Events"],
      ["/gallery", "Gallery"],
      ["/about", /./],
      ["/services", /./],
      ["/contact", "Start a conversation."],
    ]) {
      const response = await page.goto(website + route);
      assert.equal(response?.status(), 200, route);
      await page.getByRole("heading", { level: 1, name: heading }).waitFor();
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `${route} overflows at ${width}px`,
      );
      if (axePath && [390, 1440].includes(width)) {
        await page.addScriptTag({ path: axePath });
        const critical = await page.evaluate(async () => {
          const results = await window.axe.run(document, {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
          });
          return results.violations
            .filter((violation) => violation.impact === "critical")
            .map((violation) => violation.id);
        });
        assert.deepEqual(
          critical,
          [],
          `${route} has critical accessibility violations at ${width}px`,
        );
      }
      if (route === "/" && [390, 1440].includes(width)) {
        await page.screenshot({ path: path.join(artifactPath, `home-${width}.png`) });
        assert.equal(await page.locator("video[src]").count(), 0);
        if (width === 390) {
          const menu = page.getByRole("button", { name: /menu/i });
          await menu.click();
          assert.equal(await menu.getAttribute("aria-expanded"), "true");
          await page.keyboard.press("Escape");
          assert.equal(await menu.getAttribute("aria-expanded"), "false");
        }
      }
    }
    assert.deepEqual(errors, []);
    await page.close();
  }

  const page = await browser.newPage();
  const missing = await page.goto(`${website}/qa-route-does-not-exist`);
  assert.equal(missing?.status(), 404);
  const collectionId = process.env.THE_DOMAIN_QA_COLLECTION_ID;
  if (collectionId) {
    const collection = await page.goto(`${website}/gallery/${encodeURIComponent(collectionId)}`);
    assert.equal(collection?.status(), 200);
    assert.equal(await page.getByRole("button", { name: /open (image|video)/i }).count(), 18);
    const firstMedia = page.getByRole("button", { name: /open image/i }).first();
    await firstMedia.click();
    await page.getByRole("dialog").waitFor();
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    await page.getByRole("link", { name: "More highlights" }).click();
    await page.waitForURL((url) => url.searchParams.get("offset") === "18");
    assert.equal(await page.getByRole("button", { name: /open (image|video)/i }).count(), 2);
    await page.getByRole("link", { name: "Previous highlights" }).click();
    await page.waitForURL((url) => url.searchParams.get("offset") === "0");
  }
  const archiveSlug = process.env.THE_DOMAIN_QA_ARCHIVE_SLUG;
  if (archiveSlug) {
    const archive = await page.goto(`${website}/events/${encodeURIComponent(archiveSlug)}`);
    assert.equal(archive?.status(), 200);
    assert.equal(await page.getByRole("link", { name: /book now/i }).count(), 0);
  }
  const bookingSlug = process.env.THE_DOMAIN_QA_BOOKING_SLUG;
  if (bookingSlug) {
    const bookingPage = await browser.newPage();
    await bookingPage.clock.install();
    const booking = await bookingPage.goto(`${website}/events/${encodeURIComponent(bookingSlug)}`);
    assert.equal(booking?.status(), 200);
    const book = bookingPage.getByRole("link", { name: /book now/i });
    await book.waitFor();
    assert.match((await book.getAttribute("href")) ?? "", /^https:\/\//);
    await bookingPage.clock.fastForward(15 * 60 * 1000);
    await bookingPage.getByText("Booking closed", { exact: true }).first().waitFor();
    assert.equal(await book.count(), 0);
    await bookingPage.close();
  }
  await page.goto(`${admin}/dashboard`);
  await page.waitForURL((url) => url.pathname === "/login");
  await page.screenshot({ path: path.join(artifactPath, "admin-login.png") });

  const password = process.env.THE_DOMAIN_QA_PASSWORD_FILE
    ? await readFile(process.env.THE_DOMAIN_QA_PASSWORD_FILE, "utf8")
    : process.env.THE_DOMAIN_QA_PASSWORD;
  if (password && process.env.THE_DOMAIN_QA_EMAIL) {
    await page.getByLabel("Email address", { exact: false }).fill(process.env.THE_DOMAIN_QA_EMAIL);
    await page.locator("#admin-password").fill(password);
    const submitted = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === "/api/auth/login" &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: /sign in/i }).click();
    const loginResponse = await submitted;
    assert.equal(loginResponse.status(), 200, "Admin sign-in returned an error");
    await page.waitForURL((url) => url.pathname === "/dashboard");
    await page.getByRole("heading", { name: "Operations" }).waitFor();
    await page.screenshot({ path: path.join(artifactPath, "admin-dashboard.png") });
    await page.goto(`${website}/contact`);
    await page.getByLabel("Name", { exact: true }).fill("Browser QA");
    await page.getByLabel("Email", { exact: true }).fill("browser-qa@example.invalid");
    await page.getByLabel("Tell us what you have in mind").fill("Disposable browser QA enquiry.");
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await page.getByText("Your message has been received.").waitFor();
    await page.goto(`${admin}/dashboard/messages`);
    await page.getByText("Disposable browser QA enquiry.").first().waitFor();
    for (const route of [
      "events",
      "media",
      "gallery",
      "homepage",
      "about",
      "partners",
      "statistics",
      "messages",
      "discounts",
      "users",
      "settings",
    ]) {
      const response = await page.goto(`${admin}/dashboard/${route}`);
      assert.equal(response?.status(), 200, route);
      assert.equal(new URL(page.url()).pathname, `/dashboard/${route}`);
    }
    await page.getByRole("button", { name: /sign out|log out/i }).click();
    await page.waitForURL((url) => url.pathname === "/login");
    await page.goto(`${admin}/dashboard`);
    await page.waitForURL((url) => url.pathname === "/login");
  }
  console.log("Browser smoke checks passed.");
} finally {
  await browser?.close();
  for (const service of services) service.kill();
}

async function ready(url) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(1_000),
      redirect: "manual",
    }).catch(() => null);
    if (response?.ok || response?.status === 307) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`${url} did not start.`);
}
