import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Copy,
  Check,
  Edit2,
  Trash2,
  Pin,
  Maximize2,
  PanelRight,
  Calendar,
  Clock,
  FileText,
  List,
  ListOrdered,
  Save,
  RotateCcw,
} from 'lucide-react';
import { NoteItem } from '../../types';

interface NoteReaderModalProps {
  isOpen: boolean;
  note: NoteItem | null;
  initialEditMode?: boolean;
  onClose: () => void;
  onUpdate: (noteId: string, updates: Partial<NoteItem>) => void;
  onDelete: (noteId: string) => void;
  onToast?: (msg: string) => void;
}

export const NoteReaderModal: React.FC<NoteReaderModalProps> = ({
  isOpen,
  note,
  initialEditMode = false,
  onClose,
  onUpdate,
  onDelete,
  onToast,
}) => {
  // 'side' or 'fullscreen'
  const [viewMode, setViewMode] = useState<'side' | 'fullscreen'>('side');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(initialEditMode);

  // Form edit state
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editIsPinned, setEditIsPinned] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state whenever note or isOpen or initialEditMode changes
  useEffect(() => {
    if (note) {
      setEditTitle(note.title);
      setEditContent(note.content);
      setEditIsPinned(note.isPinned ?? false);
      setIsEditing(initialEditMode);
    }
  }, [note, isOpen, initialEditMode]);

  // Close on Escape if not editing, or cancel edit on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditing) {
          // Revert and exit edit mode
          if (note) {
            setEditTitle(note.title);
            setEditContent(note.content);
            setEditIsPinned(note.isPinned ?? false);
          }
          setIsEditing(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isEditing, note, onClose]);

  if (!isOpen || !note) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(note.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onToast?.('Note copied to clipboard!');
  };

  const handleStartEdit = () => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditIsPinned(note.isPinned ?? false);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditIsPinned(note.isPinned ?? false);
    setIsEditing(false);
  };

  const handleSaveEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editTitle.trim() || !editContent.trim()) return;

    onUpdate(note.id, {
      title: editTitle.trim(),
      content: editContent.trim(),
      isPinned: editIsPinned,
    });
    onToast?.('Note saved successfully!');
    setIsEditing(false);
  };

  const handleDelete = () => {
    onClose();
    onDelete(note.id);
  };

  // Bullet list toggle in edit mode
  const handleInsertBulletList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editContent.substring(start, end);

    if (selectedText.includes('\n')) {
      const lines = selectedText.split('\n');
      const allBulleted = lines.every((l) => l.startsWith('• '));
      const newLines = allBulleted
        ? lines.map((l) => l.replace(/^•\s*/, ''))
        : lines.map((l) => (l.startsWith('• ') ? l : `• ${l}`));
      const replacement = newLines.join('\n');
      const newContent = editContent.substring(0, start) + replacement + editContent.substring(end);
      setEditContent(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + replacement.length);
      }, 0);
    } else {
      const beforeCursor = editContent.substring(0, start);
      const lastNewline = beforeCursor.lastIndexOf('\n');
      const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
      const currentLine = editContent.substring(lineStart, start);

      if (currentLine.startsWith('• ')) {
        const newContent = editContent.substring(0, lineStart) + currentLine.replace(/^•\s*/, '') + editContent.substring(start);
        setEditContent(newContent);
      } else {
        const newContent = editContent.substring(0, lineStart) + '• ' + editContent.substring(lineStart);
        setEditContent(newContent);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + 2, end + 2);
        }, 0);
      }
    }
  };

  // Numbered list toggle in edit mode
  const handleInsertNumberedList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editContent.substring(start, end);

    if (selectedText.includes('\n')) {
      const lines = selectedText.split('\n');
      const allNumbered = lines.every((l) => /^\d+\.\s+/.test(l));
      const newLines = allNumbered
        ? lines.map((l) => l.replace(/^\d+\.\s*/, ''))
        : lines.map((l, idx) => `${idx + 1}. ${l.replace(/^\d+\.\s*/, '')}`);
      const replacement = newLines.join('\n');
      const newContent = editContent.substring(0, start) + replacement + editContent.substring(end);
      setEditContent(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + replacement.length);
      }, 0);
    } else {
      const beforeCursor = editContent.substring(0, start);
      const lastNewline = beforeCursor.lastIndexOf('\n');
      const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
      const currentLine = editContent.substring(lineStart, start);

      if (/^\d+\.\s+/.test(currentLine)) {
        const newContent = editContent.substring(0, lineStart) + currentLine.replace(/^\d+\.\s*/, '') + editContent.substring(start);
        setEditContent(newContent);
      } else {
        const newContent = editContent.substring(0, lineStart) + '1. ' + editContent.substring(lineStart);
        setEditContent(newContent);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + 3, end + 3);
        }, 0);
      }
    }
  };

  // Auto continuation on Enter in edit mode
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const cursor = textarea.selectionStart;
      const textBefore = editContent.substring(0, cursor);
      const lastNewline = textBefore.lastIndexOf('\n');
      const currentLine = lastNewline === -1 ? textBefore : textBefore.substring(lastNewline + 1);

      // Bullet continuation
      const bulletMatch = currentLine.match(/^(•|-|\*)\s*(.*)$/);
      if (bulletMatch) {
        const bulletSymbol = bulletMatch[1] === '-' || bulletMatch[1] === '*' ? '•' : bulletMatch[1];
        const lineContent = bulletMatch[2];

        if (!lineContent.trim()) {
          e.preventDefault();
          const lineStartIndex = lastNewline === -1 ? 0 : lastNewline + 1;
          const newContent = editContent.substring(0, lineStartIndex) + editContent.substring(cursor);
          setEditContent(newContent);
          setTimeout(() => {
            textarea.setSelectionRange(lineStartIndex, lineStartIndex);
          }, 0);
          return;
        }

        e.preventDefault();
        const insertion = `\n${bulletSymbol} `;
        const newContent = editContent.substring(0, cursor) + insertion + editContent.substring(cursor);
        setEditContent(newContent);
        setTimeout(() => {
          const newCursor = cursor + insertion.length;
          textarea.setSelectionRange(newCursor, newCursor);
        }, 0);
        return;
      }

      // Numbered list continuation
      const numMatch = currentLine.match(/^(\d+)\.\s*(.*)$/);
      if (numMatch) {
        const currentNum = parseInt(numMatch[1], 10);
        const lineContent = numMatch[2];

        if (!lineContent.trim()) {
          e.preventDefault();
          const lineStartIndex = lastNewline === -1 ? 0 : lastNewline + 1;
          const newContent = editContent.substring(0, lineStartIndex) + editContent.substring(cursor);
          setEditContent(newContent);
          setTimeout(() => {
            textarea.setSelectionRange(lineStartIndex, lineStartIndex);
          }, 0);
          return;
        }

        e.preventDefault();
        const insertion = `\n${currentNum + 1}. `;
        const newContent = editContent.substring(0, cursor) + insertion + editContent.substring(cursor);
        setEditContent(newContent);
        setTimeout(() => {
          const newCursor = cursor + insertion.length;
          textarea.setSelectionRange(newCursor, newCursor);
        }, 0);
        return;
      }
    }
  };

  const createdDate = new Date(note.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const updatedDate = note.updatedAt
    ? new Date(note.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const currentDisplayContent = isEditing ? editContent : note.content;
  const wordCount = currentDisplayContent.trim() ? currentDisplayContent.trim().split(/\s+/).length : 0;
  const charCount = currentDisplayContent.length;

  // Render formatted lines (detecting bullet points and numbers)
  const renderFormattedContent = () => {
    const lines = note.content.split('\n');

    return (
      <div className="space-y-1.5 select-text text-sm leading-relaxed text-slate-200 font-sans">
        {lines.map((line, index) => {
          const trimmed = line.trimStart();
          const isBullet = trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ');
          const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);

          if (isBullet) {
            const bulletText = trimmed.replace(/^(•|-|\*)\s+/, '');
            return (
              <div key={index} className="flex items-start gap-2.5 my-1 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-accent,#22c55e)] shadow-[0_0_6px_var(--theme-accent,#22c55e)] mt-2 shrink-0" />
                <span className="flex-1 select-text">{bulletText || '\u00A0'}</span>
              </div>
            );
          }

          if (numberedMatch) {
            const num = numberedMatch[1];
            const numText = numberedMatch[2];
            return (
              <div key={index} className="flex items-start gap-2.5 my-1 pl-1">
                <span className="text-[11px] font-mono font-bold text-[var(--theme-accent,#22c55e)] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-md shrink-0 mt-0.5 min-w-[20px] text-center">
                  {num}
                </span>
                <span className="flex-1 select-text">{numText || '\u00A0'}</span>
              </div>
            );
          }

          if (line.trim() === '') {
            return <div key={index} className="h-3" />;
          }

          return (
            <p key={index} className="select-text whitespace-pre-wrap">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Side Screen Mode Drawer */}
      {viewMode === 'side' ? (
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-10">
          <div className="w-screen max-w-xl flex flex-col liquid-glass-modal shadow-2xl border-l border-white/15 animate-slide-left text-slate-100 h-full">
            {/* Header bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-[var(--theme-accent,#22c55e)] shrink-0" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {isEditing ? 'Editing Note' : 'Note Reader (Side Mode)'}
                </span>
                {(isEditing ? editIsPinned : note.isPinned) && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--theme-accent,#22c55e)] bg-[var(--theme-accent,#22c55e)]/15 border border-[var(--theme-accent,#22c55e)]/30 px-2 py-0.5 rounded-full">
                    <Pin className="w-2.5 h-2.5" /> Pinned
                  </span>
                )}
              </div>

              {/* Header Action Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-medium transition-colors border border-white/10 cursor-pointer"
                      title="Cancel changes"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveEdit()}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--theme-accent,#22c55e)] hover:brightness-110 text-white text-xs font-bold transition-all shadow-md shadow-[var(--theme-accent,rgba(34,197,94,0.3))] cursor-pointer"
                      title="Save Changes"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Mode Toggle: Switch to Fullscreen */}
                    <button
                      type="button"
                      onClick={() => setViewMode('fullscreen')}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-medium transition-colors border border-white/10 cursor-pointer"
                      title="Switch to Full Screen Mode"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Full Screen</span>
                    </button>

                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-medium transition-colors border border-white/10 cursor-pointer"
                      title="Copy note content"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {/* In-place Edit Button */}
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[var(--theme-accent,#22c55e)]/15 hover:bg-[var(--theme-accent,#22c55e)]/25 text-[var(--theme-accent,#22c55e)] text-xs font-semibold transition-colors border border-[var(--theme-accent,#22c55e)]/30 cursor-pointer"
                      title="Edit Note Here"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors border border-white/10 cursor-pointer"
                      title="Delete Note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Close Button */}
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors border border-white/10 cursor-pointer ml-1"
                      title="Close (Esc)"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Note Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar select-text space-y-5">
              {isEditing ? (
                /* INLINE EDIT MODE (SIDE SCREEN) */
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Note Title"
                      autoFocus
                      className="w-full text-lg font-bold text-white bg-white/5 border border-white/20 focus:border-[var(--theme-accent,#22c55e)] rounded-xl px-3.5 py-2 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Content
                      </label>

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
                      rows={14}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={handleTextareaKeyDown}
                      placeholder="Write your note here... Use toolbar or type • / 1. for lists"
                      className="w-full text-xs leading-relaxed text-slate-200 bg-white/5 border border-white/20 focus:border-[var(--theme-accent,#22c55e)] rounded-xl p-3.5 outline-none resize-none custom-scrollbar font-sans transition-colors"
                    />
                    <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                      <span>Press Enter in a list to auto-continue</span>
                      <span>{editContent.length} chars</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setEditIsPinned((prev) => !prev)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        editIsPinned
                          ? 'bg-[var(--theme-accent,#22c55e)]/20 text-[var(--theme-accent,#22c55e)] border border-[var(--theme-accent,#22c55e)]/40'
                          : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                      <span>{editIsPinned ? 'Pinned Note' : 'Pin Note'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[var(--theme-accent,#22c55e)] hover:brightness-110 shadow-lg shadow-[var(--theme-accent,rgba(34,197,94,0.3))] transition-all cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* READ MODE (SIDE SCREEN) */
                <>
                  <div>
                    <h1 className="text-xl font-bold text-white tracking-tight select-text leading-snug">
                      {note.title}
                    </h1>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-white/10" />

                  {/* Formatted body */}
                  <div className="py-1">{renderFormattedContent()}</div>
                </>
              )}
            </div>

            {/* Footer Metadata */}
            <div className="px-6 py-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between bg-black/20 shrink-0">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {createdDate}
                </span>
                {updatedDate && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    Updated {updatedDate}
                  </span>
                )}
              </div>
              <div className="font-mono text-slate-500">
                {wordCount} words • {charCount} chars
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Full Screen Mode Modal */
        <div className="fixed inset-0 z-10 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-4xl h-[90vh] flex flex-col rounded-3xl liquid-glass-modal shadow-2xl border border-white/20 animate-fade-in text-slate-100 overflow-hidden">
            {/* Fullscreen Header */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-[var(--theme-accent,#22c55e)] shrink-0" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {isEditing ? 'Editing Note (Full Screen)' : 'Note Reader (Full Screen Mode)'}
                </span>
                {(isEditing ? editIsPinned : note.isPinned) && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--theme-accent,#22c55e)] bg-[var(--theme-accent,#22c55e)]/15 border border-[var(--theme-accent,#22c55e)]/30 px-2.5 py-0.5 rounded-full">
                    <Pin className="w-2.5 h-2.5" /> Pinned
                  </span>
                )}
              </div>

              {/* Fullscreen Header Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-medium transition-colors border border-white/10 cursor-pointer"
                      title="Cancel changes"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveEdit()}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[var(--theme-accent,#22c55e)] hover:brightness-110 text-white text-xs font-bold transition-all shadow-md shadow-[var(--theme-accent,rgba(34,197,94,0.3))] cursor-pointer"
                      title="Save Changes"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Mode Toggle: Switch to Side Mode */}
                    <button
                      type="button"
                      onClick={() => setViewMode('side')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-medium transition-colors border border-white/10 cursor-pointer"
                      title="Switch to Side Screen Drawer Mode"
                    >
                      <PanelRight className="w-3.5 h-3.5" />
                      <span>Side Screen</span>
                    </button>

                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-medium transition-colors border border-white/10 cursor-pointer"
                      title="Copy note content"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy All</span>
                        </>
                      )}
                    </button>

                    {/* In-place Edit Button */}
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--theme-accent,#22c55e)]/20 hover:bg-[var(--theme-accent,#22c55e)]/30 text-[var(--theme-accent,#22c55e)] text-xs font-semibold transition-colors border border-[var(--theme-accent,#22c55e)]/40 cursor-pointer"
                      title="Edit Note Here"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors border border-white/10 cursor-pointer"
                      title="Delete Note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Close Button */}
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors border border-white/10 cursor-pointer ml-2"
                      title="Close (Esc)"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Note Content Area */}
            <div className="flex-1 overflow-y-auto px-8 sm:px-12 py-6 custom-scrollbar select-text space-y-5">
              {isEditing ? (
                /* INLINE EDIT MODE (FULL SCREEN) */
                <form onSubmit={handleSaveEdit} className="space-y-4 max-w-3xl mx-auto">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Note Title
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Note Title"
                      autoFocus
                      className="w-full text-2xl font-bold text-white bg-white/5 border border-white/20 focus:border-[var(--theme-accent,#22c55e)] rounded-2xl px-4 py-2.5 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Note Content
                      </label>

                      {/* Formatting Toolbar */}
                      <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={handleInsertBulletList}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          title="Insert Bullet List (•)"
                        >
                          <List className="w-3.5 h-3.5 text-[var(--theme-accent,#22c55e)]" />
                          <span>Bullet List</span>
                        </button>
                        <div className="w-px h-3.5 bg-white/10" />
                        <button
                          type="button"
                          onClick={handleInsertNumberedList}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          title="Insert Numbered List (1. 2.)"
                        >
                          <ListOrdered className="w-3.5 h-3.5 text-[var(--theme-accent,#22c55e)]" />
                          <span>Numbered List</span>
                        </button>
                      </div>
                    </div>

                    <textarea
                      ref={textareaRef}
                      required
                      rows={14}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={handleTextareaKeyDown}
                      placeholder="Write your note here... Use toolbar or type • / 1. for lists"
                      className="w-full text-sm leading-relaxed text-slate-200 bg-white/5 border border-white/20 focus:border-[var(--theme-accent,#22c55e)] rounded-2xl p-4 outline-none resize-none custom-scrollbar font-sans transition-colors"
                    />
                    <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                      <span>Press Enter in a list to auto-continue</span>
                      <span>{editContent.length} characters</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setEditIsPinned((prev) => !prev)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        editIsPinned
                          ? 'bg-[var(--theme-accent,#22c55e)]/20 text-[var(--theme-accent,#22c55e)] border border-[var(--theme-accent,#22c55e)]/40'
                          : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                      <span>{editIsPinned ? 'Pinned Note' : 'Pin Note'}</span>
                    </button>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[var(--theme-accent,#22c55e)] hover:brightness-110 shadow-lg shadow-[var(--theme-accent,rgba(34,197,94,0.3))] transition-all cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* READ MODE (FULL SCREEN) */
                <>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight select-text leading-snug">
                      {note.title}
                    </h1>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-white/10" />

                  {/* Formatted body */}
                  <div className="py-2">{renderFormattedContent()}</div>
                </>
              )}
            </div>

            {/* Footer Metadata */}
            <div className="px-8 sm:px-12 py-3.5 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between bg-black/20 shrink-0">
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Created: {createdDate}
                </span>
                {updatedDate && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Updated: {updatedDate}
                  </span>
                )}
              </div>
              <div className="font-mono text-slate-500">
                {wordCount} words • {charCount} characters
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
