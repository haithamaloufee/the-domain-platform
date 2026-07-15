import { wizardSteps, type WizardStepId } from "@/lib/events/event-wizard-model";

export function EventWizardStepper({
  completed,
  current,
  onSelect,
}: {
  completed: ReadonlySet<WizardStepId>;
  current: WizardStepId;
  onSelect: (step: WizardStepId) => void;
}) {
  const currentIndex = wizardSteps.findIndex((step) => step.id === current);
  return (
    <nav aria-label="Event creation progress" className="overflow-x-auto border-y border-line">
      <ol className="grid min-w-[44rem] grid-cols-4">
        {wizardSteps.map((step, index) => {
          const isCurrent = step.id === current;
          const isCompleted = completed.has(step.id) || index < currentIndex;
          return (
            <li className="border-r border-line last:border-r-0" key={step.id}>
              <button
                aria-current={isCurrent ? "step" : undefined}
                className={`min-h-20 w-full px-4 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-gold ${
                  isCurrent ? "bg-gold/10" : "hover:bg-surface-raised"
                }`}
                onClick={() => onSelect(step.id)}
                type="button"
              >
                <span className="block font-label text-[0.6875rem] uppercase tracking-[0.14em] text-gold">
                  {isCompleted && !isCurrent ? "Complete" : `Step ${index + 1}`}
                </span>
                <span className="mt-1 block text-sm font-semibold text-ink">{step.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
