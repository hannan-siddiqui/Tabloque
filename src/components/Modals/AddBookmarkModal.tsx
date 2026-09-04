import React, { useState, useEffect } from 'react';
import { X, BookmarkPlus, Link2, Type, FileText } from 'lucide-react';
import { Bookmark } from '../../types';

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string | null;
  bookmarkToEdit?: Bookmark | null;
  onSave: (boardId: string, bookmarkData: { title: string; url: string; description?: string }) => void;
  onUpdate?: (bookmarkId: string, updates: Partial<Bookmark>) => void;
}

export const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({
  isOpen,
  onClose,
  boardId,
  bookmarkToEdit,
  onSave,
  onUpdate,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (bookmarkToEdit) {
      setUrl(bookmarkToEdit.url);
      setTitle(bookmarkToEdit.title);
      setDescription(bookmarkToEdit.description || '');
    } else {
      setUrl('');
      setTitle('');
      setDescription('');
    }
  }, [bookmarkToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (bookmarkToEdit && onUpdate) {
      onUpdate(bookmarkToEdit.id, {
        url: url.trim(),
        title: title.trim() || url.trim(),
        description: description.trim(),
      });
    } else if (boardId) {
      onSave(boardId, {
        url: url.trim(),
        title: title.trim() || url.trim(),
        description: description.trim(),
      });
    }

    onClose();
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    if (!title.trim() && newUrl.trim()) {
      try {
        const parsed = new URL(newUrl.startsWith('http') ? newUrl : `https://${newUrl}`);
        let host = parsed.hostname.replace(/^www\./, '');
        const parts = host.split('.');
        if (parts.length > 2 && (parts[0] === 'web' || parts[0] === 'app' || parts[0] === 'm')) {
          parts.shift();
        }
        const namePart = parts[0];
        if (namePart && namePart.length > 1) {
          setTitle(namePart.charAt(0).toUpperCase() + namePart.slice(1));
        }
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-3xl liquid-glass-modal p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl liquid-glass-pill text-emerald-400 flex items-center justify-center">
              <BookmarkPlus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">
              {bookmarkToEdit ? 'Edit Bookmark' : 'Add Bookmark'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-medium flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-emerald-400" /> Name (Visible on card) *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. WhatsApp, YouTube, Figma"
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-white placeholder-slate-400/70 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-medium flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-slate-400" /> Link / URL *
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://web.whatsapp.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-white placeholder-slate-400/70 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-medium flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Notes / Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Quick memo, login hints, or project tags..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-white placeholder-slate-400/70 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl liquid-glass-pill text-slate-300 hover:text-white transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-semibold shadow-[0_0_20px_rgba(34,197,94,0.35)] transition-all cursor-pointer"
            >
              {bookmarkToEdit ? 'Save Changes' : 'Add Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
