import { describe, expect, it } from 'vitest';
import { isSafeRemoteUrl } from './url-guard';

describe('isSafeRemoteUrl', () => {
  it('allows public https urls', () => {
    expect(isSafeRemoteUrl('https://example.com/page')).toBe(true);
  });

  it('rejects non-http protocols', () => {
    expect(isSafeRemoteUrl('ftp://example.com')).toBe(false);
    expect(isSafeRemoteUrl('file:///etc/passwd')).toBe(false);
  });

  it('rejects loopback addresses', () => {
    expect(isSafeRemoteUrl('http://127.0.0.1/x')).toBe(false);
    expect(isSafeRemoteUrl('http://localhost/x')).toBe(false);
    expect(isSafeRemoteUrl('http://[::1]/x')).toBe(false);
    expect(isSafeRemoteUrl('http://0.0.0.0/x')).toBe(false);
  });

  it('rejects private and link-local ranges', () => {
    expect(isSafeRemoteUrl('http://192.168.1.1/x')).toBe(false);
    expect(isSafeRemoteUrl('http://10.0.0.1/x')).toBe(false);
    expect(isSafeRemoteUrl('http://172.16.0.1/x')).toBe(false);
    expect(isSafeRemoteUrl('http://169.254.169.254/latest/meta-data')).toBe(false);
    expect(isSafeRemoteUrl('http://[fe80::1]/x')).toBe(false);
  });

  it('rejects cloud metadata hostnames that resolve locally', () => {
    expect(isSafeRemoteUrl('http://169.254.170.2/v2/credentials')).toBe(false);
  });
});
