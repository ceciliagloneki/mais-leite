/**
 * Shared API client for the +Leite front-end.
 *
 * Resolves the base URL from `NEXT_PUBLIC_API_URL`, performs the fetch,
 * throws on non-2xx responses (so TanStack Query can surface the error
 * state), and returns the parsed JSON body typed as `T`.
 */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const url = `${baseUrl}${path}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(
      `API request to ${path} failed with status ${response.status}`,
    );
  }

  return (await response.json()) as T;
}
