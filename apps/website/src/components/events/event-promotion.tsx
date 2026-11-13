import { getPublicApiBaseUrl } from "@/lib/environment";

export async function EventPromotion({ slug }: { slug: string }) {
  let promotion: { enabled?: boolean; percent?: number; text?: string };
  try {
    const response = await fetch(
      `${getPublicApiBaseUrl()}/api/public/promotions/${encodeURIComponent(slug)}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(2_000),
      },
    );
    if (!response.ok) return null;
    promotion = await response.json();
  } catch {
    return null;
  }
  if (
    !promotion?.enabled ||
    typeof promotion.text !== "string" ||
    !Number.isInteger(promotion.percent) ||
    promotion.percent! < 1 ||
    promotion.percent! > 100
  )
    return null;

  return (
    <aside className="mb-12 max-w-xl border-l-2 border-gold bg-surface p-5">
      <h2 className="text-lg font-semibold">{promotion.percent}% ticket offer</h2>
      <p className="mt-2 text-ink-muted">{promotion.text}</p>
    </aside>
  );
}
