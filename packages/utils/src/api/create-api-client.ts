import type { ApiProblem } from "@the-domain/types";
import { ApiError } from "./api-error";

export interface ApiClientOptions {
  baseUrl: string;
  getAccessToken?: () => string | null | Promise<string | null>;
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | null;
  json?: unknown;
}

export function createApiClient({ baseUrl, getAccessToken }: ApiClientOptions) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");

  return async function request<TResponse>(path: `/${string}`, options: ApiRequestOptions = {}) {
    const headers = new Headers(options.headers);
    const token = await getAccessToken?.();
    const { body, json, ...requestOptions } = options;

    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (json !== undefined) headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    const response = await fetch(`${normalizedBaseUrl}${path}`, {
      ...requestOptions,
      body: json === undefined ? body : JSON.stringify(json),
      headers,
    });

    if (!response.ok) {
      const problem = await readProblem(response);
      throw new ApiError(problem?.title ?? "The API request failed.", response.status, problem);
    }
    if (response.status === 204) return undefined as TResponse;
    return (await response.json()) as TResponse;
  };
}

async function readProblem(response: Response): Promise<ApiProblem | undefined> {
  if (!response.headers.get("content-type")?.includes("application/problem+json")) return undefined;
  return (await response.json()) as ApiProblem;
}
