import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';

interface ColorScheme {
  // Primary colors
  primary: string;
  primaryDark: string;
  primaryLight: string;
  
  // Background colors
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // Border and divider colors
  border: string;
  borderLight: string;
  divider: string;
  
  // Accent and status colors
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Overlay and shadow colors
  overlay: string;
  shadow: string;
  
  // Interactive states
  ripple: string;
  disabled: string;
}

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  currentTheme: 'light' | 'dark' | 'system';
  colors: ColorScheme;
  systemTheme: ColorSchemeName;
}

// Enhanced light theme colors
const lightColors: ColorScheme = {
  // Primary colors
  primary: '#FF6B35',
  primaryDark: '#E85A2B',
  primaryLight: '#FF8A5B',
  
  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  card: '#FFFFFF',
  
  // Text colors
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Border and divider colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',
  
  // Accent and status colors
  accent: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4',
  
  // Overlay and shadow colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  
  // Interactive states
  ripple: 'rgba(255, 107, 53, 0.1)',
  disabled: '#D1D5DB',
};

// Enhanced dark theme colors (matching your design)
const darkColors: ColorScheme = {
  // Primary colors
  primary: '#FF6B35',
  primaryDark: '#E85A2B',
  primaryLight: '#FF8A5B',
  
  // Background colors
  background: '#0D0D0D',
  backgroundSecondary: '#151515',
  surface: '#1F1F1F',
  surfaceSecondary: '#2A2A2A',
  card: '#1F1F1F',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#E5E7EB',
  textTertiary: '#9CA3AF',
  textInverse: '#1F2937',
  
  // Border and divider colors
  border: '#2A2A2A',
  borderLight: '#262626',
  divider: '#374151',
  
  // Accent and status colors
  accent: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4',
  
  // Overlay and shadow colors
  overlay: 'rgba(0, 0, 0, 0.8)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  
  // Interactive states
  ripple: 'rgba(255, 107, 53, 0.15)',
  disabled: '#374151',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Storage key
const THEME_STORAGE_KEY = '@app_theme_preference';

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'dark' 
}) => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<ColorSchemeName>(Appearance.getColorScheme());
  
  // Determine if dark mode should be active
  const isDark = currentTheme === 'system' 
    ? systemTheme === 'dark' 
    : currentTheme === 'dark';

  useEffect(() => {
    loadThemePreference();
    
    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setCurrentTheme(savedTheme as 'light' | 'dark' | 'system');
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  };

  const saveThemePreference = async (theme: 'light' | 'dark' | 'system') => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    setCurrentTheme(theme);
    saveThemePreference(theme);
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const colors = isDark ? darkColors : lightColors;

  const contextValue: ThemeContextType = {
    isDark,
    toggleTheme,
    setTheme,
    currentTheme,
    colors,
    systemTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Utility hooks for common use cases
export const useColors = () => {
  const { colors } = useThemeContext();
  return colors;
};

export const useIsDark = () => {
  const { isDark } = useThemeContext();
  return isDark;
};

export const useThemeAwareStyle = <T extends Record<string, any>>(
  lightStyle: T,
  darkStyle: T
): T => {
  const { isDark } = useThemeContext();
  return isDark ? darkStyle : lightStyle;
};

// Helper function to create theme-aware styles
export const createThemedStyles = <T extends Record<string, any>>(
  styleCreator: (colors: ColorScheme, isDark: boolean) => T
) => {
  return () => {
    const { colors, isDark } = useThemeContext();
    return styleCreator(colors, isDark);
  };
};

// Predefined style helpers
export const getThemedBackgroundStyle = (colors: ColorScheme) => ({
  backgroundColor: colors.background,
});

export const getThemedTextStyle = (colors: ColorScheme, variant: 'primary' | 'secondary' | 'tertiary' = 'primary') => ({
  color: variant === 'primary' 
    ? colors.text 
    : variant === 'secondary' 
      ? colors.textSecondary 
      : colors.textTertiary,
});

export const getThemedBorderStyle = (colors: ColorScheme, width: number = 1) => ({
  borderColor: colors.border,
  borderWidth: width,
});

export const getThemedShadowStyle = (colors: ColorScheme, elevation: number = 4) => ({
  shadowColor: colors.shadow,
  shadowOffset: { width: 0, height: elevation / 2 },
  shadowOpacity: 0.25,
  shadowRadius: elevation,
  elevation,
});

// Theme constants for easy access
export const THEME_COLORS = {
  LIGHT: lightColors,
  DARK: darkColors,
} as const;

export { ThemeContext };
export default ThemeProvider;