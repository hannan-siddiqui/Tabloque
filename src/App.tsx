import React, { useState, useMemo } from 'react';
import { useTabloqueStore } from './hooks/useTabloqueStore';
import { useCloudSync } from './hooks/useCloudSync';
import { Header } from './components/Layout/Header';
import { PageNavigation } from './components/Layout/PageNavigation';
import { BoardCanvas } from './components/Board/BoardCanvas';
import { FloatingDock } from './components/Layout/FloatingDock';
import { BackgroundWaves } from './components/Theme/BackgroundWaves';
import { ImportModal } from './components/Modals/ImportModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { AddBookmarkModal } from './components/Modals/AddBookmarkModal';
import { AddBoardModal } from './components/Modals/AddBoardModal';
import { Bookmark, ThemeId, WatchWidget, CalendarWidget, AuthItem, NoteItem } from './types';
import { THEMES, createCustomTheme } from './theme/themes';
import { INITIAL_STATE } from './storage/initial-data';
import { AuthCanvas } from './components/Auth/AuthCanvas';
import { NotesCanvas } from './components/Notes/NotesCanvas';
import { AddAuthModal } from './components/Modals/AddAuthModal';
import { AddNoteModal } from './components/Modals/AddNoteModal';
import { AddSimpleCardModal } from './components/Modals/AddSimpleCardModal';
import { NoteReaderModal } from './components/Notes/NoteReaderModal';
import { BackgroundCustomizerModal } from './components/Modals/BackgroundCustomizerModal';
import { Eye } from 'lucide-react';

