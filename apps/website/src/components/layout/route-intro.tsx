import { Container, Section, SectionHeader } from "@the-domain/ui";
export interface RouteIntroProps {
  eyebrow: string;
  title: string;
  description: string;
}
export function RouteIntro(props: RouteIntroProps) {
  return (
    <Section>
      <Container>
        <SectionHeader {...props} />
        <div className="mt-14 border-t border-line pt-6 font-label text-xs uppercase tracking-[0.14em] text-ink-muted">
          Foundation route · Feature content arrives in a later sprint
        </div>
      </Container>
    </Section>
  );
}
