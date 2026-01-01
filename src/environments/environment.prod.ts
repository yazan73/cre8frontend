import { resolveApiUrl } from "./api-url";

export const environment = {
  production: true,
  apiUrl: resolveApiUrl('https://cre8backend-production.up.railway.app'),
};
