import "server-only";

import type { AdminUser } from "@the-domain/types";
import { redirect } from "next/navigation";
import { getCurrentUserFromBackend, readUser } from "./backend-auth";
import { readAuthTokens } from "./auth-cookies";

export async function getAdminSession(): Promise<AdminUser | null> {
  const { accessToken } = await readAuthTokens();
  if (!accessToken) return null;

  try {
    const response = await getCurrentUserFromBackend(accessToken);
    return response.ok ? await readUser(response) : null;
  } catch {
    return null;
  }
}

export async function requireAdminSession(): Promise<AdminUser> {
  const { accessToken } = await readAuthTokens();
  if (!accessToken) redirect("/login");

  try {
    const response = await getCurrentUserFromBackend(accessToken);
    if (response.ok) return await readUser(response);
  } catch {
    redirect("/login?reason=unavailable");
  }

  redirect("/login?reason=expired");
}