export const App: React.FC = () => {
  const {
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
  } = useTabloqueStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isAddBoardOpen, setIsAddBoardOpen] = useState(false);
  const [bookmarkModalTargetBoardId, setBookmarkModalTargetBoardId] = useState<string | null>(null);
  const [bookmarkToEdit, setBookmarkToEdit] = useState<Bookmark | null>(null);

  // Auth Vault Modal states
  const [isAddAuthItemOpen, setIsAddAuthItemOpen] = useState(false);
  const [authTargetBoardId, setAuthTargetBoardId] = useState<string | null>(null);
  const [authItemToEdit, setAuthItemToEdit] = useState<AuthItem | null>(null);
  const [isAddAuthBoardOpen, setIsAddAuthBoardOpen] = useState(false);

  // Notes Modal states
  const [isAddNoteItemOpen, setIsAddNoteItemOpen] = useState(false);
  const [noteTargetBoardId, setNoteTargetBoardId] = useState<string | null>(null);
  const [noteToEdit, setNoteToEdit] = useState<NoteItem | null>(null);
  const [noteToView, setNoteToView] = useState<NoteItem | null>(null);
  const [noteReaderEditMode, setNoteReaderEditMode] = useState(false);
  const [isAddNoteBoardOpen, setIsAddNoteBoardOpen] = useState(false);

  // Cloud sync manager
  const { syncStatus, lastSyncTime } = useCloudSync(state, setRemoteState);

  // Current theme config
  const currentThemeId: ThemeId = state.theme || 'emerald';
  const baseThemeConfig = THEMES[currentThemeId] || THEMES.emerald;
  const currentThemeConfig = useMemo(() => {
    if (state.customThemeColor) {
      return createCustomTheme(state.customThemeColor, baseThemeConfig);
    }
    return baseThemeConfig;
  }, [state.customThemeColor, baseThemeConfig]);

  // Active page resolution
  const activePage = useMemo(() => {
    return state.pages[state.activePageId] || Object.values(state.pages)[0];
  }, [state.pages, state.activePageId]);

  // Typography and border configurations
  const typography = state.typography || INITIAL_STATE.typography!;
  const borderConfig = state.borderConfig || INITIAL_STATE.borderConfig!;

  const fontClass = `font-${typography.fontFamily}`;
  const fontSizeClass = `font-size-${typography.fontSize}`;
  const borderStyleClass = `border-style-${borderConfig.style}`;

  // Theme accent color resolution for borders and dynamic text
  const themeAccentColor = useMemo(() => {
    return currentThemeConfig?.accentColor || 'rgba(34, 197, 94, 0.85)';
  }, [currentThemeConfig]);

  const resolvedTextColor = typography.textColor === 'theme' ? themeAccentColor : typography.textColor;

  // Watches scoped strictly to the currently active page
  const pageWatches = useMemo(() => {
    if (!state.watches || !activePage) return {};
    const filtered: Record<string, WatchWidget> = {};
    Object.entries(state.watches).forEach(([wId, watch]) => {
      if (watch.pageId === activePage.id || activePage.watchIds?.includes(wId)) {
        filtered[wId] = watch;
      }
    });
    return filtered;
  }, [state.watches, activePage]);

  const pageWatchOrder = useMemo(() => {
    if (!state.watchOrder || !activePage) return [];
    return state.watchOrder.filter((wId) => {
      const w = state.watches?.[wId];
      return w && (w.pageId === activePage.id || activePage.watchIds?.includes(wId));
    });
  }, [state.watchOrder, state.watches, activePage]);

  // Calendars scoped strictly to the currently active page
  const pageCalendars = useMemo(() => {
    if (!state.calendars || !activePage) return {};
    const filtered: Record<string, CalendarWidget> = {};
    Object.entries(state.calendars).forEach(([cId, cal]) => {
      if (cal.pageId === activePage.id || activePage.calendarIds?.includes(cId)) {
        filtered[cId] = cal;
      }
    });
    return filtered;
  }, [state.calendars, activePage]);

  const pageCalendarOrder = useMemo(() => {
    if (!state.calendarOrder || !activePage) return [];
    return state.calendarOrder.filter((cId) => {
      const c = state.calendars?.[cId];
      return c && (c.pageId === activePage.id || activePage.calendarIds?.includes(cId));
    });
  }, [state.calendarOrder, state.calendars, activePage]);

  if (!isLoaded || !activePage) {
    return (
      <div className="min-h-screen bg-[#050b09] flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading TabLoque...</span>
        </div>
      </div>
    );
  }

  const handleOpenAddBookmark = (boardId: string) => {
    setBookmarkToEdit(null);
    setBookmarkModalTargetBoardId(boardId);
  };

  const handleOpenEditBookmark = (bookmark: Bookmark) => {
    setBookmarkToEdit(bookmark);
    setBookmarkModalTargetBoardId(null);
  };

  const handleQuickAddBookmark = (boardId: string, name: string, url: string) => {
    createBookmark(boardId, {
      title: name,
      url,
    });
  };

  const handleFocusSearch = () => {
    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  };

  return (
    <div 
      className={`min-h-screen flex flex-col text-slate-100 relative selection:bg-emerald-500 selection:text-black overflow-x-hidden border-none outline-none shadow-none ${fontClass} ${fontSizeClass} ${borderStyleClass}`}
      style={{
        ['--custom-text-color' as string]: resolvedTextColor,
        ['--custom-font-weight' as string]: typography.fontWeight === 'bold' ? '700' : typography.fontWeight === 'semibold' ? '600' : typography.fontWeight === 'medium' ? '500' : '400',
        ['--custom-text-transform' as string]: typography.textTransform,
        ['--custom-letter-spacing' as string]: typography.letterSpacing === 'tight' ? '-0.025em' : typography.letterSpacing === 'wide' ? '0.05em' : 'normal',
        ['--theme-accent' as string]: themeAccentColor,
        ['--card-backdrop-blur' as string]: `${state.cardGlassBlur ?? 4}px`,
        ['--card-bg-opacity' as string]: `${(state.cardGlassOpacity ?? 25) / 100}`,
      }}
    >
      {/* Dynamic Ambient Silk Waves Background with optional Custom Wallpaper */}
      <BackgroundWaves
        theme={currentThemeConfig}
        customBackgroundImage={state.customBackgroundImage}
        backgroundBlur={state.backgroundBlur}
        backgroundBrightness={state.backgroundBrightness}
      />

      {/* Top Header - Centered Liquid Glass Search Capsule with Tabs & Top-Right Customizer */}
      <Header
        activeTab={state.activeTab || 'bookmarks'}
        onSelectTab={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        customThemeColor={state.customThemeColor}
        customBackgroundImage={state.customBackgroundImage}
        themeAccentColor={themeAccentColor}
        isZenMode={isZenMode}
        onToggleZenMode={() => setIsZenMode((prev) => !prev)}
      />

      {/* Main Canvas Container - Smoothly fades out in Zen Mode */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isZenMode ? 'opacity-0 pointer-events-none select-none scale-[0.98]' : 'opacity-100 scale-100'
        }`}
      >
        {/* Active Tab View */}
        {(state.activeTab || 'bookmarks') === 'bookmarks' && (
        <>
          {/* Workspace Category Navigation (Pills matching reference design) */}
          <PageNavigation
            pages={state.pages}
            pageOrder={state.pageOrder}
            activePageId={state.activePageId}
            theme={currentThemeConfig}
            onSelectPage={setActivePage}
            onCreatePage={createPage}
            onUpdatePage={updatePage}
            onDeletePage={deletePage}
          />

          {/* Main Boards Canvas & Watched Widgets */}
          <BoardCanvas
            activePage={activePage}
            boards={state.boards}
            bookmarks={state.bookmarks}
            searchQuery={searchQuery}
            privacyMode={state.privacyMode}
            isEditMode={isEditMode}
            watches={pageWatches}
            watchOrder={pageWatchOrder}
            calendars={pageCalendars}
            calendarOrder={pageCalendarOrder}
            onUpdateWatch={updateWatch}
            onDeleteWatch={deleteWatch}
            onUpdateCalendar={updateCalendar}
            onDeleteCalendar={deleteCalendar}
            onReorderBoards={reorderBoards}
            onReorderBookmarks={reorderBookmarksInBoard}
            onMoveBookmark={moveBookmark}
            onAddBookmark={handleOpenAddBookmark}
            onQuickAddBookmark={handleQuickAddBookmark}
            onUpdateBoard={updateBoard}
            onDeleteBoard={deleteBoard}
            onEditBookmark={handleOpenEditBookmark}
            onDeleteBookmark={deleteBookmark}
            onOpenAddBoard={() => setIsAddBoardOpen(true)}
            onUpdatePage={updatePage}
          />
        </>
      )}

      {state.activeTab === 'auth' && (
        <AuthCanvas
          boards={state.authBoards || {}}
          boardOrder={state.authBoardOrder || []}
          items={state.authItems || {}}
          searchQuery={searchQuery}
          onAddBoard={() => setIsAddAuthBoardOpen(true)}
          onUpdateBoard={updateAuthBoard}
          onDeleteBoard={deleteAuthBoard}
          onAddItem={(boardId) => {
            setAuthTargetBoardId(boardId);
            setAuthItemToEdit(null);
            setIsAddAuthItemOpen(true);
          }}
          onEditItem={(item) => {
            setAuthItemToEdit(item);
            setAuthTargetBoardId(null);
            setIsAddAuthItemOpen(true);
          }}
          onDeleteItem={deleteAuthItem}
        />
      )}

      {state.activeTab === 'notes' && (
        <NotesCanvas
          boards={state.noteBoards || {}}
          boardOrder={state.noteBoardOrder || []}
          notes={state.noteItems || {}}
          searchQuery={searchQuery}
          onAddBoard={() => setIsAddNoteBoardOpen(true)}
          onUpdateBoard={updateNoteBoard}
          onDeleteBoard={deleteNoteBoard}
          onAddNote={(boardId) => {
            setNoteTargetBoardId(boardId);
            setNoteToEdit(null);
            setIsAddNoteItemOpen(true);
          }}
          onViewNote={(note) => {
            setNoteToView(note);
            setNoteReaderEditMode(false);
          }}
          onEditNote={(note) => {
            setNoteToView(note);
            setNoteReaderEditMode(true);
          }}
          onDeleteNote={deleteNoteItem}
        />
      )}
      </div>

      {/* Floating Zen Mode Indicator when active */}
      {isZenMode && (
        <button
          type="button"
          onClick={() => setIsZenMode(false)}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-2.5 rounded-2xl liquid-glass shadow-2xl border border-white/20 text-xs font-semibold text-white animate-fade-in hover:scale-105 cursor-pointer"
        >
          <Eye className="w-4 h-4 text-emerald-400" />
          <span>Zen Wallpaper Mode · Click anywhere to restore cards</span>
        </button>
      )}

      {/* Right-Hand Floating Setting Bar (Liquid Glass Dock) */}
      <FloatingDock
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        privacyMode={state.privacyMode}
        onTogglePrivacyMode={togglePrivacyMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onFocusSearch={handleFocusSearch}
        syncStatus={syncStatus}
        activePage={activePage}
        onUpdatePage={updatePage}
        onAddWatch={(type) => {
          if (state.activeTab !== 'bookmarks') {
            setActiveTab('bookmarks');
          }
          addWatch(type);
        }}
        onAddCalendar={(type) => {
          if (state.activeTab !== 'bookmarks') {
            setActiveTab('bookmarks');
          }
          addCalendar(type);
        }}
        onOpenAddBoard={() => {
          if (state.activeTab === 'auth') {
            setIsAddAuthBoardOpen(true);
          } else if (state.activeTab === 'notes') {
            setIsAddNoteBoardOpen(true);
          } else {
            setIsAddBoardOpen(true);
          }
        }}
      />

      {/* Modals */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={importBookmarks}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={currentThemeId}
        onSelectTheme={setTheme}
        typography={typography}
        onUpdateTypography={updateTypography}
        borderConfig={borderConfig}
        onUpdateBorderConfig={updateBorderConfig}
        privacyMode={state.privacyMode}
        onTogglePrivacyMode={togglePrivacyMode}
        firebaseConfig={state.firebaseConfig}
        onSaveFirebaseConfig={updateFirebaseConfig}
        syncStatus={syncStatus}
        lastSyncTime={lastSyncTime}
        onOpenImport={() => setIsImportOpen(true)}
        currentState={state}
        onResetToDefault={resetToDefault}
        onRestoreBackup={restoreState}
        customThemeColor={state.customThemeColor}
        onSelectCustomThemeColor={setCustomThemeColor}
        customBackgroundImage={state.customBackgroundImage}
        onSelectCustomBackgroundImage={setCustomBackgroundImage}
        backgroundBlur={state.backgroundBlur ?? 0}
        onUpdateBackgroundBlur={setBackgroundBlur}
        backgroundBrightness={state.backgroundBrightness ?? 100}
        onUpdateBackgroundBrightness={setBackgroundBrightness}
        cardGlassBlur={state.cardGlassBlur ?? 4}
        onUpdateCardGlassBlur={setCardGlassBlur}
        cardGlassOpacity={state.cardGlassOpacity ?? 25}
        onUpdateCardGlassOpacity={setCardGlassOpacity}
        onOpenBackgroundCustomizer={() => {
          setIsSettingsOpen(false);
          setIsCustomizerOpen(true);
        }}
      />

      <AddBookmarkModal
        isOpen={Boolean(bookmarkModalTargetBoardId || bookmarkToEdit)}
        onClose={() => {
          setBookmarkModalTargetBoardId(null);
          setBookmarkToEdit(null);
        }}
        boardId={bookmarkModalTargetBoardId}
        bookmarkToEdit={bookmarkToEdit}
        onSave={createBookmark}
        onUpdate={updateBookmark}
      />

      <AddBoardModal
        isOpen={isAddBoardOpen}
        onClose={() => setIsAddBoardOpen(false)}
        onSave={createBoard}
      />

      {/* Auth Vault Modals */}
      <AddAuthModal
        isOpen={isAddAuthItemOpen}
        onClose={() => {
          setIsAddAuthItemOpen(false);
          setAuthItemToEdit(null);
          setAuthTargetBoardId(null);
        }}
        boards={state.authBoards || {}}
        targetBoardId={authTargetBoardId}
        itemToEdit={authItemToEdit}
        onSave={createAuthItem}
        onUpdate={updateAuthItem}
      />

      <AddSimpleCardModal
        isOpen={isAddAuthBoardOpen}
        title="Create Auth Card"
        onClose={() => setIsAddAuthBoardOpen(false)}
        onSave={(title, color) => createAuthBoard(title, color)}
      />

      {/* Notes Modals */}
      <AddNoteModal
        isOpen={isAddNoteItemOpen}
        onClose={() => {
          setIsAddNoteItemOpen(false);
          setNoteToEdit(null);
          setNoteTargetBoardId(null);
        }}
        boards={state.noteBoards || {}}
        targetBoardId={noteTargetBoardId}
        noteToEdit={noteToEdit}
        onSave={createNoteItem}
        onUpdate={updateNoteItem}
      />

      <AddSimpleCardModal
        isOpen={isAddNoteBoardOpen}
        title="Create Notes Card"
        onClose={() => setIsAddNoteBoardOpen(false)}
        onSave={(title, color) => createNoteBoard(title, color)}
      />

      <NoteReaderModal
        isOpen={Boolean(noteToView)}
        note={noteToView ? (state.noteItems?.[noteToView.id] || noteToView) : null}
        initialEditMode={noteReaderEditMode}
        onClose={() => {
          setNoteToView(null);
          setNoteReaderEditMode(false);
        }}
        onUpdate={updateNoteItem}
        onDelete={(noteId) => {
          deleteNoteItem(noteId);
          setNoteToView(null);
          setNoteReaderEditMode(false);
        }}
      />



      {/* Background & Accent Color Customizer Modal */}
      <BackgroundCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        theme={currentThemeConfig}
        currentThemeId={currentThemeId}
        onSelectTheme={setTheme}
        customThemeColor={state.customThemeColor}
        onSelectCustomThemeColor={setCustomThemeColor}
        customBackgroundImage={state.customBackgroundImage}
        onSelectCustomBackgroundImage={setCustomBackgroundImage}
        backgroundBlur={state.backgroundBlur ?? 0}
        onUpdateBackgroundBlur={setBackgroundBlur}
        backgroundBrightness={state.backgroundBrightness ?? 100}
        onUpdateBackgroundBrightness={setBackgroundBrightness}
        cardGlassBlur={state.cardGlassBlur ?? 4}
        onUpdateCardGlassBlur={setCardGlassBlur}
        cardGlassOpacity={state.cardGlassOpacity ?? 25}
        onUpdateCardGlassOpacity={setCardGlassOpacity}
      />
    </div>
  );
};
