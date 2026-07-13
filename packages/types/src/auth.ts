export const UserRole = {
  Editor: 1,
  MediaManager: 2,
  Admin: 3,
  SuperAdmin: 4,
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  user: AdminUser;
}

export interface AuthSessionResponse {
  user: AdminUser;
  expiresAtUtc?: string;
}

export interface AuthErrorResponse {
  message: string;
}

export interface LogoutResponse {
  success: boolean;
}
