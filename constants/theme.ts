/**
 * Initial visual tokens for NoteFlow.
 * Keep the design language centralized here before adding a larger design system.
 */
export const lightColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  border: '#E2E8F0',
  text: '#0F172A',
  textMuted: '#475569',
  primary: '#2563EB',
  accent: '#0EA5E9',
  success: '#16A34A',
  danger: '#DC2626',
} as const;

export const darkColors = {
  background: '#020617',
  surface: '#0F172A',
  surfaceMuted: '#1E293B',
  border: '#334155',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  primary: '#60A5FA',
  accent: '#38BDF8',
  success: '#4ADE80',
  danger: '#F87171',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;
