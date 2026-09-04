import React from 'react';
import { DragOverlay } from '@dnd-kit/core';
import { Board, Bookmark } from '../../types';
import { BookmarkCard } from '../Bookmark/BookmarkCard';
import { BoardColumn } from '../Board/BoardColumn';

interface DragOverlayWrapperProps {
  activeBoard: Board | null;
  activeBookmark: { bookmark: Bookmark; boardId: string } | null;
  boardBookmarks: Bookmark[];
  privacyMode: boolean;
}

export const DragOverlayWrapper: React.FC<DragOverlayWrapperProps> = ({
  activeBoard,
  activeBookmark,
  boardBookmarks,
  privacyMode,
}) => {
  return (
    <DragOverlay dropAnimation={null}>
      {activeBoard && (
        <BoardColumn
          board={activeBoard}
          bookmarks={boardBookmarks}
          privacyMode={privacyMode}
          onAddBookmark={() => {}}
          onQuickAddBookmark={() => {}}
          onUpdateBoard={() => {}}
          onDeleteBoard={() => {}}
          onEditBookmark={() => {}}
          onDeleteBookmark={() => {}}
          isOverlay
        />
      )}

      {activeBookmark && (
        <BookmarkCard
          bookmark={activeBookmark.bookmark}
          boardId={activeBookmark.boardId}
          privacyMode={privacyMode}
          isOverlay
        />
      )}
    </DragOverlay>
  );
};
