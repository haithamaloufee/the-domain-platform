export const countUpDurationMs = 1_450;
export const snakeVelocityLimit = 24;
export const snakeMotionEpsilon = 0.04;

export interface SnakeMotionState {
  offset: number;
  targetVelocity: number;
  velocity: number;
}

export interface NavigationIntent {
  altKey: boolean;
  button: number;
  ctrlKey: boolean;
  currentHref: string;
  download: boolean;
  href: string;
  metaKey: boolean;
  shiftKey: boolean;
  target: string | null;
}

export type LogoNavigationAction = "ignore" | "navigate" | "refresh";

export function getLogoNavigationAction(
  pathname: string,
  intent: Pick<NavigationIntent, "altKey" | "button" | "ctrlKey" | "metaKey" | "shiftKey">,
): LogoNavigationAction {
  if (intent.button !== 0 || intent.altKey || intent.ctrlKey || intent.metaKey || intent.shiftKey)
    return "ignore";
  return pathname === "/" ? "refresh" : "navigate";
}

export function runLogoNavigationAction(
  action: LogoNavigationAction,
  effects: { closeMenu: () => void; refresh: () => void; scrollToTop: () => void },
) {
  if (action === "ignore") return false;
  effects.closeMenu();
  if (action === "navigate") return false;
  effects.scrollToTop();
  effects.refresh();
  return true;
}

export function clampUnit(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - clampUnit(progress), 3);
}

export function parseStatisticTarget(source: string): number | null {
  const normalized = source.replaceAll(",", "").trim();
  if (!/^-?\d+(?:\.\d+)?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatStatisticValue(value: number, source: string) {
  const decimalSource = source.replaceAll(",", "");
  const decimals = decimalSource.includes(".") ? (decimalSource.split(".")[1]?.length ?? 0) : 0;
  const rounded = Number(value.toFixed(decimals));
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
    useGrouping: source.includes(","),
  }).format(rounded);
}

export function statisticFinalLabel(value: string, suffix?: string | null) {
  return `${value}${suffix ?? ""}`;
}

export function snakeVelocityFromScrollDelta(delta: number) {
  if (delta === 0) return 0;

  return Math.max(-snakeVelocityLimit, Math.min(snakeVelocityLimit, -delta * 1.05));
}

export function stepSnakeMotion(
  state: SnakeMotionState,
  period: number,
): SnakeMotionState & { active: boolean } {
  const safePeriod = Math.max(1, period);
  const velocity = state.velocity + (state.targetVelocity - state.velocity) * 0.28;
  const targetVelocity = state.targetVelocity * 0.62;
  const offset = (((state.offset + velocity) % safePeriod) + safePeriod) % safePeriod;
  const active =
    Math.abs(velocity) > snakeMotionEpsilon || Math.abs(targetVelocity) > snakeMotionEpsilon;
  return {
    active,
    offset,
    targetVelocity: active ? targetVelocity : 0,
    velocity: active ? velocity : 0,
  };
}

export function shouldStartNavigationTransition(intent: NavigationIntent) {
  if (
    intent.button !== 0 ||
    intent.altKey ||
    intent.ctrlKey ||
    intent.metaKey ||
    intent.shiftKey ||
    intent.download ||
    (intent.target !== null && intent.target !== "" && intent.target !== "_self")
  )
    return false;

  try {
    const current = new URL(intent.currentHref);
    const destination = new URL(intent.href, current);
    if (!["http:", "https:"].includes(destination.protocol)) return false;
    if (destination.origin !== current.origin) return false;
    return destination.pathname !== current.pathname;
  } catch {
    return false;
  }
}
