import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { notesAPI } from '../services/api';
import { useAuth } from '../services/authContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { Plus, LogOut, Trash2, Edit2, Search, Tag, Sun, Moon } from 'lucide-react';

function NotesList() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['notes', page, search],
    queryFn: () => notesAPI.getNotes(page, 10, search),
    select: (res) => res.data.data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notesAPI.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const handleDelete = (id) => {
    if (confirm('Delete this note?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 transition-colors duration-300">
      <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white"> Pendown</h1>
            <span className="hidden sm:inline text-sm text-zinc-500 dark:text-zinc-400">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {isDark ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-zinc-700" />}
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition text-sm font-medium px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <LogOut size={18} /><span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex gap-3 items-center flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={20} />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search notes..." className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-600 transition" />
          </div>
          <button onClick={() => navigate('/notes/new')} className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition shadow-lg hover:shadow-xl font-medium">
            <Plus size={20} /><span>New Note</span>
          </button>
        </div>

        {isLoading && <div className="flex justify-center items-center py-20"><div className="w-12 h-12 border-4 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin"></div></div>}
        {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">Failed to load notes</div>}

        {!isLoading && !error && data?.notes && data.notes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.notes.map((note) => {
              const colorClass = {
                default: 'bg-white dark:bg-zinc-800',
                yellow: 'bg-note-yellow dark:bg-yellow-700/40',
                pink: 'bg-note-pink dark:bg-pink-700/35',
                blue: 'bg-note-blue dark:bg-blue-700/35',
                green: 'bg-note-green dark:bg-green-700/35',
                purple: 'bg-note-purple dark:bg-purple-700/35',
                orange: 'bg-note-orange dark:bg-orange-700/35',
              }[note.color || 'default'];

              return (
                <div
                  key={note._id}
                  className={`${colorClass} rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer relative group border border-zinc-200 dark:border-zinc-700`}
                  onClick={() => navigate(`/notes/${note._id}/edit`)}
                >
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3 line-clamp-2">{note.title}</h3>
                  <div className="text-zinc-700 dark:text-zinc-300 text-sm line-clamp-4 mb-3" dangerouslySetInnerHTML={{ __html: (note.content || '').substring(0, 200) }} />
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {note.tags.map((t) => (
                        <span key={t} className="text-xs px-2 py-1 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200">{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-300 dark:border-zinc-700">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(note.createdAt).toLocaleDateString()}</p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/notes/${note._id}/edit`); }}
                        className="p-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(note._id); }}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : !isLoading && !error && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">No notes yet</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8">Create your first note!</p>
            <button onClick={() => navigate('/notes/new')} className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-8 py-3 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition shadow-lg font-medium">
              <Plus size={20} />Create Note
            </button>
          </div>
        )}

        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-5 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg disabled:opacity-50 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition">Previous</button>
            <span className="px-5 py-2 text-zinc-600 dark:text-zinc-400 font-medium">Page {page} of {data.pagination.pages}</span>
            <button onClick={() => setPage(Math.min(data.pagination.pages, page + 1))} disabled={page === data.pagination.pages} className="px-5 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg disabled:opacity-50 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition">Next</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default NotesList;
