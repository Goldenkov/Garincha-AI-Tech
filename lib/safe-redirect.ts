const allowedRedirectPaths = new Set(["/journey", "/launch-kit", "/dashboard"]);
const fallbackRedirect = "/journey";

export function sanitizeAccessRedirect(value: string | null | undefined) {
  if (!value) return fallbackRedirect;
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("//")) {
    return fallbackRedirect;
  }

  try {
    const url = new URL(value, "https://local.invalid");
    if (url.origin !== "https://local.invalid") return fallbackRedirect;
    if (!allowedRedirectPaths.has(url.pathname)) return fallbackRedirect;
    return `${url.pathname}${url.search}`;
  } catch {
    return fallbackRedirect;
  }
}
