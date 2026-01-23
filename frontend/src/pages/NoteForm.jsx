import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesAPI } from '../services/api';
import { ArrowLeft, Check } from 'lucide-react';

function NoteForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const isEdit = !!id;

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
    }
  }, [data, isEdit]);

  const saveMutation = useMutation({
    mutationFn: (noteData) =>
      isEdit ? notesAPI.updateNote(id, noteData) : notesAPI.createNote(noteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      navigate('/notes');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }
    saveMutation.mutate({ title, content });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/notes')}
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition font-medium"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-2 rounded-full hover:bg-zinc-800 transition disabled:opacity-50 font-medium"
          >
            <Check size={18} />
            {saveMutation.isPending ? 'Saving...' : 'Done'}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full text-4xl font-bold text-zinc-900 bg-transparent border-none focus:outline-none placeholder-zinc-400"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing..."
            className="w-full h-96 text-lg text-zinc-800 bg-transparent border-none focus:outline-none placeholder-zinc-400 resize-none leading-relaxed"
          />
        </form>
      </main>
    </div>
  );
}

export default NoteForm;
