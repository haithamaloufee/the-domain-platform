"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { shouldStartNavigationTransition } from "@/lib/homepage-ux";

const minimumVisibleMs = 180;
const safetyTimeoutMs = 6_000;

export function NavigationTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);
  const pendingRef = useRef(false);
  const startedAtRef = useRef(0);
  const safetyTimerRef = useRef<number | null>(null);
  const [pending, setPending] = useState(false);

  const finish = useCallback(() => {
    pendingRef.current = false;
    if (safetyTimerRef.current !== null) window.clearTimeout(safetyTimerRef.current);
    safetyTimerRef.current = null;
    setPending(false);
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.hasAttribute("data-no-route-transition")) return;
      if (
        !shouldStartNavigationTransition({
          altKey: event.altKey,
          button: event.button,
          ctrlKey: event.ctrlKey,
          currentHref: window.location.href,
          download: anchor.hasAttribute("download"),
          href: anchor.href,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey,
          target: anchor.getAttribute("target"),
        })
      )
        return;

      if (pendingRef.current) {
        event.preventDefault();
        return;
      }

      pendingRef.current = true;
      startedAtRef.current = performance.now();
      setPending(true);
      safetyTimerRef.current = window.setTimeout(finish, safetyTimeoutMs);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [finish]);

  useEffect(() => {
    if (previousPathnameRef.current === pathname) return;
    previousPathnameRef.current = pathname;
    if (!pendingRef.current) return;
    const elapsed = performance.now() - startedAtRef.current;
    const timer = window.setTimeout(finish, Math.max(0, minimumVisibleMs - elapsed));
    return () => window.clearTimeout(timer);
  }, [finish, pathname]);

  useEffect(
    () => () => {
      if (safetyTimerRef.current !== null) window.clearTimeout(safetyTimerRef.current);
    },
    [],
  );

  return (
    <>
      {children}
      {pending && (
        <div
          aria-atomic="true"
          aria-live="polite"
          className="route-transition-overlay"
          data-route-transition-overlay
          role="status"
        >
          <Image
            alt=""
            aria-hidden="true"
            className="route-transition-icon"
            height={53}
            priority
            src="/brand/the-domain-icon.png"
            width={48}
          />
          <span className="sr-only">Loading page</span>
        </div>
      )}
    </>
  );
}
