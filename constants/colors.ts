export const Colors = {
  primary: '#16A34A',
  deep: '#15803D',
  light: '#DCFCE7',
  white: '#FFFFFF',
  background: '#F8FAFC',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  card: '#FFFFFF',
  border: '#E2E8F0',
  overlay: 'rgba(15, 23, 42, 0.6)',

  // Extended palette
  primaryLight: '#86EFAC',
  primaryDark: '#166534',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',

  // Gradients (used as array in LinearGradient)
  gradientPrimary: ['#16A34A', '#15803D'] as string[],
  gradientHero: ['#15803D', '#166534', '#0F172A'] as string[],
  gradientCard: ['rgba(22, 163, 74, 0.1)', 'rgba(21, 128, 61, 0.05)'] as string[],
  gradientOverlay: ['transparent', 'rgba(15, 23, 42, 0.85)'] as string[],

  // Semantic
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Tab bar
  tabActive: '#16A34A',
  tabInactive: '#94A3B8',
  tabBackground: '#FFFFFF',
} as const;
