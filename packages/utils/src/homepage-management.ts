export function moveHomepageItem<T extends { id: string; sortOrder: number }>(
  items: readonly T[],
  id: string,
  direction: -1 | 1,
): T[] {
  const next = [...items];
  const index = next.findIndex((item) => item.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= next.length) return next;
  const [moved] = next.splice(index, 1);
  if (moved) next.splice(target, 0, moved);
  return next.map((item, sortOrder) => ({ ...item, sortOrder }));
}
export function statisticsPhraseRequest(phrase: string, isEnabled: boolean) {
  return { phrase: phrase.trim(), isEnabled };
}
export function partnerLogoEligible(item: {
  mediaType: number;
  approvalStatus: number;
  isArchived: boolean;
  url: string;
}): boolean {
  return (
    item.mediaType === 1 &&
    item.approvalStatus === 2 &&
    !item.isArchived &&
    item.url.startsWith("https://")
  );
}
