const fallbackApiUrl = "http://localhost:5276";
export const publicEnvironment = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? fallbackApiUrl,
} as const;
