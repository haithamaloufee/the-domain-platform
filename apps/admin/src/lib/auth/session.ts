import "server-only";

import type { AdminUser } from "@the-domain/types";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getCurrentUserFromBackend, readUser } from "./backend-auth";
import { readAuthTokens } from "./auth-cookies";

export const getAdminSession = cache(async (): Promise<AdminUser | null> => {
  const { accessToken } = await readAuthTokens();
  if (!accessToken) return null;

  try {
    const response = await getCurrentUserFromBackend(accessToken);
    return response.ok ? await readUser(response) : null;
  } catch {
    return null;
  }
});

export async function requireAdminSession(): Promise<AdminUser> {
  const user = await getAdminSession();
  if (user) return user;
  redirect("/login?reason=expired");
}
