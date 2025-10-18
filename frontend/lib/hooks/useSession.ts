"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/http";

interface User {
  id: string;
  name: string;
  email: string;
  isSeller: boolean;
}

interface UseSessionReturn {
  user: User | null;
  loading: boolean;
}

export function useSession(): UseSessionReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await apiFetch<{ user: User }>("/auth/user");
        setUser(response.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  return { user, loading };
}
