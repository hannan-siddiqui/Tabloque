import React, { useState, useRef } from 'react';
import { 
  X, 
  Palette, 
  EyeOff, 
  Cloud, 
  Download, 
  Upload,
  Shield, 
  CheckCircle2, 
  Check, 
  Sparkles,
  Type,
  Sliders,
  Image as ImageIcon,
  RotateCcw,
  Sun,
  Eye,
} from 'lucide-react';
import { 
  FirebaseConfig, 
  TabloqueState, 
  ThemeId, 
  TypographyConfig, 
  BorderConfig, 
  FontFamilyId, 
  FontSizeId, 
  FontWeightId, 
  TextTransformId, 
  LetterSpacingId, 
  BorderGlowId 
} from '../../types';
import { THEMES } from '../../theme/themes';
import { SyncStatus } from '../../hooks/useCloudSync';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  typography: TypographyConfig;
  onUpdateTypography: (updates: Partial<TypographyConfig>) => void;
  borderConfig: BorderConfig;
  onUpdateBorderConfig: (updates: Partial<BorderConfig>) => void;
  privacyMode: boolean;
  onTogglePrivacyMode: () => void;
  firebaseConfig: FirebaseConfig | null | undefined;
  onSaveFirebaseConfig: (config: FirebaseConfig | null) => void;
  syncStatus: SyncStatus;
  lastSyncTime: Date | null;
  onOpenImport: () => void;
  currentState: TabloqueState;
  onResetToDefault: () => void;
  onRestoreBackup?: (state: TabloqueState) => void;
  customThemeColor?: string | null;
  onSelectCustomThemeColor?: (color: string | null) => void;
  customBackgroundImage?: string | null;
  onSelectCustomBackgroundImage?: (image: string | null) => void;
  backgroundBlur?: number;
  onUpdateBackgroundBlur?: (blur: number) => void;
  backgroundBrightness?: number;
  onUpdateBackgroundBrightness?: (brightness: number) => void;
  cardGlassBlur?: number;
  onUpdateCardGlassBlur?: (blur: number) => void;
  cardGlassOpacity?: number;
  onUpdateCardGlassOpacity?: (opacity: number) => void;
  onOpenBackgroundCustomizer?: () => void;
}

const FONT_OPTIONS: { id: FontFamilyId; name: string; desc: string; sampleClass: string }[] = [
  { id: 'inter', name: 'Inter', desc: 'Modern, clean & balanced', sampleClass: 'font-inter' },
  { id: 'jakarta', name: 'Plus Jakarta', desc: 'Geometric tech & crisp', sampleClass: 'font-jakarta' },
  { id: 'outfit', name: 'Outfit', desc: 'Futuristic circular geometry', sampleClass: 'font-outfit' },
  { id: 'poppins', name: 'Poppins', desc: 'Bold, friendly & readable', sampleClass: 'font-poppins' },
  { id: 'space', name: 'Space Grotesk', desc: 'Cyberpunk monospace blend', sampleClass: 'font-space' },
  { id: 'mono', name: 'JetBrains Mono', desc: 'Developer & terminal code', sampleClass: 'font-mono' },
  { id: 'serif', name: 'Cinzel', desc: 'Classical luxury serif', sampleClass: 'font-serif' },
  { id: 'system', name: 'System Sans', desc: 'Apple SF / native system', sampleClass: 'font-system' },
];

const SIZE_OPTIONS: { id: FontSizeId; name: string; label: string }[] = [
  { id: 'small', name: 'Compact', label: '12px' },
  { id: 'medium', name: 'Standard', label: '14px' },
  { id: 'large', name: 'Spacious', label: '16px' },
  { id: 'xlarge', name: 'Extra Large', label: '18px' },
];

const WEIGHT_OPTIONS: { id: FontWeightId; label: string }[] = [
  { id: 'normal', label: 'Regular (400)' },
  { id: 'medium', label: 'Medium (500)' },
  { id: 'semibold', label: 'Semi-Bold (600)' },
  { id: 'bold', label: 'Bold (700)' },
];

