import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { saveUploadBuffer } from '@/lib/storage';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  const apiKey = process.env['OPENAI_API_KEY'];
  if (!apiKey) {
    return Response.json(
      { error: '未配置 OPENAI_API_KEY，无法生成图像' },
      { status: 500 }
    );
  }

  let body: { prompt?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: '无效请求' }, { status: 400 });
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return Response.json({ error: '缺少参数' }, { status: 400 });
  }

  const client = new OpenAI({ apiKey });
  try {
    const res = await client.images.generate({
      model: process.env['OPENAI_IMAGE_MODEL'] ?? 'gpt-image-1',
      prompt,
      size: '1024x1024',
      n: 1,
    });

    const b64 = res.data?.[0]?.b64_json;
    if (b64) {
      const saved = await saveUploadBuffer(
        Buffer.from(b64, 'base64'),
        '.png'
      );
      return Response.json({ url: `/api/files/${saved.name}` });
    }

    const remoteUrl = res.data?.[0]?.url;
    if (remoteUrl) {
      const imgRes = await fetch(remoteUrl, {
        signal: AbortSignal.timeout(15000),
      });
      if (!imgRes.ok) throw new Error('下载生成图片失败');
      const buf = Buffer.from(await imgRes.arrayBuffer());
      const saved = await saveUploadBuffer(buf, '.png');
      return Response.json({ url: `/api/files/${saved.name}` });
    }

    return Response.json({ error: '生成结果为空' }, { status: 502 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : '图像生成失败';
    return Response.json({ error: message }, { status: 502 });
  }
}
