import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Plus, Trash2, Palette, Edit3, GripHorizontal, Maximize2 } from 'lucide-react';
import { Board } from '../../types';

interface BoardHeaderProps {
  board: Board;
  count: number;
  onAddBookmark: (boardId: string) => void;
  onUpdateBoard: (boardId: string, updates: Partial<Board>) => void;
  onDeleteBoard: (boardId: string) => void;
  dragHandleProps?: Record<string, any>;
  onFreePointerDown?: (e: React.PointerEvent) => void;
}

const COLOR_MAP: Record<string, { bg: string; dot: string; border: string }> = {
  indigo: { bg: 'bg-indigo-500/10', dot: 'bg-indigo-500', border: 'border-indigo-500/30' },
  emerald: { bg: 'bg-emerald-500/10', dot: 'bg-emerald-500', border: 'border-emerald-500/30' },
  purple: { bg: 'bg-purple-500/10', dot: 'bg-purple-500', border: 'border-purple-500/30' },
  amber: { bg: 'bg-amber-500/10', dot: 'bg-amber-500', border: 'border-amber-500/30' },
  rose: { bg: 'bg-rose-500/10', dot: 'bg-rose-500', border: 'border-rose-500/30' },
  sky: { bg: 'bg-sky-500/10', dot: 'bg-sky-500', border: 'border-sky-500/30' },
};

const COLOR_OPTIONS = ['indigo', 'emerald', 'purple', 'amber', 'rose', 'sky'];

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  board,
  count,
  onAddBookmark,
  onUpdateBoard,
  onDeleteBoard,
  dragHandleProps,
  onFreePointerDown,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(board.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [sizePickerOpen, setSizePickerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close popup window when clicking anywhere outside or pressing Escape
  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDownOutside = (e: PointerEvent | MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setColorPickerOpen(false);
        setSizePickerOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setColorPickerOpen(false);
        setSizePickerOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDownOutside, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const colorConfig = COLOR_MAP[board.color || 'indigo'] || COLOR_MAP.indigo;

  const handleSaveTitle = () => {
    if (title.trim() && title.trim() !== board.title) {
      onUpdateBoard(board.id, { title: title.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveTitle();
    if (e.key === 'Escape') {
      setTitle(board.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      onPointerDown={onFreePointerDown}
      className={`flex items-center justify-between gap-2 pb-2 mb-1 border-b border-white/10 ${
        onFreePointerDown ? 'cursor-grab active:cursor-grabbing select-none' : ''
      }`}
    >
      {/* Drag handle and title */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <button
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-200 p-0.5 rounded transition-opacity opacity-0 group-hover:opacity-100 shrink-0"
          title="Drag to reorder board"
          aria-label="Drag board handle"
        >
          <GripHorizontal className="w-3.5 h-3.5" />
        </button>

        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={handleKeyDown}
            autoFocus
            className="text-sm font-bold liquid-glass-input rounded-lg px-2 py-0.5 text-white outline-none w-full"
          />
        ) : (
          <h3
            onDoubleClick={() => setIsEditing(true)}
            className="text-sm font-bold text-white truncate cursor-pointer hover:text-slate-200 transition-colors board-header-title leading-tight"
            title="Double-click to rename"
          >
            {board.title}
          </h3>
        )}
      </div>

      {/* Action buttons - appear on hover */}
      <div className={`flex items-center gap-0.5 shrink-0 transition-opacity duration-200 ${
        menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <button
          onClick={() => onAddBookmark(board.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Add link to this board"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Board Options Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
              setColorPickerOpen(false);
              setSizePickerOpen(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Board settings"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 top-full mt-1.5 w-48 rounded-2xl liquid-glass-modal p-1.5 shadow-2xl z-[70] text-xs animate-fade-in border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-white hover:bg-white/15 transition-colors cursor-pointer font-medium"
              >
                <Edit3 className="w-3.5 h-3.5 text-[var(--theme-accent,#22c55e)]" />
                <span>Rename / Edit board</span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setColorPickerOpen((prev) => !prev);
                    setSizePickerOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-slate-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  <span>Change color</span>
                </button>

                {colorPickerOpen && (
                  <div className="p-2 border-t border-white/10 flex items-center gap-2 justify-center">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          onUpdateBoard(board.id, { color: c });
                          setColorPickerOpen(false);
                          setMenuOpen(false);
                        }}
                        className={`w-5 h-5 rounded-full ${COLOR_MAP[c].dot} hover:scale-110 transition-transform ${
                          board.color === c ? 'ring-2 ring-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : ''
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setSizePickerOpen((prev) => !prev);
                    setColorPickerOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-slate-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Card size</span>
                </button>

                {sizePickerOpen && (
                  <div className="p-2 border-t border-white/10 space-y-2 text-[11px]">
                    <div>
                      <p className="text-slate-400 font-semibold mb-1">Width:</p>
                      <div className="grid grid-cols-3 gap-1">
                        {[260, 320, 420].map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => {
                              onUpdateBoard(board.id, { width: w });
                              setMenuOpen(false);
                            }}
                            className={`px-1.5 py-1 rounded-lg text-center transition-all ${
                              (board.width || 320) === w
                                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/50'
                                : 'liquid-glass-pill text-slate-300 hover:text-white'
                            }`}
                          >
                            {w}px
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-slate-400 font-semibold mb-1">Height:</p>
                      <div className="grid grid-cols-3 gap-1">
                        {[240, 380, 520].map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => {
                              onUpdateBoard(board.id, { height: h });
                              setMenuOpen(false);
                            }}
                            className={`px-1.5 py-1 rounded-lg text-center transition-all ${
                              board.height === h
                                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/50'
                                : 'liquid-glass-pill text-slate-300 hover:text-white'
                            }`}
                          >
                            {h}px
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onUpdateBoard(board.id, { width: undefined, height: undefined });
                        setMenuOpen(false);
                      }}
                      className="w-full py-1.5 text-center text-[10px] text-slate-400 hover:text-white rounded-lg liquid-glass-pill transition-colors cursor-pointer"
                    >
                      Reset to default size
                    </button>
                  </div>
                )}
              </div>

              <div className="h-px bg-white/10 my-1" />

              <button
                type="button"
                onClick={() => {
                  onDeleteBoard(board.id);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete board</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