const TRANSFORM_OPTIONS: { id: TextTransformId; label: string }[] = [
  { id: 'none', label: 'Default' },
  { id: 'capitalize', label: 'Title Case' },
  { id: 'uppercase', label: 'Uppercase' },
];

const TRACKING_OPTIONS: { id: LetterSpacingId; label: string }[] = [
  { id: 'tight', label: 'Tight (-0.02em)' },
  { id: 'normal', label: 'Normal' },
  { id: 'wide', label: 'Wide (+0.05em)' },
];

const COLOR_SWATCHES = [
  { value: '#ffffff', label: 'Pure White', bg: 'bg-white' },
  { value: '#f1f5f9', label: 'Frosted Ice', bg: 'bg-slate-100' },
  { value: '#fbbf24', label: 'Golden Amber', bg: 'bg-amber-400' },
  { value: '#38bdf8', label: 'Cyber Sky', bg: 'bg-sky-400' },
  { value: '#34d399', label: 'Emerald Mint', bg: 'bg-emerald-400' },
  { value: '#fb7185', label: 'Neon Rose', bg: 'bg-rose-400' },
  { value: '#c084fc', label: 'Amethyst Violet', bg: 'bg-purple-400' },
  { value: '#a3e635', label: 'Lime Glow', bg: 'bg-lime-400' },
];

