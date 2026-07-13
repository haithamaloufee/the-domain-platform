import { Button, Card, Input } from "@the-domain/ui";
export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-16">
      <Card className="w-full max-w-md p-8 sm:p-10">
        <p className="font-label text-xs uppercase tracking-[0.16em] text-gold">
          Restricted access
        </p>
        <h1 className="mt-5 font-display text-4xl font-bold tracking-[-0.04em]">Admin sign in</h1>
        <p className="mt-4 leading-7 text-ink-muted">
          The interface is prepared for backend authentication. This form does not submit
          credentials in Sprint 5.
        </p>
        <form className="mt-9 space-y-6">
          <div>
            <label className="font-label text-xs uppercase tracking-[0.1em]" htmlFor="email">
              Email
            </label>
            <Input autoComplete="email" disabled id="email" type="email" />
          </div>
          <div>
            <label className="font-label text-xs uppercase tracking-[0.1em]" htmlFor="password">
              Password
            </label>
            <Input autoComplete="current-password" disabled id="password" type="password" />
          </div>
          <Button className="w-full" disabled type="submit">
            Sign in
          </Button>
        </form>
      </Card>
    </main>
  );
}
