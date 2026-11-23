import { createHash, timingSafeEqual } from "node:crypto";
import { isVirtualDatabase } from "./database-mode.js";

export const localDemoAdminId = "local-demo-order-admin";

export function localDemoAdminConfigured() {
  return process.env.NODE_ENV === "development" && isVirtualDatabase()
    && /^[a-f0-9]{64}$/.test(process.env.LOCAL_DEMO_ADMIN_PASSWORD_HASH || "");
}

export function localDemoAdminAvailable(request) {
  // Next reports this origin from the bound development server, not from the request.
  const address = /^http:\/\/(127\.0\.0\.1:\d+)$/.exec(process.env.__NEXT_PRIVATE_ORIGIN || "");
  return localDemoAdminConfigured() && !!address && request.headers.get("host") === address[1];
}

export function isLocalDemoAdmin(request, user) {
  return localDemoAdminAvailable(request) && user?.id === localDemoAdminId && !user.guest;
}

export function localDemoAdminUser(password) {
  const expected = Buffer.from(process.env.LOCAL_DEMO_ADMIN_PASSWORD_HASH || "", "hex");
  const received = typeof password === "string" && password.length <= 128
    ? createHash("sha256").update(password).digest() : null;
  if (!received || expected.length !== received.length || !timingSafeEqual(expected, received)) {
    throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
  }
  return { id: localDemoAdminId, name: "관리자", email: "", guest: false };
}
