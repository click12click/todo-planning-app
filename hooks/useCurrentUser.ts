"use client";

import { useEffect, useState } from "react";
import type { User } from "@/lib/types";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.status === 200 ? (r.json() as Promise<User>) : null))
      .then((data) => {
        setUser(data);
        setMounted(true);
      });
  }, []);

  return { user, mounted };
}
