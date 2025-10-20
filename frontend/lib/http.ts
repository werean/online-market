// apiFetch helper
// - uses NEXT_PUBLIC_API_URL when available
// - falls back to http://localhost:8080 otherwise and warns once
// - preserves generic typing <T = unknown>

const FALLBACK_API_URL = "http://localhost:8080";
const ENV_API_URL =
  typeof process !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL as string | undefined)
    : undefined;

if (!ENV_API_URL) {
  // eslint-disable-next-line no-console
  console.warn("NEXT_PUBLIC_API_URL is not defined. Using fallback:", FALLBACK_API_URL);
}

const BASE_API_URL = ENV_API_URL || FALLBACK_API_URL;

export class ApiError extends Error {
  constructor(message: string, public status: number, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

function buildUrl(base: string, path: string) {
  try {
    return new URL(path, base).toString();
  } catch (e) {
    if (base.endsWith("/") && path.startsWith("/")) return base + path.slice(1);
    if (!base.endsWith("/") && !path.startsWith("/")) return base + "/" + path;
    return base + path;
  }
}

export const apiFetch = async <T = unknown>(path: string, init?: RequestInit): Promise<T> => {
  const url = buildUrl(BASE_API_URL, path);

  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  };

  if (init?.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(url, {
      ...init,
      credentials: "include",
      headers,
      cache: init?.cache || "no-store",
    });

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const errorMessage = data?.message || `HTTP error! status: ${response.status}`;
      console.error(`❌ HTTP ${response.status} em ${init?.method || "GET"} ${url}:`, {
        status: response.status,
        statusText: response.statusText,
        message: errorMessage,
        data,
      });
      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(`❌ Fetch error em ${init?.method || "GET"} ${url}:`, error);
    throw new ApiError(error.message || "Failed to fetch", 0, error);
  }
};
