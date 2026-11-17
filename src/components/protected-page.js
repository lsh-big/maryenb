"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

export function ProtectedPage({ children, next }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(next)}`); }, [user, loading, router, next]);
  if (loading || !user) return <section className="cart-shell"><p>로그인 상태를 확인하고 있습니다…</p></section>;
  return children;
}
