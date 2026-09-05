import React, { useState, useEffect } from 'react';
import {
  GripHorizontal,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { WatchWidget, WatchType } from '../../types';

interface WatchWidgetCardProps {
  watch: WatchWidget;
  layoutMode?: 'free' | 'grid' | 'kanban';
  defaultPosition?: { x: number; y: number };
  onUpdateWatch: (watchId: string, updates: Partial<WatchWidget>) => void;
  onDeleteWatch: (watchId: string) => void;
}

export const WATCH_STYLES: { id: WatchType; label: string; icon: string; desc: string }[] = [
  { id: 'hybrid', label: 'Minimal Hybrid', icon: '🕒', desc: 'Analog dial with top-right digital readout & day' },
  { id: 'stacked', label: 'Stacked LCD', icon: '🔢', desc: 'Stacked digital display with ghost segments & vertical date' },
  { id: 'roman', label: 'Roman Minimal', icon: '🏛️', desc: 'Modern Roman numeral dial with accent second hand' },
  { id: 'hud', label: 'Typography HUD', icon: '⏱️', desc: 'Giant slashed techno digits with hours, minutes & seconds' },
];

/* 7-Segment SVG Digit with Ghost Inactive Segments and Dynamic Scaling */
const SEGMENTS: Record<string, number[]> = {
  '0': [1, 1, 1, 1, 1, 1, 0],
  '1': [0, 1, 1, 0, 0, 0, 0],
  '2': [1, 1, 0, 1, 1, 0, 1],
  '3': [1, 1, 1, 1, 0, 0, 1],
  '4': [0, 1, 1, 0, 0, 1, 1],
  '5': [1, 0, 1, 1, 0, 1, 1],
  '6': [1, 0, 1, 1, 1, 1, 1],
  '7': [1, 1, 1, 0, 0, 0, 0],
  '8': [1, 1, 1, 1, 1, 1, 1],
  '9': [1, 1, 1, 1, 0, 1, 1],
};

const SvgSevenSegment: React.FC<{ digit: string; scale?: number }> = ({ digit, scale = 1 }) => {
  const active = SEGMENTS[digit] || SEGMENTS['0'];
  const w = Math.round(38 * scale);
  const h = Math.round(62 * scale);
  return (
    <svg viewBox="0 0 32 58" style={{ width: `${w}px`, height: `${h}px` }} className="drop-shadow-sm select-none">
      {/* a - top horizontal */}
      <rect x="5" y="2" width="22" height="4.5" rx="2.2" fill={active[0] ? '#ffffff' : 'rgba(255,255,255,0.1)'} opacity={active[0] ? 0.95 : 0.25} />
      {/* b - top right vertical */}
      <rect x="25.5" y="6.5" width="4.5" height="20" rx="2.2" fill={active[1] ? '#ffffff' : 'rgba(255,255,255,0.1)'} opacity={active[1] ? 0.95 : 0.25} />
      {/* c - bottom right vertical */}
      <rect x="25.5" y="29.5" width="4.5" height="20" rx="2.2" fill={active[2] ? '#ffffff' : 'rgba(255,255,255,0.1)'} opacity={active[2] ? 0.95 : 0.25} />
      {/* d - bottom horizontal */}
      <rect x="5" y="49" width="22" height="4.5" rx="2.2" fill={active[3] ? '#ffffff' : 'rgba(255,255,255,0.1)'} opacity={active[3] ? 0.95 : 0.25} />
      {/* e - bottom left vertical */}
      <rect x="2" y="29.5" width="4.5" height="20" rx="2.2" fill={active[4] ? '#ffffff' : 'rgba(255,255,255,0.1)'} opacity={active[4] ? 0.95 : 0.25} />
      {/* f - top left vertical */}
      <rect x="2" y="6.5" width="4.5" height="20" rx="2.2" fill={active[5] ? '#ffffff' : 'rgba(255,255,255,0.1)'} opacity={active[5] ? 0.95 : 0.25} />
      {/* g - middle horizontal */}
      <rect x="5" y="25.5" width="22" height="4.5" rx="2.2" fill={active[6] ? '#ffffff' : 'rgba(255,255,255,0.1)'} opacity={active[6] ? 0.95 : 0.25} />
    </svg>
  );
};

export const WatchWidgetCard: React.FC<WatchWidgetCardProps> = ({
  watch,
  layoutMode = 'free',
  defaultPosition = { x: 24, y: 16 },
  onUpdateWatch,
  onDeleteWatch,
}) => {
  const [time, setTime] = useState(new Date());
  const [isFreeDragging, setIsFreeDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);

  // Active watch style fallback
  const validWatchTypes: WatchType[] = ['hybrid', 'stacked', 'roman', 'hud'];
  const currentWatchType: WatchType = validWatchTypes.includes(watch.type) ? watch.type : 'hybrid';
  const currentIndex = Math.max(0, WATCH_STYLES.findIndex((s) => s.id === currentWatchType));

  // Dynamic resizing & scale logic
  const defaultBaseWidth = currentWatchType === 'hud' ? 440 : 260;
  const [dynamicWidth, setDynamicWidth] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isFreeLayout = layoutMode === 'free';
  const pos = watch.position || defaultPosition;

  // Compute effective width and proportional scaling factor
  const effectiveWidth = dynamicWidth ?? watch.width ?? defaultBaseWidth;
  const scale = Math.max(0.65, Math.min(2.2, effectiveWidth / defaultBaseWidth));

  // Solid, responsive pointer drag anywhere on card (excluding controls)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isFreeLayout || isResizing) return;
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('a') || target.closest('.no-drag')) {
      return;
    }

    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture fails
    }

    setIsFreeDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = watch.position || defaultPosition;

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
      onUpdateWatch(watch.id, { position: { x: finalX, y: finalY } });
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Interactive Bottom-Right Corner Drag-to-Resize
  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = effectiveWidth;
    let finalWidth = startWidth;

    const minWidth = currentWatchType === 'hud' ? 280 : 210;
    const maxWidth = currentWatchType === 'hud' ? 820 : 560;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, Math.round(startWidth + deltaX)));
      finalWidth = newWidth;
      setDynamicWidth(newWidth);
    };

    const onPointerUp = () => {
      setIsResizing(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      onUpdateWatch(watch.id, { width: finalWidth });
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleSetPresetWidth = (size: 'sm' | 'md' | 'lg') => {
    let targetWidth: number;
    if (currentWatchType === 'hud') {
      targetWidth = size === 'sm' ? 340 : size === 'md' ? 440 : 580;
    } else {
      targetWidth = size === 'sm' ? 220 : size === 'md' ? 270 : 350;
    }
    setDynamicWidth(targetWidth);
    onUpdateWatch(watch.id, { width: targetWidth });
  };

  const hours24 = time.getHours();
  const is24Hour = watch.is24Hour ?? false;
  const hours = is24Hour ? hours24 : hours24 % 12 || 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hoursStr = String(hours).padStart(2, '0');
  const minutesStr = String(minutes).padStart(2, '0');
  const secondsStr = String(seconds).padStart(2, '0');
  const dayName = time.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const dateNumber = time.getDate();
  const monthStr = time.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const fullDateStr = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleNextStyle = () => {
    const nextIdx = (currentIndex + 1) % WATCH_STYLES.length;
    onUpdateWatch(watch.id, { type: WATCH_STYLES[nextIdx].id });
  };

  const handlePrevStyle = () => {
    const prevIdx = (currentIndex - 1 + WATCH_STYLES.length) % WATCH_STYLES.length;
    onUpdateWatch(watch.id, { type: WATCH_STYLES[prevIdx].id });
  };

  const cardStyle: React.CSSProperties = {
    width: `${effectiveWidth}px`,
    ['--widget-scale' as string]: scale.toFixed(3),
    ...(isFreeLayout
      ? {
          position: 'absolute',
          left: `${pos.x + dragOffset.x}px`,
          top: `${pos.y + dragOffset.y}px`,
          zIndex: isFreeDragging || isResizing ? 50 : 10,
          boxShadow:
            isFreeDragging || isResizing
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px var(--theme-accent, rgba(34, 197, 94, 0.35))'
              : undefined,
          transition: isFreeDragging || isResizing ? 'none' : 'box-shadow 0.2s',
        }
      : {}),
  };

  return (
    <div
      style={cardStyle}
      onPointerDown={handlePointerDown}
      className={`shrink-0 flex flex-col rounded-3xl liquid-glass-card p-4 relative group select-none transition-all duration-150 ${
        isFreeLayout ? 'cursor-grab active:cursor-grabbing' : ''
      } ${isFreeDragging ? 'ring-2 ring-[var(--theme-accent,#22c55e)] scale-[1.02]' : ''}`}
    >
      {/* Top Controls Bar - Appears on Hover */}
      <div className="flex items-center justify-between gap-1 pb-1 mb-1 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150 w-full min-w-0">
        {/* Drag indicator */}
        <div className="flex items-center gap-1 text-slate-400 shrink-0">
          <GripHorizontal className="w-3.5 h-3.5 hover:text-white transition-colors" />
          {effectiveWidth >= 300 && (
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Clock</span>
          )}
        </div>

        {/* Quick Size Presets: S / M / L */}
        <div className="flex items-center gap-0.5 bg-white/5 p-0.5 rounded-lg border border-white/10 no-drag text-[9px] font-bold shrink-0">
          <button
            type="button"
            onClick={() => handleSetPresetWidth('sm')}
            className="px-1 py-0.5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Small Size"
          >
            S
          </button>
          <button
            type="button"
            onClick={() => handleSetPresetWidth('md')}
            className="px-1 py-0.5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Medium Size (Default)"
          >
            M
          </button>
          <button
            type="button"
            onClick={() => handleSetPresetWidth('lg')}
            className="px-1 py-0.5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Large Size"
          >
            L
          </button>
        </div>

        {/* Style switcher */}
        <div className="flex items-center gap-0.5 no-drag bg-white/5 px-1 py-0.5 rounded-lg border border-white/10 shrink-0">
          <button
            type="button"
            onClick={handlePrevStyle}
            className="p-0.5 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Previous clock style"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>

          <div className="relative no-drag">
            <button
              type="button"
              onClick={() => setStyleDropdownOpen((prev) => !prev)}
              className="flex items-center px-1 text-[10px] font-semibold text-slate-200 hover:bg-white/10 rounded transition-colors cursor-pointer"
            >
              <span>{currentIndex + 1}/4</span>
            </button>

            {styleDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setStyleDropdownOpen(false)} />
                <div className="absolute left-0 top-full mt-1.5 w-52 rounded-2xl liquid-glass-modal p-1.5 shadow-2xl z-50 animate-fade-in text-xs space-y-1">
                  <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-white/10">
                    Choose Clock
                  </div>
                  {WATCH_STYLES.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => {
                        onUpdateWatch(watch.id, { type: style.id });
                        setStyleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                        currentWatchType === style.id
                          ? 'bg-white/20 text-white font-semibold'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-sm">{style.icon}</span>
                      <span className="truncate">{style.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleNextStyle}
            className="p-0.5 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Next clock style"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* 12H / 24H Toggle & Delete Button */}
        <div className="flex items-center gap-1 no-drag shrink-0">
          <button
            type="button"
            onClick={() => onUpdateWatch(watch.id, { is24Hour: !watch.is24Hour })}
            className="px-1 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[9px] font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle 12h / 24h format"
          >
            {watch.is24Hour ? '24H' : '12H'}
          </button>

          <button
            type="button"
            onClick={() => onDeleteWatch(watch.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
            title="Remove clock"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MINIMAL HYBRID DIAL (Clock 1) */}
      {/* ========================================================================= */}
      {currentWatchType === 'hybrid' && (
        <div
          style={{ width: `${Math.round(180 * scale)}px`, height: `${Math.round(180 * scale)}px` }}
          className="flex items-center justify-center select-none relative mx-auto my-auto"
        >
          {/* Frosted Liquid Glass Dial Surface */}
          <div className="relative w-full h-full rounded-full bg-white/[0.06] border border-white/20 shadow-[inset_0_2px_6px_rgba(0,0,0,0.3),0_8px_20px_rgba(0,0,0,0.4)] backdrop-blur-xl flex items-center justify-center p-2">
            {/* Top Right Digital Readout */}
            <div
              style={{
                top: `${Math.round(20 * scale)}px`,
                right: `${Math.round(20 * scale)}px`,
              }}
              className="absolute flex flex-col items-end leading-none z-10"
            >
              <span
                style={{ fontSize: `${scale * 1.4}rem` }}
                className="font-black text-white tracking-tight drop-shadow-sm"
              >
                {hoursStr}
              </span>
              <span
                style={{ fontSize: `${scale * 1.4}rem` }}
                className="font-medium text-slate-400 tracking-tight mt-0.5"
              >
                {minutesStr}
              </span>
            </div>

            {/* Bottom Day of Week (Follows Accent Color) */}
            <div
              style={{ bottom: `${Math.round(16 * scale)}px` }}
              className="absolute inset-x-0 flex justify-center z-10"
            >
              <span
                className="font-bold tracking-[0.22em] uppercase drop-shadow"
                style={{
                  fontSize: `${Math.max(7, Math.round(9 * scale))}px`,
                  color: 'var(--theme-accent, #22c55e)',
                }}
              >
                {dayName}
              </span>
            </div>

            {/* Analog Clock Dial */}
            <svg viewBox="0 0 100 100" className="w-full h-full select-none">
              {/* Subtle Hour Cross Ticks at 12, 3, 6, 9 */}
              <line x1="50" y1="6" x2="50" y2="9.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="90.5" y1="50" x2="94" y2="50" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="50" y1="90.5" x2="50" y2="94" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="6" y1="50" x2="9.5" y2="50" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" strokeLinecap="round" />

              {/* Hour Hand */}
              <line
                x1="50"
                y1="50"
                x2="50"
                y2="28"
                stroke="#f8fafc"
                strokeWidth="5.5"
                strokeLinecap="round"
                transform={`rotate(${(hours % 12 + minutes / 60) * 30} 50 50)`}
              />

              {/* Slim Minute Hand */}
              <line
                x1="50"
                y1="50"
                x2="50"
                y2="14"
                stroke="#cbd5e1"
                strokeWidth="2.2"
                strokeLinecap="round"
                transform={`rotate(${(minutes + seconds / 60) * 6} 50 50)`}
              />

              {/* Second Hand (Follows Accent Color) */}
              <line
                x1="50"
                y1="57"
                x2="50"
                y2="12"
                stroke="var(--theme-accent, #22c55e)"
                strokeWidth="1.4"
                transform={`rotate(${seconds * 6} 50 50)`}
              />

              {/* Raised Center Cap with Shadow */}
              <circle cx="50" cy="50" r="5" fill="#ffffff" filter="drop-shadow(0 1.5px 3px rgba(0,0,0,0.4))" />
            </svg>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STACKED DIGITAL LCD (Clock 2) */}
      {/* ========================================================================= */}
      {currentWatchType === 'stacked' && (
        <div
          style={{
            width: `${Math.round(195 * scale)}px`,
            height: `${Math.round(180 * scale)}px`,
          }}
          className="flex items-center justify-between px-2 select-none mx-auto my-auto"
        >
          {/* 2x2 Digits: Hours on top, Minutes on bottom */}
          <div style={{ gap: `${Math.round(6 * scale)}px` }} className="flex flex-col justify-center">
            {/* Top Row: Hours */}
            <div style={{ gap: `${Math.round(6 * scale)}px` }} className="flex items-center">
              <SvgSevenSegment digit={hoursStr[0]} scale={scale} />
              <SvgSevenSegment digit={hoursStr[1]} scale={scale} />
            </div>
            {/* Bottom Row: Minutes */}
            <div style={{ gap: `${Math.round(6 * scale)}px` }} className="flex items-center">
              <SvgSevenSegment digit={minutesStr[0]} scale={scale} />
              <SvgSevenSegment digit={minutesStr[1]} scale={scale} />
            </div>
          </div>

          {/* Right Column: Pill Badge & Rotated Date (Follows Accent Color) */}
          <div
            style={{ height: `${Math.round(140 * scale)}px` }}
            className="flex flex-col items-center justify-between py-2 pl-2 border-l border-white/10"
          >
            {/* Accent vertical pill capsule */}
            <div
              style={{
                width: `${Math.round(12 * scale)}px`,
                height: `${Math.round(32 * scale)}px`,
              }}
              className="rounded-full bg-white/10 border border-white/20 shadow-inner flex items-center justify-center p-0.5"
            >
              <div
                style={{
                  width: `${Math.round(6 * scale)}px`,
                  height: `${Math.round(16 * scale)}px`,
                  backgroundColor: 'var(--theme-accent, #22c55e)',
                  boxShadow: '0 0 10px var(--theme-accent, #22c55e)',
                }}
                className="rounded-full transition-all duration-300"
              />
            </div>

            {/* Rotated Date Text */}
            <div
              style={{ fontSize: `${scale * 0.75}rem` }}
              className="rotate-[-90deg] origin-center whitespace-nowrap font-black tracking-widest text-slate-200"
            >
              {dateNumber}, {monthStr}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ROMAN MINIMALIST DIAL (Clock 3) */}
      {/* ========================================================================= */}
      {currentWatchType === 'roman' && (
        <div
          style={{ width: `${Math.round(180 * scale)}px`, height: `${Math.round(180 * scale)}px` }}
          className="flex items-center justify-center select-none relative mx-auto my-auto"
        >
          {/* Frosted Circular Dial Surface */}
          <div className="relative w-full h-full rounded-full bg-white/[0.06] border border-white/20 shadow-[inset_0_2px_6px_rgba(0,0,0,0.3),0_8px_20px_rgba(0,0,0,0.4)] backdrop-blur-xl flex items-center justify-center p-2">
            <svg viewBox="0 0 100 100" className="w-full h-full select-none">
              {/* Roman Numerals: XII, III (bars), VI, IX */}
              <text x="50" y="15" fill="#f8fafc" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                XII
              </text>
              <g transform="translate(86, 46)">
                <line x1="0" y1="0" x2="0" y2="8" stroke="#f8fafc" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="3" y1="0" x2="3" y2="8" stroke="#f8fafc" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="6" y1="0" x2="6" y2="8" stroke="#f8fafc" strokeWidth="1.6" strokeLinecap="round" />
              </g>
              <text x="50" y="90" fill="#f8fafc" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                VI
              </text>
              <text x="13" y="52.5" fill="#f8fafc" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                IX
              </text>

              {/* Radial Ticks for 1, 2, 4, 5, 7, 8, 10, 11 */}
              {[30, 60, 120, 150, 210, 240, 300, 330].map((deg) => (
                <line
                  key={deg}
                  x1="50"
                  y1="7"
                  x2="50"
                  y2="11"
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  transform={`rotate(${deg} 50 50)`}
                />
              ))}

              {/* Hour Hand */}
              <line
                x1="50"
                y1="50"
                x2="50"
                y2="28"
                stroke="#f8fafc"
                strokeWidth="2.8"
                strokeLinecap="round"
                transform={`rotate(${(hours % 12 + minutes / 60) * 30} 50 50)`}
              />

              {/* Minute Hand */}
              <line
                x1="50"
                y1="50"
                x2="50"
                y2="15"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeLinecap="round"
                transform={`rotate(${(minutes + seconds / 60) * 6} 50 50)`}
              />

              {/* Accent Second Hand (Follows Accent Color) */}
              <line
                x1="50"
                y1="56"
                x2="50"
                y2="13"
                stroke="var(--theme-accent, #22c55e)"
                strokeWidth="1.4"
                transform={`rotate(${seconds * 6} 50 50)`}
              />
              <circle cx="50" cy="50" r="2.5" fill="var(--theme-accent, #22c55e)" />
            </svg>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. GIANT TYPOGRAPHY HUD GRID CLOCK (Clock 4) */}
      {/* ========================================================================= */}
      {currentWatchType === 'hud' && (
        <div className="py-1 px-2 flex flex-col justify-between w-full select-none">
          {/* Top Labels */}
          <div
            style={{ fontSize: `${scale * 0.65}rem` }}
            className="flex items-center justify-between uppercase font-mono tracking-widest text-slate-400 pb-1 border-b border-white/10"
          >
            <span className="w-1/3 text-left">hours</span>
            <span className="w-1/3 text-center">minutes</span>
            <span className="w-1/3 text-right">seconds</span>
          </div>

          {/* Main Digits Row */}
          <div className="flex items-center justify-between gap-1 py-2 font-mono">
            {/* Hours: e.g. Ø8 */}
            <div className="flex items-center gap-1">
              <span
                style={{ fontSize: `${scale * 3.25}rem`, lineHeight: 1 }}
                className="font-black text-white tracking-tight drop-shadow-md"
              >
                {hoursStr[0] === '0' ? 'Ø' : hoursStr[0]}
              </span>
              <span
                style={{ fontSize: `${scale * 3.25}rem`, lineHeight: 1 }}
                className="font-black text-white tracking-tight drop-shadow-md"
              >
                {hoursStr[1]}
              </span>
            </div>

            {/* Accent Colon */}
            <div className="flex flex-col gap-1.5 py-1 px-1">
              <span
                style={{
                  width: `${Math.max(4, Math.round(6 * scale))}px`,
                  height: `${Math.max(4, Math.round(6 * scale))}px`,
                  backgroundColor: 'var(--theme-accent, #22c55e)',
                }}
                className="rounded-sm"
              />
              <span
                style={{
                  width: `${Math.max(4, Math.round(6 * scale))}px`,
                  height: `${Math.max(4, Math.round(6 * scale))}px`,
                  backgroundColor: 'var(--theme-accent, #22c55e)',
                }}
                className="rounded-sm"
              />
            </div>

            {/* Minutes: e.g. 59 */}
            <div className="flex items-center gap-1">
              <span
                style={{ fontSize: `${scale * 3.25}rem`, lineHeight: 1 }}
                className="font-black text-white tracking-tight drop-shadow-md"
              >
                {minutesStr[0]}
              </span>
              <span
                style={{ fontSize: `${scale * 3.25}rem`, lineHeight: 1 }}
                className="font-black text-white tracking-tight drop-shadow-md"
              >
                {minutesStr[1]}
              </span>
            </div>

            {/* Accent Colon */}
            <div className="flex flex-col gap-1.5 py-1 px-1">
              <span
                style={{
                  width: `${Math.max(4, Math.round(6 * scale))}px`,
                  height: `${Math.max(4, Math.round(6 * scale))}px`,
                  backgroundColor: 'var(--theme-accent, #22c55e)',
                }}
                className="rounded-sm"
              />
              <span
                style={{
                  width: `${Math.max(4, Math.round(6 * scale))}px`,
                  height: `${Math.max(4, Math.round(6 * scale))}px`,
                  backgroundColor: 'var(--theme-accent, #22c55e)',
                }}
                className="rounded-sm"
              />
            </div>

            {/* Seconds: Stacked scrolling tape */}
            <div className="flex flex-col items-center justify-center font-mono leading-none border-l border-white/10 pl-2">
              <span
                style={{ fontSize: `${scale * 0.65}rem` }}
                className="text-slate-500 font-bold -mb-0.5"
              >
                {String((seconds + 59) % 60).padStart(2, '0')}
              </span>
              <span
                style={{
                  fontSize: `${scale * 1.8}rem`,
                  color: 'var(--theme-accent, #22c55e)',
                }}
                className="font-black tracking-tight drop-shadow"
              >
                {secondsStr}
              </span>
              <span
                style={{ fontSize: `${scale * 0.65}rem` }}
                className="text-slate-500 font-bold -mt-0.5"
              >
                {String((seconds + 1) % 60).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Bottom Status Dots (Follows Accent Color) */}
          <div
            style={{ fontSize: `${scale * 0.65}rem` }}
            className="flex items-center justify-between pt-1.5 border-t border-white/10 font-mono text-slate-400"
          >
            <div className="flex items-center gap-1.5">
              {[...Array(6)].map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: `${Math.max(3, Math.round(5 * scale))}px`,
                    height: `${Math.max(3, Math.round(5 * scale))}px`,
                    backgroundColor: i === Math.floor(seconds / 10) ? 'var(--theme-accent, #22c55e)' : 'rgba(255,255,255,0.2)',
                    boxShadow: i === Math.floor(seconds / 10) ? '0 0 8px var(--theme-accent, #22c55e)' : 'none',
                  }}
                  className="rounded-full transition-all duration-300"
                />
              ))}
            </div>
            <span
              style={{ fontSize: `${scale * 0.7}rem` }}
              className="font-bold text-slate-300 uppercase tracking-wider"
            >
              {fullDateStr}
            </span>
          </div>
        </div>
      )}

      {/* Interactive Bottom-Right Corner Resize Grip Handle */}
      <div
        onPointerDown={handleResizePointerDown}
        className="absolute bottom-1 right-1 w-5 h-5 cursor-nwse-resize text-slate-400 hover:text-[var(--theme-accent,#22c55e)] opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-all flex items-end justify-end p-0.5 select-none no-drag z-20"
        title="Click & drag to resize clock"
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
