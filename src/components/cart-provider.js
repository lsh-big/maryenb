"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "maryenb-cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("장바구니 정보를 저장하지 못했습니다.", error);
    }
  }, [items, ready]);

  const value = useMemo(() => {
    const addItem = (product) => {
      if (product.price === null || product.stock < 1) return;
      setItems((current) => {
        const found = current.find((item) => item.id === product.id);
        if (found) {
          return current.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
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
            quantity: 1,
          },
        ];
      });
    };

    const updateQuantity = (id, quantity) => {
      setItems((current) =>
        quantity < 1
          ? current.filter((item) => item.id !== id)
          : current.map((item) =>
              item.id === id ? { ...item, quantity } : item,
            ),
      );
    };

    return {
      items,
      addItem,
      updateQuantity,
      removeItem: (id) =>
        setItems((current) => current.filter((item) => item.id !== id)),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.some((item) => item.price === null)
        ? null
        : items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart은 CartProvider 안에서 사용해야 합니다.");
  }
  return context;
}
