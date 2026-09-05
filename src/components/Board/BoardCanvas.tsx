import React, { useState, useMemo } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Plus, LayoutGrid, Columns3, Move } from 'lucide-react';
import { Page, Board, Bookmark, WatchWidget, CalendarWidget } from '../../types';
import { BoardColumn } from './BoardColumn';
import { DragOverlayWrapper } from '../Dnd/DragOverlayWrapper';
import { WatchWidgetCard } from '../Widgets/WatchWidgetCard';
import { CalendarWidgetCard } from '../Widgets/CalendarWidgetCard';

interface BoardCanvasProps {
  activePage: Page;
  boards: Record<string, Board>;
  bookmarks: Record<string, Bookmark>;
  searchQuery: string;
  privacyMode: boolean;
  isEditMode?: boolean;
  watches?: Record<string, WatchWidget>;
  watchOrder?: string[];
  calendars?: Record<string, CalendarWidget>;
  calendarOrder?: string[];
  onUpdateWatch?: (watchId: string, updates: Partial<WatchWidget>) => void;
  onDeleteWatch?: (watchId: string) => void;
  onUpdateCalendar?: (calendarId: string, updates: Partial<CalendarWidget>) => void;
  onDeleteCalendar?: (calendarId: string) => void;
  onReorderBoards: (boardIds: string[]) => void;
  onReorderBookmarks: (boardId: string, bookmarkIds: string[]) => void;
  onMoveBookmark: (
    bookmarkId: string,
    sourceBoardId: string,
    targetBoardId: string,
    targetIndex?: number
  ) => void;
  onAddBookmark: (boardId: string) => void;
  onQuickAddBookmark: (boardId: string, name: string, url: string) => void;
  onUpdateBoard: (boardId: string, updates: Partial<Board>) => void;
  onDeleteBoard: (boardId: string) => void;
  onEditBookmark: (bookmark: Bookmark) => void;
  onDeleteBookmark: (boardId: string, bookmarkId: string) => void;
  onOpenAddBoard: () => void;
  onUpdatePage?: (pageId: string, updates: Partial<Page>) => void;
}

