import type { LoginRequest } from "@the-domain/types";

export type LoginField = keyof LoginRequest;
export type LoginFieldErrors = Partial<Record<LoginField, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginCredentials(credentials: LoginRequest): LoginFieldErrors {
  const errors: LoginFieldErrors = {};
  const email = credentials.email.trim();

  if (!email) {
    errors.email = "Email is required.";
  } else if (email.length > 320 || !emailPattern.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!credentials.password) {
    errors.password = "Password is required.";
  } else if (credentials.password.length > 1024) {
    errors.password = "Password is too long.";
  }

  return errors;
}
