import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

interface FaviconProps {
  url: string;
  title?: string;
  customIcon?: string;
  className?: string;
  size?: number;
}

/**
 * Curated brand vector logos for major web apps where subdomains
 * often collide with generic parent icons or CDN placeholders.
 */
function getKnownBrandSvg(url: string, title?: string, className = 'w-5 h-5'): React.ReactNode | null {
  const normUrl = url.toLowerCase();
  const normTitle = (title || '').toLowerCase().trim();

  // 1. WhatsApp
  if (normUrl.includes('whatsapp') || normTitle.includes('whatsapp')) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="#25D366">
        <path d="M12.004 2c-5.523 0-10 4.477-10 10 0 1.77.462 3.497 1.338 5.023L2 22l5.127-1.344A9.957 9.957 0 0 0 12.004 22c5.523 0 10-4.477 10-10s-4.477-10-10-10zm0 18.232c-1.543 0-3.048-.415-4.364-1.2l-.313-.186-3.242.85.865-3.16-.204-.325A8.19 8.19 0 0 1 3.8 12c0-4.524 3.68-8.204 8.204-8.204 4.524 0 8.204 3.68 8.204 8.204 0 4.524-3.68 8.232-8.204 8.232zm4.51-6.16c-.247-.123-1.464-.722-1.69-.805-.227-.082-.392-.123-.557.123-.165.247-.64 1.805-.783.97-.144.165-.288.185-.535.062-.247-.123-1.042-.385-1.986-1.226-.734-.655-1.23-1.464-1.374-1.71-.144-.247-.015-.38.108-.503.11-.11.247-.288.37-.432.124-.144.165-.247.247-.412.083-.165.042-.309-.02-.432-.062-.123-.557-1.34-.763-1.835-.2-.484-.404-.418-.557-.426-.144-.008-.309-.01-.474-.01s-.433.062-.66.309c-.227.247-.865.845-.865 2.062 0 1.216.886 2.392 1.01 2.557.123.165 1.745 2.665 4.228 3.738.59.255 1.052.408 1.412.522.594.188 1.135.162 1.563.098.477-.07 1.464-.6 1.67-1.178.206-.577.206-1.072.144-1.175-.062-.103-.227-.165-.474-.288z" />
      </svg>
    );
  }

  // 2. DeepSeek
  if (normUrl.includes('deepseek') || normTitle.includes('deepseek') || normTitle.startsWith('deeps')) {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <defs>
          <linearGradient id="deepseekGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4D6BFE" />
            <stop offset="100%" stopColor="#0C8CE9" />
          </linearGradient>
        </defs>
        <path
          fill="url(#deepseekGrad)"
          d="M78.5 22.8c-7.4-4.8-16.7-5.9-25.1-3.2-12.2 4-21.2 14.8-23.3 27.5-1.1 6.5-.1 13.2 2.9 19 3.2 6.2 8.4 11.2 14.7 14.2 8.4 4 18.2 4.4 27 1.1 5.8-2.2 11-6.1 14.6-11.2 1.8-2.5 1-6-1.7-7.4-2.6-1.3-5.8-.4-7.3 2-2.3 3.6-5.8 6.3-9.9 7.7-6.2 2.1-13 1.7-18.9-1.2-4.5-2.2-8.2-5.7-10.4-10.1-1.9-3.9-2.5-8.3-1.8-12.6 1.4-8.5 7.4-15.6 15.5-18.4 5.9-2 12.4-1.3 17.7 1.9 3.2 2 5.9 4.8 7.7 8.2 1.4 2.6 4.7 3.5 7.3 2.1 2.6-1.4 3.5-4.7 2.1-7.3-2.7-5-6.7-9.2-11.4-12.3z"
        />
        <circle cx="56" cy="38" r="4.5" fill="#FFFFFF" />
        <path
          fill="url(#deepseekGrad)"
          d="M24.2 56.4c-2.8-1.5-6.3-.5-7.8 2.3-3.6 6.8-4.6 14.7-2.8 22.2.8 3.2 3.8 5.2 7 4.5 3.2-.8 5.2-3.8 4.5-7-1.1-4.7-.5-9.6 1.8-14 1.4-2.8.5-6.3-2.7-8z"
        />
      </svg>
    );
  }

  // 3. Google Gemini
  if (normUrl.includes('gemini.google.com') || normTitle === 'gemini' || normTitle.includes('google gemini')) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <defs>
          <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1ba1e2" />
            <stop offset="40%" stopColor="#7b5eea" />
            <stop offset="85%" stopColor="#c56bf0" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <path
          fill="url(#geminiGrad)"
          d="M12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24Z"
        />
      </svg>
    );
  }

  // 4. Gmail / Google Mail
  if (
    normUrl.includes('mail.google.com') ||
    normUrl.includes('gmail.com') ||
    normTitle === 'mail' ||
    normTitle === 'gmail' ||
    normTitle.includes('google mail')
  ) {
    return (
      <svg viewBox="0 0 48 48" className={className}>
        <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z" />
        <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z" />
        <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17" />
        <path
          fill="#c62828"
          d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C8.132,7.553,5.647,8.04,4.509,9.885L3,12.298z"
        />
        <path
          fill="#fbc02d"
          d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341c1.744-1.306,4.229-0.819,5.367,1.026L45,12.298z"
        />
      </svg>
    );
  }

  // 5. ChatGPT
  if (normUrl.includes('chatgpt.com') || normUrl.includes('chat.openai.com') || normTitle.includes('chatgpt')) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="#10A37F">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.98 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.08 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.493zm-9.66-4.283a4.464 4.464 0 0 1-.534-3.014c.05.03.1.066.15.094l4.779 2.758a.795.795 0 0 0 .784 0l5.834-3.369v2.335a.08.08 0 0 1-.033.063l-4.835 2.791a4.499 4.499 0 0 1-6.145-1.658zm-1.12-9.59a4.464 4.464 0 0 1 2.34-1.974v.166l4.779 2.758a.79.79 0 0 0 .784 0l5.834-3.37-2.02-1.166a.08.08 0 0 1-.038-.052L9.304 4.72a4.498 4.498 0 0 1-6.824 4.237zm15.428 3.518l-5.834 3.37-2.02-1.168a.08.08 0 0 1-.038-.052l-4.835-2.791a4.498 4.498 0 0 1 7.37-3.2l-.14.08-4.78 2.758a.795.795 0 0 0-.391.681v6.737l2.02-1.167a.071.071 0 0 1 .038-.052v-5.583a4.504 4.504 0 0 1 8.63 1.385z" />
      </svg>
    );
  }

  // 6. Claude
  if (normUrl.includes('claude.ai') || normTitle === 'claude') {
    return (
      <svg viewBox="0 0 24 24" className={className}>
        <path
          fill="#D97706"
          d="M12 2a1 1 0 0 1 .993.883L13 3v4.586l3.243-3.243a1 1 0 0 1 1.497 1.32l-.083.094L14.414 9H19a1 1 0 0 1 .993.883L20 10a1 1 0 0 1-.883.993L19 11h-4.586l3.243 3.243a1 1 0 0 1-1.32 1.497l-.094-.083L13 12.414V17a1 1 0 0 1-.883.993L12 18a1 1 0 0 1-.993-.883L11 17v-4.586l-3.243 3.243a1 1 0 0 1-1.497-1.32l.083-.094L9.586 11H5a1 1 0 0 1-.993-.883L4 10a1 1 0 0 1 .883-.993L5 9h4.586L6.343 5.757a1 1 0 0 1 1.32-1.497l.094.083L11 7.586V3a1 1 0 0 1 .883-.993L12 2z"
        />
      </svg>
    );
  }

  // 7. GitHub
  if (normUrl.includes('github.com') || normTitle.includes('github')) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="#f1f5f9">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        />
      </svg>
    );
  }

  // 8. YouTube
  if (normUrl.includes('youtube.com') || normTitle.includes('youtube')) {
    return (
      <svg viewBox="0 0 24 24" className={className}>
        <path
          fill="#FF0000"
          d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
        />
        <path fill="#FFFFFF" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }

  return null;
}

