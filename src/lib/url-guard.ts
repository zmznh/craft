const forbiddenHostnames = new Set(['localhost', 'metadata', 'metadata.google.internal']);

const ipv4Ranges = [
  { network: 0, bits: 8 }, // 0.0.0.0/8
  { network: 0x0a000000, bits: 8 }, // 10.0.0.0/8
  { network: 0x7f000000, bits: 8 }, // 127.0.0.0/8
  { network: 0xa9fe0000, bits: 16 }, // 169.254.0.0/16
  { network: 0xac100000, bits: 12 }, // 172.16.0.0/12
  { network: 0xc0a80000, bits: 16 }, // 192.168.0.0/16
];

function isForbiddenIpv4(address: string): boolean {
  const parts = address.split('.');
  if (parts.length !== 4) return true;
  let value = 0;
  for (const part of parts) {
    const octet = Number(part);
    if (!Number.isInteger(octet) || octet < 0 || octet > 255) return true;
    value = value * 256 + octet;
  }
  return ipv4Ranges.some((range) => {
    const mask = range.bits >= 32 ? 0xffffffff : (0xffffffff << (32 - range.bits)) >>> 0;
    return ((value & mask) >>> 0) === ((range.network & mask) >>> 0);
  });
}

function isForbiddenIpv6(address: string): boolean {
  const normalized = address.replace(/^\[|\]$/g, '').toLowerCase();
  if (normalized === '::1' || normalized === '::') return true;
  if (normalized.startsWith('fe80')) return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  if (normalized.startsWith('::ffff:')) {
    return isForbiddenIpv4(normalized.slice(7));
  }
  return false;
}

export function isSafeRemoteUrl(input: string): boolean {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return false;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;

  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
  if (forbiddenHostnames.has(hostname)) return false;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return !isForbiddenIpv4(hostname);
  if (hostname.includes(':')) return !isForbiddenIpv6(hostname);
  if (hostname.endsWith('.local') || hostname.endsWith('.internal')) return false;

  return true;
}
