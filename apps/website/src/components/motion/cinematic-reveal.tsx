"use client";

import { cn } from "@the-domain/utils";
import { useLayoutEffect, useRef, useState } from "react";

export function CinematicReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    document.documentElement.dataset.motionReady = "true";
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      element.classList.remove("is-concealed");
      element.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -9%", threshold: 0.06 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn("cinematic-reveal", visible ? "is-visible" : "is-concealed", className)}
      ref={ref}
    >
      {children}
    </div>
  );
}
