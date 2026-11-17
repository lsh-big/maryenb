import catalog from "../data/products.json";

const DATABASE = `maryenb-pages-demo-v1:${process.env.NEXT_PUBLIC_BASE_PATH || "/"}`;
const SESSION = `maryenb-pages-session-v1:${process.env.NEXT_PUBLIC_BASE_PATH || "/"}`;
const methods = [
  { id: "naver", label: "네이버페이", enabled: true },
  { id: "kakao", label: "카카오페이", enabled: true },
  { id: "toss", label: "토스페이", enabled: true },
  { id: "inicis", label: "KG이니시스 · 카드", enabled: true },
];
function read() {
  const saved = localStorage.getItem(DATABASE);
  return saved ? JSON.parse(saved) : { products: catalog.map((p) => ({ ...p, id: p.slug })), users: [], orders: [] };
}
function save(database) { localStorage.setItem(DATABASE, JSON.stringify(database)); }
function user() { return JSON.parse(sessionStorage.getItem(SESSION) || "null"); }
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

async function passwordHash(password, salt) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations: 100000, hash: "SHA-256" }, material, 256);
  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// Browser-local simulation only. This is not authentication or payment security for a real shop.
export async function demoRequest(path, options = {}) {
  try {
    const body = options.body ? JSON.parse(options.body) : {};
    const database = read();
    if (path === "/api/auth") {
      if (!options.method || options.method === "GET") return json({ user: user(), guestEnabled: true });
      if (body.action === "logout") { sessionStorage.removeItem(SESSION); return json({ user: null }); }
      let account;
      if (body.action === "guest") {
        account = { id: `guest-${crypto.randomUUID()}`, name: "게스트", email: "", guest: true };
      } else {
        if (!["signup", "login"].includes(body.action)) throw new Error("잘못된 요청입니다.");
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200 || typeof body.password !== "string" || body.password.length < 8 || body.password.length > 128) throw new Error("이메일과 비밀번호(8~128자)를 확인해 주세요.");
        let stored = database.users.find((u) => u.email === email);
        if (body.action === "signup") {
          if (stored) throw new Error("이미 가입된 이메일입니다.");
          if (body.consent !== true || typeof body.name !== "string" || !body.name.trim() || body.name.length > 40) throw new Error("이름과 시연용 계정 저장 동의를 확인해 주세요.");
          const salt = crypto.randomUUID();
          stored = { id: crypto.randomUUID(), name: body.name.trim(), email, guest: false, salt, hash: await passwordHash(body.password, salt) };
          database.users.push(stored);
          save(database);
        } else if (!stored || stored.hash !== await passwordHash(body.password, stored.salt)) throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
        account = { id: stored.id, name: stored.name, email: stored.email, guest: false };
      }
      sessionStorage.setItem(SESSION, JSON.stringify(account));
      return json({ user: account });
    }
    if (path === "/api/products") return json(database.products);
    if (path === "/api/checkout" && (!options.method || options.method === "GET")) return json({ virtual: true, browserLocal: true, methods, shippingFee: 0 });
    if (path === "/api/checkout") {
      const currentUser = user();
      if (!currentUser) return json({ error: "로그인 또는 게스트 입장 후 주문해 주세요." }, 401);
      if (!methods.some((m) => m.id === body.method) || !body.consent || !Array.isArray(body.items) || !body.items.length || body.items.length > 30) throw new Error("주문 정보를 확인해 주세요.");
      const seen = new Set();
      const lines = body.items.map((item) => {
        const product = database.products.find((p) => p.slug === item.slug && p.isActive);
        if (!product || seen.has(item.slug) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99 || product.stock < item.quantity) throw new Error("상품 수량 또는 재고를 확인해 주세요.");
        seen.add(item.slug);
        return { slug: product.slug, name: product.name, price: product.price, quantity: item.quantity };
      });
      for (const line of lines) database.products.find((p) => p.slug === line.slug).stock -= line.quantity;
      const order = { virtual: true, status: "SIMULATED", orderNumber: `demo-${crypto.randomUUID()}`, userId: currentUser.id, items: lines, method: body.method, shippingFee: 0, total: lines.reduce((sum, item) => sum + item.price * item.quantity, 0), createdAt: new Date().toISOString() };
      database.orders.push(order);
      save(database);
      return json(order);
    }
    return json({ error: "GitHub Pages에서는 가상 구매만 사용할 수 있습니다." }, 400);
  } catch (error) {
    return json({ error: error.name === "QuotaExceededError" ? "브라우저 저장공간이 부족합니다." : error.message }, 400);
  }
}
