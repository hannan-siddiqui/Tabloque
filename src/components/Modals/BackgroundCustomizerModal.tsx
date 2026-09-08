import React, { useState, useRef } from 'react';
import {
  X,
  Image as ImageIcon,
  Palette,
  Upload,
  Link,
  Trash2,
  Check,
  RotateCcw,
  Sliders,
  Sparkles,
  Sun,
  Eye,
} from 'lucide-react';
import { ThemeConfig, THEMES, ThemeId } from '../../theme/themes';

interface BackgroundCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
  currentThemeId?: ThemeId;
  onSelectTheme?: (themeId: ThemeId) => void;
  customThemeColor?: string | null;
  onSelectCustomThemeColor: (color: string | null) => void;
  customBackgroundImage?: string | null;
  onSelectCustomBackgroundImage: (image: string | null) => void;
  backgroundBlur?: number;
  onUpdateBackgroundBlur: (blur: number) => void;
  backgroundBrightness?: number;
  onUpdateBackgroundBrightness: (brightness: number) => void;
  cardGlassBlur?: number;
  onUpdateCardGlassBlur?: (blur: number) => void;
  cardGlassOpacity?: number;
  onUpdateCardGlassOpacity?: (opacity: number) => void;
  onToast?: (msg: string) => void;
}

const WALLPAPER_PRESETS = [
  {
    id: 'cyber-city',
    title: 'Cyber Metropolis',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1920&auto=format&fit=crop',
    preview: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=320&auto=format&fit=crop',
  },
  {
    id: 'nebula-space',
    title: 'Deep Cosmic Nebula',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1920&auto=format&fit=crop',
    preview: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=320&auto=format&fit=crop',
  },
  {
    id: 'dark-peaks',
    title: 'Atmospheric Peaks',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1920&auto=format&fit=crop',
    preview: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=320&auto=format&fit=crop',
  },
  {
    id: 'neon-waves',
    title: 'Neon Abstract Flow',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1920&auto=format&fit=crop',
    preview: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=320&auto=format&fit=crop',
  },
  {
    id: 'misty-forest',
    title: 'Moody Misty Forest',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1920&auto=format&fit=crop',
    preview: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=320&auto=format&fit=crop',
  },
  {
    id: 'sunset-horizon',
    title: 'Solar Twilight',
    url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?q=80&w=1920&auto=format&fit=crop',
    preview: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?q=80&w=320&auto=format&fit=crop',
  },
];

const COLOR_SWATCHES = [
  { name: 'Neon Emerald', hex: '#22c55e' },
  { name: 'Cyber Cyan', hex: '#06b6d4' },
  { name: 'Electric Blue', hex: '#3b82f6' },
  { name: 'Royal Indigo', hex: '#6366f1' },
  { name: 'Violet Glow', hex: '#8b5cf6' },
  { name: 'Hot Magenta', hex: '#ec4899' },
  { name: 'Ruby Crimson', hex: '#ef4444' },
  { name: 'Sunset Orange', hex: '#f97316' },
  { name: 'Amber Gold', hex: '#f59e0b' },
  { name: 'Lime Citrus', hex: '#84cc16' },
  { name: 'Teal Aurora', hex: '#14b8a6' },
  { name: 'Pure Platinum', hex: '#e2e8f0' },
];

