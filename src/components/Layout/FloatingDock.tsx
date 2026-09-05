import React, { useState } from 'react';
import {
  Search,
  Download,
  Eye,
  EyeOff,
  Settings,
  Pencil,
  Plus,
  Clock,
  Calendar as CalendarIcon,
  Move,
  LayoutGrid,
  Columns3,
  X,
  Sparkles,
  ChevronsUp,
  ChevronsDown,
} from 'lucide-react';
import { SyncStatus } from '../../hooks/useCloudSync';
import { Page, WatchType, CalendarType } from '../../types';
import { WATCH_STYLES } from '../Widgets/WatchWidgetCard';
import { CALENDAR_STYLES } from '../Widgets/CalendarWidgetCard';

interface FloatingDockProps {
  privacyMode: boolean;
  onTogglePrivacyMode: () => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onOpenAddBoard: () => void;
  onOpenImport: () => void;
  onOpenSettings: () => void;
  onFocusSearch: () => void;
  syncStatus: SyncStatus;
  activePage?: Page;
  onUpdatePage?: (pageId: string, updates: Partial<Page>) => void;
  onAddWatch?: (type: WatchType) => void;
  onAddCalendar?: (type: CalendarType) => void;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({
  privacyMode,
  onTogglePrivacyMode,
  isEditMode,
  onToggleEditMode,
  onOpenAddBoard,
  onOpenImport,
  onOpenSettings,
  onFocusSearch,
  syncStatus,
  activePage,
  onUpdatePage,
  onAddWatch,
  onAddCalendar,
}) => {
  const [watchMenuOpen, setWatchMenuOpen] = useState(false);
  const [calendarMenuOpen, setCalendarMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('tabloque_dock_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('tabloque_dock_collapsed', String(next));
      } catch {}
      return next;
    });
    setWatchMenuOpen(false);
    setCalendarMenuOpen(false);
  };

  const currentLayout = activePage?.layout || 'free';

  if (isCollapsed) {
    return (
      <aside
        aria-label="Liquid Glass Setting Bar"
        className="fixed right-4 bottom-4 z-40 flex flex-col items-center select-none animate-fade-in"
      >
        <div className="relative group">
          <button
            type="button"
            onClick={toggleCollapsed}
            className="w-10 h-10 rounded-2xl liquid-glass-dock flex items-center justify-center text-slate-300 hover:text-white hover:border-emerald-400/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all cursor-pointer group/btn active:scale-95 relative"
            aria-label="Expand Controls"
            title="Expand Controls"
          >
            <ChevronsUp className="w-5 h-5 text-emerald-400 group-hover/btn:-translate-y-0.5 transition-transform" />

            {/* Active state indicator if edit mode, privacy mode, or syncing is active */}
            {(isEditMode || privacyMode || syncStatus === 'syncing') && (
              <span
                className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                  isEditMode
                    ? 'bg-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.8)]'
                    : privacyMode
                    ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]'
                    : 'bg-emerald-400 animate-ping'
                }`}
              />
            )}
          </button>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl text-xs font-medium text-slate-100 liquid-glass whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-white/15">
            Expand Controls
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Liquid Glass Setting Bar"
      className="fixed right-4 bottom-4 z-40 flex flex-col items-center select-none animate-fade-in"
    >
      <div className="flex flex-col items-center gap-1 p-1.5 rounded-2xl liquid-glass-dock relative">
        {/* ======================================================== */}
        {/* SECTION 1: LAYOUT SWITCHERS (Moved from Header) */}
        {/* ======================================================== */}
        {onUpdatePage && activePage && (
          <>
            {/* Free Canvas */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => onUpdatePage(activePage.id, { layout: 'free' })}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  currentLayout === 'free'
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-[0_0_12px_rgba(34,197,94,0.35)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                aria-label="Free Canvas Layout"
              >
                <Move className="w-4 h-4" />
              </button>
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl text-xs font-medium text-slate-100 liquid-glass whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-white/15">
                Free Canvas (Drag Anywhere)
              </span>
            </div>

            {/* Grid Flow */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => onUpdatePage(activePage.id, { layout: 'grid' })}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  currentLayout === 'grid'
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-[0_0_12px_rgba(34,197,94,0.35)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                aria-label="Grid Flow Layout"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl text-xs font-medium text-slate-100 liquid-glass whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-white/15">
                Grid Flow (Auto Wrap)
              </span>
            </div>

            {/* Horizontal Track */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => onUpdatePage(activePage.id, { layout: 'kanban' })}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  currentLayout === 'kanban'
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-[0_0_12px_rgba(34,197,94,0.35)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                aria-label="Horizontal Track Layout"
              >
                <Columns3 className="w-4 h-4" />
              </button>
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl text-xs font-medium text-slate-100 liquid-glass whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-white/15">
                Horizontal Track
              </span>
            </div>

            {/* Specular glass divider */}
            <div className="w-6 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent my-0.5" />
          </>
        )}

        {/* ======================================================== */}
        {/* SECTION 2: CREATION & WIDGETS (Moved from Header) */}
        {/* ======================================================== */}
        {/* + Watch Widget Trigger */}
        {onAddWatch && (
          <div className="relative group">
            <button
              type="button"
              onClick={() => setWatchMenuOpen((prev) => !prev)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                watchMenuOpen
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                  : 'text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/15'
              }`}
              aria-label="Add Clock / Watch Widget"
            >
              <Clock className="w-4 h-4" />
            </button>
            {!watchMenuOpen && (
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl text-xs font-medium text-slate-100 liquid-glass whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-white/15">
                + Watch (10+ Clock Styles)
              </span>
            )}

            {/* Fly-out Menu for Clock Styles (Opens cleanly to the left of the dock) */}
            {watchMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/20"
                  onClick={() => setWatchMenuOpen(false)}
                />
                <div className="absolute right-full mr-3 top-0 w-72 max-h-[22rem] overflow-y-auto custom-scrollbar rounded-2xl liquid-glass-modal p-2.5 shadow-2xl z-50 animate-fade-in text-xs space-y-1">
                  <div className="px-2.5 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-white/10 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-200">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      Minimalist Clocks
                    </span>
                    <button
                      type="button"
                      onClick={() => setWatchMenuOpen(false)}
                      className="p-1 hover:text-white rounded text-slate-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="pt-1 space-y-1">
                    {WATCH_STYLES.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => {
                          onAddWatch(style.id);
                          setWatchMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-slate-200 hover:text-white hover:bg-emerald-500/20 hover:border-emerald-500/30 border border-transparent transition-all cursor-pointer group/item"
                      >
                        <span className="text-lg shrink-0 group-hover/item:scale-110 transition-transform">
                          {style.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white group-hover/item:text-emerald-300 transition-colors">
                            {style.label}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{style.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* + Calendar Widget Trigger */}
        {onAddCalendar && (
          <div className="relative group">
            <button
              type="button"
              onClick={() => setCalendarMenuOpen((prev) => !prev)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                calendarMenuOpen
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                  : 'text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/15'
              }`}
              aria-label="Add Calendar Widget"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
            {!calendarMenuOpen && (
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl text-xs font-medium text-slate-100 liquid-glass whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-white/15">
                + Calendar (4 Calendar Styles)
              </span>
            )}

            {/* Fly-out Menu for Calendar Styles */}
            {calendarMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/20"
                  onClick={() => setCalendarMenuOpen(false)}
                />
                <div className="absolute right-full mr-3 top-0 w-72 max-h-[22rem] overflow-y-auto custom-scrollbar rounded-2xl liquid-glass-modal p-2.5 shadow-2xl z-50 animate-fade-in text-xs space-y-1">
                  <div className="px-2.5 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-white/10 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-200">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      Calendar Styles
                    </span>
                    <button
                      type="button"
                      onClick={() => setCalendarMenuOpen(false)}
                      className="p-1 hover:text-white rounded text-slate-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="pt-1 space-y-1">
                    {CALENDAR_STYLES.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => {
                          onAddCalendar(style.id);
                          setCalendarMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-slate-200 hover:text-white hover:bg-emerald-500/20 hover:border-emerald-500/30 border border-transparent transition-all cursor-pointer group/item"
                      >
                        <span className="text-lg shrink-0 group-hover/item:scale-110 transition-transform">
                          {style.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white group-hover/item:text-emerald-300 transition-colors">
                            {style.label}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{style.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Create New Board Button */}
        <div className="relative group">
          <button
            onClick={onOpenAddBoard}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/20 transition-all cursor-pointer group/btn"
            aria-label="Create New Board"
          >
            <Plus className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          </button>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl text-xs font-medium text-slate-100 liquid-glass whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-white/15">
            + New Board
          </span>
        </div>

        {/* Specular glass divider */}
        <div className="w-6 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent my-0.5" />

        {/* ======================================================== */}
        {/* SECTION 3: EDIT & PRIVACY MODES */}
        {/* ======================================================== */}
        {/* Edit Mode Toggle */}
        <div className="relative group">
          <button
            onClick={onToggleEditMode}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isEditMode
                ? 'bg-emerald-500 text-black shadow-[0_0_18px_rgba(34,197,94,0.5)] ring-2 ring-emerald-300'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            aria-label={isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl text-xs font-medium text-slate-100 liquid-glass whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-white/15">
            {isEditMode ? 'Exit Edit Mode' : 'Edit Mode (Reorder & Organize)'}
          </span>
        </div>

        {/* Privacy Mode Toggle */}
        <div className="relative group">
          <button
            onClick={onTogglePrivacyMode}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              privacyMode
                ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            aria-label={privacyMode ? 'Turn Off Privacy Mode' : 'Turn On Privacy Mode'}
          >
            {privacyMode ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
          </button>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl text-xs font-medium text-slate-100 liquid-glass whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-white/15">
            {privacyMode ? 'Privacy Mode Active' : 'Privacy Mode (Blur Text)'}
          </span>
        </div>

        {/* Specular glass divider */}
        <div className="w-6 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent my-0.5" />

        {/* ======================================================== */}
        {/* SECTION 4: ACTIONS & SETTINGS */}
        {/* ======================================================== */}
        {/* Focus Search */}
        <div className="relative group">
          <button
            onClick={onFocusSearch}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Focus Search"
          >
            <Search className="w-4 h-4" />
          </button>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl text-xs font-medium text-slate-100 liquid-glass whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-white/15">
            Search Bookmarks
          </span>
        </div>

        {/* Import Bookmarks */}
        <div className="relative group">
          <button
            onClick={onOpenImport}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Import Bookmarks"
          >
            <Download className="w-4 h-4" />
          </button>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl text-xs font-medium text-slate-100 liquid-glass whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-white/15">
            Import Chrome Bookmarks
          </span>
        </div>

        {/* Settings & Themes */}
        <div className="relative group">
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer relative group/btn"
            aria-label="Settings, Themes & Cloud Sync"
          >
            <Settings className="w-4 h-4 group-hover/btn:rotate-45 transition-transform duration-300" />
            {syncStatus === 'syncing' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5 animate-ping" />
            )}
          </button>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl text-xs font-medium text-slate-100 liquid-glass whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-white/15">
            Settings & Themes
          </span>
        </div>

        {/* Specular glass divider */}
        <div className="w-6 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent my-0.5" />

        {/* ======================================================== */}
        {/* SECTION 5: SHRINK / COLLAPSE BUTTON (BOTTOM) */}
        {/* ======================================================== */}
        <div className="relative group">
          <button
            type="button"
            onClick={toggleCollapsed}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/15 transition-all cursor-pointer group/collapse"
            aria-label="Shrink Controls"
            title="Shrink Controls"
          >
            <ChevronsDown className="w-4 h-4 group-hover/collapse:translate-y-0.5 transition-transform" />
          </button>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl text-xs font-medium text-slate-100 liquid-glass whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-white/15">
            Shrink Controls
          </span>
        </div>
      </div>
    </aside>
  );
};
