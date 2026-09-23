import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { isSafeRemoteUrl } from '@/lib/url-guard';

function absoluteUrl(base: string, target: string | null): string | null {
  if (!target) return null;
  try {
    return new URL(target, base).toString();
  } catch {
    return null;
  }
}

function metaContent(html: string, keys: string[]): string | null {
  for (const key of keys) {
    const patterns = [
      new RegExp(
        `<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`,
        'i'
      ),
      new RegExp(
        `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`,
        'i'
      ),
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m?.[1]) return m[1];
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: '无效请求' }, { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(body.url ?? '');
  } catch {
    return Response.json({ error: '无效 URL' }, { status: 400 });
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    return Response.json({ error: '仅支持 http/https' }, { status: 400 });
  }
  if (!isSafeRemoteUrl(url.toString())) {
    return Response.json({ error: '不允许访问该地址' }, { status: 400 });
  }

  try {
    let currentUrl = url.toString();
    const res = await (async () => {
      for (let hops = 0; hops < 3; hops++) {
        const fetched = await fetch(currentUrl, {
          signal: AbortSignal.timeout(5000),
          redirect: 'manual',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (compatible; CraftyBot/1.0; link preview fetcher)',
          },
        });
        if (fetched.status >= 300 && fetched.status < 400) {
          const location = fetched.headers.get('location');
          const next = location ? new URL(location, currentUrl).toString() : null;
          if (!next || !isSafeRemoteUrl(next)) {
            return null;
          }
          currentUrl = next;
          continue;
        }
        return fetched;
      }
      return null;
    })();
    if (!res || !res.ok) {
      return Response.json({ url: currentUrl });
    }
    const finalUrl = currentUrl;
    const html = (await res.text()).slice(0, 500_000);

    const title =
      metaContent(html, ['og:title', 'twitter:title']) ??
      html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ??
      null;
    const description = metaContent(html, [
      'og:description',
      'twitter:description',
      'description',
    ]);
    const image = absoluteUrl(
      finalUrl,
      metaContent(html, ['og:image', 'twitter:image', 'og:image:secure_url'])
    );
    const siteName = metaContent(html, ['og:site_name']);
    const finalHostname = new URL(finalUrl).hostname;
    const favicon = absoluteUrl(finalUrl, '/favicon.ico');

    return Response.json({
      url: finalUrl,
      title: title?.slice(0, 200) ?? null,
      description: description?.slice(0, 300) ?? null,
      image,
      favicon,
      siteName: siteName?.slice(0, 100) ?? finalHostname,
    });
  } catch {
    // Timeout / network failure: degrade to bare url
    return Response.json({ url: url.toString(), siteName: url.hostname });
  }
}
