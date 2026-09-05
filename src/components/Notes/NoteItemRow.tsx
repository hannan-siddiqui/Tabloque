import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Copy, Check, Edit2, Trash2, Pin, MoreVertical } from 'lucide-react';
import { NoteItem } from '../../types';

interface NoteItemRowProps {
  note: NoteItem;
  onEdit: (note: NoteItem) => void;
  onDelete: (noteId: string) => void;
  onToast: (msg: string) => void;
}

export const NoteItemRow: React.FC<NoteItemRowProps> = ({
  note,
  onEdit,
  onDelete,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Close popup window when clicking anywhere outside, scrolling, or pressing Escape
  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDownOutside = (e: PointerEvent | MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        (!btnRef.current || !btnRef.current.contains(e.target as Node))
      ) {
        setMenuOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setMenuOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDownOutside, true);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside, true);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [menuOpen]);

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const menuHeight = 150;
    const spaceBelow = window.innerHeight - rect.bottom;

    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 99999,
    };

    // Auto-flip: if not enough space below, open above
    if (spaceBelow < menuHeight && rect.top > menuHeight) {
      style.bottom = `${window.innerHeight - rect.top + 6}px`;
    } else {
      style.top = `${rect.bottom + 6}px`;
    }

    // Align right edge of menu with right edge of button
    const rightOffset = window.innerWidth - rect.right;
    if (rightOffset < 10) {
      style.right = '10px';
    } else {
      style.right = `${rightOffset}px`;
    }

    setMenuStyle(style);
    setMenuOpen(true);
  };

  const handleCopyContent = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(note.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    onToast('Note copied to clipboard!');
    setMenuOpen(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    onEdit(note);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete(note.id);
  };

  const formattedDate = new Date(note.updatedAt || note.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      onClick={() => onEdit(note)}
      className="group/note relative flex flex-col p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer select-none"
    >
      {/* Top row: Title, Pin, Three Dots Menu */}
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/5">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {note.isPinned && <Pin className="w-3 h-3 text-[var(--theme-accent,#22c55e)] shrink-0" />}
          <h4 className="text-xs font-bold text-white truncate group-hover/note:text-[var(--theme-accent,#22c55e)] transition-colors bookmark-item-title">
            {note.title}
          </h4>
        </div>

        {/* Three dots button */}
        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            ref={btnRef}
            type="button"
            onClick={handleToggleMenu}
            className={`p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer ${
              menuOpen ? 'opacity-100 bg-white/10 text-white' : 'opacity-0 group-hover/note:opacity-100'
            }`}
            title="More options"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {menuOpen && createPortal(
            <div
              ref={menuRef}
              style={menuStyle}
              className="w-44 rounded-2xl liquid-glass-modal p-1.5 shadow-2xl text-xs animate-fade-in border border-white/20 space-y-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleEditClick}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-white hover:bg-white/15 transition-colors cursor-pointer font-medium"
              >
                <Edit2 className="w-3.5 h-3.5 text-[var(--theme-accent,#22c55e)]" />
                <span>Edit Note</span>
              </button>

              <button
                type="button"
                onClick={handleCopyContent}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-slate-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'Copied' : 'Copy Content'}</span>
              </button>

              <div className="h-px bg-white/10 my-1" />

              <button
                type="button"
                onClick={handleDeleteClick}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Note</span>
              </button>
            </div>,
            document.body
          )}
        </div>
      </div>

      {/* Content Preview */}
      <p className="text-[11px] text-slate-300/85 mt-2 line-clamp-3 leading-relaxed whitespace-pre-line font-sans">
        {note.content}
      </p>

      {/* Footer Timestamp */}
      <div className="flex items-center justify-between pt-2 mt-1 text-[10px] text-slate-500 font-mono">
        <span>{formattedDate}</span>
        <span className="text-[10px] text-slate-600 opacity-0 group-hover/note:opacity-100 transition-opacity">
          Click to edit
        </span>
      </div>
    </div>
  );
};
