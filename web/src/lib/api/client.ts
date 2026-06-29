const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { cache?: RequestCache },
): Promise<T> {
  const { cache = 'default', ...fetchOptions } = options ?? {};

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    cache,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    ...(cache !== 'no-store' ? { next: { revalidate: 30 } } : {}),
  });

  if (!response.ok) {
    throw new ApiError(`API error: ${response.statusText}`, response.status);
  }

  return response.json() as Promise<T>;
}

export async function checkApiHealth(): Promise<{
  status: string;
  service: string;
  timestamp: string;
}> {
  return apiFetch('/health', { cache: 'no-store' });
}
