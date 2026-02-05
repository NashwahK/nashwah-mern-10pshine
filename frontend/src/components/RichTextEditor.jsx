import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Link } from '@tiptap/extension-link';
import { 
  Bold, Italic, Strikethrough, Code, List, ListOrdered, 
  Quote, Undo, Redo, Heading1, Heading2, Image as ImageIcon,
  Table as TableIcon, Link as LinkIcon, Palette, Highlighter
} from 'lucide-react';
import InputModal from './InputModal';
import ColorPickerModal from './ColorPickerModal';
import FileUploadModal from './FileUploadModal';

export default function RichTextEditor({ content, onChange, noteColor = 'default' }) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [highlightModalOpen, setHighlightModalOpen] = useState(false);
  const initialContentRef = useRef(null);
  const hasInitializedRef = useRef(false);

  // build extensions and dedupe by name to avoid duplicate extension warnings
  const _extensions = [
    StarterKit.configure({
      bulletList: { keepMarks: true, keepAttributes: false },
      orderedList: { keepMarks: true, keepAttributes: false },
      blockquote: { HTMLAttributes: { class: 'border-l-4 border-zinc-300 dark:border-zinc-600 pl-4 italic' } },
    }),
    Image.configure({
      allowBase64: true,
      HTMLAttributes: {
        class: 'max-w-full h-auto rounded-lg',
      },
    }),
    Table.configure({ 
      resizable: true,
      handleWidth: 5,
      cellMinWidth: 50,
    }),
    TableRow,
    TableHeader.configure({
      HTMLAttributes: {
        class: 'bg-zinc-100 dark:bg-zinc-800',
      },
    }),
    TableCell.configure({
      HTMLAttributes: {
        class: 'border border-zinc-300 dark:border-zinc-700 px-3 py-2',
      },
    }),
    TextStyle,
    Color,
    Highlight.configure({ 
      multicolor: true,
      HTMLAttributes: {
        class: 'rounded-sm',
      },
    }),
    Link.configure({ 
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-600 dark:text-blue-400 underline cursor-pointer',
      },
    }),
  ];

  const extensions = Array.from(new Map(_extensions.map(e => [e.name, e])).values());

  const editor = useEditor({
    extensions,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    autofocus: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4 prose-table:border-collapse prose-table:w-full prose-td:border prose-td:border-zinc-300 dark:prose-td:border-zinc-700 prose-th:border prose-th:border-zinc-300 dark:prose-th:border-zinc-700 prose-th:bg-zinc-100 dark:prose-th:bg-zinc-800 prose-td:p-2 prose-th:p-2 prose-img:rounded-lg',
      },
    },
  });

  // Set content after editor initialization and when content prop changes from external source
  useEffect(() => {
    if (!editor) return;

    try {
      const currentContent = editor.getHTML();
      // Only update if the new content is different from what's currently in the editor
      // This prevents resetting when parent updates from our own onChange callback
      if (content && content !== currentContent && content !== initialContentRef.current) {
        editor.commands.setContent(content);
        initialContentRef.current = content;
      }
    } catch (err) {
      console.error('Failed to set editor content:', err);
      editor.commands.clearContent();
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  // normalize URL: add https:// if missing scheme
  const normalizeUrl = (raw) => {
    const s = raw.trim();
    if (!s) return s;
    // common protocols
    if (/^https?:\/\//i.test(s) || /^mailto:/i.test(s)) return s;
    return `https://${s}`;
  };

  const handleImageSubmit = (dataUrl) => {
    if (!dataUrl) {
      console.error('No image data provided');
      return;
    }

    try {
      if (!editor) {
        console.error('Editor not initialized');
        return;
      }

      // Ensure editor has focus
      editor.chain().focus().run();

      // Insert the image
      const result = editor.chain().focus().setImage({ src: dataUrl }).run();

      if (!result) {
        console.error('Failed to insert image');
      } else {
        console.log('Image inserted successfully');
      }
    } catch (error) {
      console.error('Error inserting image:', error);
    }

    setImageModalOpen(false);
  };

  const handleLinkSubmit = (url) => {
    const normalized = normalizeUrl(url);
    if (normalized) {
      // set link attributes and open in new tab
      editor.chain().focus().setLink({ href: normalized, target: '_blank', rel: 'noopener' }).run();
    }
    setLinkModalOpen(false);
  };

  const handleColorSubmit = (color) => {
    if (!color) {
      // Remove color formatting
      try {
        editor.chain().focus().unsetColor().run();
      } catch (err) {
        console.error('unsetColor failed', err);
      }
      setColorModalOpen(false);
      return;
    }
    try {
      editor.chain().focus().setColor(color).run();
    } catch (err) {
      console.error('setColor failed', err);
    }
    setColorModalOpen(false);
  };

  const handleHighlightSubmit = (color) => {
    try {
      editor.chain().focus().setHighlight({ color }).run();
    } catch (err) {
      console.error('setHighlight failed', err);
    }
    setHighlightModalOpen(false);
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const ToolbarButton = ({ onClick, active, disabled, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition ${
        active
          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
          : 'hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );

  const containerColorClass = {
    default: 'bg-white dark:bg-zinc-800',
    yellow: 'bg-note-yellow dark:bg-yellow-900/30',
    pink: 'bg-note-pink dark:bg-pink-900/30',
    blue: 'bg-note-blue dark:bg-blue-900/30',
    green: 'bg-note-green dark:bg-green-900/30',
    purple: 'bg-note-purple dark:bg-purple-900/30',
    orange: 'bg-note-orange dark:bg-orange-900/30',
  }[noteColor || 'default'];

  return (
    <>
      <div className={`border border-zinc-300 dark:border-zinc-700 rounded-xl overflow-hidden ${containerColorClass}`}>
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 p-2 border-b border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo size={18} />
          </ToolbarButton>

          <div className="w-px h-8 bg-zinc-300 dark:bg-zinc-700 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={18} />
          </ToolbarButton>

          <div className="w-px h-8 bg-zinc-300 dark:bg-zinc-700 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold"
          >
            <Bold size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic"
          >
            <Italic size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
            title="Code"
          >
            <Code size={18} />
          </ToolbarButton>

          <div className="w-px h-8 bg-zinc-300 dark:bg-zinc-700 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote size={18} />
          </ToolbarButton>

          <div className="w-px h-8 bg-zinc-300 dark:bg-zinc-700 mx-1" />

          <ToolbarButton onClick={() => setColorModalOpen(true)} title="Text Color">
            <Palette size={18} />
          </ToolbarButton>
          <ToolbarButton onClick={() => setHighlightModalOpen(true)} title="Highlight">
            <Highlighter size={18} />
          </ToolbarButton>

          <div className="w-px h-8 bg-zinc-300 dark:bg-zinc-700 mx-1" />

          <ToolbarButton onClick={() => setImageModalOpen(true)} title="Insert Image">
            <ImageIcon size={18} />
          </ToolbarButton>
          <ToolbarButton onClick={addTable} title="Insert Table">
            <TableIcon size={18} />
          </ToolbarButton>
          <ToolbarButton onClick={() => setLinkModalOpen(true)} active={editor.isActive('link')} title="Add Link">
            <LinkIcon size={18} />
          </ToolbarButton>
        </div>

        {/* Editor */}
        <EditorContent editor={editor} className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
      </div>

      {/* Modals */}
      <FileUploadModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSubmit={handleImageSubmit}
        title="Insert Image"
      />
      <InputModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onSubmit={handleLinkSubmit}
        title="Insert Link"
        placeholder="Enter URL"
      />
      <ColorPickerModal
        isOpen={colorModalOpen}
        onClose={() => setColorModalOpen(false)}
        onSubmit={handleColorSubmit}
        title="Text Color"
        type="text"
      />
      <ColorPickerModal
        isOpen={highlightModalOpen}
        onClose={() => setHighlightModalOpen(false)}
        onSubmit={handleHighlightSubmit}
        title="Highlight Color"
        type="highlight"
      />
    </>
  );
}
