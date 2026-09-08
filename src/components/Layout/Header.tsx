import React, { useRef } from 'react';
import { Search, X, Bookmark, KeyRound, StickyNote, Palette, Eye, EyeOff } from 'lucide-react';
import { AppTabId } from '../../types';

interface HeaderProps {
  activeTab?: AppTabId;
  onSelectTab: (tab: AppTabId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCustomizer?: () => void;
  customThemeColor?: string | null;
  customBackgroundImage?: string | null;
  themeAccentColor?: string;
  isZenMode?: boolean;
  onToggleZenMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab = 'bookmarks',
  onSelectTab,
  searchQuery,
  onSearchChange,
  onOpenCustomizer,
  customThemeColor,
  customBackgroundImage,
  themeAccentColor,
  isZenMode,
  onToggleZenMode,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const searchPlaceholder =
    activeTab === 'auth'
      ? 'Search logins by service, username, or url...'
      : activeTab === 'notes'
      ? 'Search notes by title or content...'
      : 'Search bookmarks by name, url, or tag...';

  return (
    <header className="w-full pt-4 pb-2 px-6 flex items-center justify-between relative z-20 gap-4">
      {/* Left: Brand Logo & Mode Switcher Tabs */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl liquid-glass select-none transition-all duration-200 hover:scale-[1.02] shadow-[0_2px_12px_rgba(0,0,0,0.2)]">
          <img
            src="/icons/TabLoque.png"
            alt="TabLoque"
            className="w-7 h-7 rounded-xl object-contain shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
          />
          <span className="font-bold text-sm tracking-tight text-white/95 hidden sm:inline-block">
            TabLoque
          </span>
        </div>

        {/* Mode Switcher Tabs (Bookmarks | Auth Vault | Notes) */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl liquid-glass shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('bookmarks')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'bookmarks'
              ? 'bg-white/15 text-white shadow-[0_2px_10px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          style={
            activeTab === 'bookmarks'
              ? {
                  borderBottom: '2px solid var(--theme-accent, #22c55e)',
                }
              : undefined
          }
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Bookmarks</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('auth')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'auth'
              ? 'bg-white/15 text-white shadow-[0_2px_10px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          style={
            activeTab === 'auth'
              ? {
                  borderBottom: '2px solid var(--theme-accent, #22c55e)',
                }
              : undefined
          }
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Auth Vault</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('notes')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'notes'
              ? 'bg-white/15 text-white shadow-[0_2px_10px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          style={
            activeTab === 'notes'
              ? {
                  borderBottom: '2px solid var(--theme-accent, #22c55e)',
                }
              : undefined
          }
        >
          <StickyNote className="w-3.5 h-3.5" />
          <span>Notes</span>
        </button>
      </div>
      </div>

      {/* Center: Liquid Glass Search Capsule */}
      <div className="w-full max-w-xl mx-auto flex-1">
        <div className="relative group">
          <Search className="w-4 h-4 text-slate-400 group-focus-within:text-[var(--theme-accent,#22c55e)] absolute left-4.5 top-1/2 -translate-y-1/2 transition-colors duration-200" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full text-sm pl-12 pr-11 py-2.5 rounded-2xl liquid-glass text-slate-100 placeholder-slate-400/70 outline-none transition-all duration-200 focus:border-[var(--theme-accent,rgba(34,197,94,0.5))] focus:shadow-[0_0_25px_var(--theme-accent,rgba(34,197,94,0.25)),inset_0_1px_1px_rgba(255,255,255,0.3)]"
          />
          {searchQuery && (
            <button
              onClick={() => {
                onSearchChange('');
                inputRef.current?.focus();
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Zen View & Wallpaper & Custom Color Button in Top Right Corner */}
      <div className="flex items-center gap-2 justify-end shrink-0">
        {onToggleZenMode && (
          <button
            type="button"
            onClick={onToggleZenMode}
            className={`p-2 rounded-2xl liquid-glass hover:border-white/35 transition-all duration-200 cursor-pointer hover:scale-[1.05] active:scale-95 flex items-center justify-center ${
              isZenMode
                ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50 shadow-[0_0_15px_rgba(34,197,94,0.35)]'
                : 'text-slate-300 hover:text-white'
            }`}
            title={isZenMode ? "Show Cards (Exit Zen View)" : "Zen View: Hide Cards to See Full Wallpaper"}
            aria-label="Toggle Zen Wallpaper View"
          >
            {isZenMode ? <EyeOff className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4" />}
          </button>
        )}

        {onOpenCustomizer && (
          <button
            type="button"
            onClick={onOpenCustomizer}
            className="relative flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl liquid-glass hover:border-white/35 transition-all duration-200 shadow-[0_2px_12px_rgba(0,0,0,0.25)] cursor-pointer hover:scale-[1.03] active:scale-95 group/btn"
            style={{
              borderColor: customThemeColor ? `${customThemeColor}70` : undefined,
              boxShadow: customThemeColor ? `0 0 16px ${customThemeColor}35` : undefined,
            }}
            title="Customize Wallpaper & Theme Color"
          >
            <div className="relative flex items-center justify-center">
              <Palette className="w-3.5 h-3.5 text-slate-200 group-hover/btn:text-white transition-colors" />
              {customBackgroundImage && (
                <span
                  className="absolute -top-1 -right-1 w-2 h-2 rounded-full ring-2 ring-black"
                  style={{ backgroundColor: themeAccentColor || 'var(--theme-accent, #22c55e)' }}
                />
              )}
            </div>
            <span className="text-xs font-semibold text-slate-200 group-hover/btn:text-white transition-colors hidden sm:inline-block">
              Wallpaper & Color
            </span>
            <span
              className="w-2.5 h-2.5 rounded-full transition-all ring-1 ring-white/20"
              style={{ backgroundColor: themeAccentColor || 'var(--theme-accent, #22c55e)' }}
            />
          </button>
        )}
      </div>
    </header>
  );
};
