export interface Bookmark {
  id: string;
  title: string;
  url: string;
  faviconUrl?: string;
  description?: string;
  tags?: string[];
  createdAt: number;
}

export interface Board {
  id: string;
  title: string;
  color?: string; // e.g., 'indigo', 'emerald', 'amber', 'rose', 'sky', 'purple'
  bookmarkIds: string[];
  width?: number; // custom width in px
  height?: number; // custom max-height in px
  position?: { x: number; y: number }; // Freeform position coordinates on canvas
  createdAt: number;
}

export interface Page {
  id: string;
  title: string;
  icon?: string;
  boardIds: string[];
  watchIds?: string[];
  layout?: 'free' | 'grid' | 'kanban';
  createdAt: number;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  userId?: string;
}

export type ThemeId =
  | 'emerald'
  | 'obsidian'
  | 'cyberpunk'
  | 'oceanic'
  | 'sunset'
  | 'crimson'
  | 'sapphire'
  | 'rose'
  | 'amethyst'
  | 'aurora'
  | 'solar'
  | 'matcha'
  | 'synthwave'
  | 'matrix'
  | 'quantum'
  | 'plasma'
  | 'tokyo'
  | 'glacier'
  | 'nebula'
  | 'volcanic'
  | 'hologram'
  | 'phantom';

export type WatchType =
  | 'hybrid'
  | 'stacked'
  | 'roman'
  | 'hud';

export interface WatchWidget {
  id: string;
  pageId?: string;
  type: WatchType;
  title?: string;
  is24Hour?: boolean;
  showSeconds?: boolean;
  position?: { x: number; y: number };
  createdAt: number;
}

export type FontFamilyId =
  | 'inter'
  | 'jakarta'
  | 'outfit'
  | 'poppins'
  | 'space'
  | 'mono'
  | 'serif'
  | 'system';

export type FontSizeId = 'small' | 'medium' | 'large' | 'xlarge';
export type FontWeightId = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextTransformId = 'none' | 'capitalize' | 'uppercase';
export type LetterSpacingId = 'tight' | 'normal' | 'wide';

export interface TypographyConfig {
  fontFamily: FontFamilyId;
  fontSize: FontSizeId;
  fontWeight: FontWeightId;
  textTransform: TextTransformId;
  textColor: string; // '#ffffff', '#e2e8f0', 'theme', '#fbbf24', '#38bdf8', '#fb7185', or custom hex
  letterSpacing: LetterSpacingId;
}

export type BorderGlowId = 'subtle' | 'luminous' | 'bold' | 'accent';

export interface BorderConfig {
  style: BorderGlowId;
  accentGlow: boolean;
}

export type AppTabId = 'bookmarks' | 'auth' | 'notes';

export interface AuthItem {
  id: string;
  title: string;
  url: string;
  userId: string;
  password?: string;
  notes?: string;
  faviconUrl?: string;
  createdAt: number;
}

export interface AuthBoard {
  id: string;
  title: string;
  color?: string;
  authItemIds: string[];
  position?: { x: number; y: number };
  width?: number;
  height?: number;
  createdAt: number;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  color?: string;
  isPinned?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface NoteBoard {
  id: string;
  title: string;
  color?: string;
  noteItemIds: string[];
  position?: { x: number; y: number };
  width?: number;
  height?: number;
  createdAt: number;
}

export interface TabloqueState {
  activeTab?: AppTabId;
  pages: Record<string, Page>;
  boards: Record<string, Board>;
  bookmarks: Record<string, Bookmark>;
  pageOrder: string[];
  activePageId: string;
  privacyMode: boolean;
  theme?: ThemeId;
  typography?: TypographyConfig;
  borderConfig?: BorderConfig;
  watches?: Record<string, WatchWidget>;
  watchOrder?: string[];
  authBoards?: Record<string, AuthBoard>;
  authItems?: Record<string, AuthItem>;
  authBoardOrder?: string[];
  noteBoards?: Record<string, NoteBoard>;
  noteItems?: Record<string, NoteItem>;
  noteBoardOrder?: string[];
  firebaseConfig?: FirebaseConfig | null;
  lastSyncedAt?: number | null;
}

export type DndItemType = 'BOARD' | 'BOOKMARK';

export interface DragItemData {
  type: DndItemType;
  board?: Board;
  bookmark?: Bookmark;
  sourceBoardId?: string;
}
