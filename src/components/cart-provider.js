"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  return <CartStore key={user?.id || "signed-out"} user={user}>{children}</CartStore>;
}

function CartStore({ children, user }) {
  const router = useRouter();
  const STORAGE_KEY = `maryenb-cart:${user?.id || "signed-out"}`;
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) { setReady(true); return; }
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch (error) {
      console.error("장바구니 정보를 불러오지 못했습니다.", error);
    } finally {
      setReady(true);
    }
  }, [STORAGE_KEY, user]);

  useEffect(() => {
    if (!ready || !user) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("장바구니 정보를 저장하지 못했습니다.", error);
    }
  }, [items, ready, STORAGE_KEY, user]);

  const value = useMemo(() => {
    const addItem = (product, quantity = 1) => {
      if (!user) {
        router.push(`/login?next=${encodeURIComponent(`/products/${product.slug}`)}`);
        return false;
      }
      if (product.price === null || product.stock < 1 || !Number.isInteger(quantity) || quantity < 1) return false;
      const existing = items.find((item) => item.id === product.id);
      if ((existing?.quantity || 0) + quantity > Math.min(product.stock, 99)) return false;
      setItems((current) => {
        const found = current.find((item) => item.id === product.id);
        if (found) {
          return current.map((item) =>
            item.id === product.id
              ? { ...item, price: product.price, stock: product.stock, quantity: Math.min(item.quantity + quantity, product.stock, 99) }
              : item,
          );
        }
        return [
          ...current,
          {
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            stock: product.stock,
            quantity,
          },
        ];
      });
      return true;
    };

    const updateQuantity = (id, quantity) => {
      setItems((current) =>
        !Number.isInteger(quantity) || quantity < 1
          ? current.filter((item) => item.id !== id)
          : current.map((item) =>
              item.id === id ? { ...item, quantity: Math.min(quantity, item.stock ?? 99, 99) } : item,
            ),
      );
    };

    return {
      items,
      clearCart: () => setItems([]),
      addItem,
      updateQuantity,
      removeItem: (id) =>
        setItems((current) => current.filter((item) => item.id !== id)),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.some((item) => item.price === null)
        ? null
        : items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };
  }, [items, user, router]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart은 CartProvider 안에서 사용해야 합니다.");
  }
  return context;
}
