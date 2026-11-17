"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    fetch("/api/auth", { cache: "no-store" }).then((r) => r.json()).then((data) => setUser(data.user)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);
  async function signOut() {
    const response = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
    if (response.ok) { setUser(null); router.push("/"); router.refresh(); }
  }
  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
