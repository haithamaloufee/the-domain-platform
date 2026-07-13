"use client";

import { buttonClasses } from "@the-domain/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function logout() {
    setIsSubmitting(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <button
      className={buttonClasses("ghost", "min-h-9 px-3")}
      disabled={isSubmitting}
      onClick={logout}
      type="button"
    >
      {isSubmitting ? "Signing out…" : "Sign out"}
    </button>
  );
}
