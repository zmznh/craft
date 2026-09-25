import 'dotenv/config';

export const MIN_SECRET_LENGTH = 32;

/** Mirrors src/lib/env/secret.ts — this process is plain Node, so it cannot import the TS helper. */
export function requireSecret(names) {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim().length >= MIN_SECRET_LENGTH) return value.trim();
  }
  throw new Error(
    `缺少签名密钥：请设置 ${names.join(' 或 ')}（至少 ${MIN_SECRET_LENGTH} 字符随机值）`,
  );
}
