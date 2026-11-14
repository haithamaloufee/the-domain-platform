"use client";

import { buttonClasses } from "@the-domain/ui";
import { useEffect, useState } from "react";

export function BookingAction({ href, closesAt }: { href: string; closesAt: string }) {
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    const deadline = Date.parse(closesAt);
    let timer: ReturnType<typeof setTimeout>;
    function check() {
      clearTimeout(timer);
      const remaining = deadline - Date.now();
      if (remaining <= 0) setClosed(true);
      else timer = setTimeout(check, Math.min(remaining, 2_000_000_000));
    }
    check();
    document.addEventListener("visibilitychange", check);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, [closesAt]);

  return closed ? (
    <span className="inline-flex min-h-11 items-center text-ink-muted" role="status">
      Booking closed
    </span>
  ) : (
    <a
      className={buttonClasses("primary")}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      onClick={(event) => {
        if (Date.now() >= Date.parse(closesAt)) {
          event.preventDefault();
          setClosed(true);
        }
      }}
    >
      Book now <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
