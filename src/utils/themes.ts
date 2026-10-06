import { VisualTheme, VisualThemeId } from '../types';

export const VISUAL_THEMES: VisualTheme[] = [
  {
    id: 'zenith',
    name: 'Golden Zenith',
    subtitle: 'Deep obsidian velvet, warm antique brass lamp, and glowing gold',
    bg: '#070B07',
    surface: '#0E150E',
    surfaceElevated: '#162216',
    cream: '#FFFFCC',
    muted: '#E6E6B8',
    gold: '#FFD700',
    border: 'rgba(255, 215, 0, 0.22)'
  },
  {
    id: 'amber',
    name: 'Midnight Amber',
    subtitle: 'Smoky pine charcoal, crackling hearth embers, and warm spice',
    bg: '#100702',
    surface: '#1D0E05',
    surfaceElevated: '#2C170A',
    cream: '#FFE8D6',
    muted: '#DEC2AB',
    gold: '#FF8A3D',
    border: 'rgba(255, 138, 61, 0.25)'
  },
  {
    id: 'moss',
    name: 'Kyoto Moss',
    subtitle: 'Evergreen mist, rainy garden stone, and gentle sage celadon',
    bg: '#070E08',
    surface: '#0F1C12',
    surfaceElevated: '#172B1C',
    cream: '#EDF5E1',
    muted: '#BFD4BA',
    gold: '#8EE4AF',
    border: 'rgba(142, 228, 175, 0.22)'
  },
  {
    id: 'nordic',
    name: 'Nordic Solitude',
    subtitle: 'Quiet fjord midnight, frosted silver dusk, and glacial cyan',
    bg: '#080E16',
    surface: '#0F1A26',
    surfaceElevated: '#172638',
    cream: '#E2E8F0',
    muted: '#AEC1D4',
    gold: '#38BDF8',
    border: 'rgba(56, 189, 248, 0.22)'
  },
  {
    id: 'espresso',
    name: 'Antique Espresso',
    subtitle: 'Aged mahogany bookshelves, warm candlelight, and copper gold',
    bg: '#100A08',
    surface: '#1C120E',
    surfaceElevated: '#2A1B16',
    cream: '#F7EDE2',
    muted: '#D5C4B7',
    gold: '#E09F67',
    border: 'rgba(224, 159, 103, 0.22)'
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
  return 'dark'; // default to signature dark obsidian
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

  if (effectiveMode === 'light') {
    root.style.setProperty('--zen-bg', '#F6F3EC');
    root.style.setProperty('--zen-surface', '#EBE5D8');
    root.style.setProperty('--zen-surface-elevated', '#E0D8C8');
    root.style.setProperty('--zen-cream', '#1A1813');
    root.style.setProperty('--zen-muted', '#5C5648');
    root.style.setProperty('--zen-gold', '#B8860B');
    root.style.setProperty('--zen-border', 'rgba(184, 134, 11, 0.28)');
  } else {
    root.style.setProperty('--zen-bg', '#070B07');
    root.style.setProperty('--zen-surface', '#0E150E');
    root.style.setProperty('--zen-surface-elevated', '#162216');
    root.style.setProperty('--zen-cream', '#FFFFCC');
    root.style.setProperty('--zen-muted', '#E6E6B8');
    root.style.setProperty('--zen-gold', '#FFD700');
    root.style.setProperty('--zen-border', 'rgba(255, 215, 0, 0.22)');
  }
}

