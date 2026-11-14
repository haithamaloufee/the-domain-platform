export async function operationsRequest<T>(
  path: string,
  method = "GET",
  data?: unknown,
): Promise<T> {
  const response = await fetch(`/api/admin/operations/${path}`, {
    method,
    cache: "no-store",
    headers: data ? { "Content-Type": "application/json" } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error("Your session expired. Sign in and try again.");
    if (response.status === 403) throw new Error("Your account does not have access to this area.");
    const problem = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(problem?.detail || "The request could not be completed.");
  }
  return response.status === 204 ? (undefined as T) : (response.json() as Promise<T>);
}
