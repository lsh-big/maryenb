import { randomBytes, randomUUID, scryptSync, timingSafeEqual, createHash } from "node:crypto";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";

const filename = path.join(process.cwd(), ".data", "auth.json");
const state = globalThis.__maryenbAuth ??= { queue: Promise.resolve() };
const digest = (token) => createHash("sha256").update(token).digest("hex");
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, guest: user.guest });

async function read() {
  try { return JSON.parse(await readFile(filename, "utf8")); }
  catch (e) { if (e.code !== "ENOENT") throw e; return { users: [], sessions: [] }; }
}

export async function authenticate(action, input) {
  const task = state.queue.then(async () => {
    const database = await read();
    let user;
    if (action === "guest") {
      user = { id: `guest-${randomUUID()}`, name: "게스트", email: "", guest: true };
    } else {
      const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
      const password = input.password;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200 || typeof password !== "string" || password.length < 8 || password.length > 128) throw new Error("이메일과 비밀번호(8~128자)를 확인해 주세요.");
      user = database.users.find((u) => u.email === email);
      if (action === "signup") {
        const name = typeof input.name === "string" ? input.name.trim() : "";
        if (!name || name.length > 40 || input.consent !== true) throw new Error("이름과 시연용 계정 저장 동의를 확인해 주세요.");
        if (user) throw new Error("이미 가입된 이메일입니다.");
        const salt = randomBytes(16).toString("hex");
        user = { id: randomUUID(), name, email, guest: false, salt, passwordHash: scryptSync(password, salt, 64).toString("hex") };
        database.users.push(user);
      } else {
        const hash = scryptSync(password, user?.salt || "unknown-user", 64);
        if (!user || !timingSafeEqual(hash, Buffer.from(user.passwordHash, "hex"))) throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
      }
    }
    const token = randomBytes(32).toString("hex");
    const maxAge = user.guest ? 86400 : 604800;
    database.sessions = database.sessions.filter((s) => s.expiresAt > Date.now());
    database.sessions.push({ tokenHash: digest(token), user: publicUser(user), expiresAt: Date.now() + maxAge * 1000 });
    await save(database);
    return { token, user: publicUser(user), maxAge };
  });
  state.queue = task.catch(() => {});
  return task;
}

async function save(database) {
  await mkdir(path.dirname(filename), { recursive: true });
  const temporary = `${filename}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(database, null, 2), "utf8");
  await rename(temporary, filename);
}

export async function getUser() {
  const token = (await cookies()).get("maryenb-session")?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  await state.queue;
  const session = (await read()).sessions.find((s) => s.tokenHash === digest(token) && s.expiresAt > Date.now());
  return session?.user ?? null;
}

export async function logout() {
  const token = (await cookies()).get("maryenb-session")?.value;
  if (!token) return;
  const task = state.queue.then(async () => {
    const database = await read();
    database.sessions = database.sessions.filter((s) => s.tokenHash !== digest(token));
    await save(database);
  });
  state.queue = task.catch(() => {});
  await task;
}
