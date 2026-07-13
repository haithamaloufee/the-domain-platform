import { buttonClasses, SectionHeader } from "@the-domain/ui";
import Link from "next/link";
import { EventsList } from "@/components/events/events-list";

export default function Page() {
  return (
    <div className="mx-auto max-w-[90rem]">
      <div className="flex flex-col items-start justify-between gap-8 border-b border-line pb-9 sm:flex-row sm:items-end">
        <SectionHeader
          eyebrow="Programming"
          title="Event directory"
          description="Create, schedule, publish, and maintain The Domain’s event catalogue."
        />
        <Link className={buttonClasses("primary", "shrink-0")} href="/dashboard/events/new">
          Create event
        </Link>
      </div>
      <section aria-labelledby="events-list-title" className="pt-8">
        <h2 className="sr-only" id="events-list-title">
          Managed events
        </h2>
        <EventsList />
      </section>
    </div>
  );
}
