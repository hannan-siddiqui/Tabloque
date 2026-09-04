import React, { useRef } from 'react';
import { Search, X, Bookmark, KeyRound, StickyNote } from 'lucide-react';
import { AppTabId } from '../../types';

interface HeaderProps {
  activeTab?: AppTabId;
  onSelectTab: (tab: AppTabId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab = 'bookmarks',
  onSelectTab,
  searchQuery,
  onSearchChange,
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
      {/* Left: Mode Switcher Tabs (Bookmarks | Auth Vault | Notes) */}
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

      {/* Right Spacer for balanced layout */}
      <div className="w-[180px] hidden md:block shrink-0" />
    </header>
  );
};
