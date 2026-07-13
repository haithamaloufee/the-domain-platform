import { EmptyState } from "@the-domain/ui";
export function AdminPlaceholder({ title, description }: { title: string; description: string }) {
  return <EmptyState title={title} description={description} />;
}
