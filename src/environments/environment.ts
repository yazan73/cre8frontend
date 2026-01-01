import { resolveApiUrl } from "./api-url";

export const environment = {
  production: false,
  apiUrl: resolveApiUrl('https://dev.api.cre8.local'), // replace with real dev endpoint when available
};
