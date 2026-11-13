import "server-only";

import {
  fetchBackend,
  isAuthenticationFailure,
  readTokens,
  refreshWithBackend,
} from "./backend-auth";
import { clearAuthCookies, readAuthTokens, setAuthCookies } from "./auth-cookies";

export async function fetchAuthorizedBackend(
  path: `/${string}`,
  init: RequestInit,
  timeoutMilliseconds?: number,
): Promise<Response> {
  const { accessToken, refreshToken } = await readAuthTokens();

  if (accessToken) {
    const response = await requestWithToken(path, init, accessToken, timeoutMilliseconds);
    if (response.status !== 401) return response;
  }

  if (!refreshToken) return unauthorizedResponse();

  const refreshed = await refreshWithBackend(refreshToken);
  if (!refreshed.ok) {
    if (isAuthenticationFailure(refreshed)) {
      return unauthorizedResponse();
    }
    return refreshed;
  }

  const tokens = await readTokens(refreshed);
  await setAuthCookies(tokens);
  const retried = await requestWithToken(path, init, tokens.accessToken, timeoutMilliseconds);
  if (retried.status === 401) await clearAuthCookies();
  return retried;
}

function requestWithToken(
  path: `/${string}`,
  init: RequestInit,
  accessToken: string,
  timeoutMilliseconds?: number,
) {
  return fetchBackend(
    path,
    {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    },
    timeoutMilliseconds,
  );
}

function unauthorizedResponse(): Response {
  return new Response(null, { status: 401 });
}
