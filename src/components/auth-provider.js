"use client";

import { apiFetch } from "../lib/client-api";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    apiFetch("/api/auth", { cache: "no-store" }).then((r) => r.json()).then((data) => setUser(data.user)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);
  async function startGuest() {
    const response = await apiFetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "guest" }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "비회원 주문을 시작하지 못했습니다.");
    setUser(data.user);
  }
  async function signOut() {
    const response = await apiFetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
    if (response.ok) { setUser(null); router.push("/"); router.refresh(); }
  }
  return <AuthContext.Provider value={{ user, loading, signOut, startGuest }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
