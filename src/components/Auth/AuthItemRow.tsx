import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  MoreVertical,
  Trash2,
  Edit2,
  KeyRound,
  User,
  Check,
} from 'lucide-react';
import { AuthItem } from '../../types';
import { Favicon } from '../Bookmark/Favicon';

interface AuthItemRowProps {
  item: AuthItem;
  onEdit: (item: AuthItem) => void;
  onDelete: (itemId: string) => void;
  onSelectAuthItem?: (item: AuthItem, type: 'both' | 'user' | 'pass') => void;
  onToast: (msg: string) => void;
}

export const AuthItemRow: React.FC<AuthItemRowProps> = ({
  item,
  onEdit,
  onDelete,
  onSelectAuthItem,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Close popup window when clicking anywhere outside, scrolling, or pressing Escape
  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDownOutside = (e: PointerEvent | MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        (!btnRef.current || !btnRef.current.contains(e.target as Node))
      ) {
        setMenuOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setMenuOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
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
  }, [menuOpen]);

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const menuHeight = 180;
    const spaceBelow = window.innerHeight - rect.bottom;

    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 99999,
    };

    // Auto-flip: if not enough space below, open above
    if (spaceBelow < menuHeight && rect.top > menuHeight) {
      style.bottom = `${window.innerHeight - rect.top + 6}px`;
    } else {
      style.top = `${rect.bottom + 6}px`;
    }

    // Align right edge of menu with right edge of button
    const rightOffset = window.innerWidth - rect.right;
    if (rightOffset < 10) {
      style.right = '10px';
    } else {
      style.right = `${rightOffset}px`;
    }

    setMenuStyle(style);
    setMenuOpen(true);
  };

  // Auto-copy both credentials and launch URL in new tab
  const handleLaunchAndCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. First copy Password into clipboard history
    if (item.password) {
      try {
        await navigator.clipboard.writeText(item.password);
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch {}
    }

    // 2. Then copy User ID as the active clipboard content (ready for immediate Ctrl+V)
    const textToCopy = item.userId || item.password || '';
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = textToCopy;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    if (onSelectAuthItem) {
      onSelectAuthItem(item, 'both');
    } else {
      onToast(`Copied credentials for ${displayName}!`);
    }

    // 3. Open target URL in new tab
    if (item.url) {
      const targetUrl = item.url.startsWith('http') ? item.url : `https://${item.url}`;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyOnlyUser = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(item.userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    if (onSelectAuthItem) {
      onSelectAuthItem(item, 'user');
    } else {
      onToast(`Copied User ID (${item.userId})!`);
    }
    setMenuOpen(false);
  };

  const handleCopyOnlyPass = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (item.password) {
      await navigator.clipboard.writeText(item.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      if (onSelectAuthItem) {
        onSelectAuthItem(item, 'pass');
      } else {
        onToast(`Copied Password for ${displayName}!`);
      }
    }
    setMenuOpen(false);
  };

  // Extract clean site name if title is empty or raw URL
  const getDisplayName = (): string => {
    if (item.title && !item.title.startsWith('http://') && !item.title.startsWith('https://')) {
      return item.title;
    }
    try {
      const parsed = new URL(item.url.startsWith('http') ? item.url : `https://${item.url}`);
      const host = parsed.hostname.replace(/^www\./i, '');
      const parts = host.split('.');
      if (parts.length > 2 && (parts[0] === 'web' || parts[0] === 'app' || parts[0] === 'm' || parts[0] === 'chat')) {
        parts.shift();
      }
      const namePart = parts[0];
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    } catch {
      return item.title || item.url;
    }
  };

  const displayName = getDisplayName();

  return (
    <div
      onClick={handleLaunchAndCopy}
      className={`group relative rounded-xl px-2.5 py-2 transition-all duration-150 hover:bg-white/[0.08] hover:border hover:border-white/12 hover:shadow-[0_4px_20px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] border border-transparent cursor-pointer select-none ${
        copied ? 'bg-emerald-500/15 !border-emerald-400/40 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : ''
      }`}
      title={`Click to open ${displayName} & copy credentials`}
    >
      <div className="flex items-center gap-2.5">
        {/* Favicon */}
        <div className="shrink-0">
          <Favicon url={item.url} title={displayName} customIcon={item.faviconUrl} />
        </div>

        {/* Name - Strictly only the name is shown */}
        <div className="flex-1 min-w-0 pr-1">
          <h4 className="text-sm font-medium text-slate-100 leading-snug truncate group-hover:text-emerald-300 transition-colors bookmark-item-title">
            {displayName}
          </h4>
        </div>

        {/* Right side: ONLY the three dots (and temporary copied checkmark) */}
        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {copied ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md animate-fade-in">
              <Check className="w-3 h-3" />
              <span>Copied</span>
            </span>
          ) : (
            <div className="relative">
              <button
                ref={btnRef}
                type="button"
                onClick={handleToggleMenu}
                className={`p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all cursor-pointer ${
                  menuOpen ? 'opacity-100 bg-white/10 text-white' : 'opacity-0 group-hover:opacity-100'
                }`}
                title="More options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && createPortal(
                <div
                  ref={menuRef}
                  style={menuStyle}
                  className="w-44 rounded-2xl liquid-glass-modal p-1.5 shadow-2xl text-xs animate-fade-in border border-white/20 space-y-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Prominent Edit option */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onEdit(item);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-white hover:bg-white/15 transition-colors cursor-pointer font-medium"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[var(--theme-accent,#22c55e)]" />
                    <span>Edit Credential</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyOnlyUser}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">Copy ID: {item.userId}</span>
                  </button>

                  {item.password && (
                    <button
                      type="button"
                      onClick={handleCopyOnlyPass}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-emerald-400 hover:bg-emerald-500/15 transition-colors cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Copy Password</span>
                    </button>
                  )}

                  <div className="h-px bg-white/10 my-1" />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onDelete(item.id);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>,
                document.body
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
