import Link from "next/link";
import { Container, EmptyState, Section, buttonClasses } from "@the-domain/ui";
export default function NotFound() {
  return (
    <Section>
      <Container>
        <EmptyState
          title="This page is outside the frame"
          description="The address may have changed or the content is no longer available."
          action={
            <Link className={buttonClasses()} href="/">
              Return home
            </Link>
          }
        />
      </Container>
    </Section>
  );
}
