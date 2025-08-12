import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
  };
}

const lightColors = {
  primary: '#8b5cf6',
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  accent: '#a855f7',
};

const darkColors = {
  primary: '#8b5cf6',
  background: '#111827',
  surface: '#1f2937',
  text: '#f9fafb',
  textSecondary: '#9ca3af',
  border: '#374151',
  accent: '#a855f7',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('chatApp_theme');
      setIsDark(saved === 'dark' || saved === null);
    } catch (error) {
      console.error('Failed to load theme:', error);
      setIsDark(true); // Default to dark theme
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    try {
      await AsyncStorage.setItem('chatApp_theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const colors = isDark ? darkColors : lightColors;

  const contextValue: ThemeContextType = {
    isDark,
    toggleTheme,
    colors,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext };
export default ThemeProvider;