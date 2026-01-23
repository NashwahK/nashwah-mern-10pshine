import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { notesAPI } from '../services/api';
import { useAuth } from '../services/authContext.jsx';
import { Plus, LogOut, Trash2, Edit2 } from 'lucide-react';

function NotesList() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <h1 className="text-5xl font-bold" style={{ fontFamily: 'Caveat, cursive', color: '#000' }}>
            PENDOWN
          </h1>
          <div className="flex items-center gap-6">
            <span className="text-sm text-zinc-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition text-sm font-medium"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-zinc-900">Your Notes</h2>
          <button
            onClick={() => navigate('/notes/new')}
            className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-full hover:bg-zinc-800 transition shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            New
          </button>
        </div>

        <div className="mb-12">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search notes..."
            className="w-full bg-white border border-zinc-300 rounded-lg px-5 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
          />
        </div>

        {isLoading && (
          <p className="text-center text-zinc-500 py-12">Loading notes...</p>
        )}
        {error && (
          <p className="text-center text-red-500 py-12">Failed to load notes</p>
        )}

        {data?.notes && data.notes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.notes.map((note, idx) => {
              const colors = [
                'bg-yellow-100',
                'bg-pink-100',
                'bg-blue-100',
                'bg-green-100',
                'bg-purple-100',
                'bg-orange-100',
              ];
              const bgColor = colors[idx % colors.length];

              return (
                <div
                  key={note._id}
                  className={`${bgColor} rounded-lg p-6 shadow-md hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer relative group`}
                  onClick={() => navigate(`/notes/${note._id}/edit`)}
                >
                  <h3 className="text-lg font-semibold text-zinc-900 mb-3 line-clamp-2">
                    {note.title}
                  </h3>
                  <p className="text-zinc-700 text-sm line-clamp-4 mb-4">
                    {note.content}
                  </p>
                  <p className="text-xs text-zinc-600 mb-4">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/notes/${note._id}/edit`);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 text-white text-xs py-2 rounded hover:bg-zinc-800 transition"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(note._id);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white text-xs py-2 rounded hover:bg-red-600 transition"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-zinc-500 mb-8 text-lg">No notes yet. Create your first one!</p>
            <button
              onClick={() => navigate('/notes/new')}
              className="inline-flex items-center gap-2 bg-zinc-900 text-white px-8 py-3 rounded-full hover:bg-zinc-800 transition shadow-lg"
            >
              <Plus size={20} />
              Create Note
            </button>
          </div>
        )}

        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex justify-center gap-3 mt-12">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-5 py-2 bg-white border border-zinc-300 text-zinc-900 rounded-lg disabled:opacity-50 hover:bg-zinc-50 transition"
            >
              Previous
            </button>
            <span className="px-5 py-2 text-zinc-600 font-medium">
              Page {page} of {data.pagination.pages}
            </span>
            <button
              onClick={() => setPage(Math.min(data.pagination.pages, page + 1))}
              disabled={page === data.pagination.pages}
              className="px-5 py-2 bg-white border border-zinc-300 text-zinc-900 rounded-lg disabled:opacity-50 hover:bg-zinc-50 transition"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default NotesList;
