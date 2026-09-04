import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, MoreVertical, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Page } from '../../types';
import { ThemeConfig } from '../../theme/themes';

interface PageNavigationProps {
  pages: Record<string, Page>;
  pageOrder: string[];
  activePageId: string;
  theme: ThemeConfig;
  onSelectPage: (pageId: string) => void;
  onCreatePage: (title: string) => void;
  onUpdatePage: (pageId: string, updates: Partial<Page>) => void;
  onDeletePage: (pageId: string) => void;
}

export const PageNavigation: React.FC<PageNavigationProps> = ({
  pages,
  pageOrder,
  activePageId,
  theme,
  onSelectPage,
  onCreatePage,
  onUpdatePage,
  onDeletePage,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuPageId, setMenuPageId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Close popup window when clicking anywhere outside, scrolling, or pressing Escape
  useEffect(() => {
    if (!menuPageId) return;

    const handlePointerDownOutside = (e: PointerEvent | MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        (!activeBtnRef.current || !activeBtnRef.current.contains(e.target as Node))
      ) {
        setMenuPageId(null);
        setMenuPosition(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuPageId(null);
        setMenuPosition(null);
      }
    };

    const handleScrollOrResize = () => {
      setMenuPageId(null);
      setMenuPosition(null);
    };

    document.addEventListener('pointerdown', handlePointerDownOutside, true);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside, true);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [menuPageId]);

  const handleTogglePageMenu = (e: React.MouseEvent, pageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (menuPageId === pageId) {
      setMenuPageId(null);
      setMenuPosition(null);
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 6,
      left: Math.max(10, Math.min(window.innerWidth - 180, rect.left)),
    });
    setMenuPageId(pageId);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPageTitle.trim()) {
      onCreatePage(newPageTitle.trim());
      setNewPageTitle('');
      setIsCreating(false);
    }
  };

  const handleStartEdit = (page: Page) => {
    setEditingPageId(page.id);
    setEditTitle(page.title);
    setMenuPageId(null);
    setMenuPosition(null);
  };

  const handleSaveEdit = (pageId: string) => {
    if (editTitle.trim()) {
      onUpdatePage(pageId, { title: editTitle.trim() });
    }
    setEditingPageId(null);
  };

  return (
    <div className="w-full px-6 py-2 flex items-center justify-center relative z-20">
      <div className="flex items-center gap-1.5 max-w-6xl w-full">
        {/* Left Scroll Arrow */}
        <button
          onClick={scrollLeft}
          className="w-8 h-8 rounded-xl liquid-glass-pill text-slate-300 hover:text-white flex items-center justify-center transition-all shrink-0"
          title="Scroll tabs left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Tabs */}
        <div
          ref={scrollContainerRef}
          className="flex-1 flex items-center gap-2 overflow-x-auto custom-scrollbar scroll-smooth px-1"
        >
          {pageOrder.map((pId) => {
            const page = pages[pId];
            if (!page) return null;

            const isActive = page.id === activePageId;
            const isEditing = editingPageId === page.id;

            if (isEditing) {
              return (
                <div key={page.id} className="flex items-center gap-1 shrink-0">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleSaveEdit(page.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(page.id);
                      if (e.key === 'Escape') setEditingPageId(null);
                    }}
                    autoFocus
                    className="px-3.5 py-1.5 text-xs font-semibold liquid-glass-input rounded-xl text-white outline-none"
                  />
                </div>
              );
            }

            return (
              <div
                key={page.id}
                className={`group relative flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs transition-all cursor-pointer select-none shrink-0 ${
                  isActive
                    ? theme.activePill
                    : 'liquid-glass-pill text-slate-300 hover:text-white'
                }`}
                onClick={() => onSelectPage(page.id)}
              >
                <span className="font-semibold">{page.title}</span>

                {/* Page Menu Button */}
                <div onClick={(e) => e.stopPropagation()}>
                  <button
                    ref={menuPageId === page.id ? activeBtnRef : undefined}
                    type="button"
                    onClick={(e) => handleTogglePageMenu(e, page.id)}
                    className={`p-1 rounded-md transition-all cursor-pointer ${
                      menuPageId === page.id
                        ? 'opacity-100 bg-white/25 text-white'
                        : 'opacity-60 hover:opacity-100 hover:bg-white/15'
                    }`}
                    title="Workspace options"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {menuPageId === page.id && menuPosition && createPortal(
                    <div
                      ref={menuRef}
                      style={{
                        position: 'fixed',
                        top: `${menuPosition.top}px`,
                        left: `${menuPosition.left}px`,
                        zIndex: 99999,
                      }}
                      className="w-44 rounded-2xl liquid-glass-modal p-1.5 shadow-2xl text-xs animate-fade-in border border-white/20 space-y-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(page);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-white hover:bg-white/15 transition-colors cursor-pointer font-medium"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[var(--theme-accent,#22c55e)]" />
                        <span>Rename / Edit</span>
                      </button>

                      {pageOrder.length > 1 ? (
                        <>
                          <div className="h-px bg-white/10 my-1" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeletePage(page.id);
                              setMenuPageId(null);
                              setMenuPosition(null);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Workspace</span>
                          </button>
                        </>
                      ) : (
                        <div className="px-2.5 py-1.5 text-[11px] text-slate-400 italic">
                          Cannot delete only workspace
                        </div>
                      )}
                    </div>,
                    document.body
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        <button
          onClick={scrollRight}
          className="w-8 h-8 rounded-xl liquid-glass-pill text-slate-300 hover:text-white flex items-center justify-center transition-all shrink-0"
          title="Scroll tabs right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Add New Workspace Pill */}
        {isCreating ? (
          <form onSubmit={handleCreate} className="flex items-center gap-1 shrink-0">
            <input
              type="text"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              placeholder="Page name..."
              autoFocus
              className="px-3 py-1.5 text-xs rounded-xl liquid-glass-input text-white placeholder-slate-400/70 outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewPageTitle('');
              }}
              className="px-2 py-1.5 text-xs text-slate-400 hover:text-white rounded"
            >
              ✕
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-8 h-8 rounded-xl liquid-glass-pill text-slate-300 hover:text-emerald-300 flex items-center justify-center transition-all shrink-0"
            title="Create new workspace page"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
