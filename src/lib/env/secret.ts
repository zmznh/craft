export const MIN_SECRET_LENGTH = 32;

const proc = (globalThis as { process?: NodeJS.Process }).process;

/**
 * Accepts the first candidate env var that is actually usable. Deliberately has
 * no built-in default: a shared `dev-secret` lets anyone forge collab tokens.
 */
export function requireSecret(names: string | string[]): string {
  const candidates = Array.isArray(names) ? names : [names];
  const env: Record<string, string | undefined> = proc?.env ?? {};

  for (const name of candidates) {
    const value = env[name];
    if (value && value.trim().length >= MIN_SECRET_LENGTH) return value.trim();
  }

  throw new Error(
    `缺少签名密钥：请设置 ${candidates.join(' 或 ')}（至少 ${MIN_SECRET_LENGTH} 字符随机值）`,
  );
}
