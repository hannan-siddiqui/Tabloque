import React, { useState, useMemo, useEffect } from 'react';
import {
  GripHorizontal,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar as CalendarIcon,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { CalendarWidget, CalendarType } from '../../types';

interface CalendarWidgetCardProps {
  calendar: CalendarWidget;
  layoutMode?: 'free' | 'grid' | 'kanban';
  defaultPosition?: { x: number; y: number };
  onUpdateCalendar: (calendarId: string, updates: Partial<CalendarWidget>) => void;
  onDeleteCalendar: (calendarId: string) => void;
}

export const CALENDAR_STYLES: { id: CalendarType; label: string; icon: string; desc: string }[] = [
  { id: 'monthly', label: 'Monthly Matrix', icon: '📅', desc: 'Full interactive monthly glass grid with month navigation' },
  { id: 'compact', label: 'Compact Agenda', icon: '🗓️', desc: 'Space-saving hero date with two-week horizon chips' },
  { id: 'split', label: 'Editorial Split', icon: '🗂️', desc: 'Bold typographic date block paired with monthly mini-grid' },
  { id: 'strip', label: 'Week Horizon', icon: '⚡', desc: 'Horizontal 7-day capsule strip with active day indicator' },
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAYS_OF_WEEK_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const CalendarWidgetCard: React.FC<CalendarWidgetCardProps> = ({
  calendar,
  layoutMode = 'free',
  defaultPosition = { x: 380, y: 16 },
  onUpdateCalendar,
  onDeleteCalendar,
}) => {
  const today = useMemo(() => new Date(), []);

  // Browsing month/year state for interactive calendars
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [isFreeDragging, setIsFreeDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);

  const isFreeLayout = layoutMode === 'free';
  const pos = calendar.position || defaultPosition;

  const validCalendarTypes: CalendarType[] = ['monthly', 'compact', 'split', 'strip'];
  const currentCalendarType: CalendarType = validCalendarTypes.includes(calendar.type) ? calendar.type : 'monthly';
  const currentIndex = Math.max(0, CALENDAR_STYLES.findIndex((s) => s.id === currentCalendarType));

  // Dynamic resizing & scale logic based on calendar style
  const defaultBaseWidth = useMemo(() => {
    switch (currentCalendarType) {
      case 'split': return 420;
      case 'strip': return 390;
      case 'compact': return 310;
      case 'monthly':
      default: return 340;
    }
  }, [currentCalendarType]);

  const [dynamicWidth, setDynamicWidth] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  // Sync dynamicWidth when calendar.width changes or style changes
  useEffect(() => {
    setDynamicWidth(null);
  }, [calendar.width, currentCalendarType]);

  const effectiveWidth = dynamicWidth ?? calendar.width ?? defaultBaseWidth;
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
    const startPos = calendar.position || defaultPosition;

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
      onUpdateCalendar(calendar.id, { position: { x: finalX, y: finalY } });
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

    const minWidth = 240;
    const maxWidth = 850;

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
      onUpdateCalendar(calendar.id, { width: finalWidth });
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleSetPresetWidth = (size: 'sm' | 'md' | 'lg') => {
    let targetWidth: number;
    switch (currentCalendarType) {
      case 'split':
        targetWidth = size === 'sm' ? 330 : size === 'md' ? 420 : 560;
        break;
      case 'strip':
        targetWidth = size === 'sm' ? 310 : size === 'md' ? 390 : 520;
        break;
      case 'compact':
        targetWidth = size === 'sm' ? 250 : size === 'md' ? 310 : 420;
        break;
      case 'monthly':
      default:
        targetWidth = size === 'sm' ? 270 : size === 'md' ? 340 : 460;
        break;
    }
    setDynamicWidth(targetWidth);
    onUpdateCalendar(calendar.id, { width: targetWidth });
  };

  const handleNextStyle = () => {
    const nextIdx = (currentIndex + 1) % CALENDAR_STYLES.length;
    onUpdateCalendar(calendar.id, { type: CALENDAR_STYLES[nextIdx].id });
  };

  const handlePrevStyle = () => {
    const prevIdx = (currentIndex - 1 + CALENDAR_STYLES.length) % CALENDAR_STYLES.length;
    onUpdateCalendar(calendar.id, { type: CALENDAR_STYLES[prevIdx].id });
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleResetToday = () => {
    const now = new Date();
    setViewDate(now);
    setSelectedDate(now);
  };

  // Monthly Matrix Days Generator
  const monthData = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: { date: Date; dayNum: number; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean }[] = [];

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const date = new Date(year, month - 1, d);
      cells.push({
        date,
        dayNum: d,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
      const isSelected =
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();

      cells.push({
        date,
        dayNum: i,
        isCurrentMonth: true,
        isToday,
        isSelected,
      });
    }

    // Next month padding days to complete a multiple of 7
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      cells.push({
        date,
        dayNum: i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }

    return {
      year,
      monthName: MONTH_NAMES[month],
      cells,
    };
  }, [viewDate, today, selectedDate]);

  // Day of year and week number calculations for statistics
  const dayOfYear = useMemo(() => {
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }, [today]);

  const weekNumber = useMemo(() => {
    const d = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }, [today]);

  const yearProgressPercent = useMemo(() => {
    const isLeap = (today.getFullYear() % 4 === 0 && today.getFullYear() % 100 !== 0) || today.getFullYear() % 400 === 0;
    const totalDays = isLeap ? 366 : 365;
    return Math.round((dayOfYear / totalDays) * 100);
  }, [today, dayOfYear]);

  // Two-week glance for Compact Agenda
  const upcomingTwoWeeks = useMemo(() => {
    const days: { date: Date; dayName: string; dayNum: number; isToday: boolean; isWeekend: boolean }[] = [];
    for (let i = -1; i < 11; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const isToday = i === 0;
      const dayOfWeek = d.getDay();
      days.push({
        date: d,
        dayName: DAYS_OF_WEEK[dayOfWeek],
        dayNum: d.getDate(),
        isToday,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }
    return days;
  }, [today]);

  // Current week days for Week Horizon Strip
  const currentWeekDays = useMemo(() => {
    const curr = new Date(viewDate);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(curr.setDate(diff));

    const week: { date: Date; dayName: string; dayNum: number; isToday: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isToday =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
      week.push({
        date: d,
        dayName: DAYS_OF_WEEK_FULL[d.getDay()],
        dayNum: d.getDate(),
        isToday,
      });
    }
    return week;
  }, [viewDate, today]);

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
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px var(--theme-accent, rgba(34, 197, 94, 0.35))'
              : undefined,
          transition: isFreeDragging || isResizing ? 'none' : 'box-shadow 0.2s',
        }
      : {}),
  };

  return (
    <div
      style={cardStyle}
      onPointerDown={handlePointerDown}
      className={`shrink-0 flex flex-col rounded-3xl liquid-glass-card p-4 relative group select-none ${
        isFreeLayout ? 'cursor-grab active:cursor-grabbing' : ''
      } ${isFreeDragging ? 'ring-2 ring-[var(--theme-accent,#22c55e)] scale-[1.02]' : ''}`}
    >
      {/* Top Header Controls (Drag Handle, Style Switcher, S/M/L Presets, Today Jump, Delete) */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
        {/* Left: Drag grip & Calendar title */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <div className="cursor-grab p-1 hover:text-white transition-colors" title="Drag Calendar Widget">
            <GripHorizontal className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-bold text-slate-200 tracking-wider uppercase flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-[var(--theme-accent,#22c55e)]" />
            <span>Calendar</span>
          </span>
        </div>

        {/* Quick Size Presets: S / M / L */}
        <div className="flex items-center gap-0.5 bg-white/5 p-0.5 rounded-lg border border-white/10 no-drag text-[9px] font-bold">
          <button
            type="button"
            onClick={() => handleSetPresetWidth('sm')}
            className="px-1.5 py-0.5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Small Size"
          >
            S
          </button>
          <button
            type="button"
            onClick={() => handleSetPresetWidth('md')}
            className="px-1.5 py-0.5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Medium Size (Default)"
          >
            M
          </button>
          <button
            type="button"
            onClick={() => handleSetPresetWidth('lg')}
            className="px-1.5 py-0.5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Large Size"
          >
            L
          </button>
        </div>

        {/* Center: Style Switcher Carousel */}
        <div className="flex items-center gap-0.5 no-drag bg-white/5 px-1.5 py-0.5 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={handlePrevStyle}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Previous calendar style"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="relative no-drag">
            <button
              type="button"
              onClick={() => setStyleDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-semibold text-slate-200 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <span>{currentIndex + 1}/4</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {styleDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setStyleDropdownOpen(false)} />
                <div className="absolute left-0 top-full mt-1.5 w-60 rounded-2xl liquid-glass-modal p-1.5 shadow-2xl z-50 animate-fade-in text-xs space-y-1">
                  <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-white/10 flex items-center justify-between">
                    <span>Choose Calendar</span>
                    <Sparkles className="w-3 h-3 text-[var(--theme-accent,#22c55e)]" />
                  </div>
                  {CALENDAR_STYLES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        onUpdateCalendar(calendar.id, { type: st.id });
                        setStyleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                        currentCalendarType === st.id
                          ? 'bg-white/20 text-white font-semibold'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-sm">{st.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate leading-tight">{st.label}</p>
                        <p className="text-[9px] text-slate-400 truncate">{st.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleNextStyle}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Next calendar style"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Quick "Today" jump & Delete button */}
        <div className="flex items-center gap-1 no-drag">
          <button
            type="button"
            onClick={handleResetToday}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Jump to Today"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDeleteCalendar(calendar.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
            title="Remove calendar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MONTHLY MATRIX STYLE */}
      {/* ========================================================================= */}
      {currentCalendarType === 'monthly' && (
        <div className="space-y-3 no-drag">
          {/* Month & Navigation Bar */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-baseline gap-2">
              <h3
                style={{ fontSize: `${scale * 1.15}rem` }}
                className="font-extrabold text-white tracking-tight"
              >
                {monthData.monthName}
              </h3>
              <span
                style={{ fontSize: `${scale * 0.75}rem` }}
                className="font-semibold text-slate-400 font-mono"
              >
                {monthData.year}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                style={{ padding: `${scale * 6}px` }}
                className="rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                style={{ padding: `${scale * 6}px` }}
                className="rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {DAYS_OF_WEEK.map((d, i) => (
              <span
                key={d}
                style={{ fontSize: `${scale * 0.65}rem` }}
                className={`font-bold uppercase tracking-wider py-1 ${
                  i === 0 || i === 6 ? 'text-slate-400' : 'text-slate-300'
                }`}
              >
                {d}
              </span>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {monthData.cells.map((cell, idx) => {
              let cellClass = 'text-slate-400 opacity-30';
              if (cell.isCurrentMonth) {
                cellClass = 'text-slate-200 hover:bg-white/10 hover:text-white';
              }
              if (cell.isToday) {
                cellClass =
                  'bg-[var(--theme-accent,#22c55e)] text-black font-extrabold shadow-[0_0_15px_var(--theme-accent,rgba(34,197,94,0.6))] border border-white/60';
              } else if (cell.isSelected && cell.isCurrentMonth) {
                cellClass = 'bg-white/20 text-white font-bold border border-white/30';
              }

              const cellSize = Math.round(32 * scale);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedDate(cell.date);
                    if (!cell.isCurrentMonth) {
                      setViewDate(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
                    }
                  }}
                  style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    fontSize: `${scale * 0.75}rem`,
                  }}
                  className={`mx-auto rounded-xl flex items-center justify-center transition-all cursor-pointer ${cellClass}`}
                >
                  {cell.dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer Bar: Selected / Today stats */}
          <div
            style={{ fontSize: `${scale * 0.7}rem` }}
            className="pt-2 border-t border-white/10 flex items-center justify-between text-slate-300 px-1"
          >
            <span className="font-medium text-slate-300">
              Week {weekNumber} • Day {dayOfYear} of 365
            </span>
            <span className="font-semibold text-[var(--theme-accent,#22c55e)]">
              {yearProgressPercent}% Year Done
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. COMPACT AGENDA STYLE */}
      {/* ========================================================================= */}
      {currentCalendarType === 'compact' && (
        <div className="space-y-3 no-drag">
          {/* Big Date Hero Capsule */}
          <div
            style={{ padding: `${scale * 14}px` }}
            className="rounded-2xl liquid-glass flex items-center justify-between border border-white/10"
          >
            <div>
              <p
                style={{ fontSize: `${scale * 0.65}rem` }}
                className="font-bold uppercase tracking-widest text-[var(--theme-accent,#22c55e)]"
              >
                {today.toLocaleDateString('en-US', { weekday: 'long' })}
              </p>
              <h2
                style={{ fontSize: `${scale * 2.5}rem` }}
                className="font-extrabold text-white tracking-tighter leading-none mt-0.5"
              >
                {String(today.getDate()).padStart(2, '0')}
              </h2>
              <p
                style={{ fontSize: `${scale * 0.75}rem` }}
                className="font-semibold text-slate-300 tracking-wide mt-1"
              >
                {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="text-right space-y-1">
              <span
                style={{ fontSize: `${scale * 0.65}rem` }}
                className="inline-block px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-[var(--theme-accent,#22c55e)]/20 text-[var(--theme-accent,#22c55e)] border border-[var(--theme-accent,#22c55e)]/40 shadow-sm"
              >
                Today
              </span>
              <p
                style={{ fontSize: `${scale * 0.65}rem` }}
                className="font-mono text-slate-400"
              >
                Week {weekNumber}
              </p>
              <p
                style={{ fontSize: `${scale * 0.65}rem` }}
                className="font-mono text-slate-400"
              >
                Quarter Q{Math.floor(today.getMonth() / 3) + 1}
              </p>
            </div>
          </div>

          {/* Upcoming Days Horizon Chips */}
          <div>
            <p
              style={{ fontSize: `${scale * 0.65}rem` }}
              className="font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-0.5"
            >
              Two-Week Horizon
            </p>
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
              {upcomingTwoWeeks.map((d, i) => (
                <div
                  key={i}
                  style={{
                    minWidth: `${Math.round(scale * 34)}px`,
                    padding: `${Math.round(scale * 6)}px ${Math.round(scale * 4)}px`,
                  }}
                  className={`flex flex-col items-center justify-center rounded-xl text-center transition-all ${
                    d.isToday
                      ? 'bg-[var(--theme-accent,#22c55e)] text-black font-extrabold shadow-[0_0_12px_var(--theme-accent,#22c55e)]'
                      : d.isWeekend
                      ? 'bg-white/[0.03] text-slate-400 border border-white/5'
                      : 'liquid-glass text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span
                    style={{ fontSize: `${scale * 0.55}rem` }}
                    className="uppercase font-bold opacity-80"
                  >
                    {d.dayName}
                  </span>
                  <span
                    style={{ fontSize: `${scale * 0.75}rem` }}
                    className="font-bold leading-tight mt-0.5"
                  >
                    {d.dayNum}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. EDITORIAL SPLIT STYLE */}
      {/* ========================================================================= */}
      {currentCalendarType === 'split' && (
        <div className="grid grid-cols-12 gap-3 no-drag items-center">
          {/* Left Column: Bold Typographic Hero Date */}
          <div
            style={{ padding: `${scale * 12}px` }}
            className="col-span-5 flex flex-col justify-between h-full rounded-2xl bg-white/[0.04] border border-white/10"
          >
            <div>
              <span
                style={{ fontSize: `${scale * 0.6}rem` }}
                className="px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider bg-[var(--theme-accent,#22c55e)]/20 text-[var(--theme-accent,#22c55e)] inline-block mb-1"
              >
                {MONTH_NAMES[today.getMonth()]}
              </span>
              <h1
                style={{ fontSize: `${scale * 3.5}rem`, lineHeight: 1 }}
                className="font-black text-white tracking-tighter"
              >
                {String(today.getDate()).padStart(2, '0')}
              </h1>
              <p
                style={{ fontSize: `${scale * 0.75}rem` }}
                className="font-bold text-slate-200 uppercase tracking-widest mt-1"
              >
                {today.toLocaleDateString('en-US', { weekday: 'long' })}
              </p>
            </div>

            <div
              style={{ fontSize: `${scale * 0.65}rem` }}
              className="pt-2 border-t border-white/10 text-slate-400 space-y-0.5"
            >
              <p>{today.getFullYear()} • Q{Math.floor(today.getMonth() / 3) + 1}</p>
              <p className="font-mono text-[var(--theme-accent,#22c55e)]">Day {dayOfYear} of 365</p>
            </div>
          </div>

          {/* Right Column: Mini Monthly Calendar Matrix */}
          <div className="col-span-7 space-y-2">
            <div className="flex items-center justify-between">
              <span
                style={{ fontSize: `${scale * 0.75}rem` }}
                className="font-bold text-white tracking-tight"
              >
                {monthData.monthName} {monthData.year}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Days Header */}
            <div
              style={{ fontSize: `${scale * 0.55}rem` }}
              className="grid grid-cols-7 gap-0.5 text-center font-bold text-slate-400 uppercase"
            >
              {DAYS_OF_WEEK.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            {/* Mini Grid */}
            <div className="grid grid-cols-7 gap-0.5 text-center">
              {monthData.cells.slice(0, 35).map((cell, idx) => {
                let clr = 'text-slate-500 opacity-25';
                if (cell.isCurrentMonth) clr = 'text-slate-300';
                if (cell.isToday) {
                  clr = 'bg-[var(--theme-accent,#22c55e)] text-black font-extrabold rounded-md shadow-sm';
                }

                const miniCellSize = Math.round(20 * scale);

                return (
                  <span
                    key={idx}
                    style={{
                      width: `${miniCellSize}px`,
                      height: `${miniCellSize}px`,
                      fontSize: `${scale * 0.65}rem`,
                    }}
                    className={`mx-auto flex items-center justify-center rounded transition-all ${clr}`}
                  >
                    {cell.dayNum}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. WEEK HORIZON STRIP STYLE */}
      {/* ========================================================================= */}
      {currentCalendarType === 'strip' && (
        <div className="space-y-3 no-drag">
          {/* Header Row with Week Number & Navigation */}
          <div className="flex items-center justify-between px-1">
            <div>
              <p
                style={{ fontSize: `${scale * 0.65}rem` }}
                className="font-bold text-[var(--theme-accent,#22c55e)] uppercase tracking-wider"
              >
                Week {weekNumber}
              </p>
              <h3
                style={{ fontSize: `${scale * 0.9}rem` }}
                className="font-bold text-white tracking-tight"
              >
                {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
            </div>

            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => {
                  const d = new Date(viewDate);
                  d.setDate(d.getDate() - 7);
                  setViewDate(d);
                }}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Previous Week"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date(viewDate);
                  d.setDate(d.getDate() + 7);
                  setViewDate(d);
                }}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Next Week"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 7-Day Capsule Strip */}
          <div className="grid grid-cols-7 gap-1.5">
            {currentWeekDays.map((d, i) => (
              <div
                key={i}
                style={{
                  padding: `${Math.round(scale * 8)}px ${Math.round(scale * 4)}px`,
                }}
                className={`flex flex-col items-center justify-center rounded-2xl transition-all border ${
                  d.isToday
                    ? 'bg-[var(--theme-accent,#22c55e)] text-black border-white/60 font-black shadow-[0_0_15px_var(--theme-accent,rgba(34,197,94,0.6))]'
                    : 'liquid-glass text-slate-200 border-white/10 hover:border-white/25 hover:bg-white/10'
                }`}
              >
                <span
                  style={{ fontSize: `${scale * 0.55}rem` }}
                  className="uppercase font-bold tracking-wider opacity-75"
                >
                  {d.dayName}
                </span>
                <span
                  style={{ fontSize: `${scale * 0.9}rem` }}
                  className="font-extrabold leading-none mt-1"
                >
                  {d.dayNum}
                </span>
              </div>
            ))}
          </div>

          {/* Year Progress Bar */}
          <div className="pt-1.5 border-t border-white/10 space-y-1">
            <div
              style={{ fontSize: `${scale * 0.65}rem` }}
              className="flex items-center justify-between text-slate-400 font-medium"
            >
              <span>2026 Year Progress</span>
              <span className="text-slate-200 font-bold">{yearProgressPercent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--theme-accent,#22c55e)] shadow-[0_0_8px_var(--theme-accent,#22c55e)] transition-all duration-500"
                style={{ width: `${yearProgressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Interactive Bottom-Right Corner Resize Grip Handle */}
      <div
        onPointerDown={handleResizePointerDown}
        className="absolute bottom-1 right-1 w-5 h-5 cursor-nwse-resize text-slate-400 hover:text-[var(--theme-accent,#22c55e)] opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-all flex items-end justify-end p-0.5 select-none no-drag z-20"
        title="Click & drag to resize calendar"
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
