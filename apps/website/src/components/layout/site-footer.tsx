import Link from "next/link";
import { Container } from "@the-domain/ui";
export function SiteFooter() {
  return (
    <footer className="border-t border-line py-10">
      <Container className="flex flex-col justify-between gap-6 text-sm text-ink-muted sm:flex-row">
        <p>© {new Date().getFullYear()} The Domain Entertainment Company.</p>
        <div className="flex gap-6">
          <Link className="hover:text-gold" href="/contact">
            Contact
          </Link>
          <Link className="hover:text-gold" href="/about">
            About
          </Link>
        </div>
      </Container>
    </footer>
  );
}
