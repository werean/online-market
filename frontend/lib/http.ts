const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(message: string, public status: number, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiFetch = async <T = unknown>(path: string, init?: RequestInit): Promise<T> => {
  const url = `${API_URL}${path}`;

  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  };

  // Só adiciona Content-Type se houver body
  if (init?.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers,
  });

  let data: any;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMessage = data?.message || `HTTP error! status: ${response.status}`;
    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
};
