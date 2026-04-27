const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, ...rest } = options;

  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...rest.headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.detail ?? `HTTP ${res.status}`) as Error & { data: unknown; status: number };
    err.data = data;
    err.status = res.status;
    throw err;
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, init?: RequestOptions) => request<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    request<T>(path, { ...init, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    request<T>(path, { ...init, method: "PATCH", body }),
  delete: <T>(path: string, init?: RequestOptions) => request<T>(path, { ...init, method: "DELETE" }),
};
