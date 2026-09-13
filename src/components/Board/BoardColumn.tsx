import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { BookmarkPlus } from 'lucide-react';
import { Board, Bookmark } from '../../types';
import { BoardHeader } from './BoardHeader';
import { BookmarkCard } from '../Bookmark/BookmarkCard';
import { getBoardColorConfig } from '../../theme/boardColors';

interface BoardColumnProps {
  board: Board;
  bookmarks: Bookmark[];
  privacyMode: boolean;
  isEditMode?: boolean;
  layoutMode?: 'free' | 'grid' | 'kanban';
  defaultPosition?: { x: number; y: number };
  onAddBookmark: (boardId: string) => void;
  onQuickAddBookmark?: (boardId: string, name: string, url: string) => void;
  onUpdateBoard: (boardId: string, updates: Partial<Board>) => void;
  onDeleteBoard: (boardId: string) => void;
  onEditBookmark: (bookmark: Bookmark) => void;
  onDeleteBookmark: (boardId: string, bookmarkId: string) => void;
  isOverlay?: boolean;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({
  board,
  bookmarks,
  privacyMode,
  isEditMode = false,
  layoutMode = 'free',
  defaultPosition = { x: 30, y: 30 },
  onAddBookmark,
  onQuickAddBookmark,
  onUpdateBoard,
  onDeleteBoard,
  onEditBookmark,
  onDeleteBookmark,
  isOverlay = false,
}) => {
  const isFreeLayout = layoutMode === 'free';
  const pos = board.position || defaultPosition;

  // Freeform dragging state
  const [isFreeDragging, setIsFreeDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleFreePointerDown = (e: React.PointerEvent) => {
    if (!isFreeLayout) return;
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('a')) return;

    e.preventDefault();
    setIsFreeDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = board.position || defaultPosition;

    let finalX = startPos.x;
    let finalY = startPos.y;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const newX = Math.max(10, Math.round(startPos.x + deltaX));
      const newY = Math.max(10, Math.round(startPos.y + deltaY));

      finalX = newX;
      finalY = newY;
      setDragOffset({ x: deltaX, y: deltaY });
    };

    const onPointerUp = () => {
      setIsFreeDragging(false);
      setDragOffset({ x: 0, y: 0 });
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      onUpdateBoard(board.id, { position: { x: finalX, y: finalY } });
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Sortable hook for grid/kanban mode
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: board.id,
    data: {
      type: 'BOARD',
      board,
    },
    disabled: isOverlay || isFreeLayout,
  });

