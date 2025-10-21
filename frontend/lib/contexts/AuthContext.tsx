"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiFetch } from "@/lib/http";

interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  isSeller: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  clearCache: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const clearCache = () => {
    // Limpar localStorage
    if (typeof window !== "undefined") {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("products_") || key.startsWith("cart_"))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      // Disparar evento customizado para limpar cache de produtos
      window.dispatchEvent(new CustomEvent("clearProductsCache"));
    }
  };

  const logout = () => {
    clearCache();
    setUser(null);
  };

  const refreshUser = async () => {
    setLoading(true);
    try {
      const response = await apiFetch<{ user: User }>("/auth/user");
      setUser(response.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, clearCache, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
