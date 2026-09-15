export const proAccessStorageKey = "business-reboot:pro-access";
export const proAccessAtStorageKey = "business-reboot:pro-access-at";
export const proAccessChangedEvent = "business-reboot:pro-access-changed";

export function hasProAccess() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(proAccessStorageKey) === "true";
}

export function setProAccess() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(proAccessStorageKey, "true");
  window.localStorage.setItem(proAccessAtStorageKey, new Date().toISOString());
  window.dispatchEvent(new Event(proAccessChangedEvent));
}

export function clearProAccess() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(proAccessStorageKey);
  window.localStorage.removeItem(proAccessAtStorageKey);
  window.dispatchEvent(new Event(proAccessChangedEvent));
}

export function subscribeToProAccess(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;

  function handleStorage(event: StorageEvent) {
    if (event.key === proAccessStorageKey || event.key === proAccessAtStorageKey) {
      callback();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(proAccessChangedEvent, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(proAccessChangedEvent, callback);
  };
}

export async function verifyAccessCode(code: string) {
  const response = await fetch("/api/verify-access", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    return { success: false };
  }

  return (await response.json()) as { success: boolean };
}

export async function logoutProAccess() {
  await fetch("/api/logout", {
    method: "POST",
  }).catch(() => undefined);
  clearProAccess();
}
