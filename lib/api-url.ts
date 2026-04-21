const LOCAL_BACKEND_BASE_URL = "http://127.0.0.1:8000";

function ensureAbsoluteUrl(value: string) {
  const trimmedValue = value.trim();

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  if (trimmedValue.startsWith("localhost") || trimmedValue.startsWith("127.0.0.1")) {
    return `http://${trimmedValue}`;
  }

  return `https://${trimmedValue}`;
}

export function normalizeApiBaseUrl(value?: string | null) {
  const rawValue = value?.trim()
    ? ensureAbsoluteUrl(value)
    : `${LOCAL_BACKEND_BASE_URL}/api`;
  const withoutTrailingSlash = rawValue.replace(/\/+$/, "");

  return withoutTrailingSlash.endsWith("/api")
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
}

export function normalizeBackendBaseUrl(value: string) {
  return ensureAbsoluteUrl(value).replace(/\/+$/, "").replace(/\/api$/, "");
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
