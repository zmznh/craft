import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  CheckSquare,
  ChevronRight,
  Quote,
  Code,
  Image,
  Table,
  Minus,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  StickyNote,
  FileText,
  AtSign,
  CreditCard,
  LayoutGrid,
  Globe,
  Sparkles,
  PenLine,
} from 'lucide-react';
import type { Editor } from '@tiptap/react';
import type { ComponentType } from 'react';
import { uploadFile } from '@/lib/upload-client';
import { requestImageGen } from '@/components/editor/ai/ImageGenDialog';

export interface SlashCommand {
  name: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  keywords: string[];
  category: string;
  command: (editor: Editor, range: { from: number; to: number }) => void;
}

export const slashCommands: SlashCommand[] = [
  // ── 基础块 ──
  {
    name: '文本',
    description: '普通文本段落',
    icon: Type,
    keywords: ['text', 'paragraph', '文本', '段落'],
    category: '基础块',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },
  {
    name: '标题 1',
    description: '大标题',
    icon: Heading1,
    keywords: ['h1', 'title', 'heading 1', '标题', '大标题'],
    category: '基础块',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run();
    },
  },
  {
    name: '标题 2',
    description: '副标题',
    icon: Heading2,
    keywords: ['h2', 'subtitle', 'heading 2', '副标题'],
    category: '基础块',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run();
    },
  },
  {
    name: '标题 3',
    description: '三级标题',
    icon: Heading3,
    keywords: ['h3', 'heading 3', '标题 3'],
    category: '基础块',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run();
    },
  },
  {
    name: '标题 4',
    description: '四级标题',
    icon: Heading4,
    keywords: ['h4', 'heading 4', '标题 4'],
    category: '基础块',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 4 }).run();
    },
  },

  // ── 列表 ──
  {
    name: '无序列表',
    description: '项目符号列表',
    icon: List,
    keywords: ['bullet', 'list', 'unordered', '列表', '无序'],
    category: '列表',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    name: '有序列表',
    description: '编号列表',
    icon: ListOrdered,
    keywords: ['numbered', 'ordered', 'list', '有序', '编号'],
    category: '列表',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    name: '待办事项',
    description: '可勾选的任务列表',
    icon: CheckSquare,
    keywords: ['todo', 'task', 'checkbox', '待办', '任务', '清单'],
    category: '列表',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    name: '折叠列表',
    description: '可展开/折叠的内容',
    icon: ChevronRight,
    keywords: ['toggle', 'collapse', 'fold', '折叠', '展开'],
    category: '列表',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setToggleBlock().run();
    },
  },

  // ── 高级块 ──
  {
    name: '引用',
    description: '引用文本块',
    icon: Quote,
    keywords: ['quote', 'blockquote', '引用'],
    category: '高级块',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    name: '代码块',
    description: '代码片段（支持语法高亮）',
    icon: Code,
    keywords: ['code', 'snippet', '代码', '代码块'],
    category: '高级块',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    name: '表格',
    description: '插入表格',
    icon: Table,
    keywords: ['table', '表格'],
    category: '高级块',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    },
  },
  {
    name: '分隔线',
    description: '水平分隔线',
    icon: Minus,
    keywords: ['divider', 'separator', 'hr', 'line', '分隔线', '分割线'],
    category: '高级块',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },

  // ── Callout ──
  {
    name: '信息提示',
    description: '蓝色信息 Callout',
    icon: Info,
    keywords: ['callout', 'info', 'alert', 'notice', '提示', '信息'],
    category: 'Callout',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setCallout({ type: 'info' }).run();
    },
  },
  {
    name: '警告提示',
    description: '黄色警告 Callout',
    icon: AlertTriangle,
    keywords: ['callout', 'warning', 'warn', '警告', '提醒'],
    category: 'Callout',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setCallout({ type: 'warning' }).run();
    },
  },
  {
    name: '错误提示',
    description: '红色错误 Callout',
    icon: AlertCircle,
    keywords: ['callout', 'error', 'danger', '错误', '危险'],
    category: 'Callout',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setCallout({ type: 'error' }).run();
    },
  },
  {
    name: '成功提示',
    description: '绿色成功 Callout',
    icon: CheckCircle,
    keywords: ['callout', 'success', 'done', '成功', '完成'],
    category: 'Callout',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setCallout({ type: 'success' }).run();
    },
  },
  {
    name: '备注',
    description: '紫色备注 Callout',
    icon: StickyNote,
    keywords: ['callout', 'note', '备注', '注释'],
    category: 'Callout',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setCallout({ type: 'note' }).run();
    },
  },

  // ── 媒体 ──
  {
    name: 'AI 生成图像',
    description: '用 AI 生成一张图片插入文档',
    icon: Sparkles,
    keywords: ['ai', 'image gen', 'dalle', '生成', '绘图', 'ai 图像'],
    category: '媒体',
    command: (_editor, _range) => {
      requestImageGen();
    },
  },
  {
    name: '绘图',
    description: '插入一块可绘制图形与草图的画板',
    icon: PenLine,
    keywords: ['drawing', 'sketch', 'draw', '绘图', '画板', '草图', '手写'],
    category: '媒体',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).insertDrawing().run();
    },
  },
  {
    name: '图片',
    description: '上传图片或嵌入图片',
    icon: Image,
    keywords: ['image', 'photo', 'picture', '图片', '照片'],
    category: '媒体',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setImageBlock({}).run();
    },
  },
  {
    name: '文件附件',
    description: '上传文件附件',
    icon: FileText,
    keywords: ['file', 'attachment', 'upload', '文件', '附件'],
    category: '媒体',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).run();
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        try {
          const { url } = await uploadFile(file);
          editor
            .chain()
            .focus()
            .setAttachment({ url, name: file.name, size: file.size })
            .run();
        } catch (err) {
          alert(err instanceof Error ? err.message : '上传失败');
        }
      };
      input.click();
    },
  },

  // ── 嵌入 ──
  {
    name: '图片网格',
    description: '多图自动布局的网格',
    icon: LayoutGrid,
    keywords: ['gallery', 'grid', '网格', '图库', '自动布局'],
    category: '媒体',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setImageGallery({}).run();
    },
  },
  {
    name: '网页链接',
    description: '生成富链接预览卡片',
    icon: Globe,
    keywords: ['link', 'preview', 'web', '链接', '网页', '书签'],
    category: '嵌入',
    command: (editor, range) => {
      const url = window.prompt('输入网页 URL:');
      editor.chain().focus().deleteRange(range);
      if (url) {
        editor.chain().setLinkPreview({ url }).run();
      } else {
        editor.chain().setParagraph().run();
      }
    },
  },
  {
    name: '卡片',
    description: '圆角卡片容器，可容纳多个块',
    icon: CreditCard,
    keywords: ['card', '卡片', '容器'],
    category: '布局',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setCardBlock({}).run();
    },
  },
  {
    name: '@提及',
    description: '提及另一个文档',
    icon: AtSign,
    keywords: ['mention', 'link', '提及', '引用文档'],
    category: '嵌入',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },
];

export function filterCommands(query: string): SlashCommand[] {
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) return slashCommands;

  return slashCommands.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(lowerQuery) ||
      cmd.description.toLowerCase().includes(lowerQuery) ||
      cmd.keywords.some((kw) => kw.toLowerCase().includes(lowerQuery))
  );
}

export function getCommandCategories(): string[] {
  const categories = new Set<string>();
  slashCommands.forEach((cmd) => categories.add(cmd.category));
  return Array.from(categories);
}
