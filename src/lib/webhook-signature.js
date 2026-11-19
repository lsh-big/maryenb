import { createHmac, timingSafeEqual } from "node:crypto";

export function verifiedWebhookId(raw, headers, secret, now = Date.now()) {
  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp") || "";
  const encodedKey = secret?.replace(/^whsec_/, "");
  if (!id || id.length > 200 || /[\s,]/.test(id) || !/^\d{1,12}$/.test(timestamp)
    || Math.abs(Math.floor(now / 1000) - Number(timestamp)) > 300 || !encodedKey) return null;

  try {
    const key = Buffer.from(atob(encodedKey), "binary");
    if (!key.length) return null;
    const expected = createHmac("sha256", key).update(`${id}.${timestamp}.`).update(raw).digest();
    for (const signature of (headers.get("webhook-signature") || "").split(/\s+/)) {
      const match = /^v1,([a-zA-Z0-9+/]+={0,2})$/.exec(signature);
      if (!match) continue;
      const actual = Buffer.from(match[1], "base64");
      if (actual.length === expected.length && timingSafeEqual(actual, expected)) return id;
    }
  } catch {
    return null;
  }
  return null;
}