export const BoardCanvas: React.FC<BoardCanvasProps> = ({
  activePage,
  boards,
  bookmarks,
  searchQuery,
  privacyMode,
  isEditMode = false,
  watches = {},
  watchOrder = [],
  calendars = {},
  calendarOrder = [],
  onUpdateWatch,
  onDeleteWatch,
  onUpdateCalendar,
  onDeleteCalendar,
  onReorderBoards,
  onReorderBookmarks,
  onMoveBookmark,
  onAddBookmark,
  onQuickAddBookmark,
  onUpdateBoard,
  onDeleteBoard,
  onEditBookmark,
  onDeleteBookmark,
  onOpenAddBoard,
  onUpdatePage,
}) => {
  const [activeDragType, setActiveDragType] = useState<'BOARD' | 'BOOKMARK' | null>(null);
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  const [activeBookmark, setActiveBookmark] = useState<{ bookmark: Bookmark; boardId: string } | null>(null);

  // Configure drag sensors with distance threshold to permit normal link clicks
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const boardIds = activePage.boardIds;

  // Filter bookmarks if search query is active
  const filteredBookmarksByBoard = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const result: Record<string, Bookmark[]> = {};

    boardIds.forEach((boardId) => {
      const board = boards[boardId];
      if (!board) {
        result[boardId] = [];
        return;
      }

      const list = board.bookmarkIds
        .map((id) => bookmarks[id])
        .filter(Boolean) as Bookmark[];

      if (!q) {
        result[boardId] = list;
      } else {
        result[boardId] = list.filter(
          (bm) =>
            bm.title.toLowerCase().includes(q) ||
            bm.url.toLowerCase().includes(q) ||
            (bm.description && bm.description.toLowerCase().includes(q))
        );
      }
    });

    return result;
  }, [boardIds, boards, bookmarks, searchQuery]);

  // Handle Drag Start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.type === 'BOARD') {
      setActiveDragType('BOARD');
      setActiveBoard(activeData.board);
    } else if (activeData?.type === 'BOOKMARK') {
      setActiveDragType('BOOKMARK');
      setActiveBookmark({
        bookmark: activeData.bookmark,
        boardId: activeData.sourceBoardId,
      });
    }
  };

  // Handle Drag Over (between boards or over another card)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // We only care about cross-container drag over for bookmarks
    if (activeData?.type !== 'BOOKMARK') return;

    const activeBookmarkId = active.id as string;
    const sourceBoardId = activeData.sourceBoardId;

    let targetBoardId: string | null = null;

    if (overData?.type === 'BOARD') {
      targetBoardId = overData.board.id;
    } else if (overData?.type === 'BOOKMARK') {
      targetBoardId = overData.sourceBoardId;
    } else if (String(over.id).startsWith('board-droppable-')) {
      targetBoardId = String(over.id).replace('board-droppable-', '');
    }

    if (!targetBoardId || sourceBoardId === targetBoardId) return;

    // Moving across different boards
    const targetBoard = boards[targetBoardId];
    if (!targetBoard) return;

    let targetIndex = targetBoard.bookmarkIds.length;
    if (overData?.type === 'BOOKMARK') {
      const overIndex = targetBoard.bookmarkIds.indexOf(over.id as string);
      targetIndex = overIndex >= 0 ? overIndex : targetBoard.bookmarkIds.length;
    }

    onMoveBookmark(sourceBoardId, targetBoardId, activeBookmarkId, targetIndex);
    activeData.sourceBoardId = targetBoardId;
  };

  // Handle Drag End
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeData = active.data.current;
      const overData = over.data.current;

      if (activeData?.type === 'BOARD') {
        // Reordering boards horizontally
        const oldIndex = boardIds.indexOf(active.id as string);
        const newIndex = boardIds.indexOf(over.id as string);
        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(boardIds, oldIndex, newIndex);
          onReorderBoards(newOrder);
        }
      } else if (activeData?.type === 'BOOKMARK') {
        const activeBookmarkId = active.id as string;
        const currentBoardId = activeData.sourceBoardId;
        const currentBoard = boards[currentBoardId];

        if (currentBoard) {
          if (overData?.type === 'BOOKMARK' && overData.sourceBoardId === currentBoardId) {
            // Reordering bookmarks in the same board
            const oldIndex = currentBoard.bookmarkIds.indexOf(activeBookmarkId);
            const newIndex = currentBoard.bookmarkIds.indexOf(over.id as string);
            if (oldIndex !== -1 && newIndex !== -1) {
              const newOrder = arrayMove(currentBoard.bookmarkIds, oldIndex, newIndex);
              onReorderBookmarks(currentBoardId, newOrder);
            }
          }
        }
      }
    }

    setActiveDragType(null);
    setActiveBoard(null);
    setActiveBookmark(null);
  };

  const currentLayout = activePage.layout || 'free';

  // Calculate default grid position for freeform canvas
  const getDefaultPosition = (index: number) => {
    const colWidth = 360;
    const rowHeight = 460;
    const maxCols = Math.max(1, Math.floor((typeof window !== 'undefined' ? window.innerWidth - 90 : 1200) / colWidth));
    const col = index % maxCols;
    const row = Math.floor(index / maxCols);
    return {
      x: 24 + col * colWidth,
      y: 16 + row * rowHeight,
    };
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 w-full overflow-y-auto overflow-x-auto px-6 pt-1 pb-6 custom-scrollbar">
        {/* Edit Mode Active Banner (when editing is toggled on) */}
        {isEditMode && (
          <div className="flex items-center justify-end pb-2 px-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold animate-fade-in flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Edit Mode Active
            </span>
          </div>
        )}

        {/* Board Cards Canvas Container */}
        {currentLayout === 'free' ? (
          /* FREE CANVAS: Cards placed anywhere with absolute coordinates */
          <div className="relative w-full min-h-[calc(100vh-160px)] min-w-[1200px] pb-36">
            {/* Clock / Watch Widgets (Draggable anywhere) */}
            {(watchOrder.length > 0 ? watchOrder : Object.keys(watches)).map((wId, wIdx) => {
              const watch = watches[wId];
              if (!watch) return null;
              return (
                <WatchWidgetCard
                  key={watch.id}
                  watch={watch}
                  layoutMode="free"
                  defaultPosition={{ x: 24, y: 16 + wIdx * 220 }}
                  onUpdateWatch={onUpdateWatch || (() => {})}
                  onDeleteWatch={onDeleteWatch || (() => {})}
                />
              );
            })}

            {/* Calendar Widgets (Draggable anywhere) */}
            {(calendarOrder.length > 0 ? calendarOrder : Object.keys(calendars)).map((cId, cIdx) => {
              const calendar = calendars[cId];
              if (!calendar) return null;
              return (
                <CalendarWidgetCard
                  key={calendar.id}
                  calendar={calendar}
                  layoutMode="free"
                  defaultPosition={{ x: 420, y: 16 + cIdx * 240 }}
                  onUpdateCalendar={onUpdateCalendar || (() => {})}
                  onDeleteCalendar={onDeleteCalendar || (() => {})}
                />
              );
            })}

            {boardIds.map((bId, idx) => {
              const board = boards[bId];
              if (!board) return null;
              return (
                <BoardColumn
                  key={board.id}
                  board={board}
                  bookmarks={filteredBookmarksByBoard[board.id] || []}
                  privacyMode={privacyMode}
                  isEditMode={isEditMode}
                  layoutMode="free"
                  defaultPosition={getDefaultPosition(idx)}
                  onAddBookmark={onAddBookmark}
                  onQuickAddBookmark={onQuickAddBookmark}
                  onUpdateBoard={onUpdateBoard}
                  onDeleteBoard={onDeleteBoard}
                  onEditBookmark={onEditBookmark}
                  onDeleteBookmark={onDeleteBookmark}
                />
              );
            })}
          </div>
        ) : (
          /* GRID OR KANBAN LAYOUT */
          <div
            className={
              currentLayout === 'grid'
                ? 'flex flex-wrap items-start content-start gap-5 w-full pb-20'
                : 'flex items-start gap-5 min-w-max h-full pb-4'
            }
          >
            {/* Clock / Watch Widgets */}
            {(watchOrder.length > 0 ? watchOrder : Object.keys(watches)).map((wId) => {
              const watch = watches[wId];
              if (!watch) return null;
              return (
                <WatchWidgetCard
                  key={watch.id}
                  watch={watch}
                  layoutMode={currentLayout}
                  onUpdateWatch={onUpdateWatch || (() => {})}
                  onDeleteWatch={onDeleteWatch || (() => {})}
                />
              );
            })}

            {/* Calendar Widgets */}
            {(calendarOrder.length > 0 ? calendarOrder : Object.keys(calendars)).map((cId) => {
              const calendar = calendars[cId];
              if (!calendar) return null;
              return (
                <CalendarWidgetCard
                  key={calendar.id}
                  calendar={calendar}
                  layoutMode={currentLayout}
                  onUpdateCalendar={onUpdateCalendar || (() => {})}
                  onDeleteCalendar={onDeleteCalendar || (() => {})}
                />
              );
            })}

            {/* Sortable context for boards */}
            <SortableContext
              items={boardIds}
              strategy={currentLayout === 'grid' ? rectSortingStrategy : horizontalListSortingStrategy}
            >
              {boardIds.map((bId) => {
                const board = boards[bId];
                if (!board) return null;
                return (
                  <BoardColumn
                    key={board.id}
                    board={board}
                    bookmarks={filteredBookmarksByBoard[board.id] || []}
                    privacyMode={privacyMode}
                    isEditMode={isEditMode}
                    layoutMode={currentLayout}
                    onAddBookmark={onAddBookmark}
                    onQuickAddBookmark={onQuickAddBookmark}
                    onUpdateBoard={onUpdateBoard}
                    onDeleteBoard={onDeleteBoard}
                    onEditBookmark={onEditBookmark}
                    onDeleteBookmark={onDeleteBookmark}
                  />
                );
              })}

              {/* Dashed Add Board Button (matching reference image) */}
              <button
                onClick={onOpenAddBoard}
                className="h-24 min-w-[260px] rounded-2xl border-2 border-dashed border-white/20 hover:border-emerald-400/60 hover:bg-white/[0.04] transition-all flex items-center justify-center gap-2.5 text-xs font-bold text-slate-300 hover:text-white uppercase tracking-wider cursor-pointer group shrink-0"
                title="Add a new board"
              >
                <div className="w-7 h-7 rounded-full border border-white/30 group-hover:border-emerald-400 group-hover:text-emerald-300 flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                <span>Add Board</span>
              </button>
            </SortableContext>
          </div>
        )}

        {boardIds.length === 0 && Object.keys(watches).length === 0 && (
          <div className="flex items-center justify-center w-full py-20 text-center">
            <div className="max-w-md p-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
              <LayoutGrid className="w-10 h-10 mx-auto mb-3 text-emerald-400" />
              <h3 className="text-lg font-bold text-white mb-1">No Boards in this Workspace</h3>
              <p className="text-xs text-slate-400 mb-4">
                Create your first board to organize your bookmarks, or import an existing Chrome bookmark file.
              </p>
              <button
                onClick={onOpenAddBoard}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-semibold shadow-lg shadow-emerald-500/20"
              >
                Create First Board
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drag overlay preview */}
      <DragOverlayWrapper
        activeBoard={activeBoard}
        activeBookmark={activeBookmark}
        boardBookmarks={activeBoard ? filteredBookmarksByBoard[activeBoard.id] || [] : []}
        privacyMode={privacyMode}
      />
    </DndContext>
  );
};
