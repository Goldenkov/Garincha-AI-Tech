const allowedPrefixes = ["/projects", "/startup/", "/account", "/start"];
const fallbackRedirect = "/projects";

/** Accepts only same-site relative paths inside the product; everything else falls back to /projects. */
export function sanitizeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallbackRedirect;
  try {
    const url = new URL(value, "https://local.invalid");
    if (url.origin !== "https://local.invalid") return fallbackRedirect;
    if (!allowedPrefixes.some((prefix) => url.pathname === prefix.replace(/\/$/u, "") || url.pathname.startsWith(prefix))) {
      return fallbackRedirect;
    }
    return `${url.pathname}${url.search}`;
  } catch {
    return fallbackRedirect;
  }
}
