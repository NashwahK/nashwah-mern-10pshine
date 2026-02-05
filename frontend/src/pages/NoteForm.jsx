import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesAPI } from '../services/api';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';
import RichTextEditor from '../components/RichTextEditor.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { ArrowLeft, Check, Pin, Tag as TagIcon, X, Palette } from 'lucide-react';

function NoteForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { isDark } = useTheme();
  const { showNotification } = useNotification();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [color, setColor] = useState('default');
  const [error, setError] = useState('');
  const [originalData, setOriginalData] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  const isEdit = !!id;

  const colors = [
    { name: 'default', label: 'Default', bg: 'bg-white dark:bg-zinc-800' },
    { name: 'yellow', label: 'Yellow', bg: 'bg-note-yellow dark:bg-yellow-700/40' },
    { name: 'pink', label: 'Pink', bg: 'bg-note-pink dark:bg-pink-700/35' },
    { name: 'blue', label: 'Blue', bg: 'bg-note-blue dark:bg-blue-700/35' },
    { name: 'green', label: 'Green', bg: 'bg-note-green dark:bg-green-700/35' },
    { name: 'purple', label: 'Purple', bg: 'bg-note-purple dark:bg-purple-700/35' },
    { name: 'orange', label: 'Orange', bg: 'bg-note-orange dark:bg-orange-700/35' },
  ];

  const { data } = useQuery({
    queryKey: ['note', id],
    queryFn: () => notesAPI.getNoteById(id),
    enabled: isEdit,
    select: (res) => res.data.data.note,
  });

  useEffect(() => {
    if (isEdit && data) {
      setTitle(data.title);
      setContent(data.content);
      setTags(data.tags || []);
      setIsPinned(data.isPinned || false);
      setColor(data.color || 'default');
      setOriginalData({
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        isPinned: data.isPinned || false,
        color: data.color || 'default',
      });
    } else {
      // For new notes, set empty original data
      setOriginalData({
        title: '',
        content: '',
        tags: [],
        isPinned: false,
        color: 'default',
      });
    }
  }, [data, isEdit]);

  // Track unsaved changes and show warning on leave
  const hasChanges = () => {
    if (!originalData) return false;
    return (
      title !== originalData.title ||
      content !== originalData.content ||
      JSON.stringify(tags) !== JSON.stringify(originalData.tags) ||
      isPinned !== originalData.isPinned ||
      color !== originalData.color
    );
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [title, content, tags, isPinned, color, originalData]);

  const saveMutation = useMutation({
    mutationFn: (noteData) =>
      isEdit ? notesAPI.updateNote(id, noteData) : notesAPI.createNote(noteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      showNotification(
        isEdit ? 'Note updated successfully' : 'Note created successfully',
        'success'
      );
      navigate('/notes');
    },
    onError: () => {
      showNotification('Failed to save note', 'error');
    },
  });

  const handleNavigateBack = () => {
    if (hasChanges()) {
      setShowLeaveConfirm(true);
      setPendingNavigation('/notes');
    } else {
      navigate('/notes');
    }
  };

  const handleConfirmLeave = () => {
    setShowLeaveConfirm(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }
    saveMutation.mutate({ title, content, tags, isPinned, color });
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 transition-colors duration-300">
      <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={handleNavigateBack}
            className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition font-medium"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isPinned
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              <Pin size={16} className={isPinned ? 'fill-current' : ''} />
              {isPinned ? 'Pinned' : 'Pin'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={saveMutation.isPending}
              className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition disabled:opacity-50 font-medium shadow-lg"
            >
              <Check size={18} />
              {saveMutation.isPending ? 'Saving...' : 'Done'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 mb-6 animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Color Picker */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              <Palette size={16} />
              Note Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  className={`px-4 py-2 rounded-lg ${c.bg} text-zinc-900 dark:text-white border-2 transition ${
                    color === c.name
                      ? 'border-zinc-900 dark:border-zinc-100 shadow-lg scale-105'
                      : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full bg-transparent border-0 text-3xl font-bold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
            autoFocus
          />

          {/* Tags Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              <TagIcon size={16} />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500 transition"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag..."
                className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-600 transition"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition font-medium"
              >
                Add
              </button>
            </div>
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              Content
            </label>
            <RichTextEditor content={content} onChange={setContent} noteColor={color} />
          </div>
        </form>
      </main>

      {/* Leave confirmation dialog */}
      <ConfirmDialog
        isOpen={showLeaveConfirm}
        title="Leave this note?"
        message="Are you sure you want to leave this wisdom behind? Your changes won't be saved."
        confirmText="Leave Anyway"
        cancelText="Keep Working"
        onConfirm={handleConfirmLeave}
        onCancel={() => setShowLeaveConfirm(false)}
        isDangerous={true}
      />
    </div>
  );
}

export default NoteForm;
