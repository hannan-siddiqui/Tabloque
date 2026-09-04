import React from 'react';
import { ThemeConfig } from '../../theme/themes';

interface BackgroundWavesProps {
  theme: ThemeConfig;
}

export const BackgroundWaves: React.FC<BackgroundWavesProps> = ({ theme }) => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
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

      {/* Elegant flowing wave curves (silk ribbons) matching reference image */}
      <svg
        className="absolute inset-0 w-full h-full object-cover opacity-85"
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

        {/* Layered bezier ribbon waves */}
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
    </div>
  );
};
