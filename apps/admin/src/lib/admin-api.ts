import { createApiClient } from "@the-domain/utils/api";
import { adminEnvironment } from "./environment";

// The token provider is intentionally absent until the authentication integration sprint.
export const adminApi = createApiClient({ baseUrl: adminEnvironment.apiBaseUrl });
