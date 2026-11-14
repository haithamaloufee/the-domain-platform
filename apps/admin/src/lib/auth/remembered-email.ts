const rememberedEmailStorageKey = "the-domain.admin.remembered-email";

export type RememberedEmailStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">;

export function readRememberedEmail(storage = getBrowserStorage()): string {
  try {
    return storage?.getItem(rememberedEmailStorageKey)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function rememberEmail(email: string, storage = getBrowserStorage()): void {
  const normalizedEmail = email.trim();
  try {
    if (normalizedEmail) storage?.setItem(rememberedEmailStorageKey, normalizedEmail);
    else storage?.removeItem(rememberedEmailStorageKey);
  } catch {
    // Storage can be unavailable in hardened browser contexts; sign-in remains functional.
  }
}

export function forgetRememberedEmail(storage = getBrowserStorage()): void {
  try {
    storage?.removeItem(rememberedEmailStorageKey);
  } catch {
    // Storage can be unavailable in hardened browser contexts; sign-in remains functional.
  }
}

function getBrowserStorage(): Storage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}
