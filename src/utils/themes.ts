import { VisualTheme } from '../types';

export const VISUAL_THEMES: VisualTheme[] = [
  {
    id: 'terracotta',
    name: 'Space Black & Electric Azure',
    subtitle: 'Apple Space Black (#090D16), frosted azure acrylic, and pure white optical clarity',
    bg: '#090D16',
    surface: 'rgba(18, 25, 41, 0.72)',
    surfaceElevated: 'rgba(30, 42, 68, 0.85)',
    cream: '#F8FAFC',
    muted: '#94A3B8',
    gold: '#0EA5E9',
    border: 'rgba(255, 255, 255, 0.09)'
  },
  {
    id: 'zenith',
    name: 'Midnight Indigo & Violet',
    subtitle: 'Deep space midnight, frosted indigo crystal, and electric violet accents',
    bg: '#080914',
    surface: 'rgba(17, 20, 40, 0.75)',
    surfaceElevated: 'rgba(28, 33, 62, 0.85)',
    cream: '#F8FAFC',
    muted: '#94A3B8',
    gold: '#6366F1',
    border: 'rgba(99, 102, 241, 0.18)'
  },
  {
    id: 'moss',
    name: 'Studio Graphite & Emerald',
    subtitle: 'Titanium dark graphite, quiet cedar stone, and fresh Apple emerald focus',
    bg: '#080E0B',
    surface: 'rgba(15, 26, 20, 0.75)',
    surfaceElevated: 'rgba(24, 42, 32, 0.85)',
    cream: '#F8FAFC',
    muted: '#94A3B8',
    gold: '#10B981',
    border: 'rgba(16, 185, 129, 0.18)'
  },
  {
    id: 'nordic',
    name: 'Glacial Cyan & Silver',
    subtitle: 'Arctic dusk midnight, frosted silver glass, and crisp laser cyan',
    bg: '#070B14',
    surface: 'rgba(14, 23, 38, 0.75)',
    surfaceElevated: 'rgba(22, 38, 62, 0.85)',
    cream: '#F8FAFC',
    muted: '#94A3B8',
    gold: '#06B6D4',
    border: 'rgba(6, 182, 212, 0.18)'
  },
  {
    id: 'amber',
    name: 'Solar Amber & Obsidian',
    subtitle: 'Deep obsidian velvet, warm solar hearth glow, and crisp golden focus',
    bg: '#0E0B08',
    surface: 'rgba(28, 20, 14, 0.75)',
    surfaceElevated: 'rgba(44, 32, 22, 0.85)',
    cream: '#F8FAFC',
    muted: '#94A3B8',
    gold: '#F59E0B',
    border: 'rgba(245, 158, 11, 0.18)'
  },
  {
    id: 'espresso',
    name: 'Studio Minimalist Slate',
    subtitle: 'Refined dark neutral slate, clean monochrome depth, and Apple blue accent',
    bg: '#0B0D11',
    surface: 'rgba(22, 25, 32, 0.75)',
    surfaceElevated: 'rgba(34, 38, 48, 0.85)',
    cream: '#F8FAFC',
    muted: '#94A3B8',
    gold: '#38BDF8',
    border: 'rgba(255, 255, 255, 0.08)'
  }
];

export function applyTheme(theme: VisualTheme) {
  const root = document.documentElement;
  root.style.setProperty('--zen-bg', theme.bg);
  root.style.setProperty('--zen-surface', theme.surface);
  root.style.setProperty('--zen-surface-elevated', theme.surfaceElevated);
  root.style.setProperty('--zen-cream', theme.cream);
  root.style.setProperty('--zen-muted', theme.muted);
  root.style.setProperty('--zen-gold', theme.gold);
  root.style.setProperty('--zen-border', theme.border);
}

export function getStoredTheme(): VisualTheme {
  const savedId = localStorage.getItem('zenbonfire_visual_theme');
  const found = VISUAL_THEMES.find((t) => t.id === savedId);
  return found || VISUAL_THEMES[0];
}

export type ThemeMode = 'dark' | 'light' | 'system';

export function getStoredThemeMode(): ThemeMode {
  const saved = localStorage.getItem('zenbonfire_theme_mode');
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  return 'dark'; // signature Apple Pro space black
}

export function applyThemeMode(mode: ThemeMode) {
  const root = document.documentElement;
  localStorage.setItem('zenbonfire_theme_mode', mode);

  let effectiveMode: 'dark' | 'light' = 'dark';
  if (mode === 'system') {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    effectiveMode = prefersDark ? 'dark' : 'light';
  } else {
    effectiveMode = mode;
  }

  root.setAttribute('data-theme', effectiveMode);

  const themeColorMeta = document.getElementById('theme-color-meta') || document.querySelector('meta[name="theme-color"]');
  const faviconLink = (document.getElementById('app-favicon') || document.querySelector('link[rel="icon"]')) as HTMLLinkElement | null;
  const manifestLink = (document.getElementById('app-manifest') || document.querySelector('link[rel="manifest"]')) as HTMLLinkElement | null;

  if (effectiveMode === 'light') {
    root.style.setProperty('--zen-bg', '#F8FAFC');
    root.style.setProperty('--zen-surface', 'rgba(255, 255, 255, 0.85)');
    root.style.setProperty('--zen-surface-elevated', '#F1F5F9');
    root.style.setProperty('--zen-cream', '#0F172A');
    root.style.setProperty('--zen-muted', '#64748B');
    root.style.setProperty('--zen-gold', '#0284C7');
    root.style.setProperty('--zen-border', 'rgba(15, 23, 42, 0.08)');

    if (themeColorMeta) themeColorMeta.setAttribute('content', '#F8FAFC');
    if (faviconLink) faviconLink.setAttribute('href', '/favicon-light.svg');
    if (manifestLink) manifestLink.setAttribute('href', '/manifest.json?theme=light');
  } else {
    // Apple Space Black Signature
    root.style.setProperty('--zen-bg', '#090D16');
    root.style.setProperty('--zen-surface', 'rgba(18, 25, 41, 0.72)');
    root.style.setProperty('--zen-surface-elevated', 'rgba(30, 42, 68, 0.85)');
    root.style.setProperty('--zen-cream', '#F8FAFC');
    root.style.setProperty('--zen-muted', '#94A3B8');
    root.style.setProperty('--zen-gold', '#0EA5E9');
    root.style.setProperty('--zen-border', 'rgba(255, 255, 255, 0.08)');

    if (themeColorMeta) themeColorMeta.setAttribute('content', '#090D16');
    if (faviconLink) faviconLink.setAttribute('href', '/favicon.svg');
    if (manifestLink) manifestLink.setAttribute('href', '/manifest.json?theme=dark');
  }

  // Sync preference with backend
  try {
    fetch('/api/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode })
    }).catch(() => {});
  } catch {
    // Silent ignore in offline/isolated environments
  }
}
