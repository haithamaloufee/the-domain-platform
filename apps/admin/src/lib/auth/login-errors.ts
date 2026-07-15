export const loginErrorMessages = {
  invalidCredentials: "The email or password is incorrect.",
  rateLimited: "Too many sign-in attempts. Please wait a moment and try again.",
  serviceUnavailable:
    "Admin services are temporarily unavailable. Check your connection and try again.",
  unexpected: "We could not complete sign-in. Please try again.",
} as const;

export function getLoginErrorMessage(status: number): string {
  if (status === 400 || status === 401) return loginErrorMessages.invalidCredentials;
  if (status === 429) return loginErrorMessages.rateLimited;
  if (status === 502 || status === 503 || status === 504)
    return loginErrorMessages.serviceUnavailable;
  return loginErrorMessages.unexpected;
}
