import type { AdminUser } from "@the-domain/types";
import { parseAdminUser } from "./backend-auth";

export const validatedAdminUserHeader = "x-the-domain-validated-admin-user";

export function serializeValidatedAdminUser(user: AdminUser): string {
  return encodeURIComponent(JSON.stringify(user));
}

export function parseValidatedAdminUser(value: string | null): AdminUser | null {
  if (!value) return null;

  try {
    return parseAdminUser(JSON.parse(decodeURIComponent(value)) as unknown);
  } catch {
    return null;
  }
}
