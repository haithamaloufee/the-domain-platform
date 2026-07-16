import type { UpdateBrandingSettingsRequest } from "@the-domain/types";
import { parseBrandingSettings } from "./branding-contract";
export async function getBrandingSettings() {
  return request({ method: "GET" });
}
export async function updateBrandingSettings(input: UpdateBrandingSettingsRequest) {
  return request({
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
async function request(init: RequestInit) {
  const response = await fetch("/api/admin/branding", {
    ...init,
    credentials: "same-origin",
    headers: { Accept: "application/json", ...init.headers },
  });
  if (!response.ok) {
    const value = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(value?.detail || "Branding Settings could not be saved.");
  }
  return parseBrandingSettings(await response.json());
}
