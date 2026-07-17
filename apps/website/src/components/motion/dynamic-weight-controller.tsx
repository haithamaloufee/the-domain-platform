type DynamicWeightKind = "heading" | "body" | "action" | "label" | "statistic";

export function DynamicText({ children }: { children: string; kind?: DynamicWeightKind }) {
  return <span className="dynamic-text">{children}</span>;
}
