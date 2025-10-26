export const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000';

export async function apiGet(path: string, headers?: Record<string, string>) {
  const res = await fetch(`${API_URL}${path}`, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiJson(path: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown, headers?: Record<string, string>) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


