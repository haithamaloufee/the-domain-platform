"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

const defaultSize = { width: 1440, height: 560 };

export function ScrollSnakeText({ phrase }: { phrase: string }) {
  const id = useId().replaceAll(":", "");
  const containerRef = useRef<HTMLDivElement>(null);
  const pathDefinitionRef = useRef<SVGPathElement>(null);
  const textPathRef = useRef<SVGTextPathElement>(null);
  const measureTwoRef = useRef<SVGTextElement>(null);
  const measureFourRef = useRef<SVGTextElement>(null);
  const [size, setSize] = useState(defaultSize);
  const [pathLength, setPathLength] = useState(0);
  const [unitWidth, setUnitWidth] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      if (width > 0 && height > 0)
        setSize((current) =>
          Math.abs(current.width - width) <= 1 && Math.abs(current.height - height) <= 1
            ? current
            : { width, height },
        );
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(container);
    return () => resize.disconnect();
  }, []);

  const path = createWavePath(size.width, size.height);
  const unitText = `${phrase.toUpperCase()}\u00a0 · \u00a0`;

  useLayoutEffect(() => {
    const pathDefinition = pathDefinitionRef.current;
    if (pathDefinition) setPathLength(pathDefinition.getTotalLength());
    const two = measureTwoRef.current?.getComputedTextLength() ?? 0;
    const four = measureFourRef.current?.getComputedTextLength() ?? 0;
    const measuredUnit = (four - two) / 2;
    if (Number.isFinite(measuredUnit) && measuredUnit > 0) setUnitWidth(measuredUnit);
  }, [path, unitText]);

  useEffect(() => {
    const container = containerRef.current;
    const textPath = textPathRef.current;
    if (!container || !textPath) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      textPath.setAttribute("startOffset", "0px");
      return;
    }

    let visible = false;
    let lastScrollY = window.scrollY;
    let targetVelocity = 0;
    let velocity = 0;
    let offset = 0;
    let frame = 0;
    const period = Math.max(1, unitWidth);

    const animate = () => {
      frame = 0;
      velocity += (targetVelocity - velocity) * 0.24;
      targetVelocity *= 0.68;
      offset = (((offset + velocity) % period) + period) % period;
      textPath.setAttribute("startOffset", `${offset}px`);
      if (Math.abs(velocity) > 0.025 || Math.abs(targetVelocity) > 0.025)
        frame = requestAnimationFrame(animate);
    };
    const onScroll = () => {
      const current = window.scrollY;
      const delta = current - lastScrollY;
      lastScrollY = current;
      if (!visible || delta === 0) return;
      targetVelocity = Math.max(-18, Math.min(18, -delta * 0.72));
      if (!frame) frame = requestAnimationFrame(animate);
    };
    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        lastScrollY = window.scrollY;
      },
      { rootMargin: "15% 0px", threshold: 0 },
    );
    intersection.observe(container);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      intersection.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [unitWidth]);

  const estimatedUnit = Math.max(240, phrase.length * 18);
  const repeatCount = Math.min(
    96,
    Math.max(
      8,
      Math.ceil(Math.max(pathLength, size.width * 1.6) / (unitWidth || estimatedUnit)) + 4,
    ),
  );
  const repeatedText = unitText.repeat(repeatCount);

  return (
    <div
      className="pointer-events-none absolute inset-x-[calc(50%-50vw)] top-0 z-0 h-[30rem] overflow-hidden sm:h-[36rem] lg:h-[42rem]"
      ref={containerRef}
    >
      <span className="sr-only">{phrase}</span>
      <svg
        aria-hidden="true"
        className="block h-full w-full overflow-hidden text-gold"
        preserveAspectRatio="none"
        viewBox={`0 0 ${size.width} ${size.height}`}
      >
        <defs>
          <path d={path} fill="none" id={id} ref={pathDefinitionRef} />
        </defs>
        <text className="snake-text-measure" ref={measureTwoRef} x="0" y="-9999">
          {unitText.repeat(2)}
        </text>
        <text className="snake-text-measure" ref={measureFourRef} x="0" y="-9999">
          {unitText.repeat(4)}
        </text>
        <text className="snake-text-flow fill-current">
          <textPath href={`#${id}`} ref={textPathRef}>
            {repeatedText}
          </textPath>
        </text>
      </svg>
    </div>
  );
}

function createWavePath(width: number, height: number) {
  const fontReserve = width < 640 ? 28 : 42;
  const cycles = width < 640 ? 1.5 : 2;
  const halfCycles = Math.max(3, Math.round(cycles * 2));
  const halfWidth = width / halfCycles;
  const overflow = Math.max(160, width * 0.32);
  const leftSteps = Math.ceil(overflow / halfWidth);
  const rightSteps = Math.ceil(overflow / halfWidth);
  const totalSteps = halfCycles + leftSteps + rightSteps;
  const startX = -leftSteps * halfWidth;
  const centerY = height / 2;
  const amplitude = Math.max(0, Math.min(height * 0.31, height / 2 - fontReserve));
  const controlAmplitude = amplitude * (4 / 3);
  const startSign = leftSteps % 2 === 0 ? -1 : 1;
  let path = `M ${startX},${centerY}`;
  for (let index = 0; index < totalSteps; index += 1) {
    const start = startX + index * halfWidth;
    const end = start + halfWidth;
    const peak =
      centerY + (index % 2 === 0 ? startSign * controlAmplitude : -startSign * controlAmplitude);
    path += ` C ${start + halfWidth / 3},${peak} ${end - halfWidth / 3},${peak} ${end},${centerY}`;
  }
  return path;
}
