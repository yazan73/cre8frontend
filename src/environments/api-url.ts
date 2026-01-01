declare const process: { env?: Record<string, string | undefined> };

export function resolveApiUrl(defaultUrl: string): string {
  const importMetaEnv =
    typeof import.meta !== 'undefined'
      ? ((import.meta as any).env as Record<string, string | undefined> | undefined)
      : undefined;

  const fromImportMeta = importMetaEnv?.['NG_APP_API_URL'];
  const fromProcess =
    typeof process !== 'undefined' ? process.env?.['NG_APP_API_URL'] : undefined;
  const fromWindow = typeof window !== 'undefined' ? (window as any)?.['NG_APP_API_URL'] : undefined;

  return fromImportMeta || fromProcess || fromWindow || defaultUrl;
}
