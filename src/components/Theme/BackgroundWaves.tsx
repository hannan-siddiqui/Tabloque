import React from 'react';
import { ThemeConfig } from '../../theme/themes';
import { BackgroundPatternId } from '../../types';

interface BackgroundWavesProps {
  theme: ThemeConfig;
  pattern?: BackgroundPatternId;
  customBackgroundImage?: string | null;
  backgroundBlur?: number;
  backgroundBrightness?: number;
}

export const BackgroundWaves: React.FC<BackgroundWavesProps> = ({
  theme,
  pattern = 'waves',
  customBackgroundImage,
  backgroundBlur = 0,
  backgroundBrightness = 100,
}) => {
  // Compute universal GPU-accelerated filters that work on both custom wallpaper and theme waves
  const filterParts: string[] = [];
  if (backgroundBlur > 0) {
    filterParts.push(`blur(${backgroundBlur}px)`);
  }
  if (backgroundBrightness !== 100) {
    filterParts.push(`brightness(${backgroundBrightness}%)`);
  }
  const filterStyle = filterParts.length > 0 ? filterParts.join(' ') : undefined;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Background Visual Layer (Custom Wallpaper or Theme Waves) with universal blur & brightness */}
      <div
        className="absolute inset-0 transition-all duration-300 pointer-events-none"
        style={{
          filter: filterStyle,
          transform: backgroundBlur > 0 ? 'scale(1.05)' : 'none',
        }}
      >
        {/* 1. Custom Background Image Mode */}
        {customBackgroundImage ? (
          <>
            {/* Deep dark canvas base */}
            <div className="absolute inset-0 bg-[#05080c]" />

            {/* User's custom wallpaper - clean, sharp, pure color fidelity */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-300 pointer-events-none"
              style={{
                backgroundImage: `url("${customBackgroundImage.replace(/"/g, '\\"')}")`,
              }}
            />
          </>
        ) : (
          /* 2. Default Dynamic Ambient Waves & Theme Glows Mode */
          <>
            {/* Base theme gradient */}
            <div className={`absolute inset-0 bg-gradient-to-b ${theme.bgGradient}`} />

            {/* Ambient radial glows */}
            <div
              className="absolute -top-[15%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[140px] opacity-35"
              style={{ backgroundColor: theme.accentColor }}
            />
            <div
              className="absolute top-[35%] -right-[15%] w-[65vw] h-[65vw] rounded-full blur-[160px] opacity-30"
              style={{ backgroundColor: theme.accentColor }}
            />
            <div
              className="absolute -bottom-[20%] left-[20%] w-[55vw] h-[55vw] rounded-full blur-[140px] opacity-25"
              style={{ backgroundColor: theme.accentColor }}
            />

            {/* Conditional Pattern Render in Selected Accent Color (or None for clean pure color) */}
            {pattern === 'waves' && (
              /* 1. Elegant flowing wave curves (silk ribbons) */
              <svg
                className="absolute inset-0 w-full h-full object-cover opacity-85 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1440 900"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={theme.accentColor} stopOpacity="0.0" />
                    <stop offset="50%" stopColor={theme.accentColor} stopOpacity="0.32" />
                    <stop offset="100%" stopColor={theme.accentColor} stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="waveGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={theme.accentColor} stopOpacity="0.0" />
                    <stop offset="40%" stopColor={theme.accentColor} stopOpacity="0.4" />
                    <stop offset="80%" stopColor={theme.accentColor} stopOpacity="0.1" />
                    <stop offset="100%" stopColor={theme.accentColor} stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="waveGrad3" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor={theme.accentColor} stopOpacity="0.0" />
                    <stop offset="30%" stopColor={theme.accentColor} stopOpacity="0.35" />
                    <stop offset="70%" stopColor={theme.accentColor} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={theme.accentColor} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <path
                  d="M-100,500 C300,300 600,700 1100,350 C1300,200 1500,450 1600,300"
                  fill="none"
                  stroke="url(#waveGrad1)"
                  strokeWidth="120"
                  strokeLinecap="round"
                />
                <path
                  d="M-80,480 C320,280 620,680 1120,330 C1320,180 1520,430 1620,280"
                  fill="none"
                  stroke="url(#waveGrad2)"
                  strokeWidth="60"
                  strokeLinecap="round"
                />
                <path
                  d="M-60,460 C340,260 640,660 1140,310 C1340,160 1540,410 1640,260"
                  fill="none"
                  stroke="url(#waveGrad3)"
                  strokeWidth="30"
                  strokeLinecap="round"
                />

                <path
                  d="M-50,700 C400,550 800,850 1200,600 C1400,500 1550,650 1650,550"
                  fill="none"
                  stroke="url(#waveGrad1)"
                  strokeWidth="80"
                  strokeLinecap="round"
                />
                <path
                  d="M-30,680 C420,530 820,830 1220,580 C1420,480 1570,630 1670,530"
                  fill="none"
                  stroke="url(#waveGrad2)"
                  strokeWidth="40"
                  strokeLinecap="round"
                />

                <path
                  d="M-100,200 C350,50 750,350 1150,150 C1350,50 1500,180 1600,100"
                  fill="none"
                  stroke="url(#waveGrad3)"
                  strokeWidth="50"
                  strokeLinecap="round"
                />
              </svg>
            )}

            {pattern === 'grid' && (
              /* 2. Cyber Grid in Selected Accent Color */
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
                <defs>
                  <pattern id="bg-pattern-grid" width="44" height="44" patternUnits="userSpaceOnUse">
                    <path
                      d="M 44 0 L 0 0 0 44"
                      fill="none"
                      stroke={theme.accentColor}
                      strokeWidth="1.2"
                      strokeOpacity="0.38"
                    />
                  </pattern>
                  <radialGradient id="patternVignetteGrid" cx="50%" cy="50%" r="75%">
                    <stop offset="0%" stopColor="#000" stopOpacity="0" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
                  </radialGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#bg-pattern-grid)" />
                <rect width="100%" height="100%" fill="url(#patternVignetteGrid)" />
              </svg>
            )}

            {pattern === 'dots' && (
              /* 3. Dot Matrix in Selected Accent Color */
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-55">
                <defs>
                  <pattern id="bg-pattern-dots" width="28" height="28" patternUnits="userSpaceOnUse">
                    <circle cx="3" cy="3" r="1.6" fill={theme.accentColor} fillOpacity="0.5" />
                  </pattern>
                  <radialGradient id="patternVignetteDots" cx="50%" cy="50%" r="75%">
                    <stop offset="0%" stopColor="#000" stopOpacity="0" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
                  </radialGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#bg-pattern-dots)" />
                <rect width="100%" height="100%" fill="url(#patternVignetteDots)" />
              </svg>
            )}

            {pattern === 'hexagons' && (
              /* 4. Hex Honeycomb in Selected Accent Color */
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-45">
                <defs>
                  <pattern id="bg-pattern-hex" width="56" height="96" patternUnits="userSpaceOnUse">
                    <path
                      d="M28 0 L56 16 L56 48 L28 64 L0 48 L0 16 Z M28 64 L56 80 L56 112 L28 128 L0 112 L0 80 Z"
                      fill="none"
                      stroke={theme.accentColor}
                      strokeWidth="1.2"
                      strokeOpacity="0.38"
                    />
                  </pattern>
                  <radialGradient id="patternVignetteHex" cx="50%" cy="50%" r="75%">
                    <stop offset="0%" stopColor="#000" stopOpacity="0" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
                  </radialGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#bg-pattern-hex)" />
                <rect width="100%" height="100%" fill="url(#patternVignetteHex)" />
              </svg>
            )}

            {pattern === 'mesh' && (
              /* 5. Isometric Mesh in Selected Accent Color */
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-45">
                <defs>
                  <pattern id="bg-pattern-mesh" width="48" height="48" patternUnits="userSpaceOnUse">
                    <path
                      d="M0 24 L24 0 L48 24 L24 48 Z"
                      fill="none"
                      stroke={theme.accentColor}
                      strokeWidth="1.2"
                      strokeOpacity="0.36"
                    />
                    <path
                      d="M24 0 L24 48 M0 24 L48 24"
                      fill="none"
                      stroke={theme.accentColor}
                      strokeWidth="0.6"
                      strokeOpacity="0.22"
                      strokeDasharray="2,3"
                    />
                  </pattern>
                  <radialGradient id="patternVignetteMesh" cx="50%" cy="50%" r="75%">
                    <stop offset="0%" stopColor="#000" stopOpacity="0" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
                  </radialGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#bg-pattern-mesh)" />
                <rect width="100%" height="100%" fill="url(#patternVignetteMesh)" />
              </svg>
            )}

            {pattern === 'circuit' && (
              /* 6. Circuit Traces in Selected Accent Color */
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-45">
                <defs>
                  <pattern id="bg-pattern-circuit" width="80" height="80" patternUnits="userSpaceOnUse">
                    <path
                      d="M10 10 L30 10 L30 30 L50 30 M10 50 L30 50 L50 70 L70 70 M70 10 L70 30 L50 50"
                      fill="none"
                      stroke={theme.accentColor}
                      strokeWidth="1.3"
                      strokeOpacity="0.38"
                    />
                    <circle cx="10" cy="10" r="2.5" fill={theme.accentColor} fillOpacity="0.65" />
                    <circle cx="50" cy="30" r="2.5" fill={theme.accentColor} fillOpacity="0.65" />
                    <circle cx="70" cy="70" r="2.5" fill={theme.accentColor} fillOpacity="0.65" />
                    <circle cx="70" cy="10" r="2.5" fill={theme.accentColor} fillOpacity="0.65" />
                  </pattern>
                  <radialGradient id="patternVignetteCircuit" cx="50%" cy="50%" r="75%">
                    <stop offset="0%" stopColor="#000" stopOpacity="0" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
                  </radialGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#bg-pattern-circuit)" />
                <rect width="100%" height="100%" fill="url(#patternVignetteCircuit)" />
              </svg>
            )}

            {pattern === 'stripes' && (
              /* 7. Diagonal Lines in Selected Accent Color */
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                <defs>
                  <pattern id="bg-pattern-stripes" width="36" height="36" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="36" stroke={theme.accentColor} strokeWidth="1.6" strokeOpacity="0.38" />
                  </pattern>
                  <radialGradient id="patternVignetteStripes" cx="50%" cy="50%" r="75%">
                    <stop offset="0%" stopColor="#000" stopOpacity="0" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
                  </radialGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#bg-pattern-stripes)" />
                <rect width="100%" height="100%" fill="url(#patternVignetteStripes)" />
              </svg>
            )}

            {/* When pattern === 'none', no pattern or wave SVG is rendered! Clean pure color background */}
          </>
        )}
      </div>
    </div>
  );
};
