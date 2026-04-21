const LOCAL_API_BASE_URL = "http://127.0.0.1:8000/api";

export function normalizeApiBaseUrl(value?: string | null) {
  const rawValue = value?.trim() || LOCAL_API_BASE_URL;
  const withoutTrailingSlash = rawValue.replace(/\/+$/, "");

  return withoutTrailingSlash.endsWith("/api")
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
}

export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL
);

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${API_BASE_URL}${normalizedPath}`;
}

export function googleRedirectUrl() {
  return apiUrl("/auth/google/redirect");
}
