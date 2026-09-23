import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { saveUpload } from '@/lib/storage';

const MAX_SIZE = 20 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: '无效请求' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return Response.json({ error: '缺少文件' }, { status: 400 });
  }
  if (file.size === 0) {
    return Response.json({ error: '文件为空' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return Response.json({ error: '文件超过 20MB 限制' }, { status: 413 });
  }

  try {
    const saved = await saveUpload(file);
    return Response.json({
      url: `/api/files/${saved.name}`,
      name: file.name,
      size: saved.size,
      type: saved.type,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '上传失败';
    return Response.json({ error: message }, { status: 500 });
  }
}
