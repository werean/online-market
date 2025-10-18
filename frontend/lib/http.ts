const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiFetch = async <T = unknown>(path: string, init?: RequestInit): Promise<T> => {
  const url = `${API_URL}${path}`;

  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  let data: any;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMessage = data?.message || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
};
