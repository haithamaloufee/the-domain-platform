import "server-only";

import type { AdminUser } from "@the-domain/types";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUserFromBackend, readUser } from "./backend-auth";
import { readAuthTokens } from "./auth-cookies";
import { parseValidatedAdminUser, validatedAdminUserHeader } from "./validated-user";

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
  const requestHeaders = await headers();
  const user = parseValidatedAdminUser(requestHeaders.get(validatedAdminUserHeader));
  if (user) return user;
  redirect("/login?reason=expired");
}
