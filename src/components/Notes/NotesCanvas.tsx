import React, { useState, useMemo } from 'react';
import { Plus, StickyNote, CheckCircle2 } from 'lucide-react';
import { NoteBoard, NoteItem } from '../../types';
import { NoteCardColumn } from './NoteCardColumn';

interface NotesCanvasProps {
  boards: Record<string, NoteBoard>;
  boardOrder: string[];
  notes: Record<string, NoteItem>;
  searchQuery: string;
  onAddBoard: () => void;
  onUpdateBoard: (boardId: string, updates: Partial<NoteBoard>) => void;
  onDeleteBoard: (boardId: string) => void;
  onAddNote: (boardId: string) => void;
  onEditNote: (note: NoteItem) => void;
  onDeleteNote: (noteId: string) => void;
}

export const NotesCanvas: React.FC<NotesCanvasProps> = ({
  boards,
  boardOrder,
  notes,
  searchQuery,
  onAddBoard,
  onUpdateBoard,
  onDeleteBoard,
  onAddNote,
  onEditNote,
  onDeleteNote,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Filter notes by search query
  const filteredNotesByBoard = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const map: Record<string, NoteItem[]> = {};

    Object.values(boards).forEach((board) => {
      const boardNotes = (board.noteItemIds || [])
        .map((id) => notes[id])
        .filter(Boolean);

      if (!q) {
        map[board.id] = boardNotes;
      } else {
        map[board.id] = boardNotes.filter(
          (note) =>
            note.title.toLowerCase().includes(q) ||
            note.content.toLowerCase().includes(q)
        );
      }
    });

    return map;
  }, [boards, notes, searchQuery]);

  const orderedBoardIds = boardOrder.length > 0 ? boardOrder : Object.keys(boards);

  const getDefaultPosition = (index: number) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    return {
      x: 30 + col * 380,
      y: 20 + row * 420,
    };
  };

  return (
    <div className="flex-1 w-full overflow-y-auto overflow-x-auto px-6 pt-1 pb-36 custom-scrollbar relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl liquid-glass-modal shadow-2xl border border-[var(--theme-accent,rgba(34,197,94,0.4))] animate-fade-in text-xs font-semibold text-white">
          <CheckCircle2 className="w-4 h-4 text-[var(--theme-accent,#22c55e)] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="mb-3 flex items-center justify-between text-xs text-slate-400 max-w-6xl">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--theme-accent,#22c55e)] animate-pulse" />
          <span className="font-semibold text-slate-300">Notes Workspace</span>
          <span className="text-slate-500">• Drag card header to place anywhere • Drag corner to resize cards • Click note to edit</span>
        </div>
        <button
          type="button"
          onClick={onAddBoard}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl liquid-glass text-xs font-semibold text-slate-200 hover:text-white hover:border-white/30 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Card</span>
        </button>
      </div>

      {/* Free Canvas Container */}
      <div className="relative w-full min-h-[calc(100vh-160px)] min-w-[1200px] pb-36">
        {orderedBoardIds.map((bId, idx) => {
          const board = boards[bId];
          if (!board) return null;
          return (
            <NoteCardColumn
              key={board.id}
              board={board}
              defaultPosition={getDefaultPosition(idx)}
              notes={filteredNotesByBoard[board.id] || []}
              onAddNote={onAddNote}
              onUpdateBoard={onUpdateBoard}
              onDeleteBoard={onDeleteBoard}
              onEditNote={onEditNote}
              onDeleteNote={onDeleteNote}
              onToast={showToast}
            />
          );
        })}
      </div>
    </div>
  );
};
