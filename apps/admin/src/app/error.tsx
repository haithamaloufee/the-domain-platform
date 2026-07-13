"use client";
import { Button, EmptyState } from "@the-domain/ui";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="p-gutter">
      <EmptyState
        title="Admin workspace unavailable"
        description="Retry the current operation. No changes have been submitted."
        action={<Button onClick={reset}>Try again</Button>}
      />
    </main>
  );
}
