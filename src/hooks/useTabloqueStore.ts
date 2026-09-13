import { useState, useEffect, useCallback, useRef } from 'react';
import { TabloqueState, Page, Board, Bookmark, FirebaseConfig, ThemeId, BackgroundPatternId, WatchType, WatchWidget, CalendarType, CalendarWidget, TypographyConfig, BorderConfig, AppTabId, AuthBoard, AuthItem, NoteBoard, NoteItem } from '../types';
import { loadStateFromStorage, saveStateToStorage, onStorageChange } from '../storage/chrome-storage';
import { INITIAL_STATE } from '../storage/initial-data';
import { ParsedBookmarkGroup } from '../services/bookmark-importer';

export function useTabloqueStore() {
  const [state, setState] = useState<TabloqueState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const isInitialMount = useRef<boolean>(true);

  // Load state on mount
  useEffect(() => {
    loadStateFromStorage().then((savedState) => {
      if (!savedState.watches) {
        const defaultPageId = savedState.activePageId || Object.keys(savedState.pages)[0] || 'page-1';
        savedState.watches = {
          'watch-1': {
            id: 'watch-1',
            pageId: defaultPageId,
            type: 'hybrid',
            is24Hour: false,
            showSeconds: true,
            position: { x: 24, y: 16 },
            createdAt: Date.now() - 30000,
          },
        };
        savedState.watchOrder = ['watch-1'];
      } else {
        const validTypes: WatchType[] = ['hybrid', 'stacked', 'roman', 'hud'];
        const defaultPageId = savedState.activePageId || Object.keys(savedState.pages)[0] || 'page-1';
        Object.values(savedState.watches).forEach((w) => {
          if (!validTypes.includes(w.type)) {
            w.type = 'hybrid';
          }
          if (!w.pageId) {
            w.pageId = defaultPageId;
          }
        });
      }
      if (!savedState.calendars) {
        savedState.calendars = {};
        savedState.calendarOrder = [];
      } else {
        const validCalTypes: CalendarType[] = ['monthly', 'compact', 'split', 'strip'];
        const defaultPageId = savedState.activePageId || Object.keys(savedState.pages)[0] || 'page-1';
        Object.values(savedState.calendars).forEach((c) => {
          if (!validCalTypes.includes(c.type)) {
            c.type = 'monthly';
          }
          if (!c.pageId) {
            c.pageId = defaultPageId;
          }
        });
      }
      if (!savedState.typography) {
        savedState.typography = INITIAL_STATE.typography;
      }
      if (!savedState.borderConfig) {
        savedState.borderConfig = INITIAL_STATE.borderConfig;
      }
      if (!savedState.activeTab) {
        savedState.activeTab = 'bookmarks';
      }
      if (!savedState.authBoards) {
        savedState.authBoards = INITIAL_STATE.authBoards;
        savedState.authItems = INITIAL_STATE.authItems;
        savedState.authBoardOrder = INITIAL_STATE.authBoardOrder;
      }
      if (!savedState.noteBoards) {
        savedState.noteBoards = INITIAL_STATE.noteBoards;
        savedState.noteItems = INITIAL_STATE.noteItems;
        savedState.noteBoardOrder = INITIAL_STATE.noteBoardOrder;
      }
      if (savedState.customThemeColor === undefined) {
        savedState.customThemeColor = null;
      }
      if (savedState.customBackgroundImage === undefined) {
        savedState.customBackgroundImage = null;
      }
      if (savedState.backgroundBlur === undefined) {
        savedState.backgroundBlur = 0;
      }
      if (savedState.backgroundBrightness === undefined) {
        savedState.backgroundBrightness = 100;
      }
      if (savedState.cardGlassBlur === undefined) {
        savedState.cardGlassBlur = savedState.customBackgroundImage ? 4 : 16;
      }
      if (savedState.cardGlassOpacity === undefined) {
        savedState.cardGlassOpacity = 25;
      }
      setState(savedState);
      setIsLoaded(true);
    });

    // Subscribe to external storage updates (e.g. background service worker tab save)
    const unsubscribe = onStorageChange((newState) => {
      setState((prev) => ({
        ...prev,
        ...newState,
      }));
    });

    return unsubscribe;
  }, []);

  // Sync state to local storage whenever state changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isLoaded) {
      saveStateToStorage(state);
    }
  }, [state, isLoaded]);

  // --- Page Management ---
  const setActivePage = useCallback((pageId: string) => {
    setState((prev) => ({ ...prev, activePageId: pageId }));
  }, []);

  const createPage = useCallback((title: string, icon: string = 'Folder') => {
    const pageId = 'page-' + Date.now();
    const defaultBoardId = 'board-' + Date.now();

    const newPage: Page = {
      id: pageId,
      title: title.trim() || 'New Workspace',
      icon,
      boardIds: [defaultBoardId],
      createdAt: Date.now(),
    };

    const newDefaultBoard: Board = {
      id: defaultBoardId,
      title: 'Main Board',
      color: 'indigo',
      bookmarkIds: [],
      createdAt: Date.now(),
    };

    setState((prev) => ({
      ...prev,
      pages: { ...prev.pages, [pageId]: newPage },
      boards: { ...prev.boards, [defaultBoardId]: newDefaultBoard },
      pageOrder: [...prev.pageOrder, pageId],
      activePageId: pageId,
    }));

    return pageId;
  }, []);

  const updatePage = useCallback((pageId: string, updates: Partial<Page>) => {
    setState((prev) => {
      const page = prev.pages[pageId];
      if (!page) return prev;
      return {
        ...prev,
        pages: {
          ...prev.pages,
          [pageId]: { ...page, ...updates },
        },
      };
    });
  }, []);

  const deletePage = useCallback((pageId: string) => {
    setState((prev) => {
      if (prev.pageOrder.length <= 1) return prev; // Keep at least one page

      const newPages = { ...prev.pages };
      delete newPages[pageId];

      const newPageOrder = prev.pageOrder.filter((id) => id !== pageId);
      const newActivePageId = prev.activePageId === pageId ? newPageOrder[0] : prev.activePageId;

      // Clean up watches for this page
      const remainingWatches = { ...(prev.watches || {}) };
      Object.entries(remainingWatches).forEach(([wId, w]) => {
        if (w.pageId === pageId) {
          delete remainingWatches[wId];
        }
      });
      const remainingWatchOrder = (prev.watchOrder || []).filter((id) => remainingWatches[id]);

      // Clean up calendars for this page
      const remainingCalendars = { ...(prev.calendars || {}) };
      Object.entries(remainingCalendars).forEach(([cId, c]) => {
        if (c.pageId === pageId) {
          delete remainingCalendars[cId];
        }
      });
      const remainingCalendarOrder = (prev.calendarOrder || []).filter((id) => remainingCalendars[id]);

      return {
        ...prev,
        pages: newPages,
        pageOrder: newPageOrder,
        activePageId: newActivePageId,
        watches: remainingWatches,
        watchOrder: remainingWatchOrder,
        calendars: remainingCalendars,
        calendarOrder: remainingCalendarOrder,
      };
    });
  }, []);

  // --- Board Management ---
  const createBoard = useCallback((title: string, color: string = 'indigo') => {
    setState((prev) => {
      const activePage = prev.pages[prev.activePageId];
      if (!activePage) return prev;

      const boardId = 'board-' + Date.now();
      const newBoard: Board = {
        id: boardId,
        title: title.trim() || 'New Board',
        color,
        bookmarkIds: [],
        createdAt: Date.now(),
      };

      return {
        ...prev,
        boards: { ...prev.boards, [boardId]: newBoard },
        pages: {
          ...prev.pages,
          [prev.activePageId]: {
            ...activePage,
            boardIds: [...activePage.boardIds, boardId],
          },
        },
      };
    });
  }, []);

  const updateBoard = useCallback((boardId: string, updates: Partial<Board>) => {
    setState((prev) => {
      const board = prev.boards[boardId];
      if (!board) return prev;
      return {
        ...prev,
        boards: {
          ...prev.boards,
          [boardId]: { ...board, ...updates },
        },
      };
    });
  }, []);

  const deleteBoard = useCallback((boardId: string) => {
    setState((prev) => {
      const newBoards = { ...prev.boards };
      delete newBoards[boardId];

      const activePage = prev.pages[prev.activePageId];
      if (!activePage) return prev;

      return {
        ...prev,
        boards: newBoards,
        pages: {
          ...prev.pages,
          [prev.activePageId]: {
            ...activePage,
            boardIds: activePage.boardIds.filter((id) => id !== boardId),
          },
        },
      };
    });
  }, []);

  const reorderBoards = useCallback((boardIds: string[]) => {
    setState((prev) => {
      const activePage = prev.pages[prev.activePageId];
      if (!activePage) return prev;

      return {
        ...prev,
        pages: {
          ...prev.pages,
          [prev.activePageId]: {
            ...activePage,
            boardIds,
          },
        },
      };
    });
  }, []);

  // --- Bookmark Management ---
  const createBookmark = useCallback(
    (boardId: string, data: { title: string; url: string; description?: string }) => {
      const bookmarkId = 'bm-' + Date.now();
      let normalizedUrl = data.url.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      // If title not provided, extract clean site name (e.g. WhatsApp from web.whatsapp.com)
      let cleanTitle = data.title.trim();
      if (!cleanTitle) {
        try {
          const parsed = new URL(normalizedUrl);
          let host = parsed.hostname.replace(/^www\./, '');
          const parts = host.split('.');
          if (parts.length > 2 && (parts[0] === 'web' || parts[0] === 'app' || parts[0] === 'm')) {
            parts.shift();
          }
          const namePart = parts[0];
          cleanTitle = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        } catch {
          cleanTitle = normalizedUrl;
        }
      }

      const newBookmark: Bookmark = {
        id: bookmarkId,
        title: cleanTitle,
        url: normalizedUrl,
        description: data.description?.trim(),
        createdAt: Date.now(),
      };

      setState((prev) => {
        const board = prev.boards[boardId];
        if (!board) return prev;

        return {
          ...prev,
          bookmarks: { ...prev.bookmarks, [bookmarkId]: newBookmark },
          boards: {
            ...prev.boards,
            [boardId]: {
              ...board,
              bookmarkIds: [bookmarkId, ...board.bookmarkIds],
            },
          },
        };
      });
    },
    []
  );

  const updateBookmark = useCallback((bookmarkId: string, updates: Partial<Bookmark>) => {
    setState((prev) => {
      const bm = prev.bookmarks[bookmarkId];
      if (!bm) return prev;
      return {
        ...prev,
        bookmarks: {
          ...prev.bookmarks,
          [bookmarkId]: { ...bm, ...updates },
        },
      };
    });
  }, []);

  const deleteBookmark = useCallback((boardId: string, bookmarkId: string) => {
    setState((prev) => {
      const board = prev.boards[boardId];
      if (!board) return prev;

      const newBookmarks = { ...prev.bookmarks };
      delete newBookmarks[bookmarkId];

      return {
        ...prev,
        bookmarks: newBookmarks,
        boards: {
          ...prev.boards,
          [boardId]: {
            ...board,
            bookmarkIds: board.bookmarkIds.filter((id) => id !== bookmarkId),
          },
        },
      };
    });
  }, []);

  const moveBookmark = useCallback(
    (sourceBoardId: string, targetBoardId: string, bookmarkId: string, targetIndex?: number) => {
      setState((prev) => {
        const sourceBoard = prev.boards[sourceBoardId];
        const targetBoard = prev.boards[targetBoardId];
        if (!sourceBoard || !targetBoard) return prev;

        // Clone source list without moved item
        const sourceIds = sourceBoard.bookmarkIds.filter((id) => id !== bookmarkId);

        // Target list
        const targetIds =
          sourceBoardId === targetBoardId
            ? [...sourceIds]
            : [...targetBoard.bookmarkIds.filter((id) => id !== bookmarkId)];

        const insertionIndex =
          targetIndex !== undefined ? Math.min(Math.max(0, targetIndex), targetIds.length) : targetIds.length;

        targetIds.splice(insertionIndex, 0, bookmarkId);

        return {
          ...prev,
          boards: {
            ...prev.boards,
            [sourceBoardId]: {
              ...sourceBoard,
              bookmarkIds: sourceBoardId === targetBoardId ? targetIds : sourceIds,
            },
            ...(sourceBoardId !== targetBoardId && {
              [targetBoardId]: {
                ...targetBoard,
                bookmarkIds: targetIds,
              },
            }),
          },
        };
      });
    },
    []
  );

  const reorderBookmarksInBoard = useCallback((boardId: string, bookmarkIds: string[]) => {
    setState((prev) => {
      const board = prev.boards[boardId];
      if (!board) return prev;
      return {
        ...prev,
        boards: {
          ...prev.boards,
          [boardId]: {
            ...board,
            bookmarkIds,
          },
        },
      };
    });
  }, []);

  // --- Privacy Mode ---
  const togglePrivacyMode = useCallback(() => {
    setState((prev) => ({ ...prev, privacyMode: !prev.privacyMode }));
  }, []);

  // --- Settings & Cloud Config ---
  const updateFirebaseConfig = useCallback((config: FirebaseConfig | null) => {
    setState((prev) => ({ ...prev, firebaseConfig: config }));
  }, []);

  const setRemoteState = useCallback((remoteUpdates: Partial<TabloqueState>) => {
    setState((prev) => ({
      ...prev,
      ...remoteUpdates,
    }));
  }, []);

  // --- Bulk Import ---
  const importBookmarks = useCallback(
    (groups: ParsedBookmarkGroup[], mode: 'single' | 'folders' = 'folders') => {
      setState((prev) => {
        const activePage = prev.pages[prev.activePageId];
        if (!activePage) return prev;

        const newBookmarks = { ...prev.bookmarks };
        const newBoards = { ...prev.boards };
        const newPageBoardIds = [...activePage.boardIds];

        if (mode === 'single') {
          // Import all into a single "Imported Bookmarks" board
          const boardId = 'board-imported-' + Date.now();
          const importedBookmarkIds: string[] = [];

          groups.forEach((group) => {
            group.bookmarks.forEach((item, idx) => {
              const bmId = `bm-imp-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;
              newBookmarks[bmId] = {
                id: bmId,
                title: item.title,
                url: item.url,
                faviconUrl: item.faviconUrl,
                createdAt: Date.now(),
              };
              importedBookmarkIds.push(bmId);
            });
          });

          newBoards[boardId] = {
            id: boardId,
            title: 'Imported Bookmarks',
            color: 'indigo',
            bookmarkIds: importedBookmarkIds,
            createdAt: Date.now(),
          };
          newPageBoardIds.push(boardId);
        } else {
          // Create a board per folder
          groups.forEach((group, gIdx) => {
            const boardId = `board-imp-${Date.now()}-${gIdx}`;
            const importedBookmarkIds: string[] = [];

            const colors = ['indigo', 'emerald', 'purple', 'amber', 'rose', 'sky'];
            const assignedColor = colors[gIdx % colors.length];

            group.bookmarks.forEach((item, idx) => {
              const bmId = `bm-imp-${Date.now()}-${gIdx}-${idx}-${Math.random().toString(36).substring(2, 6)}`;
              newBookmarks[bmId] = {
                id: bmId,
                title: item.title,
                url: item.url,
                faviconUrl: item.faviconUrl,
                createdAt: Date.now(),
              };
              importedBookmarkIds.push(bmId);
            });

            newBoards[boardId] = {
              id: boardId,
              title: group.folderName || 'Bookmarks',
              color: assignedColor,
              bookmarkIds: importedBookmarkIds,
              createdAt: Date.now(),
            };
            newPageBoardIds.push(boardId);
          });
        }

        return {
          ...prev,
          bookmarks: newBookmarks,
          boards: newBoards,
          pages: {
            ...prev.pages,
            [prev.activePageId]: {
              ...activePage,
              boardIds: newPageBoardIds,
            },
          },
        };
      });
    },
    []
  );

  const setTheme = useCallback((themeId: ThemeId) => {
    setState((prev) => ({ ...prev, theme: themeId, customThemeColor: null }));
  }, []);

  const setCustomThemeColor = useCallback((color: string | null) => {
    setState((prev) => ({ ...prev, customThemeColor: color }));
  }, []);

  const setBackgroundPattern = useCallback((pattern: BackgroundPatternId) => {
    setState((prev) => ({ ...prev, backgroundPattern: pattern }));
  }, []);

  const setCustomBackgroundImage = useCallback((imageUrl: string | null) => {
    setState((prev) => ({ ...prev, customBackgroundImage: imageUrl }));
  }, []);

  const setBackgroundBlur = useCallback((blur: number) => {
    setState((prev) => ({ ...prev, backgroundBlur: blur }));
  }, []);

  const setBackgroundBrightness = useCallback((brightness: number) => {
    setState((prev) => ({ ...prev, backgroundBrightness: brightness }));
  }, []);

  const setCardGlassBlur = useCallback((blur: number) => {
    setState((prev) => ({ ...prev, cardGlassBlur: blur }));
  }, []);

  const setCardGlassOpacity = useCallback((opacity: number) => {
    setState((prev) => ({ ...prev, cardGlassOpacity: opacity }));
  }, []);

  // --- Watch Widget Management ---
  const addWatch = useCallback((type: WatchType = 'hybrid') => {
    const watchId = 'watch-' + Date.now();
    setState((prev) => {
      const activePageId = prev.activePageId;
      const newWatch: WatchWidget = {
        id: watchId,
        pageId: activePageId,
        type,
        is24Hour: false,
        showSeconds: true,
        position: { x: 30, y: 16 },
        createdAt: Date.now(),
      };

      const watches = { ...(prev.watches || {}), [watchId]: newWatch };
      const watchOrder = [...(prev.watchOrder || []), watchId];

      const activePage = prev.pages[activePageId];
      const pages = activePage
        ? {
            ...prev.pages,
            [activePageId]: {
              ...activePage,
              watchIds: [...(activePage.watchIds || []), watchId],
            },
          }
        : prev.pages;

      return {
        ...prev,
        pages,
        watches,
        watchOrder,
      };
    });
  }, []);

  const updateWatch = useCallback((watchId: string, updates: Partial<WatchWidget>) => {
    setState((prev) => {
      const existing = prev.watches?.[watchId];
      if (!existing) return prev;
      return {
        ...prev,
        watches: {
          ...prev.watches,
          [watchId]: { ...existing, ...updates },
        },
      };
    });
  }, []);

  const deleteWatch = useCallback((watchId: string) => {
    setState((prev) => {
      if (!prev.watches?.[watchId]) return prev;
      const targetWatch = prev.watches[watchId];
      const { [watchId]: _, ...remainingWatches } = prev.watches;
      const newWatchOrder = (prev.watchOrder || []).filter((id) => id !== watchId);

      const newPages = { ...prev.pages };
      if (targetWatch.pageId && newPages[targetWatch.pageId]) {
        newPages[targetWatch.pageId] = {
          ...newPages[targetWatch.pageId],
          watchIds: (newPages[targetWatch.pageId].watchIds || []).filter((id) => id !== watchId),
        };
      }

      return {
        ...prev,
        pages: newPages,
        watches: remainingWatches,
        watchOrder: newWatchOrder,
      };
    });
  }, []);

  // --- Calendar Widget Management ---
  const addCalendar = useCallback((type: CalendarType = 'monthly') => {
    const calId = 'cal-' + Date.now();
    setState((prev) => {
      const activePageId = prev.activePageId;
      const newCal: CalendarWidget = {
        id: calId,
        pageId: activePageId,
        type,
        position: { x: 380, y: 16 },
        createdAt: Date.now(),
      };

      const calendars = { ...(prev.calendars || {}), [calId]: newCal };
      const calendarOrder = [...(prev.calendarOrder || []), calId];

      const activePage = prev.pages[activePageId];
      const pages = activePage
        ? {
            ...prev.pages,
            [activePageId]: {
              ...activePage,
              calendarIds: [...(activePage.calendarIds || []), calId],
            },
          }
        : prev.pages;

      return {
        ...prev,
        pages,
        calendars,
        calendarOrder,
      };
    });
  }, []);

  const updateCalendar = useCallback((calId: string, updates: Partial<CalendarWidget>) => {
    setState((prev) => {
      const existing = prev.calendars?.[calId];
      if (!existing) return prev;
      return {
        ...prev,
        calendars: {
          ...prev.calendars,
          [calId]: { ...existing, ...updates },
        },
      };
    });
  }, []);

  const deleteCalendar = useCallback((calId: string) => {
    setState((prev) => {
      if (!prev.calendars?.[calId]) return prev;
      const targetCal = prev.calendars[calId];
      const { [calId]: _, ...remainingCalendars } = prev.calendars;
      const newCalendarOrder = (prev.calendarOrder || []).filter((id) => id !== calId);

      const newPages = { ...prev.pages };
      if (targetCal.pageId && newPages[targetCal.pageId]) {
        newPages[targetCal.pageId] = {
          ...newPages[targetCal.pageId],
          calendarIds: (newPages[targetCal.pageId].calendarIds || []).filter((id) => id !== calId),
        };
      }

      return {
        ...prev,
        pages: newPages,
        calendars: remainingCalendars,
        calendarOrder: newCalendarOrder,
      };
    });
  }, []);

  const setActiveTab = useCallback((tab: AppTabId) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  // --- Auth Vault Actions ---
  const createAuthBoard = useCallback((title: string, color: string = 'emerald') => {
    const boardId = 'auth-board-' + Date.now();
    const newBoard: AuthBoard = {
      id: boardId,
      title,
      color,
      authItemIds: [],
      createdAt: Date.now(),
    };
    setState((prev) => ({
      ...prev,
      authBoards: { ...(prev.authBoards || {}), [boardId]: newBoard },
      authBoardOrder: [...(prev.authBoardOrder || []), boardId],
    }));
  }, []);

  const updateAuthBoard = useCallback((boardId: string, updates: Partial<AuthBoard>) => {
    setState((prev) => {
      const existing = prev.authBoards?.[boardId];
      if (!existing) return prev;
      return {
        ...prev,
        authBoards: {
          ...prev.authBoards,
          [boardId]: { ...existing, ...updates },
        },
      };
    });
  }, []);

  const deleteAuthBoard = useCallback((boardId: string) => {
    setState((prev) => {
      if (!prev.authBoards?.[boardId]) return prev;
      const { [boardId]: target, ...remainingBoards } = prev.authBoards;
      const remainingItems = { ...(prev.authItems || {}) };
      target.authItemIds.forEach((itemId) => {
        delete remainingItems[itemId];
      });
      return {
        ...prev,
        authBoards: remainingBoards,
        authItems: remainingItems,
        authBoardOrder: (prev.authBoardOrder || []).filter((id) => id !== boardId),
      };
    });
  }, []);

  const createAuthItem = useCallback((boardId: string, item: Omit<AuthItem, 'id' | 'createdAt'>) => {
    const itemId = 'auth-item-' + Date.now();
    const newItem: AuthItem = {
      id: itemId,
      ...item,
      createdAt: Date.now(),
    };
    setState((prev) => {
      const board = prev.authBoards?.[boardId];
      if (!board) return prev;
      return {
        ...prev,
        authItems: { ...(prev.authItems || {}), [itemId]: newItem },
        authBoards: {
          ...prev.authBoards,
          [boardId]: {
            ...board,
            authItemIds: [...board.authItemIds, itemId],
          },
        },
      };
    });
  }, []);

  const updateAuthItem = useCallback((itemId: string, updates: Partial<AuthItem>) => {
    setState((prev) => {
      const existing = prev.authItems?.[itemId];
      if (!existing) return prev;
      return {
        ...prev,
        authItems: {
          ...prev.authItems,
          [itemId]: { ...existing, ...updates },
        },
      };
    });
  }, []);

  const deleteAuthItem = useCallback((itemId: string) => {
    setState((prev) => {
      if (!prev.authItems?.[itemId]) return prev;
      const { [itemId]: _, ...remainingItems } = prev.authItems;
      const updatedBoards = { ...(prev.authBoards || {}) };
      Object.keys(updatedBoards).forEach((bId) => {
        if (updatedBoards[bId].authItemIds.includes(itemId)) {
          updatedBoards[bId] = {
            ...updatedBoards[bId],
            authItemIds: updatedBoards[bId].authItemIds.filter((id) => id !== itemId),
          };
        }
      });
      return {
        ...prev,
        authItems: remainingItems,
        authBoards: updatedBoards,
      };
    });
  }, []);

  // --- Notes Actions ---
  const createNoteBoard = useCallback((title: string, color: string = 'purple') => {
    const boardId = 'note-board-' + Date.now();
    const newBoard: NoteBoard = {
      id: boardId,
      title,
      color,
      noteItemIds: [],
      createdAt: Date.now(),
    };
    setState((prev) => ({
      ...prev,
      noteBoards: { ...(prev.noteBoards || {}), [boardId]: newBoard },
      noteBoardOrder: [...(prev.noteBoardOrder || []), boardId],
    }));
  }, []);

  const updateNoteBoard = useCallback((boardId: string, updates: Partial<NoteBoard>) => {
    setState((prev) => {
      const existing = prev.noteBoards?.[boardId];
      if (!existing) return prev;
      return {
        ...prev,
        noteBoards: {
          ...prev.noteBoards,
          [boardId]: { ...existing, ...updates },
        },
      };
    });
  }, []);

  const deleteNoteBoard = useCallback((boardId: string) => {
    setState((prev) => {
      if (!prev.noteBoards?.[boardId]) return prev;
      const { [boardId]: target, ...remainingBoards } = prev.noteBoards;
      const remainingItems = { ...(prev.noteItems || {}) };
      target.noteItemIds.forEach((itemId) => {
        delete remainingItems[itemId];
      });
      return {
        ...prev,
        noteBoards: remainingBoards,
        noteItems: remainingItems,
        noteBoardOrder: (prev.noteBoardOrder || []).filter((id) => id !== boardId),
      };
    });
  }, []);

  const createNoteItem = useCallback((boardId: string, item: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const itemId = 'note-item-' + Date.now();
    const newItem: NoteItem = {
      id: itemId,
      ...item,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setState((prev) => {
      const board = prev.noteBoards?.[boardId];
      if (!board) return prev;
      return {
        ...prev,
        noteItems: { ...(prev.noteItems || {}), [itemId]: newItem },
        noteBoards: {
          ...prev.noteBoards,
          [boardId]: {
            ...board,
            noteItemIds: [...board.noteItemIds, itemId],
          },
        },
      };
    });
  }, []);

  const updateNoteItem = useCallback((itemId: string, updates: Partial<NoteItem>) => {
    setState((prev) => {
      const existing = prev.noteItems?.[itemId];
      if (!existing) return prev;
      return {
        ...prev,
        noteItems: {
          ...prev.noteItems,
          [itemId]: { ...existing, ...updates, updatedAt: Date.now() },
        },
      };
    });
  }, []);

  const deleteNoteItem = useCallback((itemId: string) => {
    setState((prev) => {
      if (!prev.noteItems?.[itemId]) return prev;
      const { [itemId]: _, ...remainingItems } = prev.noteItems;
      const updatedBoards = { ...(prev.noteBoards || {}) };
      Object.keys(updatedBoards).forEach((bId) => {
        if (updatedBoards[bId].noteItemIds.includes(itemId)) {
          updatedBoards[bId] = {
            ...updatedBoards[bId],
            noteItemIds: updatedBoards[bId].noteItemIds.filter((id) => id !== itemId),
          };
        }
      });
      return {
        ...prev,
        noteItems: remainingItems,
        noteBoards: updatedBoards,
      };
    });
  }, []);

  const resetToDefault = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const restoreState = useCallback((importedState: TabloqueState) => {
    setState({
      ...INITIAL_STATE,
      ...importedState,
    });
  }, []);

  const updateTypography = useCallback((updates: Partial<TypographyConfig>) => {
    setState((prev) => ({
      ...prev,
      typography: {
        fontFamily: prev.typography?.fontFamily || 'inter',
        fontSize: prev.typography?.fontSize || 'medium',
        fontWeight: prev.typography?.fontWeight || 'medium',
        textTransform: prev.typography?.textTransform || 'none',
        textColor: prev.typography?.textColor || '#ffffff',
        letterSpacing: prev.typography?.letterSpacing || 'normal',
        ...updates,
      },
    }));
  }, []);

  const updateBorderConfig = useCallback((updates: Partial<BorderConfig>) => {
    setState((prev) => ({
      ...prev,
      borderConfig: {
        style: prev.borderConfig?.style || 'subtle',
        accentGlow: prev.borderConfig?.accentGlow ?? false,
        ...updates,
      },
    }));
  }, []);

  return {
    state,
    isLoaded,
    setActivePage,
    createPage,
    updatePage,
    deletePage,
    createBoard,
    updateBoard,
    deleteBoard,
    reorderBoards,
    createBookmark,
    updateBookmark,
    deleteBookmark,
    moveBookmark,
    reorderBookmarksInBoard,
    togglePrivacyMode,
    setTheme,
    setCustomThemeColor,
    setBackgroundPattern,
    setCustomBackgroundImage,
    setBackgroundBlur,
    setBackgroundBrightness,
    setCardGlassBlur,
    setCardGlassOpacity,
    updateTypography,
    updateBorderConfig,
    addWatch,
    updateWatch,
    deleteWatch,
    addCalendar,
    updateCalendar,
    deleteCalendar,
    setActiveTab,
    createAuthBoard,
    updateAuthBoard,
    deleteAuthBoard,
    createAuthItem,
    updateAuthItem,
    deleteAuthItem,
    createNoteBoard,
    updateNoteBoard,
    deleteNoteBoard,
    createNoteItem,
    updateNoteItem,
    deleteNoteItem,
    updateFirebaseConfig,
    setRemoteState,
    importBookmarks,
    resetToDefault,
    restoreState,
  };
}
