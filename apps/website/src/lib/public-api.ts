import { createApiClient } from "@the-domain/utils/api";
import { publicEnvironment } from "./environment";
export const publicApi = createApiClient({ baseUrl: publicEnvironment.apiBaseUrl });
