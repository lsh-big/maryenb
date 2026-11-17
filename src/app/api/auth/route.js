import { NextResponse } from "next/server";
import { authenticate, getUser, logout } from "../../../lib/auth";
import { isVirtualDatabase } from "../../../lib/database-mode";

export async function GET() {
  return NextResponse.json({ user: await getUser(), guestEnabled: isVirtualDatabase() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 403 });
  try {
    const { action, ...input } = await request.json();
    if (!["login", "signup", "guest", "logout"].includes(action)) throw new Error("잘못된 요청입니다.");
    if (action === "logout") {
      await logout();
      const response = NextResponse.json({ user: null });
      response.cookies.set("maryenb-session", "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
      return response;
    }
    if (action === "guest" && !isVirtualDatabase()) throw new Error("게스트 모드는 시연 환경에서만 사용할 수 있습니다.");
    const session = await authenticate(action, input);
    const response = NextResponse.json({ user: session.user });
    response.cookies.set("maryenb-session", session.token, { httpOnly: true, sameSite: "lax", secure: new URL(request.url).protocol === "https:", path: "/", maxAge: session.maxAge });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error.code ? "계정 정보를 저장하지 못했습니다." : error.message }, { status: 400 });
  }
}
