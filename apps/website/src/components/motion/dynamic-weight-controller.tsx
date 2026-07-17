"use client";

import { useEffect } from "react";

const selector = "h1,h2,h3,h4,p,a,button,label,dt,dd,li,[data-dynamic-weight]";

export function DynamicWeightController() {
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    if (!finePointer.matches || reducedMotion.matches || forcedColors.matches) return;

    const visible = new Set<HTMLElement>();
    const bounds = new Map<HTMLElement, DOMRect>();
    let pointerX = -10_000;
    let pointerY = -10_000;
    let frame = 0;
    let invalid = true;

    const intersection = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        if (entry.isIntersecting) visible.add(element);
        else visible.delete(element);
      }
      invalid = true;
    });

    const observe = () => {
      document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
        if (element.dataset.dynamicWeightReady) return;
        element.dataset.dynamicWeightReady = "true";
        intersection.observe(element);
      });
      invalid = true;
    };

    const render = () => {
      frame = 0;
      if (invalid) {
        bounds.clear();
        visible.forEach((element) => bounds.set(element, element.getBoundingClientRect()));
        invalid = false;
      }
      visible.forEach((element) => {
        const rect = bounds.get(element);
        if (!rect) return;
        const dx = Math.max(rect.left - pointerX, 0, pointerX - rect.right);
        const dy = Math.max(rect.top - pointerY, 0, pointerY - rect.bottom);
        const distance = Math.hypot(dx, dy);
        const proximity = Math.max(0, 1 - distance / 260);
        const weight = Math.round(300 + proximity * 500);
        element.style.fontVariationSettings = `"wght" ${weight}`;
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };
    const pointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      schedule();
    };
    const reset = () => {
      visible.forEach((element) => element.style.removeProperty("font-variation-settings"));
    };
    const resize = () => {
      invalid = true;
      schedule();
    };
    const scroll = () => {
      invalid = true;
    };
    const mutations = new MutationObserver(observe);
    const resizeObserver = new ResizeObserver(resize);
    observe();
    mutations.observe(document.body, { childList: true, subtree: true });
    resizeObserver.observe(document.body);
    window.addEventListener("pointermove", pointerMove, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    document.fonts.ready.then(resize).catch(() => undefined);
    return () => {
      cancelAnimationFrame(frame);
      intersection.disconnect();
      mutations.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("scroll", scroll);
      document.documentElement.removeEventListener("pointerleave", reset);
      reset();
    };
  }, []);

  return null;
}
