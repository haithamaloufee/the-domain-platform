import { SectionHeader } from "@the-domain/ui";
import { EditEventScreen } from "@/components/events/edit-event-screen";
import { wizardSteps, type WizardStepId } from "@/lib/events/event-wizard-model";

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { id } = await params;
  const requestedStep = (await searchParams).step;
  const initialStep = wizardSteps.some((step) => step.id === requestedStep)
    ? (requestedStep as WizardStepId)
    : "basic";
  return (
    <div className="mx-auto max-w-[96rem]">
      <SectionHeader
        eyebrow="Event directory"
        title="Edit event"
        description="Move through public information, schedule, media, and review without losing the event’s canonical state."
      />
      <div className="mt-10">
        <EditEventScreen eventId={id} initialStep={initialStep} />
      </div>
    </div>
  );
}
