import { clearAuthentication, getToken } from "@/lib/auth";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";
  const token = getToken();

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && token) {
      clearAuthentication();
      window.location.assign("/login");
    }
    throw new Error(body.error ?? `Erro ao acessar ${path}.`);
  }

  return body as T;
}

export function post<T>(path: string, dados: unknown): Promise<T> {
  return api<T>(path, { method: "POST", body: JSON.stringify(dados) });
}

export function put<T>(path: string, dados: unknown): Promise<T> {
  return api<T>(path, { method: "PUT", body: JSON.stringify(dados) });
}
