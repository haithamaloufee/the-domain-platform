import Link from "next/link";
import { EmptyState, buttonClasses } from "@the-domain/ui";
export default function NotFound() {
  return (
    <main className="p-gutter">
      <EmptyState
        title="Admin route not found"
        description="This operations route does not exist."
        action={
          <Link className={buttonClasses()} href="/dashboard">
            Dashboard
          </Link>
        }
      />
    </main>
  );
}
