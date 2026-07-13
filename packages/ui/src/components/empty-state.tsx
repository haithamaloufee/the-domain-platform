import type { ReactNode } from "react";
import { Card } from "./card";
export interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="flex min-h-64 flex-col items-start justify-center p-8 sm:p-12">
      <span aria-hidden="true" className="mb-6 h-px w-12 bg-gold" />
      <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
      <p className="mt-3 max-w-xl leading-7 text-ink-muted">{description}</p>
      {action && <div className="mt-7">{action}</div>}
    </Card>
  );
}