const BORDER_OPTIONS: { id: BorderGlowId; name: string; desc: string }[] = [
  { id: 'subtle', name: 'Subtle Glass (1px)', desc: 'Clean, minimalist fine glass line with continuous contrast' },
  { id: 'luminous', name: 'Luminous Rim (1.5px)', desc: 'Double-rim refraction with specular liquid light reflections' },
  { id: 'bold', name: 'Bold Crystal (2px)', desc: 'High-contrast crystal refraction bevel edge for maximum visibility' },
  { id: 'accent', name: 'Theme Glow Rim', desc: 'Atmospheric halo that reflects your active theme accent color' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  typography,
  onUpdateTypography,
  borderConfig,
  onUpdateBorderConfig,
  privacyMode,
  onTogglePrivacyMode,
  firebaseConfig,
  onSaveFirebaseConfig,
  syncStatus,
  lastSyncTime,
  onOpenImport,
  currentState,
  onResetToDefault,
  onRestoreBackup,
  customThemeColor,
  onSelectCustomThemeColor,
  customBackgroundImage,
  onSelectCustomBackgroundImage,
  backgroundBlur = 0,
  onUpdateBackgroundBlur,
  backgroundBrightness = 100,
  onUpdateBackgroundBrightness,
  cardGlassBlur = 4,
  onUpdateCardGlassBlur,
  cardGlassOpacity = 25,
  onUpdateCardGlassOpacity,
  onOpenBackgroundCustomizer,
}) => {
  const [activeTab, setActiveTab] = useState<'theme' | 'typography' | 'borders' | 'privacy' | 'sync' | 'backup'>('theme');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Firebase form state
  const [apiKey, setApiKey] = useState(firebaseConfig?.apiKey || '');
  const [authDomain, setAuthDomain] = useState(firebaseConfig?.authDomain || '');
  const [projectId, setProjectId] = useState(firebaseConfig?.projectId || '');
  const [appId, setAppId] = useState(firebaseConfig?.appId || '');
  const [userId, setUserId] = useState(firebaseConfig?.userId || 'user_default');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          if (onRestoreBackup) {
            onRestoreBackup(parsed);
            alert('Backup successfully restored! Your workspaces, credentials, and notes are loaded.');
            onClose();
          }
        }
      } catch (err) {
        alert('Invalid JSON file. Please select a valid TabLoque backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  const handleSaveFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      onSaveFirebaseConfig(null);
    } else {
      onSaveFirebaseConfig({
        apiKey: apiKey.trim(),
        authDomain: authDomain.trim(),
        projectId: projectId.trim(),
        appId: appId.trim(),
        userId: userId.trim() || 'user_default',
      });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleDisconnectFirebase = () => {
    onSaveFirebaseConfig(null);
    setApiKey('');
    setAuthDomain('');
    setProjectId('');
    setAppId('');
    setUserId('');
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tabloque-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl rounded-3xl liquid-glass-modal shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[88vh]">
        
        {/* Left Sidebar Navigation inside Settings */}
        <div className="w-full md:w-56 bg-black/35 border-b md:border-b-0 md:border-r border-white/10 p-5 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl liquid-glass-pill flex items-center justify-center border border-white/20 overflow-hidden p-0.5 shadow-sm">
                <img src="/icons/TabLoque.png" alt="TabLoque Logo" className="w-full h-full object-contain rounded-lg" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Settings</h3>
                <p className="text-[11px] text-slate-400">Personalize TabLoque</p>
              </div>
            </div>

            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab('theme')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  activeTab === 'theme'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-[0_0_15px_rgba(34,197,94,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>Themes & Style</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('typography')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  activeTab === 'typography'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-[0_0_15px_rgba(34,197,94,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Type className="w-4 h-4" />
                <span>Fonts & Text</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('borders')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  activeTab === 'borders'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-[0_0_15px_rgba(34,197,94,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Glass & Borders</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('privacy')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  activeTab === 'privacy'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-[0_0_15px_rgba(34,197,94,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <EyeOff className="w-4 h-4" />
                <span>Privacy Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sync')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  activeTab === 'sync'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-[0_0_15px_rgba(34,197,94,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Cloud className="w-4 h-4" />
                <span>Cloud Sync</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('backup')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  activeTab === 'backup'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-[0_0_15px_rgba(34,197,94,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Backup & Import</span>
              </button>
            </nav>
          </div>

          <div className="pt-4 border-t border-white/10 text-[11px] text-slate-400 flex items-center gap-2">
            <img src="/icons/TabLoque.png" alt="TabLoque Logo" className="w-4 h-4 object-contain rounded" />
            <span>TabLoque Liquid Glass v1.0</span>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col justify-between">
          <div>
            {/* Top Close Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <h4 className="text-sm font-bold text-white capitalize">
                {activeTab === 'theme' && 'Themes & Ambient Wallpaper'}
                {activeTab === 'typography' && 'Typography, Fonts & Text Customization'}
                {activeTab === 'borders' && 'Liquid Glass & Border Edge Settings'}
                {activeTab === 'privacy' && 'Privacy & Screen Sharing'}
                {activeTab === 'sync' && 'Cloud Synchronization (Firebase)'}
                {activeTab === 'backup' && 'Data Import & Backups'}
              </h4>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TAB 1: THEMES */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                {/* Custom Color & Wallpaper Quick Bar */}
                <div className="p-4 rounded-2xl liquid-glass border border-white/15 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl shadow-md flex items-center justify-center border border-white/20"
                        style={{ backgroundColor: customThemeColor || 'var(--theme-accent, #22c55e)' }}
                      >
                        <Palette className="w-4 h-4 text-white drop-shadow" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">Custom Accent Color</h4>
                          {customThemeColor && (
                            <span className="text-[10px] font-mono font-bold bg-white/15 text-[var(--theme-accent,#22c55e)] px-2 py-0.5 rounded-full border border-white/20 uppercase">
                              Active: {customThemeColor}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Choose any custom color to override the predefined themes
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onOpenBackgroundCustomizer && (
                        <button
                          type="button"
                          onClick={onOpenBackgroundCustomizer}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/20 transition-all cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-[var(--theme-accent,#22c55e)]" />
                          <span>Custom Wallpaper</span>
                        </button>
                      )}

                      {customThemeColor && onSelectCustomThemeColor && (
                        <button
                          type="button"
                          onClick={() => onSelectCustomThemeColor(null)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-colors cursor-pointer"
                          title="Reset to predefined theme"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset Color</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Color Picker & Swatches */}
                  {onSelectCustomThemeColor && (
                    <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-white/10">
                      <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 hover:border-white/30 cursor-pointer transition-colors text-xs font-semibold text-slate-200">
                        <input
                          type="color"
                          value={customThemeColor || '#22c55e'}
                          onChange={(e) => onSelectCustomThemeColor(e.target.value)}
                          className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 outline-none"
                        />
                        <span>Pick Any Color</span>
                      </label>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {['#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#14b8a6', '#e2e8f0'].map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            onClick={() => onSelectCustomThemeColor(hex)}
                            className={`w-6 h-6 rounded-lg transition-transform hover:scale-110 cursor-pointer border ${
                              (customThemeColor || '').toLowerCase() === hex.toLowerCase()
                                ? 'ring-2 ring-white border-white scale-110'
                                : 'border-white/20'
                            }`}
                            style={{ backgroundColor: hex }}
                            title={hex}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-slate-300 font-semibold">
                    Or select from Predefined Themes & Ambient Silk Waves:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {(Object.keys(THEMES) as ThemeId[]).map((tId) => {
                      const t = THEMES[tId];
                      const isSelected = currentTheme === tId && !customThemeColor;

                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            onSelectTheme(t.id);
                            if (onSelectCustomThemeColor) onSelectCustomThemeColor(null);
                            if (customBackgroundImage && onSelectCustomBackgroundImage) {
                              onSelectCustomBackgroundImage(null);
                            }
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                            isSelected
                              ? 'border-emerald-400 bg-emerald-500/15 shadow-[0_0_20px_rgba(34,197,94,0.3)] ring-1 ring-emerald-400/50'
                              : 'border-white/10 liquid-glass hover:border-white/25 hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${t.previewColor} shadow-md flex items-center justify-center`}>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            {isSelected && (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/40">
                                Active
                              </span>
                            )}
                          </div>
                          <h5 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                            {t.name}
                          </h5>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {t.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Wallpaper Banner if active */}
                {customBackgroundImage && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-amber-400/25 bg-amber-500/10 text-xs text-amber-200">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                      <span>
                        Custom wallpaper is active and overriding theme waves.
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {onSelectCustomBackgroundImage && (
                        <button
                          type="button"
                          onClick={() => onSelectCustomBackgroundImage(null)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 font-semibold border border-amber-400/30 transition-colors cursor-pointer text-xs"
                        >
                          Switch to Silk Waves
                        </button>
                      )}
                      {onOpenBackgroundCustomizer && (
                        <button
                          type="button"
                          onClick={onOpenBackgroundCustomizer}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold border border-white/20 transition-colors cursor-pointer text-xs"
                        >
                          Edit Wallpaper
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Display & Glassmorphism Adjustments (Universal for all themes and wallpapers) */}
                <div className="p-4 rounded-2xl liquid-glass border border-white/15 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-white flex items-center gap-2">
                        <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Display, Brightness & Glass Adjustments</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Applies live across all themes & wallpapers
                      </p>
                    </div>
                    {(onUpdateBackgroundBrightness || onUpdateBackgroundBlur || onUpdateCardGlassBlur || onUpdateCardGlassOpacity) && (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateBackgroundBrightness?.(100);
                          onUpdateBackgroundBlur?.(0);
                          onUpdateCardGlassBlur?.(4);
                          onUpdateCardGlassOpacity?.(25);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] font-semibold transition-colors cursor-pointer"
                        title="Reset brightness, blur, and glass settings to defaults"
                      >
                        <RotateCcw className="w-3 h-3 text-emerald-400" />
                        <span>Reset Defaults</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Brightness / Dimming */}
                    {onUpdateBackgroundBrightness && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 flex items-center gap-1.5">
                            <Sun className="w-3 h-3 text-amber-400" />
                            Brightness (Dimming)
                          </span>
                          <span className="font-mono text-slate-400">{backgroundBrightness}%</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="100"
                          value={backgroundBrightness}
                          onChange={(e) => onUpdateBackgroundBrightness(Number(e.target.value))}
                          className="w-full accent-emerald-400 cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-500">
                          Adjust background brightness for both wallpapers and theme waves.
                        </p>
                      </div>
                    )}

                    {/* Background Blur */}
                    {onUpdateBackgroundBlur && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 flex items-center gap-1.5">
                            <Eye className="w-3 h-3 text-cyan-400" />
                            Background Blur
                          </span>
                          <span className="font-mono text-slate-400">{backgroundBlur}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="25"
                          value={backgroundBlur}
                          onChange={(e) => onUpdateBackgroundBlur(Number(e.target.value))}
                          className="w-full accent-emerald-400 cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-500">
                          Blurs background (wallpaper or theme waves) behind cards.
                        </p>
                      </div>
                    )}

                    {/* Card Glass Blur */}
                    {onUpdateCardGlassBlur && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            Card Glass Blur (See-Through)
                          </span>
                          <span className="font-mono text-emerald-400 font-bold">{cardGlassBlur}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={cardGlassBlur}
                          onChange={(e) => onUpdateCardGlassBlur(Number(e.target.value))}
                          className="w-full accent-emerald-400 cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-400">
                          Set to <strong className="text-emerald-300">0px</strong> for 100% sharp see-through cards!
                        </p>
                      </div>
                    )}

                    {/* Card Glass Opacity */}
                    {onUpdateCardGlassOpacity && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                            <Sliders className="w-3.5 h-3.5 text-purple-400" />
                            Card Glass Tint / Darkness
                          </span>
                          <span className="font-mono text-purple-300 font-bold">{cardGlassOpacity}%</span>
                        </div>
                        <input
                          type="range"
                          min="8"
                          max="70"
                          value={cardGlassOpacity}
                          onChange={(e) => onUpdateCardGlassOpacity(Number(e.target.value))}
                          className="w-full accent-purple-400 cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-400">
                          Lower value makes cards more transparent so background shows through.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TYPOGRAPHY, FONTS & TEXT CUSTOMIZATION */}
            {activeTab === 'typography' && (
              <div className="space-y-5">
                {/* Section 1: Font Family */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-emerald-400" />
                    Font Typeface
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Choose the font family applied across all board headers, bookmark cards, and menus.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {FONT_OPTIONS.map((f) => {
                      const isSelected = (typography?.fontFamily || 'inter') === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => onUpdateTypography({ fontFamily: f.id })}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${f.sampleClass} ${
                            isSelected
                              ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(34,197,94,0.25)]'
                              : 'border-white/10 liquid-glass text-slate-300 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold">{f.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5 truncate">{f.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Font Size & Weight */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Font Size */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200">Text Size</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {SIZE_OPTIONS.map((s) => {
                        const isSelected = (typography?.fontSize || 'medium') === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => onUpdateTypography({ fontSize: s.id })}
                            className={`py-2 px-1 rounded-xl text-center border transition-all cursor-pointer ${
                              isSelected
                                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(34,197,94,0.25)] font-bold'
                                : 'border-white/10 liquid-glass text-slate-400 hover:text-white'
                            }`}
                          >
                            <span className="block text-xs">{s.name}</span>
                            <span className="block text-[10px] text-slate-400">{s.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Font Weight */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200">Font Weight / Boldness</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {WEIGHT_OPTIONS.map((w) => {
                        const isSelected = (typography?.fontWeight || 'medium') === w.id;
                        return (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => onUpdateTypography({ fontWeight: w.id })}
                            className={`py-2 px-1 rounded-xl text-center border transition-all cursor-pointer ${
                              isSelected
                                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(34,197,94,0.25)] font-bold'
                                : 'border-white/10 liquid-glass text-slate-400 hover:text-white'
                            }`}
                          >
                            <span className="block text-[11px] font-medium">{w.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Section 3: Format & Spacing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Text Transform / Format */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200">Text Format / Case</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {TRANSFORM_OPTIONS.map((t) => {
                        const isSelected = (typography?.textTransform || 'none') === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => onUpdateTypography({ textTransform: t.id })}
                            className={`py-2 px-2 rounded-xl text-xs text-center border transition-all cursor-pointer ${
                              isSelected
                                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold'
                                : 'border-white/10 liquid-glass text-slate-400 hover:text-white'
                            }`}
                          >
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Letter Spacing */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200">Letter Spacing (Tracking)</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {TRACKING_OPTIONS.map((tr) => {
                        const isSelected = (typography?.letterSpacing || 'normal') === tr.id;
                        return (
                          <button
                            key={tr.id}
                            type="button"
                            onClick={() => onUpdateTypography({ letterSpacing: tr.id })}
                            className={`py-2 px-2 rounded-xl text-xs text-center border transition-all cursor-pointer ${
                              isSelected
                                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold'
                                : 'border-white/10 liquid-glass text-slate-400 hover:text-white'
                            }`}
                          >
                            {tr.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Section 4: Text Color */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">Text Color</label>
                    <span className="text-[11px] text-slate-400 font-mono">{typography?.textColor || '#ffffff'}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {/* Dynamic Theme Color Option */}
                    <button
                      type="button"
                      onClick={() => onUpdateTypography({ textColor: 'theme' })}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        typography?.textColor === 'theme'
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                          : 'border-white/10 liquid-glass text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Theme Accent Color</span>
                    </button>

                    {/* Color Swatches */}
                    {COLOR_SWATCHES.map((c) => {
                      const isSelected = typography?.textColor === c.value;
                      return (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => onUpdateTypography({ textColor: c.value })}
                          className={`w-7 h-7 rounded-xl ${c.bg} flex items-center justify-center transition-all cursor-pointer relative shadow-md ${
                            isSelected ? 'ring-2 ring-emerald-400 scale-110' : 'opacity-80 hover:opacity-100 hover:scale-105'
                          }`}
                          title={c.label}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-black" />}
                        </button>
                      );
                    })}

                    {/* Custom Hex / Color Input */}
                    <div className="flex items-center gap-1.5 ml-auto liquid-glass px-2.5 py-1 rounded-xl border border-white/10">
                      <input
                        type="color"
                        value={typography?.textColor && typography.textColor.startsWith('#') ? typography.textColor : '#ffffff'}
                        onChange={(e) => onUpdateTypography({ textColor: e.target.value })}
                        className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 outline-none"
                        title="Pick custom color"
                      />
                      <input
                        type="text"
                        value={typography?.textColor || '#ffffff'}
                        onChange={(e) => onUpdateTypography({ textColor: e.target.value })}
                        placeholder="#ffffff"
                        className="w-16 text-[11px] font-mono bg-transparent text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 5: Live Interactive Typography Preview */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Real-Time Typography Preview
                  </label>
                  <div className="p-4 rounded-2xl liquid-glass-card space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <h3 
                        className="board-header-title truncate"
                        style={{
                          fontFamily: typography.fontFamily === 'mono' ? 'JetBrains Mono' : typography.fontFamily === 'serif' ? 'Cinzel' : typography.fontFamily === 'space' ? 'Space Grotesk' : typography.fontFamily === 'outfit' ? 'Outfit' : typography.fontFamily === 'poppins' ? 'Poppins' : typography.fontFamily === 'jakarta' ? 'Plus Jakarta Sans' : 'Inter',
                          color: typography.textColor === 'theme' ? 'var(--theme-accent, #22c55e)' : typography.textColor,
                          fontWeight: typography.fontWeight === 'bold' ? 700 : typography.fontWeight === 'semibold' ? 600 : typography.fontWeight === 'medium' ? 500 : 400,
                          textTransform: typography.textTransform,
                          letterSpacing: typography.letterSpacing === 'tight' ? '-0.02em' : typography.letterSpacing === 'wide' ? '0.05em' : 'normal',
                          fontSize: typography.fontSize === 'small' ? '0.8125rem' : typography.fontSize === 'large' ? '1.0625rem' : typography.fontSize === 'xlarge' ? '1.25rem' : '0.875rem',
                        }}
                      >
                        Sample Board Title
                      </h3>
                      <span className="text-[10px] liquid-glass-pill px-2 py-0.5 rounded-full text-slate-300">
                        Live Preview
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl liquid-glass">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                        ⚡
                      </div>
                      <span 
                        className="bookmark-item-title truncate flex-1"
                        style={{
                          fontFamily: typography.fontFamily === 'mono' ? 'JetBrains Mono' : typography.fontFamily === 'serif' ? 'Cinzel' : typography.fontFamily === 'space' ? 'Space Grotesk' : typography.fontFamily === 'outfit' ? 'Outfit' : typography.fontFamily === 'poppins' ? 'Poppins' : typography.fontFamily === 'jakarta' ? 'Plus Jakarta Sans' : 'Inter',
                          color: typography.textColor === 'theme' ? 'var(--theme-accent, #22c55e)' : typography.textColor,
                          fontWeight: typography.fontWeight === 'bold' ? 700 : typography.fontWeight === 'semibold' ? 600 : typography.fontWeight === 'medium' ? 500 : 400,
                          textTransform: typography.textTransform,
                          letterSpacing: typography.letterSpacing === 'tight' ? '-0.02em' : typography.letterSpacing === 'wide' ? '0.05em' : 'normal',
                          fontSize: typography.fontSize === 'small' ? '0.75rem' : typography.fontSize === 'large' ? '1rem' : typography.fontSize === 'xlarge' ? '1.125rem' : '0.875rem',
                        }}
                      >
                        GitHub - Development Repositories
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BORDERS & LIQUID GLASS */}
            {activeTab === 'borders' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                    Liquid Glass Border Styling & Contrast
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Fix and customize the light rim edge visibility across cards, widgets, and dock.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {BORDER_OPTIONS.map((b) => {
                      const isSelected = (borderConfig?.style || 'luminous') === b.id;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => onUpdateBorderConfig({ style: b.id })}
                          className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                            isSelected
                              ? 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_20px_rgba(34,197,94,0.3)] ring-1 ring-emerald-400/50'
                              : 'border-white/10 liquid-glass hover:border-white/25 hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <h5 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                              {b.name}
                            </h5>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            {b.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-2xl liquid-glass flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      Theme Accent Rim Glow
                    </p>
                    <p className="text-xs text-slate-400">
                      When enabled, all cards and setting bars emit an ambient atmospheric specular halo matching your chosen wallpaper theme.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateBorderConfig({ accentGlow: !borderConfig?.accentGlow })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      borderConfig?.accentGlow
                        ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                        : 'liquid-glass-pill text-white hover:bg-white/20'
                    }`}
                  >
                    {borderConfig?.accentGlow ? 'ON (Glowing)' : 'OFF (Subtle)'}
                  </button>
                </div>

                <div className="rounded-2xl liquid-glass p-4 text-xs text-slate-300 space-y-1.5">
                  <p className="font-semibold text-emerald-300">Border Sharpness Guarantee:</p>
                  <p className="text-slate-400">
                    All board cards, watched widgets, setting docks, and dialogs now feature continuous 4-sided specular refraction edges so no borders disappear against dark wallpapers.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: PRIVACY MODE */}
            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl liquid-glass flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      Screen-Sharing Blur Filter
                    </p>
                    <p className="text-xs text-slate-400">
                      Instantly blurs all bookmark names and favicons to prevent confidential projects and links from leaking during calls or presentations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onTogglePrivacyMode}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      privacyMode
                        ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                        : 'liquid-glass-pill text-white hover:bg-white/20'
                    }`}
                  >
                    {privacyMode ? 'ON (Private)' : 'OFF (Visible)'}
                  </button>
                </div>

                <div className="rounded-2xl liquid-glass p-4 text-xs text-slate-300 space-y-1.5">
                  <p className="font-semibold text-emerald-300">Quick Tip:</p>
                  <p className="text-slate-400">
                    When Privacy Mode is ON, simply hover over any individual bookmark card to temporarily preview its title.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 5: CLOUD SYNC */}
            {activeTab === 'sync' && (
              <form onSubmit={handleSaveFirebase} className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">
                    Status:{' '}
                    <span className="font-bold capitalize text-emerald-400">
                      {syncStatus === 'disconnected' ? 'Offline Storage' : syncStatus}
                    </span>
                    {lastSyncTime && ` (${lastSyncTime.toLocaleTimeString()})`}
                  </span>
                  {firebaseConfig?.apiKey && (
                    <button
                      type="button"
                      onClick={handleDisconnectFirebase}
                      className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                    >
                      Disconnect Cloud
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">Project ID *</label>
                    <input
                      type="text"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      placeholder="my-tabloque-app"
                      className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-white placeholder-slate-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">API Key *</label>
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-white placeholder-slate-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">Auth Domain</label>
                    <input
                      type="text"
                      value={authDomain}
                      onChange={(e) => setAuthDomain(e.target.value)}
                      placeholder="app.firebaseapp.com"
                      className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-white placeholder-slate-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">App ID</label>
                    <input
                      type="text"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      placeholder="1:1234:web:abcd"
                      className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-white placeholder-slate-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-slate-300 font-medium">Sync Key / User Identifier</label>
                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="e.g. personal-macbook"
                      className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-white placeholder-slate-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {savedSuccess ? (
                    <span className="text-emerald-400 flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Settings Saved!
                    </span>
                  ) : <span />}

                  <button
                    type="submit"
                    className="px-4.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.35)] cursor-pointer"
                  >
                    Save Cloud Config
                  </button>
                </div>
              </form>
            )}

            {/* TAB 6: BACKUP & IMPORT */}
            {activeTab === 'backup' && (
              <div className="space-y-4 text-xs">
                {/* Import HTML */}
                <div className="p-4 rounded-2xl liquid-glass flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-bold text-white">Import Chrome Bookmarks</p>
                    <p className="text-slate-400">
                      Upload standard bookmarks.html exported from your browser to bulk-populate boards.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenImport();
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl shrink-0 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] cursor-pointer"
                  >
                    Import HTML
                  </button>
                </div>

                {/* Export Backup */}
                <div className="p-4 rounded-2xl liquid-glass flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-bold text-white">Export Local Backup</p>
                    <p className="text-slate-400">
                      Save a complete JSON snapshot of all your workspaces, boards, and links.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="px-4 py-2 liquid-glass-pill text-white font-semibold rounded-xl shrink-0 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON</span>
                  </button>
                </div>

                {/* Import Local Backup */}
                <div className="p-4 rounded-2xl liquid-glass flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-bold text-white">Import Local Backup (JSON)</p>
                    <p className="text-slate-400">
                      Restore a TabLoque backup file exported from another Chrome profile or computer.
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-[var(--theme-accent,#22c55e)]/20 hover:bg-[var(--theme-accent,#22c55e)]/30 text-[var(--theme-accent,#22c55e)] border border-[var(--theme-accent,#22c55e)]/40 font-bold rounded-xl shrink-0 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload JSON</span>
                  </button>
                </div>

                {/* Reset to Defaults */}
                <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-bold text-rose-300">Reset to Defaults</p>
                    <p className="text-slate-400">
                      Reset all pages and boards back to the default starter template.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Reset all workspaces, boards, and bookmarks to defaults?')) {
                        onResetToDefault();
                        onClose();
                      }
                    }}
                    className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold rounded-xl shrink-0 transition-all cursor-pointer"
                  >
                    Reset Defaults
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 mt-6 border-t border-white/10 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 liquid-glass-pill text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
