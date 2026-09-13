export interface BoardColorConfig {
  id: string;
  label: string;
  dot: string;
  hex: string;
  rgb: string;
  topRgb: string;
  bgGlow: string;
  isDefault?: boolean;
  isCustom?: boolean;
}

export const BOARD_COLORS: Record<string, BoardColorConfig> = {
  indigo: {
    id: 'indigo',
    label: 'Indigo',
    dot: 'bg-indigo-500',
    hex: '#6366f1',
    rgb: '99, 102, 241',
    topRgb: '129, 140, 248',
    bgGlow: 'rgba(99, 102, 241, 0.25)',
  },
  emerald: {
    id: 'emerald',
    label: 'Emerald',
    dot: 'bg-emerald-500',
    hex: '#10b981',
    rgb: '16, 185, 129',
    topRgb: '52, 211, 153',
    bgGlow: 'rgba(16, 185, 129, 0.25)',
  },
  purple: {
    id: 'purple',
    label: 'Purple',
    dot: 'bg-purple-500',
    hex: '#a855f7',
    rgb: '168, 85, 247',
    topRgb: '192, 132, 252',
    bgGlow: 'rgba(168, 85, 247, 0.25)',
  },
  amber: {
    id: 'amber',
    label: 'Amber',
    dot: 'bg-amber-500',
    hex: '#f59e0b',
    rgb: '245, 158, 11',
    topRgb: '251, 191, 36',
    bgGlow: 'rgba(245, 158, 11, 0.25)',
  },
  rose: {
    id: 'rose',
    label: 'Rose',
    dot: 'bg-rose-500',
    hex: '#f43f5e',
    rgb: '244, 63, 94',
    topRgb: '251, 113, 133',
    bgGlow: 'rgba(244, 63, 94, 0.25)',
  },
  sky: {
    id: 'sky',
    label: 'Sky Blue',
    dot: 'bg-sky-500',
    hex: '#0ea5e9',
    rgb: '14, 165, 233',
    topRgb: '56, 189, 248',
    bgGlow: 'rgba(14, 165, 233, 0.25)',
  },
};

export const COLOR_OPTIONS = ['indigo', 'emerald', 'purple', 'amber', 'rose', 'sky'] as const;

export function hexToRgb(hex: string): { rgb: string; topRgb: string } | null {
  let cleanHex = hex.trim().replace(/^#/, '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  if (cleanHex.length !== 6) return null;
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return null;

  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  const topR = Math.min(255, Math.round(r + (255 - r) * 0.35));
  const topG = Math.min(255, Math.round(g + (255 - g) * 0.35));
  const topB = Math.min(255, Math.round(b + (255 - b) * 0.35));

  return {
    rgb: `${r}, ${g}, ${b}`,
    topRgb: `${topR}, ${topG}, ${topB}`,
  };
}

export function getBoardColorConfig(colorId?: string): BoardColorConfig {
  if (!colorId || colorId === 'default') {
    return {
      id: 'default',
      label: 'Theme Default',
      dot: 'bg-[var(--theme-accent,#22c55e)]',
      hex: 'var(--theme-accent, #22c55e)',
      rgb: '34, 197, 94',
      topRgb: '255, 255, 255',
      bgGlow: 'transparent',
      isDefault: true,
    };
  }

  if (colorId.startsWith('#')) {
    const converted = hexToRgb(colorId);
    if (converted) {
      return {
        id: colorId,
        label: 'Custom Color',
        dot: '',
        hex: colorId,
        rgb: converted.rgb,
        topRgb: converted.topRgb,
        bgGlow: `rgba(${converted.rgb}, 0.28)`,
        isCustom: true,
      };
    }
  }

  if (BOARD_COLORS[colorId]) {
    return BOARD_COLORS[colorId];
  }

  return {
    id: 'default',
    label: 'Theme Default',
    dot: 'bg-[var(--theme-accent,#22c55e)]',
    hex: 'var(--theme-accent, #22c55e)',
    rgb: '34, 197, 94',
    topRgb: '255, 255, 255',
    bgGlow: 'transparent',
    isDefault: true,
  };
}
