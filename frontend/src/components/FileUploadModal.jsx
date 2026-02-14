import { useState } from 'react';
import { X, Upload, Check } from 'lucide-react';

export default function FileUploadModal({ isOpen, onClose, onSubmit, title }) {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (file) => {
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, GIF, WebP)');
      return;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`Image size must be less than 10MB. Your file: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    setError('');
    setFileName(file.name);

    // Create preview with proper error handling
    const reader = new FileReader();
    reader.onerror = () => {
      setError('Failed to read file. Please try another image.');
      setPreview(null);
    };
    reader.onload = (event) => {
      try {
        const result = event.target.result;
        if (result && typeof result === 'string') {
          setPreview(result);
        } else {
          setError('Failed to process image.');
          setPreview(null);
        }
      } catch (err) {
        setError('Error processing image: ' + err.message);
        setPreview(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleSubmit = () => {
    if (preview) {
      try {
        onSubmit(preview);
        setPreview(null);
        setFileName('');
        setError('');
        onClose();
      } catch (err) {
        setError('Error inserting image: ' + err.message);
      }
    }
  };

  const handleClose = () => {
    setPreview(null);
    setFileName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-4 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* File Upload Area */}
          <label className="block">
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                isDragging
                  ? 'border-zinc-900 dark:border-white bg-zinc-100 dark:bg-zinc-800'
                  : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
                <div className={`p-3 rounded-xl ${isDragging ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                  <Upload
                    size={32}
                    className={isDragging ? 'text-white dark:text-zinc-900' : 'text-zinc-600 dark:text-zinc-400'}
                  />
                </div>
                <div>
                  <p className="text-base font-semibold text-zinc-900 dark:text-white">
                    Drag and drop your image here
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    or click to browse
                  </p>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                  PNG, JPG, GIF, WebP up to 10MB
                </p>
              </div>
            </div>
          </label>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-700 dark:text-red-400 flex items-start gap-3">
              <span className="text-red-500 dark:text-red-400 flex-shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Image Preview */}
          {preview && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Check size={20} className="text-green-600 dark:text-green-400" />
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Image selected</p>
                {fileName && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">- {fileName}</p>
                )}
              </div>
              <div className="relative rounded-xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-800">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border-2 border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!preview}
              className="flex-1 px-4 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Insert Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