/**
 * Extracts root domain (e.g. web.whatsapp.com -> whatsapp.com, chat.deepseek.com -> deepseek.com)
 */
function getBaseDomain(domain: string): string {
  const parts = domain.replace(/^www\./, '').split('.');
  if (parts.length <= 2) return parts.join('.');

  const common2ndLevel = ['co', 'com', 'org', 'net', 'edu', 'gov', 'ai', 'io'];
  if (parts.length >= 3 && common2ndLevel.includes(parts[parts.length - 2])) {
    return parts.slice(-3).join('.');
  }
  return parts.slice(-2).join('.');
}

/**
 * Native Chrome Extension Favicon URL
 */
function getChromeFavicon(pageUrl: string, size = 64): string {
  if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
    try {
      const u = new URL(`chrome-extension://${chrome.runtime.id}/_favicon/`);
      u.searchParams.set('pageUrl', pageUrl);
      u.searchParams.set('size', size.toString());
      return u.toString();
    } catch {
      return '';
    }
  }
  return '';
}

export const Favicon: React.FC<FaviconProps> = ({
  url,
  title,
  customIcon,
  className = 'w-5 h-5',
  size = 64,
}) => {
  // Check curated brand vector logos first (solves WhatsApp, DeepSeek, Gemini, Gmail, etc.)
  const knownBrand = getKnownBrandSvg(url, title, className);
  if (knownBrand) {
    return <div className="shrink-0 flex items-center justify-center">{knownBrand}</div>;
  }

  // Extract domains
  let fullDomain = '';
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    fullDomain = parsed.hostname;
  } catch {
    fullDomain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0];
  }

  const baseDomain = getBaseDomain(fullDomain);

  // Build cascade of sources
  const sources: string[] = [];

  if (customIcon) {
    sources.push(customIcon);
  }

  // 1. Chrome native cached favicon for active tabs
  const chromeFavicon = getChromeFavicon(url, size);
  if (chromeFavicon) {
    sources.push(chromeFavicon);
  }

  // 2. Google Favicon service for full domain (handles subdomains cleanly)
  if (fullDomain) {
    sources.push(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(fullDomain)}&sz=${size}`);
  }

  // 3. DuckDuckGo icon on BASE domain only (avoids the 1478-byte chevron placeholder bug on subdomains)
  if (baseDomain) {
    sources.push(`https://icons.duckduckgo.com/ip3/${baseDomain}.ico`);
  }

  // 4. Google Favicon on base domain fallback
  if (baseDomain && baseDomain !== fullDomain) {
    sources.push(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(baseDomain)}&sz=${size}`);
  }

  const [sourceIndex, setSourceIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);

  useEffect(() => {
    setSourceIndex(0);
    setAllFailed(false);
  }, [url, customIcon]);

  const handleImgError = () => {
    if (sourceIndex < sources.length - 1) {
      setSourceIndex((prev) => prev + 1);
    } else {
      setAllFailed(true);
    }
  };

  const currentSrc = sources[sourceIndex];

  if (allFailed || !currentSrc) {
    return (
      <div className={`flex items-center justify-center rounded-lg bg-surface-hover text-slate-400 ${className}`}>
        <Globe className="w-3.5 h-3.5" />
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={`${fullDomain} icon`}
      className={`rounded-md object-contain shrink-0 ${className}`}
      loading="lazy"
      onError={handleImgError}
    />
  );
};
