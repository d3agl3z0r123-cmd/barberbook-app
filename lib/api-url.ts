const LOCAL_BACKEND_BASE_URL = "http://127.0.0.1:8000";

export function normalizeApiBaseUrl(value?: string | null) {
  const rawValue = value?.trim() || `${LOCAL_BACKEND_BASE_URL}/api`;
  const withoutTrailingSlash = rawValue.replace(/\/+$/, "");

  return withoutTrailingSlash.endsWith("/api")
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
}

export function normalizeBackendBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "").replace(/\/api$/, "");
}

export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL
);

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${API_BASE_URL}${normalizedPath}`;
}

export function googleRedirectUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!configuredBaseUrl) {
    return null;
  }

  return `${normalizeBackendBaseUrl(configuredBaseUrl)}/api/auth/google/redirect`;
}