  // Droppable container for bookmarks dropped directly onto this board column
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `board-droppable-${board.id}`,
    data: {
      type: 'BOARD',
      board,
    },
  });

  // Interactive drag-to-resize logic
  const [isResizing, setIsResizing] = useState(false);
  const [currentDimensions, setCurrentDimensions] = useState<{ width?: number; height?: number }>({
    width: board.width,
    height: board.height,
  });

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = currentDimensions.width || board.width || 320;
    const startHeight = currentDimensions.height || board.height || 360;

    let finalWidth = startWidth;
    let finalHeight = startHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const newWidth = Math.max(220, Math.min(950, Math.round(startWidth + deltaX)));
      const newHeight = Math.max(160, Math.min(950, Math.round(startHeight + deltaY)));

      finalWidth = newWidth;
      finalHeight = newHeight;

      setCurrentDimensions({
        width: newWidth,
        height: newHeight,
      });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      onUpdateBoard(board.id, {
        width: finalWidth,
        height: finalHeight,
      });
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const currentBoardWidth = currentDimensions.width || board.width || 320;
  const isMultiColumn = currentBoardWidth >= 440;
  const bookmarkIds = bookmarks.map((b) => b.id);
  const colorConfig = getBoardColorConfig(board.color);
  const isTinted = !colorConfig.isDefault;

  const style: React.CSSProperties = isFreeLayout
    ? {
        position: 'absolute',
        left: `${pos.x + dragOffset.x}px`,
        top: `${pos.y + dragOffset.y}px`,
        zIndex: isFreeDragging ? 40 : 10,
        width: `${currentBoardWidth}px`,
        height: currentDimensions.height ? `${currentDimensions.height}px` : (board.height ? `${board.height}px` : undefined),
        maxHeight: currentDimensions.height ? `${currentDimensions.height}px` : (board.height ? `${board.height}px` : 'calc(100vh - 150px)'),
        boxShadow: isFreeDragging ? `0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px ${isTinted ? `rgba(${colorConfig.rgb}, 0.35)` : 'rgba(34, 197, 94, 0.2)'}` : undefined,
        transition: (isResizing || isFreeDragging) ? 'none' : 'box-shadow 0.15s',
        ...(isTinted
          ? {
              ['--board-tint-rgb' as string]: colorConfig.rgb,
              ['--board-tint-top-rgb' as string]: colorConfig.topRgb,
              ['--board-accent-hex' as string]: colorConfig.hex,
            }
          : {}),
      }
    : {
        transform: CSS.Translate.toString(transform),
        transition: isResizing ? 'none' : transition,
        opacity: isDragging ? 0.4 : 1,
        width: `${currentBoardWidth}px`,
        height: currentDimensions.height ? `${currentDimensions.height}px` : (board.height ? `${board.height}px` : undefined),
        maxHeight: currentDimensions.height ? `${currentDimensions.height}px` : (board.height ? `${board.height}px` : 'calc(100vh - 150px)'),
        ...(isTinted
          ? {
              ['--board-tint-rgb' as string]: colorConfig.rgb,
              ['--board-tint-top-rgb' as string]: colorConfig.topRgb,
              ['--board-accent-hex' as string]: colorConfig.hex,
            }
          : {}),
      };

  return (
    <div
      ref={setSortableRef}
      style={style}
      data-board-color={colorConfig.id}
      className={`shrink-0 flex flex-col rounded-2xl liquid-glass-card ${isTinted ? 'board-tinted' : ''} px-5 pt-3.5 pb-4 group relative ${
        isOverlay ? 'shadow-[0_0_40px_rgba(var(--board-tint-rgb,34,197,94),0.55)] border-t-2 border-[var(--board-accent-hex,#22c55e)] rotate-1 scale-[1.02] z-50' : ''
      }`}
    >
      {/* Board Header - Draggable anywhere in Free Canvas mode */}
      <BoardHeader
        board={board}
        colorConfig={colorConfig}
        count={bookmarks.length}
        onAddBookmark={onAddBookmark}
        onUpdateBoard={onUpdateBoard}
        onDeleteBoard={onDeleteBoard}
        dragHandleProps={{ ...attributes, ...listeners }}
        onFreePointerDown={isFreeLayout ? handleFreePointerDown : undefined}
      />

      {/* Bookmarks List Container - Automatically 2+ columns when card width is increased */}
      <div
        ref={setDroppableRef}
        className={`flex-1 overflow-y-auto pr-1 pb-1 custom-scrollbar min-h-[120px] ${
          isMultiColumn
            ? 'grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2 content-start'
            : 'space-y-2'
        }`}
      >
        <SortableContext
          items={bookmarkIds}
          strategy={isMultiColumn ? rectSortingStrategy : verticalListSortingStrategy}
        >
          {bookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              boardId={board.id}
              privacyMode={privacyMode}
              isEditMode={isEditMode}
              onEdit={onEditBookmark}
              onDelete={onDeleteBookmark}
            />
          ))}
        </SortableContext>

        {bookmarks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 rounded-xl border border-dashed border-white/10 text-slate-400 text-xs text-center p-4">
            <BookmarkPlus className="w-6 h-6 mb-1.5 opacity-60" style={{ color: colorConfig.hex }} />
            <p className="font-medium">No bookmarks yet</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Drop links here or click +</p>
          </div>
        )}
      </div>

      {/* Interactive Bottom-Right Corner Resize Grip - Appears on Hover */}
      <div
        onMouseDown={handleResizeMouseDown}
        className="absolute bottom-1.5 right-1.5 w-4 h-4 cursor-nwse-resize text-slate-400 hover:text-emerald-400 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-all flex items-end justify-end p-0.5 select-none"
        title="Click & drag to resize card width and height"
      >
        <svg viewBox="0 0 6 6" className="w-2.5 h-2.5 fill-current">
          <circle cx="5" cy="5" r="0.75" />
          <circle cx="5" cy="2.5" r="0.75" />
          <circle cx="2.5" cy="5" r="0.75" />
        </svg>
      </div>
    </div>
  );
};
