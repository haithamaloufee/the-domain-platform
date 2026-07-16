import type {
  AdminAboutSettings,
  AdminTeamMember,
  SaveAboutSettingsRequest,
  SaveTeamMemberRequest,
} from "@the-domain/types";
import { parseAbout, parseTeam, parseTeamMember } from "./about-contract";
const headers = { "Content-Type": "application/json" };
async function request<T>(
  url: string,
  init: RequestInit,
  parse: (value: unknown) => T,
): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const value = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error("Unable to save About content. Check the highlighted fields and try again.");
  return parse(value);
}
export const getAbout = (): Promise<AdminAboutSettings | null> =>
  request("/api/admin/about", { method: "GET" }, parseAbout);
export const saveAbout = (input: SaveAboutSettingsRequest): Promise<AdminAboutSettings> =>
  request("/api/admin/about", { method: "PUT", headers, body: JSON.stringify(input) }, (value) => {
    const parsed = parseAbout(value);
    if (!parsed) throw new Error("Invalid About response.");
    return parsed;
  });
export const listTeam = (): Promise<AdminTeamMember[]> =>
  request("/api/admin/team", { method: "GET" }, parseTeam);
export const createTeam = (input: SaveTeamMemberRequest) =>
  request(
    "/api/admin/team",
    { method: "POST", headers, body: JSON.stringify(input) },
    parseTeamMember,
  );
export const updateTeam = (id: string, input: SaveTeamMemberRequest) =>
  request(
    `/api/admin/team/${encodeURIComponent(id)}`,
    { method: "PUT", headers, body: JSON.stringify(input) },
    parseTeamMember,
  );
export const teamVisibility = (id: string, visible: boolean) =>
  request(
    `/api/admin/team/${encodeURIComponent(id)}/${visible ? "show" : "hide"}`,
    { method: "POST" },
    parseTeamMember,
  );
export const reorderTeam = (ids: string[]) =>
  request(
    "/api/admin/team/reorder",
    { method: "POST", headers, body: JSON.stringify({ ids }) },
    parseTeam,
  );
export async function deleteTeam(id: string) {
  const response = await fetch(`/api/admin/team/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Unable to delete Team member.");
}
