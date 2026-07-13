import { Card } from "@the-domain/ui";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getAdminSession } from "@/lib/auth/session";

const reasonMessages: Readonly<Record<string, string>> = {
  expired: "Your session expired. Please sign in again.",
  unavailable: "Unable to connect to the server. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  if (await getAdminSession()) redirect("/dashboard");
  const { reason } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center px-5 py-16">
      <Card className="relative w-full max-w-md overflow-hidden p-8 sm:p-10">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gold" />
        <p className="font-label text-xs uppercase tracking-[0.16em] text-gold">
          Restricted access
        </p>
        <h1 className="mt-5 font-display text-4xl font-bold tracking-[-0.04em]">Admin sign in</h1>
        <p className="mt-4 leading-7 text-ink-muted">
          Sign in with your authorized Domain staff account to continue to content operations.
        </p>
        <LoginForm initialMessage={reason ? reasonMessages[reason] : undefined} />
      </Card>
    </main>
  );
}
