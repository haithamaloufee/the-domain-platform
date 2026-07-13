import { cn } from "@the-domain/utils";

export function CinematicReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("cinematic-reveal", className)}>{children}</div>;
}
