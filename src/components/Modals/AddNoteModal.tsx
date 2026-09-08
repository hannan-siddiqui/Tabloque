import React, { useState, useEffect, useRef } from 'react';
import { X, StickyNote, Pin, List, ListOrdered } from 'lucide-react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Insert Bullet List into textarea
  const handleInsertBulletList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (selectedText.includes('\n')) {
      const lines = selectedText.split('\n');
      const allBulleted = lines.every((l) => l.startsWith('• '));
      const newLines = allBulleted
        ? lines.map((l) => l.replace(/^•\s*/, ''))
        : lines.map((l) => (l.startsWith('• ') ? l : `• ${l}`));
      const replacement = newLines.join('\n');
      const newContent = content.substring(0, start) + replacement + content.substring(end);
      setContent(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + replacement.length);
      }, 0);
    } else {
      // Find beginning of current line
      const beforeCursor = content.substring(0, start);
      const lastNewline = beforeCursor.lastIndexOf('\n');
      const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
      const currentLine = content.substring(lineStart, start);

      if (currentLine.startsWith('• ')) {
        // Toggle off
        const newContent = content.substring(0, lineStart) + currentLine.replace(/^•\s*/, '') + content.substring(start);
        setContent(newContent);
      } else {
        // Insert bullet at line start
        const newContent = content.substring(0, lineStart) + '• ' + content.substring(lineStart);
        setContent(newContent);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + 2, end + 2);
        }, 0);
      }
    }
  };

  // Insert Numbered List into textarea
  const handleInsertNumberedList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (selectedText.includes('\n')) {
      const lines = selectedText.split('\n');
      const allNumbered = lines.every((l) => /^\d+\.\s+/.test(l));
      const newLines = allNumbered
        ? lines.map((l) => l.replace(/^\d+\.\s*/, ''))
        : lines.map((l, idx) => `${idx + 1}. ${l.replace(/^\d+\.\s*/, '')}`);
      const replacement = newLines.join('\n');
      const newContent = content.substring(0, start) + replacement + content.substring(end);
      setContent(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + replacement.length);
      }, 0);
    } else {
      // Find beginning of current line
      const beforeCursor = content.substring(0, start);
      const lastNewline = beforeCursor.lastIndexOf('\n');
      const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
      const currentLine = content.substring(lineStart, start);

      if (/^\d+\.\s+/.test(currentLine)) {
        // Toggle off
        const newContent = content.substring(0, lineStart) + currentLine.replace(/^\d+\.\s*/, '') + content.substring(start);
        setContent(newContent);
      } else {
        // Insert 1. at line start
        const newContent = content.substring(0, lineStart) + '1. ' + content.substring(lineStart);
        setContent(newContent);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + 3, end + 3);
        }, 0);
      }
    }
  };

  // Smart keyboard handling for auto bullet/number continuation
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const cursor = textarea.selectionStart;
      const textBefore = content.substring(0, cursor);
      const lastNewline = textBefore.lastIndexOf('\n');
      const currentLine = lastNewline === -1 ? textBefore : textBefore.substring(lastNewline + 1);

      // Check for bullet list
      const bulletMatch = currentLine.match(/^(•|-|\*)\s*(.*)$/);
      if (bulletMatch) {
        const bulletSymbol = bulletMatch[1] === '-' || bulletMatch[1] === '*' ? '•' : bulletMatch[1];
        const lineContent = bulletMatch[2];

        // Empty bullet line: clear bullet and exit list
        if (!lineContent.trim()) {
          e.preventDefault();
          const lineStartIndex = lastNewline === -1 ? 0 : lastNewline + 1;
          const newContent = content.substring(0, lineStartIndex) + content.substring(cursor);
          setContent(newContent);
          setTimeout(() => {
            textarea.setSelectionRange(lineStartIndex, lineStartIndex);
          }, 0);
          return;
        }

        // Non-empty bullet: continue list on next line
        e.preventDefault();
        const insertion = `\n${bulletSymbol} `;
        const newContent = content.substring(0, cursor) + insertion + content.substring(cursor);
        setContent(newContent);
        setTimeout(() => {
          const newCursor = cursor + insertion.length;
          textarea.setSelectionRange(newCursor, newCursor);
        }, 0);
        return;
      }

      // Check for numbered list
      const numMatch = currentLine.match(/^(\d+)\.\s*(.*)$/);
      if (numMatch) {
        const currentNum = parseInt(numMatch[1], 10);
        const lineContent = numMatch[2];

        // Empty numbered line: clear number and exit list
        if (!lineContent.trim()) {
          e.preventDefault();
          const lineStartIndex = lastNewline === -1 ? 0 : lastNewline + 1;
          const newContent = content.substring(0, lineStartIndex) + content.substring(cursor);
          setContent(newContent);
          setTimeout(() => {
            textarea.setSelectionRange(lineStartIndex, lineStartIndex);
          }, 0);
          return;
        }

        // Non-empty number: continue incremented list on next line
        e.preventDefault();
        const insertion = `\n${currentNum + 1}. `;
        const newContent = content.substring(0, cursor) + insertion + content.substring(cursor);
        setContent(newContent);
        setTimeout(() => {
          const newCursor = cursor + insertion.length;
          textarea.setSelectionRange(newCursor, newCursor);
        }, 0);
        return;
      }
    }
  };

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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">Content *</label>

              {/* Formatting Toolbar */}
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={handleInsertBulletList}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Insert Bullet List (•)"
                >
                  <List className="w-3.5 h-3.5 text-[var(--theme-accent,#22c55e)]" />
                  <span>Bullets</span>
                </button>
                <div className="w-px h-3 bg-white/10" />
                <button
                  type="button"
                  onClick={handleInsertNumberedList}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Insert Numbered List (1. 2.)"
                >
                  <ListOrdered className="w-3.5 h-3.5 text-[var(--theme-accent,#22c55e)]" />
                  <span>Numbered</span>
                </button>
              </div>
            </div>

            <textarea
              ref={textareaRef}
              required
              rows={7}
              placeholder="Write your note, checklist, code snippets, or thoughts here... Use toolbar or type • / 1. for lists"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl liquid-glass text-white placeholder-slate-500 outline-none border border-white/15 focus:border-[var(--theme-accent,#22c55e)] resize-none custom-scrollbar leading-relaxed"
            />
            <div className="mt-1 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Tip: Press Enter in a list to auto-continue; press Enter on an empty list item to exit</span>
              <span>{content.length} chars</span>
            </div>
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

