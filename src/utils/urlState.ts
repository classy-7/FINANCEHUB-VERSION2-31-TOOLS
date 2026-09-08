/**
 * Utilities for encoding/decoding calculator inputs to/from URL query parameters
 * for bookmarkable, shareable calculator configurations.
 */

export function getQueryParamNumber(paramName: string, defaultValue: number): number {
  if (typeof window === "undefined") return defaultValue;
  try {
    const params = new URLSearchParams(window.location.search);
    const val = params.get(paramName);
    if (val !== null && !isNaN(Number(val))) {
      return Number(val);
    }
  } catch {
    // ignore
  }
  return defaultValue;
}

export function getQueryParamString(paramName: string, defaultValue: string): string {
  if (typeof window === "undefined") return defaultValue;
  try {
    const params = new URLSearchParams(window.location.search);
    const val = params.get(paramName);
    if (val !== null && val.trim() !== "") {
      return val;
    }
  } catch {
    // ignore
  }
  return defaultValue;
}

export function updateUrlQueryParams(paramsMap: Record<string, string | number | boolean | undefined>) {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    Object.entries(paramsMap).forEach(([key, val]) => {
      if (val === undefined || val === null || val === "") {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, String(val));
      }
    });
    window.history.replaceState({}, "", url.toString());
  } catch {
    // ignore
  }
}

export function getShareableUrl(): string {
  if (typeof window === "undefined") return "";
  return window.location.href;
}
