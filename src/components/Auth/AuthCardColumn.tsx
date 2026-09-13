import React, { useState, useRef, useEffect } from 'react';
import { Plus, MoreVertical, Trash2, Edit2, KeyRound, Palette, Check } from 'lucide-react';
import { AuthBoard, AuthItem } from '../../types';
import { AuthItemRow } from './AuthItemRow';
import { getBoardColorConfig, BOARD_COLORS, COLOR_OPTIONS } from '../../theme/boardColors';

interface AuthCardColumnProps {
  board: AuthBoard;
  items: AuthItem[];
  defaultPosition?: { x: number; y: number };
  onAddItem: (boardId: string) => void;
  onUpdateBoard: (boardId: string, updates: Partial<AuthBoard>) => void;
  onDeleteBoard: (boardId: string) => void;
  onEditItem: (item: AuthItem) => void;
  onDeleteItem: (itemId: string) => void;
  onSelectAuthItem?: (item: AuthItem, type: 'both' | 'user' | 'pass') => void;
  onToast: (msg: string) => void;
}

export const AuthCardColumn: React.FC<AuthCardColumnProps> = ({
  board,
  items,
  defaultPosition = { x: 30, y: 20 },
  onAddItem,
  onUpdateBoard,
  onDeleteBoard,
  onEditItem,
  onDeleteItem,
  onSelectAuthItem,
  onToast,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(board.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close popup window when clicking anywhere outside or pressing Escape
  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDownOutside = (e: PointerEvent | MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDownOutside, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const pos = board.position || defaultPosition;

  // Freeform dragging state
  const [isFreeDragging, setIsFreeDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleFreePointerDown = (e: React.PointerEvent) => {
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

  const handleSaveTitle = () => {
    if (titleInput.trim() && titleInput.trim() !== board.title) {
      onUpdateBoard(board.id, { title: titleInput.trim() });
    }
    setIsEditingTitle(false);
  };

  useEffect(() => {
    setTitleInput(board.title);
  }, [board.title]);

  const currentBoardWidth = currentDimensions.width || board.width || 320;
  const isMultiColumn = currentBoardWidth >= 440;
  const colorConfig = getBoardColorConfig(board.color);
  const isTinted = !colorConfig.isDefault;
  const isDefaultTheme = !board.color || board.color === 'default';
  const isCustomHex = Boolean(board.color && board.color.startsWith('#'));

  const style: React.CSSProperties = {
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
  };

  return (
    <div
      style={style}
      data-board-color={colorConfig.id}
      className={`shrink-0 flex flex-col rounded-2xl liquid-glass-card ${isTinted ? 'board-tinted' : ''} px-5 pt-3.5 pb-4 group relative select-none transition-all duration-150`}
    >
      {/* Card Header - Draggable anywhere on Canvas */}
      <div
        onPointerDown={handleFreePointerDown}
        style={{
          borderBottomColor: isDefaultTheme ? undefined : `rgba(${colorConfig.rgb}, 0.35)`,
        }}
        className={`flex items-center justify-between pb-2 mb-1 border-b ${isDefaultTheme ? 'border-white/10' : ''} cursor-grab active:cursor-grabbing`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className={`w-2.5 h-2.5 rounded-full ${colorConfig.dot || ''} transition-all`}
            style={{
              backgroundColor: colorConfig.isCustom ? colorConfig.hex : undefined,
              boxShadow: `0 0 8px ${colorConfig.hex}`,
            }}
          />

          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
              autoFocus
              className="text-sm font-bold text-white bg-white/10 px-2 py-0.5 rounded-lg outline-none w-full border border-white/20"
            />
          ) : (
            <h3
              onDoubleClick={() => setIsEditingTitle(true)}
              className="text-sm font-bold text-white tracking-wide truncate leading-tight cursor-text board-header-title"
              title="Double click to rename • Drag header to move"
            >
              {board.title}
            </h3>
          )}
        </div>

        {/* Action buttons (hover visible) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            type="button"
            onClick={() => onAddItem(board.id)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Add auth link"
          >
            <Plus className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setMenuOpen((prev) => !prev);
                setColorPickerOpen(false);
              }}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Card options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 top-full mt-1.5 w-52 rounded-2xl liquid-glass-modal p-1.5 shadow-2xl z-[70] animate-fade-in text-xs space-y-0.5 border border-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setIsEditingTitle(true);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/15 text-white text-left transition-colors cursor-pointer font-medium"
                >
                  <Edit2 className="w-3.5 h-3.5" style={{ color: colorConfig.hex }} />
                  <span>Rename / Edit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onAddItem(board.id);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-slate-200 text-left transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                  <span>Add Auth Link</span>
                </button>

                {/* Change Color */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setColorPickerOpen((prev) => !prev)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-slate-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Palette className="w-3.5 h-3.5" style={{ color: colorConfig.hex }} />
                    <span>Change color</span>
                  </button>

                  {colorPickerOpen && (
                    <div className="p-2 border-t border-white/10 space-y-2">
                      {/* Theme Default Option */}
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateBoard(board.id, { color: undefined });
                          setColorPickerOpen(false);
                          setMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-xl transition-all cursor-pointer text-[11px] ${
                          isDefaultTheme
                            ? 'bg-white/15 text-white font-semibold border border-white/30'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                        title="Reset to default theme color with no custom tint"
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-[var(--theme-accent,#22c55e)] shadow-[0_0_6px_var(--theme-accent,#22c55e)]" />
                          <span>Theme Default</span>
                        </div>
                        {isDefaultTheme && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>

                      {/* Predefined Color Presets */}
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold mb-1 px-0.5">Presets:</p>
                        <div className="flex items-center gap-1.5 justify-center py-0.5">
                          {COLOR_OPTIONS.map((c) => {
                            const opt = BOARD_COLORS[c];
                            const isSelected = board.color === c;
                            return (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  onUpdateBoard(board.id, { color: c });
                                  setColorPickerOpen(false);
                                  setMenuOpen(false);
                                }}
                                className={`w-5 h-5 rounded-full ${opt.dot} hover:scale-125 transition-all cursor-pointer ${
                                  isSelected ? 'ring-2 ring-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.7)]' : 'opacity-70 hover:opacity-100'
                                }`}
                                title={opt.label}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Choose Any Custom Color */}
                      <div className="pt-1.5 border-t border-white/10 flex items-center justify-between">
                        <label className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5 cursor-pointer">
                          <div
                            className="w-4 h-4 rounded-full border border-white/40 shadow-sm shrink-0 overflow-hidden relative cursor-pointer"
                            style={{ backgroundColor: isCustomHex ? board.color : '#ec4899' }}
                          >
                            <input
                              type="color"
                              value={isCustomHex ? board.color : '#ec4899'}
                              onChange={(e) => {
                                onUpdateBoard(board.id, { color: e.target.value });
                              }}
                              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                              title="Pick any custom color"
                            />
                          </div>
                          <span>Custom color</span>
                        </label>

                        {isCustomHex && (
                          <span className="text-[10px] font-mono text-slate-300 uppercase bg-white/10 px-1.5 py-0.5 rounded border border-white/20">
                            {board.color}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-px bg-white/10 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDeleteBoard(board.id);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-red-500/20 text-rose-400 text-left transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Card</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items List - Bookmark style layout (responsive multi-column when card is widened) */}
      <div
        className={`flex-1 overflow-y-auto custom-scrollbar pr-1 pb-1 ${
          isMultiColumn
            ? 'grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2 content-start'
            : 'space-y-1'
        }`}
      >
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-28 rounded-xl border border-dashed border-white/10 text-slate-400 text-xs text-center p-4">
            <KeyRound className="w-6 h-6 mb-1.5 opacity-40 text-emerald-400" />
            <p className="font-medium">No logins yet</p>
            <button
              type="button"
              onClick={() => onAddItem(board.id)}
              className="text-[11px] font-semibold text-[var(--theme-accent,#22c55e)] hover:underline cursor-pointer mt-1"
            >
              + Add first login
            </button>
          </div>
        ) : (
          items.map((item) => (
            <AuthItemRow
              key={item.id}
              item={item}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
              onSelectAuthItem={onSelectAuthItem}
              onToast={onToast}
            />
          ))
        )}
      </div>

      {/* Interactive Bottom-Right Corner Resize Grip - Appears on Hover */}
      <div
        onMouseDown={handleResizeMouseDown}
        className="absolute bottom-1.5 right-1.5 w-4 h-4 cursor-nwse-resize text-slate-400 hover:text-[var(--theme-accent,#22c55e)] opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-all flex items-end justify-end p-0.5 select-none"
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
