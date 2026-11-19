export function shopOrigin(request) {
  const configured = process.env.SHOP_ORIGIN;
  if (configured) return new URL(configured).origin;
  // Next may normalize the request URL to localhost even when the browser used 127.0.0.1.
  const internal = new URL(request.url);
  const host = request.headers.get("host");
  return host ? new URL(`${internal.protocol}//${host}`).origin : internal.origin;
}

export function hasSameOrigin(request) {
  try {
    return request.headers.get("origin") === shopOrigin(request);
  } catch {
    return false;
  }
}
