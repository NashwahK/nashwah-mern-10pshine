import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function InputModal({ isOpen, onClose, onSubmit, title, placeholder, defaultValue = '' }) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  const handleClose = () => {
    setValue('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition"
          >
            <X size={20} />
          </button>
        </div>
        
        <div>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e); } }}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
            autoFocus
          />

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition font-medium"
            >
              Insert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
