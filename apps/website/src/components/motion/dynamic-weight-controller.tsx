"use client";

import {
  Fragment,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";

type DynamicWeightKind = "heading" | "body" | "action" | "label" | "statistic";

interface WeightTuning {
  from: number;
  to: number;
  reach: number;
}

interface RegisteredText {
  root: HTMLElement;
  glyphs: HTMLElement[];
  kind: DynamicWeightKind;
  bounds: DOMRect[];
  factors: number[];
}

const tuning: Record<DynamicWeightKind, WeightTuning> = {
  heading: { from: 620, to: 800, reach: 440 },
  body: { from: 380, to: 590, reach: 280 },
  action: { from: 540, to: 760, reach: 240 },
  label: { from: 500, to: 700, reach: 240 },
  statistic: { from: 640, to: 800, reach: 420 },
};

type RegisterText = (
  root: HTMLElement,
  glyphs: HTMLElement[],
  kind: DynamicWeightKind,
) => () => void;

const DynamicWeightContext = createContext<RegisterText | null>(null);

export function DynamicWeightProvider({ children }: { children: ReactNode }) {
  const entriesRef = useRef(new Map<HTMLElement, RegisteredText>());
  const visibleRef = useRef(new Set<HTMLElement>());
  const intersectionRef = useRef<IntersectionObserver | null>(null);
  const resizeRef = useRef<ResizeObserver | null>(null);
  const invalidateRef = useRef<(() => void) | null>(null);

  const register = useCallback<RegisterText>((root, glyphs, kind) => {
    const entry: RegisteredText = {
      root,
      glyphs,
      kind,
      bounds: [],
      factors: glyphs.map(() => 0),
    };
    entriesRef.current.set(root, entry);
    intersectionRef.current?.observe(root);
    resizeRef.current?.observe(root);
    invalidateRef.current?.();
    return () => {
      intersectionRef.current?.unobserve(root);
      resizeRef.current?.unobserve(root);
      visibleRef.current.delete(root);
      entriesRef.current.delete(root);
      glyphs.forEach((glyph) => glyph.style.removeProperty("font-variation-settings"));
    };
  }, []);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    if (!finePointer.matches || reducedMotion.matches || forcedColors.matches) return;

    const entries = entriesRef.current;
    const visible = visibleRef.current;
    let pointerX = -10_000;
    let pointerY = -10_000;
    let lastTime = performance.now();
    let frame = 0;
    let invalid = true;

    const measure = () => {
      visible.forEach((root) => {
        const entry = entries.get(root);
        if (entry) entry.bounds = entry.glyphs.map((glyph) => glyph.getBoundingClientRect());
      });
      invalid = false;
    };

    const render = (now: number) => {
      frame = 0;
      if (invalid) measure();
      const elapsed = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const smoothing = 1 - Math.exp(-elapsed / 0.115);
      let unsettled = false;

      visible.forEach((root) => {
        const entry = entries.get(root);
        if (!entry) return;
        const values = tuning[entry.kind];
        entry.glyphs.forEach((glyph, index) => {
          const rect = entry.bounds[index];
          if (!rect) return;
          const dx = pointerX - (rect.left + rect.width / 2);
          const dy = pointerY - (rect.top + rect.height / 2);
          const target = Math.max(0, 1 - Math.hypot(dx, dy) / values.reach);
          const previous = entry.factors[index] ?? 0;
          const factor = previous + (target - previous) * smoothing;
          entry.factors[index] = factor;
          if (Math.abs(target - factor) > 0.002) unsettled = true;
          const weight = Math.round(values.from + (values.to - values.from) * factor);
          glyph.style.fontVariationSettings = `"wght" ${weight}`;
        });
      });

      if (unsettled) frame = requestAnimationFrame(render);
    };

    const schedule = () => {
      if (!frame) {
        lastTime = performance.now();
        frame = requestAnimationFrame(render);
      }
    };
    const invalidate = () => {
      invalid = true;
      schedule();
    };
    invalidateRef.current = invalidate;

    const intersection = new IntersectionObserver((observations) => {
      observations.forEach((observation) => {
        const root = observation.target as HTMLElement;
        if (observation.isIntersecting) visible.add(root);
        else visible.delete(root);
      });
      invalidate();
    });
    intersectionRef.current = intersection;

    const resize = new ResizeObserver(invalidate);
    resizeRef.current = resize;
    entries.forEach((_, root) => {
      intersection.observe(root);
      resize.observe(root);
    });

    const pointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      schedule();
    };
    const pointerLeave = () => {
      pointerX = -10_000;
      pointerY = -10_000;
      schedule();
    };
    const scroll = () => {
      invalid = true;
      schedule();
    };

    window.addEventListener("pointermove", pointerMove, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", pointerLeave);
    document.fonts.ready.then(invalidate).catch(() => undefined);

    return () => {
      cancelAnimationFrame(frame);
      intersection.disconnect();
      resize.disconnect();
      intersectionRef.current = null;
      resizeRef.current = null;
      invalidateRef.current = null;
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("scroll", scroll);
      document.documentElement.removeEventListener("pointerleave", pointerLeave);
      entries.forEach((entry) =>
        entry.glyphs.forEach((glyph) => glyph.style.removeProperty("font-variation-settings")),
      );
    };
  }, []);

  return <DynamicWeightContext.Provider value={register}>{children}</DynamicWeightContext.Provider>;
}

export function DynamicText({
  children,
  kind = "body",
}: {
  children: string;
  kind?: DynamicWeightKind;
}) {
  const register = useContext(DynamicWeightContext);
  const rootRef = useRef<HTMLSpanElement>(null);
  const glyphsRef = useRef<HTMLElement[]>([]);
  let glyphCursor = 0;
  const glyphCount = Array.from(children.replace(/\s/g, "")).length;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !register) return;
    return register(root, glyphsRef.current.slice(0, glyphCount), kind);
  }, [children, glyphCount, kind, register]);

  const tokens = children.split(/(\s+)/);
  return (
    <span className="dynamic-text" ref={rootRef}>
      <span className="dynamic-text__sr sr-only">{children}</span>
      <span aria-hidden="true" className="dynamic-text__visual">
        {tokens.map((token, tokenIndex) =>
          /^\s+$/.test(token) ? (
            <Fragment key={`space-${tokenIndex}`}>{token}</Fragment>
          ) : (
            <span className="dynamic-text__word" key={`${token}-${tokenIndex}`}>
              {Array.from(token).map((glyph, glyphIndex) => {
                const index = glyphCursor++;
                return (
                  <span
                    className="dynamic-text__glyph"
                    key={`${glyph}-${glyphIndex}`}
                    ref={(element) => {
                      if (element) glyphsRef.current[index] = element;
                    }}
                  >
                    {glyph}
                  </span>
                );
              })}
            </span>
          ),
        )}
      </span>
    </span>
  );
}
