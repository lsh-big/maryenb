"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./auth-provider";
import { apiFetch } from "../lib/client-api";
import { sizeLabel } from "../lib/product-market";
import { linePrice, MAX_ORDER_QUANTITY } from "../lib/product-price";

const CartContext = createContext(null);
const storageKey = `maryenb-carts-v2:${process.env.NEXT_PUBLIC_BASE_PATH || "/"}`;
const guest = "guest";

function readCarts(account, legacyId) {
  const saved = localStorage.getItem(storageKey);
  const carts = saved ? JSON.parse(saved) : {};
  if (legacyId && !Object.hasOwn(carts, account)) {
    const legacy = JSON.parse(localStorage.getItem(`maryenb-cart:${legacyId}`) || "[]");
    carts[account] = Array.isArray(legacy) ? legacy : [];
  }
  return carts;
}

function mergeItems(accountItems, guestItems) {
  const merged = new Map(accountItems.map((item) => [item.slug, item]));
  for (const item of guestItems) {
    const previous = merged.get(item.slug);
    merged.set(item.slug, { ...item, quantity: Math.min(MAX_ORDER_QUANTITY, item.quantity + (previous?.quantity || 0)) });
  }
  return [...merged.values()];
}

export function CartProvider({ children }) {
  const { user, loading } = useAuth();
  const account = user && !user.guest ? user.id : guest;
  return <CartStore key={account} account={account} legacyId={user?.id} loading={loading}>{children}</CartStore>;
}

function CartStore({ children, account, legacyId, loading }) {
  const pathname = usePathname();
  const latest = useRef([]);
  const [savedItems, setSavedItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [inventory, setInventory] = useState(null);
  const [inventoryRevision, setInventoryRevision] = useState(0);

  useEffect(() => {
    if (loading) return;
    function load() {
      try {
        const carts = readCarts(account, legacyId);
        if (account !== guest && carts[guest]?.length) {
          carts[account] = mergeItems(carts[account] || [], carts[guest]);
          carts[guest] = [];
        }
        localStorage.setItem(storageKey, JSON.stringify(carts));
        latest.current = carts[account] || [];
        setSavedItems(latest.current);
      } catch {
        setSavedItems(latest.current);
      }
      setReady(true);
    }
    function sync(event) {
      if (event.key !== storageKey) return;
      try {
        latest.current = readCarts(account, legacyId)[account] || [];
        setSavedItems(latest.current);
      } catch {
        // Keep the current cart if browser storage is unavailable.
      }
    }
    load();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [account, legacyId, loading]);

  useEffect(() => {
    if (!["/cart", "/checkout"].includes(pathname.replace(/\/$/, ""))) return;
    let active = true;
    apiFetch("/api/products", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((products) => { if (active) setInventory(products); })
      .catch(() => {});
    return () => { active = false; setInventory(null); };
  }, [pathname, inventoryRevision]);

  const items = inventory ? savedItems.map((item) => {
    const product = inventory.find((product) => product.slug === item.slug);
    return {
      ...item, volume: product ? sizeLabel(product) : item.volume, price: product?.price ?? null,
      stock: product?.stock ?? 0, bundlePrices: product?.bundlePrices, unavailable: !product || Boolean(product.koreaSalesNote),
      salesNote: product?.koreaSalesNote,
    };
  }) : savedItems;

  function save(next) {
    latest.current = next;
    setSavedItems(next);
    try {
      const carts = readCarts(account, legacyId);
      localStorage.setItem(storageKey, JSON.stringify({ ...carts, [account]: next }));
    } catch {
      // Shopping can continue in memory when the browser blocks storage.
    }
  }

  function addItem(product, quantity = 1) {
    if (!ready || !Number.isFinite(product.price) || product.price <= 0 || product.koreaSalesNote || !Number.isInteger(quantity) || quantity < 1) return false;
    const current = latest.current;
    const existing = current.find((item) => item.slug === product.slug);
    const total = (existing?.quantity || 0) + quantity;
    if (total > Math.min(product.stock, MAX_ORDER_QUANTITY)) return false;
    const line = { id: product.id, slug: product.slug, name: product.name, volume: sizeLabel(product),
      imageUrl: product.imageUrl, price: product.price, stock: product.stock, bundlePrices: product.bundlePrices, quantity: total };
    save(existing ? current.map((item) => item.slug === product.slug ? line : item) : [...current, line]);
    return true;
  }

  function updateQuantity(id, quantity) {
    const line = items.find((item) => item.id === id);
    if (!line || !Number.isInteger(quantity) || quantity < 1 || quantity > Math.min(line.stock ?? MAX_ORDER_QUANTITY, MAX_ORDER_QUANTITY)) return;
    save(latest.current.map((item) => item.id === id ? { ...item, quantity } : item));
  }

  const amounts = items.map((item) => linePrice(item, item.quantity));
  const value = {
    items, ready, addItem, updateQuantity,
    refreshInventory: () => setInventoryRevision((revision) => revision + 1),
    clearCart: () => save([]),
    removeItem: (id) => save(latest.current.filter((item) => item.id !== id)),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: amounts.includes(null) ? null : amounts.reduce((sum, amount) => sum + amount, 0),
    hasUnavailable: items.some((item, index) => item.unavailable || amounts[index] == null || item.quantity > item.stock),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart은 CartProvider 안에서 사용해야 합니다.");
  return context;
}
