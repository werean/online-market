"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { apiFetch } from "../http";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  stock?: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  loading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Chave localStorage para carrinho anônimo (antes de fazer login)
  const ANONYMOUS_CART_KEY = "anonymous_cart";

  // Carregar carrinho do backend quando usuário estiver logado
  const loadCartFromBackend = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await apiFetch<{ success: boolean; data: CartItem[] }>("/cart");
      if (response.success) {
        setItems(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
    } finally {
      setLoading(false);
    }
  };

  // Migrar carrinho anônimo para o backend quando usuário fizer login
  const migrateAnonymousCart = async () => {
    if (!user) return;

    const anonymousCart = localStorage.getItem(ANONYMOUS_CART_KEY);
    if (!anonymousCart) return;

    try {
      const items: CartItem[] = JSON.parse(anonymousCart);

      // Adicionar cada item ao carrinho do usuário
      for (const item of items) {
        await apiFetch("/cart/add", {
          method: "POST",
          body: JSON.stringify({
            productId: item.id,
            quantity: item.quantity,
          }),
        });
      }

      // Limpar carrinho anônimo
      localStorage.removeItem(ANONYMOUS_CART_KEY);

      // Recarregar carrinho do backend
      await loadCartFromBackend();
    } catch (error) {
      console.error("Erro ao migrar carrinho anônimo:", error);
    }
  };

  // Carregar carrinho quando usuário muda
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      // Usuário logado - carregar do backend e migrar carrinho anônimo se existir
      migrateAnonymousCart();
    } else {
      // Usuário não logado - carregar do localStorage
      const anonymousCart = localStorage.getItem(ANONYMOUS_CART_KEY);
      if (anonymousCart) {
        try {
          setItems(JSON.parse(anonymousCart));
        } catch {
          setItems([]);
        }
      } else {
        setItems([]);
      }
    }

    setMounted(true);
  }, [user, authLoading]);

  // Salvar carrinho anônimo no localStorage
  useEffect(() => {
    if (!mounted || authLoading) return;

    // Só salvar no localStorage se o usuário NÃO estiver logado
    if (!user && items.length > 0) {
      localStorage.setItem(ANONYMOUS_CART_KEY, JSON.stringify(items));
    }
  }, [items, mounted, user, authLoading]);

  const addItem = async (newItem: Omit<CartItem, "quantity">) => {
    if (user) {
      // Usuário logado - usar API
      try {
        setLoading(true);
        const response = await apiFetch<{ success: boolean; data: CartItem }>("/cart/add", {
          method: "POST",
          body: JSON.stringify({
            productId: newItem.id,
            quantity: 1,
          }),
        });

        if (response.success) {
          // Recarregar carrinho completo do backend
          await loadCartFromBackend();
        }
      } catch (error) {
        console.error("Erro ao adicionar item:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    } else {
      // Usuário não logado - usar localStorage
      setItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === newItem.id);

        if (existingItem) {
          return prevItems.map((item) =>
            item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }

        return [...prevItems, { ...newItem, quantity: 1 }];
      });
    }
  };

  const removeItem = async (id: string) => {
    if (user) {
      // Usuário logado - usar API
      try {
        setLoading(true);
        await apiFetch(`/cart/${id}`, {
          method: "DELETE",
        });

        // Recarregar carrinho do backend
        await loadCartFromBackend();
      } catch (error) {
        console.error("Erro ao remover item:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    } else {
      // Usuário não logado - usar localStorage
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (user) {
      // Usuário logado - usar API
      try {
        setLoading(true);
        await apiFetch(`/cart/${id}`, {
          method: "PUT",
          body: JSON.stringify({ quantity }),
        });

        // Recarregar carrinho do backend
        await loadCartFromBackend();
      } catch (error) {
        console.error("Erro ao atualizar quantidade:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    } else {
      // Usuário não logado - usar localStorage
      if (quantity <= 0) {
        removeItem(id);
        return;
      }

      setItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const clearCart = async () => {
    if (user) {
      // Usuário logado - usar API
      try {
        setLoading(true);
        await apiFetch("/cart", {
          method: "DELETE",
        });

        setItems([]);
      } catch (error) {
        console.error("Erro ao limpar carrinho:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    } else {
      // Usuário não logado - limpar localStorage
      setItems([]);
      localStorage.removeItem(ANONYMOUS_CART_KEY);
    }
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, loading }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
}
