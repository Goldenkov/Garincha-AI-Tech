export function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const heavyPrefetchRoutes = new Set(["/journey", "/launch-kit", "/dashboard", "/game", "/map"]);
