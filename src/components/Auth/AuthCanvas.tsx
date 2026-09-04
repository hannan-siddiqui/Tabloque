import React, { useState, useMemo } from 'react';
import { Plus, ShieldCheck, KeyRound, CheckCircle2, Copy, X } from 'lucide-react';
import { AuthBoard, AuthItem } from '../../types';
import { AuthCardColumn } from './AuthCardColumn';

interface AuthCanvasProps {
  boards: Record<string, AuthBoard>;
  boardOrder: string[];
  items: Record<string, AuthItem>;
  searchQuery: string;
  onAddBoard: () => void;
  onUpdateBoard: (boardId: string, updates: Partial<AuthBoard>) => void;
  onDeleteBoard: (boardId: string) => void;
  onAddItem: (boardId: string) => void;
  onEditItem: (item: AuthItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export const AuthCanvas: React.FC<AuthCanvasProps> = ({
  boards,
  boardOrder,
  items,
  searchQuery,
  onAddBoard,
  onUpdateBoard,
  onDeleteBoard,
  onAddItem,
  onEditItem,
  onDeleteItem,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeAuthToast, setActiveAuthToast] = useState<{
    item: AuthItem;
    copiedType: 'both' | 'user' | 'pass';
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSelectAuthItem = (item: AuthItem, type: 'both' | 'user' | 'pass') => {
    setActiveAuthToast({ item, copiedType: type });
    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setActiveAuthToast((prev) => (prev?.item.id === item.id ? null : prev));
    }, 6000);
  };

  const handleCopyUserFromToast = async () => {
    if (!activeAuthToast?.item.userId) return;
    try {
      await navigator.clipboard.writeText(activeAuthToast.item.userId);
    } catch {}
    setActiveAuthToast((prev) => prev ? { ...prev, copiedType: 'user' } : null);
    setTimeout(() => setActiveAuthToast(null), 2500);
  };

  const handleCopyPasswordFromToast = async () => {
    if (!activeAuthToast?.item.password) return;
    try {
      await navigator.clipboard.writeText(activeAuthToast.item.password);
    } catch {}
    setActiveAuthToast((prev) => prev ? { ...prev, copiedType: 'pass' } : null);
    setTimeout(() => setActiveAuthToast(null), 2500);
  };

  // Filter items by search query
  const filteredItemsByBoard = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const map: Record<string, AuthItem[]> = {};

    Object.values(boards).forEach((board) => {
      const boardItems = (board.authItemIds || [])
        .map((id) => items[id])
        .filter(Boolean);

      if (!q) {
        map[board.id] = boardItems;
      } else {
        map[board.id] = boardItems.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.userId.toLowerCase().includes(q) ||
            item.url.toLowerCase().includes(q) ||
            (item.notes && item.notes.toLowerCase().includes(q))
        );
      }
    });

    return map;
  }, [boards, items, searchQuery]);

  const orderedBoardIds = boardOrder.length > 0 ? boardOrder : Object.keys(boards);

  const getDefaultPosition = (index: number) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    return {
      x: 30 + col * 360,
      y: 20 + row * 400,
    };
  };

  return (
    <div className="flex-1 w-full overflow-y-auto overflow-x-auto px-6 pt-1 pb-36 custom-scrollbar relative">
      {/* Interactive Credential Action Toast */}
      {activeAuthToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl liquid-glass-modal shadow-2xl border border-[var(--theme-accent,rgba(34,197,94,0.4))] animate-fade-in text-xs font-semibold text-white">
          <div className="w-2 h-2 rounded-full bg-[var(--theme-accent,#22c55e)] animate-pulse shrink-0" />
          
          {activeAuthToast.copiedType === 'both' ? (
            <div className="flex items-center gap-2.5">
              <span>
                Copied <strong className="text-white">{activeAuthToast.item.title}</strong> User ID & Password!
              </span>
              <div className="flex items-center gap-1.5 ml-2 border-l border-white/10 pl-2">
                <button
                  type="button"
                  onClick={handleCopyUserFromToast}
                  className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs transition-colors cursor-pointer"
                  title="Copy User ID to clipboard"
                >
                  Copy User
                </button>
                {activeAuthToast.item.password && (
                  <button
                    type="button"
                    onClick={handleCopyPasswordFromToast}
                    className="px-2 py-0.5 rounded-lg bg-[var(--theme-accent,#22c55e)] hover:brightness-110 text-white font-bold text-xs transition-colors cursor-pointer"
                    title="Copy Password to clipboard"
                  >
                    Copy Pass
                  </button>
                )}
              </div>
            </div>
          ) : activeAuthToast.copiedType === 'user' ? (
            <div className="flex items-center gap-2">
              <span>
                Copied User ID: <code className="text-emerald-300 font-mono bg-white/10 px-1.5 py-0.5 rounded">{activeAuthToast.item.userId}</code>
              </span>
              {activeAuthToast.item.password && (
                <button
                  type="button"
                  onClick={handleCopyPasswordFromToast}
                  className="flex items-center gap-1 ml-2 px-2.5 py-1 rounded-xl bg-[var(--theme-accent,#22c55e)] hover:brightness-110 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Copy Password</span>
                </button>
              )}
            </div>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Copied Password for {activeAuthToast.item.title} to clipboard!</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setActiveAuthToast(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Basic Toast Notification */}
      {!activeAuthToast && toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl liquid-glass-modal shadow-2xl border border-[var(--theme-accent,rgba(34,197,94,0.4))] animate-fade-in text-xs font-semibold text-white">
          <CheckCircle2 className="w-4 h-4 text-[var(--theme-accent,#22c55e)] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Controls & Info */}
      <div className="mb-3 flex items-center justify-between text-xs text-slate-400 max-w-6xl">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--theme-accent,#22c55e)] animate-pulse" />
          <span className="font-semibold text-slate-300">Auth Vault</span>
          <span className="text-slate-500">• Click bookmark to open & copy credentials • Drag header to move • Drag corner to resize</span>
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
            <AuthCardColumn
              key={board.id}
              board={board}
              defaultPosition={getDefaultPosition(idx)}
              items={filteredItemsByBoard[board.id] || []}
              onAddItem={onAddItem}
              onUpdateBoard={onUpdateBoard}
              onDeleteBoard={onDeleteBoard}
              onEditItem={onEditItem}
              onDeleteItem={onDeleteItem}
              onSelectAuthItem={handleSelectAuthItem}
              onToast={showToast}
            />
          );
        })}
      </div>
    </div>
  );
};
