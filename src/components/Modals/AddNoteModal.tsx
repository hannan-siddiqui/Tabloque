import React, { useState, useEffect } from 'react';
import { X, StickyNote, Pin } from 'lucide-react';
import { NoteBoard, NoteItem } from '../../types';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  boards: Record<string, NoteBoard>;
  targetBoardId: string | null;
  noteToEdit?: NoteItem | null;
  onSave: (boardId: string, noteData: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate?: (noteId: string, updates: Partial<NoteItem>) => void;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({
  isOpen,
  onClose,
  boards,
  targetBoardId,
  noteToEdit,
  onSave,
  onUpdate,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title);
      setContent(noteToEdit.content);
      setIsPinned(noteToEdit.isPinned ?? false);
    } else {
      setTitle('');
      setContent('');
      setIsPinned(false);
    }

    if (targetBoardId && boards[targetBoardId]) {
      setSelectedBoardId(targetBoardId);
    } else {
      const firstBoard = Object.keys(boards)[0];
      setSelectedBoardId(firstBoard || '');
    }
  }, [isOpen, noteToEdit, targetBoardId, boards]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (noteToEdit && onUpdate) {
      onUpdate(noteToEdit.id, {
        title: title.trim(),
        content: content.trim(),
        isPinned,
      });
    } else if (selectedBoardId) {
      onSave(selectedBoardId, {
        title: title.trim(),
        content: content.trim(),
        isPinned,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg rounded-3xl liquid-glass-modal p-6 shadow-2xl z-10 animate-fade-in text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-[var(--theme-accent,#22c55e)]" />
            <h2 className="text-base font-bold text-white">
              {noteToEdit ? 'Edit Note' : 'Create New Note'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!noteToEdit && Object.keys(boards).length > 1 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Card</label>
              <select
                value={selectedBoardId}
                onChange={(e) => setSelectedBoardId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl liquid-glass text-slate-200 outline-none border border-white/15"
              >
                {Object.values(boards).map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                    {b.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Note Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Project Architecture, Daily Meeting, Ideas"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl liquid-glass text-white placeholder-slate-500 outline-none border border-white/15 focus:border-[var(--theme-accent,#22c55e)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Content *</label>
            <textarea
              required
              rows={6}
              placeholder="Write your note, checklist, code snippets, or thoughts here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl liquid-glass text-white placeholder-slate-500 outline-none border border-white/15 focus:border-[var(--theme-accent,#22c55e)] resize-none custom-scrollbar leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPinned((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isPinned
                  ? 'bg-[var(--theme-accent,#22c55e)]/20 text-[var(--theme-accent,#22c55e)] border border-[var(--theme-accent,#22c55e)]/40'
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
              <span>{isPinned ? 'Pinned Note' : 'Pin Note'}</span>
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[var(--theme-accent,#22c55e)] hover:brightness-110 shadow-lg shadow-[var(--theme-accent,rgba(34,197,94,0.4))] transition-all cursor-pointer"
            >
              {noteToEdit ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
