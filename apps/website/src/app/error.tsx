"use client";
import { Button, Container, EmptyState, Section } from "@the-domain/ui";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Section>
      <Container>
        <EmptyState
          title="The experience paused unexpectedly"
          description="Please retry this page. If the issue continues, return to the main navigation."
          action={<Button onClick={reset}>Try again</Button>}
        />
      </Container>
    </Section>
  );
}
