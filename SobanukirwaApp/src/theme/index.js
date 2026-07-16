import { Platform } from 'react-native';

// ==========================================
// SOBANUKIRWA DESIGN SYSTEM
// Modern, Clean, Premium Islamic App Theme
// ==========================================

export const COLORS = {
  // Core palette
  primary: '#0F766E',
  primaryLight: '#14B8A6',
  primaryDark: '#0D5C56',
  secondary: '#14B8A6',
  accent: '#F59E0B',
  accentLight: '#FBBF24',
  accentDark: '#D97706',

  // Backgrounds
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceVariant: '#F1F5F9',

  // Text
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#111827',

  // Borders & Dividers
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#F1F5F9',

  // Semantic
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  shimmer: '#E5E7EB',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

export const RADIUS = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const SHADOWS = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: { elevation: 1 },
    default: { boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: { elevation: 3 },
    default: { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)' },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    android: { elevation: 6 },
    default: { boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05)' },
  }),
  xl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
    },
    android: { elevation: 10 },
    default: { boxShadow: '0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)' },
  }),
};

export const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 34, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700', lineHeight: 30, letterSpacing: -0.3 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 26 },
  h4: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body1: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body2: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  body3: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  caption: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  label: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  small: { fontSize: 11, fontWeight: '500', lineHeight: 14 },
  arabic: { fontSize: 22, fontWeight: '400', lineHeight: 36, fontFamily: 'Amiri' },
  arabicLarge: { fontSize: 28, fontWeight: '400', lineHeight: 44, fontFamily: 'Amiri' },
};

// Keep COLORS exported for backward compatibility with AppContext
export default COLORS;