export const BackgroundCustomizerModal: React.FC<BackgroundCustomizerModalProps> = ({
  isOpen,
  onClose,
  theme,
  currentThemeId,
  onSelectTheme,
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
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'wallpaper' | 'theme' | 'color'>('wallpaper');
  const [urlInput, setUrlInput] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom color local picker
  const [pickerColor, setPickerColor] = useState(customThemeColor || theme.accentColor || '#22c55e');

  if (!isOpen) return null;

  // Process uploaded image file with canvas optimization & bulletproof fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WebP, etc.)');
      return;
    }

    setIsProcessingImage(true);

    const finishWithDataUrl = (dataUrl: string) => {
      onSelectCustomBackgroundImage(dataUrl);
      setIsProcessingImage(false);
      onToast?.('Custom wallpaper applied!');
    };

    const blobUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        // Optimize to max 1920x1080 to ensure crisp desktop display while keeping storage quota light
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          URL.revokeObjectURL(blobUrl);
          finishWithDataUrl(compressedDataUrl);
          return;
        }
      } catch (err) {
        console.warn('Canvas optimization encountered error, using direct reader fallback:', err);
      }

      // Fallback: direct FileReader
      const reader = new FileReader();
      reader.onload = (evt) => {
        URL.revokeObjectURL(blobUrl);
        finishWithDataUrl(evt.target?.result as string);
      };
      reader.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        setIsProcessingImage(false);
        alert('Could not read image file.');
      };
      reader.readAsDataURL(file);
    };

    img.onerror = () => {
      // Fallback: direct FileReader if Image() decoding fails
      const reader = new FileReader();
      reader.onload = (evt) => {
        URL.revokeObjectURL(blobUrl);
        finishWithDataUrl(evt.target?.result as string);
      };
      reader.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        setIsProcessingImage(false);
        alert('Could not decode image file.');
      };
      reader.readAsDataURL(file);
    };

    img.src = blobUrl;
    e.target.value = '';
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onSelectCustomBackgroundImage(urlInput.trim());
    setUrlInput('');
    onToast?.('Wallpaper URL applied!');
  };

  const handleApplyColor = (colorHex: string) => {
    setPickerColor(colorHex);
    onSelectCustomThemeColor(colorHex);
    onToast?.(`Custom theme color applied (${colorHex})`);
  };

  const handleResetColor = () => {
    onSelectCustomThemeColor(null);
    setPickerColor(theme.accentColor || '#22c55e');
    onToast?.('Reset to predefined theme!');
  };

  const handleRemoveWallpaper = () => {
    onSelectCustomBackgroundImage(null);
    onToast?.('Wallpaper removed; restored silk waves.');
  };

  const handleResetAdjustments = () => {
    onUpdateBackgroundBrightness(100);
    onUpdateBackgroundBlur(0);
    onUpdateCardGlassBlur?.(4);
    onUpdateCardGlassOpacity?.(25);
    onToast?.('Adjustments reset to default settings!');
  };

  const renderAdjustmentsSection = () => (
    <div className="p-4 rounded-2xl liquid-glass border border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-[var(--theme-accent,#22c55e)]" />
            <span>Display, Brightness & Glass Adjustments</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
            Applies live across all themes & wallpapers
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetAdjustments}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] font-semibold transition-colors cursor-pointer"
          title="Reset brightness, blur, and glass settings to defaults"
        >
          <RotateCcw className="w-3 h-3 text-[var(--theme-accent,#22c55e)]" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Brightness / Dimming */}
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
            className="w-full accent-[var(--theme-accent,#22c55e)] cursor-pointer"
          />
          <p className="text-[10px] text-slate-500">
            Adjust background brightness for both wallpapers and theme waves.
          </p>
        </div>

        {/* Blur */}
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
            className="w-full accent-[var(--theme-accent,#22c55e)] cursor-pointer"
          />
          <p className="text-[10px] text-slate-500">
            Blurs background (wallpaper or theme waves) behind cards.
          </p>
        </div>

        {/* Card Glass Blur (Transparency/Clarity) */}
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

        {/* Card Glass Opacity (Tint) */}
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
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl liquid-glass-modal shadow-2xl border border-white/20 z-10 text-slate-100 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--theme-accent,#22c55e)]/20 border border-[var(--theme-accent,#22c55e)]/40 flex items-center justify-center text-[var(--theme-accent,#22c55e)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Wallpaper & Theme Customizer
              </h2>
              <p className="text-[11px] text-slate-400">
                Personalize wallpapers, silk wave themes, and card glassmorphism
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-white/10 shrink-0 bg-black/10 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('wallpaper')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              activeTab === 'wallpaper'
                ? 'bg-white/15 text-white shadow-lg border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-[var(--theme-accent,#22c55e)]" />
            <span>Custom Wallpaper</span>
            {customBackgroundImage && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-accent,#22c55e)]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              activeTab === 'theme'
                ? 'bg-white/15 text-white shadow-lg border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--theme-accent,#22c55e)]" />
            <span>Theme Presets</span>
            {!customBackgroundImage && !customThemeColor && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-accent,#22c55e)]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('color')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              activeTab === 'color'
                ? 'bg-white/15 text-white shadow-lg border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-[var(--theme-accent,#22c55e)]" />
            <span>Custom Accent Color</span>
            {customThemeColor && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-accent,#22c55e)]" />
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {activeTab === 'wallpaper' && (
            /* TAB 1: WALLPAPER */
            <div className="space-y-6">
              {/* Current Active Wallpaper Status & Controls */}
              {customBackgroundImage ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={customBackgroundImage}
                      alt="Current wallpaper preview"
                      className="w-16 h-12 object-cover rounded-xl border border-white/15 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Custom Wallpaper Active</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                          Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Adjust brightness & blur below or remove to restore waves
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveWallpaper}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Wallpaper</span>
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] text-xs text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--theme-accent,#22c55e)] shrink-0" />
                  <span>
                    Currently using the default animated silk waves. Choose an image below to set your custom wallpaper!
                  </span>
                </div>
              )}

              {/* Upload from device or URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* File Upload Option */}
                <div className="p-4 rounded-2xl liquid-glass border border-white/10 flex flex-col justify-between space-y-3">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[var(--theme-accent,#22c55e)]" />
                    <h3 className="text-xs font-bold text-white">Upload from Device</h3>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Select any photo or wallpaper (PNG, JPEG, WebP) from your computer.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isProcessingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingImage ? (
                      <span>Optimizing image...</span>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose Image File</span>
                      </>
                    )}
                  </button>
                </div>

                {/* URL Option */}
                <form
                  onSubmit={handleApplyUrl}
                  className="p-4 rounded-2xl liquid-glass border border-white/10 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-[var(--theme-accent,#22c55e)]" />
                    <h3 className="text-xs font-bold text-white">Image URL Link</h3>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Paste any direct image URL link from the web (Unsplash, etc.).
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="flex-1 text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 outline-none focus:border-[var(--theme-accent,#22c55e)]"
                    />
                    <button
                      type="submit"
                      disabled={!urlInput.trim()}
                      className="px-3 py-2 rounded-xl bg-[var(--theme-accent,#22c55e)] hover:brightness-110 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                </form>
              </div>

              {/* Curated Aesthetic Presets */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--theme-accent,#22c55e)]" />
                  <span>Curated Aesthetic Wallpapers</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {WALLPAPER_PRESETS.map((preset) => {
                    const isSelected = customBackgroundImage === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          onSelectCustomBackgroundImage(preset.url);
                          onToast?.(`Applied ${preset.title}!`);
                        }}
                        className={`group relative rounded-2xl overflow-hidden border text-left transition-all h-24 cursor-pointer ${
                          isSelected
                            ? 'border-[var(--theme-accent,#22c55e)] ring-2 ring-[var(--theme-accent,#22c55e)]/40 shadow-lg'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <img
                          src={preset.preview}
                          alt={preset.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2.5 flex flex-col justify-end">
                          <span className="text-[11px] font-bold text-white leading-tight drop-shadow">
                            {preset.title}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--theme-accent,#22c55e)] text-black flex items-center justify-center shadow">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Adjustments: Universal for all themes and wallpapers */}
              {renderAdjustmentsSection()}
            </div>
          )}

          {/* TAB 2: THEME PRESETS */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              {/* Wallpaper active banner if applicable */}
              {customBackgroundImage ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-amber-400/25 bg-amber-500/10 text-xs text-amber-200">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>
                      Custom wallpaper is active. Selecting any theme below will restore animated silk waves for that theme.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCustomBackgroundImage(null);
                      onToast?.('Restored silk waves for theme!');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 font-semibold border border-amber-400/30 transition-colors cursor-pointer shrink-0 text-xs"
                  >
                    Restore Silk Waves
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] text-xs text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--theme-accent,#22c55e)] shrink-0" />
                  <span>
                    Select any theme preset below to update accent colors, flowing wave ribbons, and ambient backdrops.
                  </span>
                </div>
              )}

              {/* Theme Presets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(THEMES) as ThemeId[]).map((tId) => {
                  const t = THEMES[tId];
                  const isSelected = (currentThemeId === tId || theme.id === tId) && !customThemeColor && !customBackgroundImage;

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        if (onSelectTheme) onSelectTheme(t.id);
                        onSelectCustomThemeColor(null);
                        if (customBackgroundImage) {
                          onSelectCustomBackgroundImage(null);
                        }
                        onToast?.(`Applied ${t.name} theme!`);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                        isSelected
                          ? 'border-[var(--theme-accent,#22c55e)] bg-[var(--theme-accent,#22c55e)]/15 shadow-[0_0_20px_rgba(34,197,94,0.3)] ring-1 ring-[var(--theme-accent,#22c55e)]/50'
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
                      <h5 className="text-xs font-bold text-white group-hover:text-[var(--theme-accent,#22c55e)] transition-colors">
                        {t.name}
                      </h5>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {t.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Universal Adjustments Section */}
              {renderAdjustmentsSection()}
            </div>
          )}

          {/* TAB 3: CUSTOM COLOR */}
          {activeTab === 'color' && (
            <div className="space-y-6">
              {/* Active Color Info & Reset */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl liquid-glass border border-white/10">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl shadow-lg flex items-center justify-center border border-white/30"
                    style={{ backgroundColor: pickerColor }}
                  >
                    <Palette className="w-5 h-5 text-white drop-shadow" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Active Accent Color</span>
                      <span className="text-xs font-mono font-bold text-[var(--theme-accent,#22c55e)] uppercase">
                        {pickerColor}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Applied to silk waves, glowing borders, tabs, icons, and buttons
                    </p>
                  </div>
                </div>

                {customThemeColor && (
                  <button
                    type="button"
                    onClick={handleResetColor}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/15 transition-colors cursor-pointer shrink-0"
                    title="Revert to predefined theme default"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Theme</span>
                  </button>
                )}
              </div>

              {/* Native Color Picker & Hex Input */}
              <div className="p-5 rounded-2xl liquid-glass border border-white/10 space-y-4">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[var(--theme-accent,#22c55e)]" />
                  <span>Choose Any Color (Color Picker & Hex)</span>
                </h3>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Interactive Color Box */}
                  <label className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/15 hover:border-white/30 cursor-pointer transition-colors">
                    <input
                      type="color"
                      value={pickerColor}
                      onChange={(e) => handleApplyColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 outline-none"
                    />
                    <span className="text-xs font-semibold text-slate-200">
                      Click to Open Palette
                    </span>
                  </label>

                  {/* Hex input */}
                  <div className="flex items-center gap-2 bg-white/5 border border-white/15 rounded-2xl px-3.5 py-2">
                    <span className="text-xs font-mono text-slate-400">#</span>
                    <input
                      type="text"
                      maxLength={7}
                      value={pickerColor.replace('#', '')}
                      onChange={(e) => {
                        const val = '#' + e.target.value.replace(/[^0-9A-Fa-f]/g, '');
                        setPickerColor(val);
                        if (val.length === 7) {
                          handleApplyColor(val);
                        }
                      }}
                      className="w-24 text-xs font-mono font-bold text-white bg-transparent outline-none uppercase"
                      placeholder="22C55E"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyColor(pickerColor)}
                    className="px-4 py-2.5 rounded-2xl bg-[var(--theme-accent,#22c55e)] hover:brightness-110 text-white text-xs font-bold transition-all shadow-lg cursor-pointer"
                  >
                    Apply Color
                  </button>
                </div>
              </div>

              {/* Preset Color Swatches */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300">
                  Quick Vibrant Neon & Velvet Swatches
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {COLOR_SWATCHES.map((swatch) => {
                    const isSelected = pickerColor.toLowerCase() === swatch.hex.toLowerCase();
                    return (
                      <button
                        key={swatch.hex}
                        type="button"
                        onClick={() => handleApplyColor(swatch.hex)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-white bg-white/15 shadow-md ring-1 ring-white/40'
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-lg shadow shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: swatch.hex }}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white drop-shadow" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white truncate leading-tight">
                            {swatch.name}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400 uppercase leading-none mt-0.5">
                            {swatch.hex}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Adjustments: Universal for all themes and wallpapers */}
              {renderAdjustmentsSection()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between bg-black/20 shrink-0">
          <span>Changes are saved automatically & synced with your theme</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
