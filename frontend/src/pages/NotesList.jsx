import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { notesAPI } from '../services/api';
import { useAuth } from '../services/authContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { Plus, LogOut, Trash2, Edit2, Search, Tag, Sun, Moon, ChevronDown } from 'lucide-react';

function NotesList() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ['notes', page, search],
    queryFn: () => notesAPI.getNotes(page, 10, search),
    select: (res) => res.data.data,
  });

  // Extract all unique tags from notes
  const allTags = Array.from(new Set(rawData?.notes?.flatMap(n => n.tags || []) || [])).sort();

  // Filter notes by selected tags and apply sorting
  const data = rawData ? {
    ...rawData,
    notes: (rawData.notes || [])
      .filter(note => selectedTags.length === 0 || selectedTags.some(tag => note.tags?.includes(tag)))
      .sort((a, b) => {
        switch (sortBy) {
          case 'oldest':
            return new Date(a.createdAt) - new Date(b.createdAt);
          case 'a-z':
            return a.title.localeCompare(b.title);
          case 'z-a':
            return b.title.localeCompare(a.title);
          case 'newest':
          default:
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
      })
  } : rawData;

  const deleteMutation = useMutation({
    mutationFn: (id) => notesAPI.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      showNotification('Note deleted successfully', 'success');
      setShowDeleteConfirm(false);
      setNoteToDelete(null);
    },
    onError: () => {
      showNotification('Failed to delete note', 'error');
    },
  });

  const handleDeleteClick = (id) => {
    setNoteToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (noteToDelete) {
      deleteMutation.mutate(noteToDelete);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 transition-colors duration-300 flex">
      {/* Left Sidebar */}
      <aside className="w-48 bg-transparent border-r border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center py-12 px-4 sticky top-0 h-screen">
        <div className="flex flex-col items-center gap-8 text-center">
          {/* Title */}
          <h1 className="text-5xl font-bold text-zinc-900 dark:text-white" style={{ fontFamily: '"Caveat", cursive' }}>
            Pendown
          </h1>

          {/* User Email */}
          <div className="text-xs text-zinc-600 dark:text-zinc-400 break-words max-w-[140px]">
            {user?.email}
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            className="p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {isDark ? <Sun size={24} className="text-yellow-500" /> : <Moon size={24} className="text-zinc-700" />}
          </button>

          {/* Logout Button */}
          <button 
            onClick={handleLogout} 
            className="flex flex-col items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition text-xs font-medium px-4 py-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 w-full justify-center"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 px-8 py-8">
        {/* Controls Section */}
        <div className="mb-8 space-y-4">
          {/* Search and New Note Row */}
          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex-1 min-w-[250px] relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 group-focus-within:text-zinc-700 dark:group-focus-within:text-zinc-300 transition-colors duration-200" size={20} />
              <input 
                type="text" 
                value={search} 
                onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
                placeholder="Search your notes..." 
                className="w-full bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300 focus:ring-0 transition-all duration-200" 
              />
            </div>
            <button 
              onClick={() => navigate('/notes/new')} 
              className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-200 font-medium shadow-sm hover:shadow-lg"
            >
              <Plus size={20} /><span>New Note</span>
            </button>
          </div>

          {/* Tags Filter and Sort Row */}
          <div className="flex gap-3 items-center flex-wrap">
            {/* Tag Filters */}
            {allTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap flex-1">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Filter:</span>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTags(
                      selectedTags.includes(tag) 
                        ? selectedTags.filter(t => t !== tag)
                        : [...selectedTags, tag]
                    )}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      selectedTags.includes(tag)
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <Tag size={12} className="inline mr-1" />{tag}
                  </button>
                ))}
              </div>
            )}

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-600 cursor-pointer"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="a-z">A → Z</option>
                <option value="z-a">Z → A</option>
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-400 pointer-events-none" />
            </div>
          </div>
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
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(note._id); }}
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

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete note?"
        message="This action cannot be undone. Are you sure you want to delete this note?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isDangerous={true}
      />
    </div>
  );
}

export default NotesList;
