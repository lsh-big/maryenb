export function withBasePath(path) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (!base || path === base || path.startsWith(`${base}/`)) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiFetch(path, options) {
  if (process.env.NEXT_PUBLIC_PAGES_DEMO === "true") {
    const { demoRequest } = await import("./pages-demo");
    return demoRequest(path, options);
  }
  return fetch(path, options);
}
