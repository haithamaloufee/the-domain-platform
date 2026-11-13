import type { Metadata } from "next";
import { Container, Section } from "@the-domain/ui";
import { ContactForm } from "@/components/contact/contact-form";
import { getPublicBranding } from "@/lib/public-api";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Contact",
  description:
    "Contact The Domain Entertainment about productions, partnerships and events in Jordan.",
  path: "/contact",
});

export default async function ContactPage() {
  const branding = await getPublicBranding().catch(() => null);
  return (
    <Section className="architectural-grid">
      <Container className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
        <header>
          <h1 className="type-page-heading text-ink">Start a conversation.</h1>
          <p className="type-body-lead mt-6 max-w-lg text-ink-muted">
            Get in touch about productions, venue enquiries, partnerships or an upcoming show.
          </p>
          {branding?.publicEmail && (
            <a
              className="mt-7 inline-flex min-h-11 items-center text-gold"
              href={`mailto:${branding.publicEmail}`}
            >
              {branding.publicEmail}
            </a>
          )}
        </header>
        <ContactForm />
      </Container>
    </Section>
  );
}
