import { THE_DOMAIN_SITE_NAME } from "@the-domain/utils/site-identity";

export interface LoginBranding {
  siteName: typeof THE_DOMAIN_SITE_NAME;
  logoUrl: string | null;
}

export function resolveLoginBranding(value: unknown): LoginBranding {
  const primaryLogo = isRecord(value) && isRecord(value.primaryLogo) ? value.primaryLogo : null;
  const logoUrl =
    primaryLogo &&
    typeof primaryLogo.url === "string" &&
    primaryLogo.url.startsWith("https://")
      ? primaryLogo.url
      : null;

  return { siteName: THE_DOMAIN_SITE_NAME, logoUrl };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
