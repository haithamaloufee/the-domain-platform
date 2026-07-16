import { Card } from "@the-domain/ui";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { readAuthTokens } from "@/lib/auth/auth-cookies";
import { loginErrorMessages } from "@/lib/auth/login-errors";
import { getAdminSession } from "@/lib/auth/session";
import { fetchBackend } from "@/lib/auth/backend-auth";
import Image from "next/image";

export const dynamic = "force-dynamic";

const reasonMessages: Readonly<Record<string, string>> = {
  expired: "Your session expired. Please sign in again.",
  unavailable: loginErrorMessages.serviceUnavailable,
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  if (await getAdminSession()) redirect("/dashboard");

  const { refreshToken } = await readAuthTokens();
  if (refreshToken && !reason) redirect("/dashboard");
  const branding = await loadLoginBranding();

  return (
    <main
      className="relative isolate grid min-h-screen place-items-center overflow-hidden px-4 py-8 sm:px-6 sm:py-12 lg:px-10"
      id="admin-content"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,color-mix(in_srgb,var(--td-color-gold)_8%,transparent),transparent_32%)]"
      />
      <div className="grid w-full max-w-6xl overflow-hidden border border-line bg-surface lg:min-h-[42rem] lg:grid-cols-[minmax(0,0.92fr)_minmax(28rem,1.08fr)]">
        <section className="relative flex flex-col justify-between border-b border-line bg-canvas p-7 sm:p-10 lg:border-b-0 lg:border-r lg:p-12">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-10 bg-gold" />
              <p className="font-label text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                {branding.logoUrl ? (
                  <Image
                    alt={`${branding.siteName} logo`}
                    className="h-12 w-auto object-contain"
                    height={48}
                    width={190}
                    src={branding.logoUrl}
                  />
                ) : (
                  branding.siteName
                )}
              </p>
            </div>
            <h1 className="mt-8 max-w-xl font-display text-[clamp(2.5rem,8vw,4.5rem)] font-bold leading-[0.95] tracking-[-0.055em] text-ink">
              Content control, without the noise.
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-7 text-ink-muted sm:text-base">
              A focused workspace for managing The Domain events, media, and public experience.
            </p>
          </div>

          <div className="mt-10 grid gap-4 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-1">
            <SecurityNote
              label="Private access"
              text="Available only to authorized staff accounts."
            />
            <SecurityNote
              label="Protected session"
              text="Credentials are exchanged through the secure admin service."
            />
          </div>
        </section>

        <section className="flex items-center bg-surface-raised p-5 sm:p-10 lg:p-14">
          <Card className="relative w-full border-0 bg-transparent p-0">
            <span
              aria-hidden="true"
              className="absolute -left-5 top-0 h-14 w-px bg-gold sm:-left-10 lg:-left-14"
            />
            <p className="font-label text-xs font-semibold uppercase tracking-[0.16em] text-gold">
              Restricted access
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.035em] text-ink sm:text-4xl">
              Sign in to continue
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-ink-muted sm:text-base sm:leading-7">
              Use your authorized staff email and password. Your password is never stored in this
              browser.
            </p>
            <LoginForm initialMessage={reason ? reasonMessages[reason] : undefined} />
          </Card>
        </section>
      </div>
    </main>
  );
}

async function loadLoginBranding() {
  try {
    const response = await fetchBackend("/api/public/branding", {
      method: "GET",
      cache: "no-store",
    });
    if (!response.ok) throw new Error();
    const value = (await response.json()) as {
      siteName?: unknown;
      primaryLogo?: { url?: unknown } | null;
    };
    return {
      siteName:
        typeof value.siteName === "string" && value.siteName ? value.siteName : "The Domain",
      logoUrl:
        typeof value.primaryLogo?.url === "string" && value.primaryLogo.url.startsWith("https://")
          ? value.primaryLogo.url
          : null,
    };
  } catch {
    return { siteName: "The Domain", logoUrl: null };
  }
}

function SecurityNote({ label, text }: { label: string; text: string }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-3">
      <span aria-hidden="true" className="mt-2 size-1.5 bg-gold" />
      <div>
        <p className="font-label text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink">
          {label}
        </p>
        <p className="mt-1 text-xs leading-5 text-ink-muted">{text}</p>
      </div>
    </div>
  );
}
