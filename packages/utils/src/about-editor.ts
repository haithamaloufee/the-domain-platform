export type AboutPreviewMode = "desktop" | "tablet" | "mobile";
export function safeAboutHref(value: string): boolean {
  const input = value.trim();
  if (input.startsWith("/") && !input.startsWith("//")) return true;
  try {
    return ["https:", "mailto:", "tel:"].includes(new URL(input).protocol);
  } catch {
    return false;
  }
}
export function moveAboutItem<T>(items: readonly T[], from: number, to: number): T[] {
  if (from < 0 || to < 0 || from >= items.length || to >= items.length) return [...items];
  const result = [...items];
  const [item] = result.splice(from, 1);
  if (item !== undefined) result.splice(to, 0, item);
  return result;
}
export function aboutChanged<T>(canonical: T, current: T): boolean {
  return JSON.stringify(canonical) !== JSON.stringify(current);
}
export function aboutPreviewWidth(mode: AboutPreviewMode): string {
  return mode === "mobile" ? "max-w-xs" : mode === "tablet" ? "max-w-2xl" : "max-w-full";
}
