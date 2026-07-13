import type {
  AdminHomepageContent,
  AdminPartner,
  AdminStatisticItem,
  CreatePartnerRequest,
  CreateStatisticRequest,
  UpdateHomepageContentRequest,
  UpdatePartnerRequest,
  UpdateStatisticRequest,
} from "@the-domain/types";
import {
  parseAdminHomepage,
  parseAdminPartner,
  parseAdminPartners,
  parseAdminStatistic,
  parseAdminStatistics,
} from "./cms-contract";

const jsonHeaders = { "Content-Type": "application/json" };

export function getAdminHomepage(): Promise<AdminHomepageContent | null> {
  return request("/api/admin/homepage", { method: "GET" }, parseAdminHomepage);
}

export function updateAdminHomepage(
  input: UpdateHomepageContentRequest,
): Promise<AdminHomepageContent> {
  return request(
    "/api/admin/homepage",
    { method: "PUT", headers: jsonHeaders, body: JSON.stringify(input) },
    requiredHomepage,
  );
}

export function listAdminStatistics(): Promise<AdminStatisticItem[]> {
  return request("/api/admin/statistics", { method: "GET" }, parseAdminStatistics);
}

export function createAdminStatistic(input: CreateStatisticRequest): Promise<AdminStatisticItem> {
  return request(
    "/api/admin/statistics",
    { method: "POST", headers: jsonHeaders, body: JSON.stringify(input) },
    parseAdminStatistic,
  );
}

export function updateAdminStatistic(id: string, input: UpdateStatisticRequest) {
  return request(
    `/api/admin/statistics/${encodeURIComponent(id)}`,
    { method: "PUT", headers: jsonHeaders, body: JSON.stringify(input) },
    parseAdminStatistic,
  );
}

export function showAdminStatistic(id: string) {
  return statisticAction(id, "show", "POST");
}

export function hideAdminStatistic(id: string) {
  return statisticAction(id, "hide", "POST");
}

export function deleteAdminStatistic(id: string) {
  return statisticAction(id, "", "DELETE");
}

export function listAdminPartners(): Promise<AdminPartner[]> {
  return request("/api/admin/partners", { method: "GET" }, parseAdminPartners);
}

export function createAdminPartner(input: CreatePartnerRequest): Promise<AdminPartner> {
  return request(
    "/api/admin/partners",
    { method: "POST", headers: jsonHeaders, body: JSON.stringify(input) },
    parseAdminPartner,
  );
}

export function updateAdminPartner(id: string, input: UpdatePartnerRequest) {
  return request(
    `/api/admin/partners/${encodeURIComponent(id)}`,
    { method: "PUT", headers: jsonHeaders, body: JSON.stringify(input) },
    parseAdminPartner,
  );
}

export function showAdminPartner(id: string) {
  return partnerAction(id, "show", "POST");
}

export function hideAdminPartner(id: string) {
  return partnerAction(id, "hide", "POST");
}

export function deleteAdminPartner(id: string) {
  return partnerAction(id, "", "DELETE");
}

function statisticAction(id: string, action: "show" | "hide" | "", method: "POST" | "DELETE") {
  const suffix = action ? `/${action}` : "";
  return request(
    `/api/admin/statistics/${encodeURIComponent(id)}${suffix}`,
    { method },
    parseAdminStatistic,
  );
}

function partnerAction(id: string, action: "show" | "hide" | "", method: "POST" | "DELETE") {
  const suffix = action ? `/${action}` : "";
  return request(
    `/api/admin/partners/${encodeURIComponent(id)}${suffix}`,
    { method },
    parseAdminPartner,
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
    const message =
      typeof value === "object" &&
      value !== null &&
      "message" in value &&
      typeof value.message === "string"
        ? value.message
        : "Unable to complete the content request.";
    throw new Error(message);
  }
  return parse(value);
}

function requiredHomepage(value: unknown): AdminHomepageContent {
  const content = parseAdminHomepage(value);
  if (!content) throw new Error("The server did not return the saved homepage content.");
  return content;
}
