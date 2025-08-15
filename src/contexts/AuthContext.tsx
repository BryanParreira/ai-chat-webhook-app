import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  createdAt?: string;
  lastLoginAt?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  name?: string; // For sign up
}

interface AuthError {
  message: string;
  code?: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: AuthError | null;
  clearError: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  USER: '@auth_user',
  REMEMBER_ME: '@auth_remember_me',
} as const;

// Mock user database for demo purposes
const MOCK_USERS = [
  {
    id: '1',
    email: 'demo@example.com',
    password: 'password',
    name: 'Demo User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    email: 'user@google.com',
    password: 'oauth',
    name: 'Google User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '3',
    email: 'user@github.com',
    password: 'oauth',
    name: 'GitHub User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=github',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true for initial load
  const [error, setError] = useState<AuthError | null>(null);

  // Check for stored user on app launch
  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking stored auth:', error);
      // Clear any corrupted data
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAvatar = (email: string): string => {
    const seed = email.split('@')[0];
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  };

  const validateCredentials = (credentials: LoginCredentials): void => {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      throw new Error('Please enter a valid email address');
    }

    if (credentials.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // If signing up, validate name
    if (credentials.name !== undefined) {
      if (!credentials.name.trim()) {
        throw new Error('Name is required for sign up');
      }
      if (credentials.name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }
    }
  };

  const simulateNetworkDelay = (): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Basic validation (but allow any valid format)
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Simulate network delay
      await simulateNetworkDelay();

      const isSignUp = credentials.name !== undefined;
      let authenticatedUser: User;

      if (isSignUp) {
        // Sign up flow - allow any new user
        authenticatedUser = {
          id: Date.now().toString(),
          email: credentials.email.toLowerCase(),
          name: credentials.name?.trim() || 'User',
          avatar: generateAvatar(credentials.email),
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        // Add to mock database for future logins
        MOCK_USERS.push({
          ...authenticatedUser,
          password: credentials.password,
        });
      } else {
        // Sign in flow - check existing users first, then allow any credentials
        const mockUser = MOCK_USERS.find(
          u => u.email.toLowerCase() === credentials.email.toLowerCase() && u.password === credentials.password
        );

        if (mockUser) {
          // Use existing user data
          authenticatedUser = {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            avatar: mockUser.avatar,
            createdAt: mockUser.createdAt || new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };
        } else {
          // Allow any credentials - create new user on the fly
          const newUserId = Date.now().toString();
          authenticatedUser = {
            id: newUserId,
            email: credentials.email.toLowerCase(),
            name: credentials.email.split('@')[0] || 'User', // Use email prefix as name
            avatar: generateAvatar(credentials.email),
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };

          // Add to mock database for consistency
          MOCK_USERS.push({
            ...authenticatedUser,
            password: credentials.password,
          });
        }
      }

      // Store user data
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authenticatedUser));
      
      setUser(authenticatedUser);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError({ message: errorMessage });
      throw error; // Re-throw so the UI can handle it
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate logout delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Clear stored data
      await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.REMEMBER_ME]);
      
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      // Force logout even if there's an error
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  const isAuthenticated = user !== null;

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    error,
    clearError,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Additional utility hooks for common use cases
export const useAuthUser = (): User => {
  const { user } = useAuth();
  if (!user) {
    throw new Error('useAuthUser must be used when user is authenticated');
  }
  return user;
};

export const useAuthGuard = (): boolean => {
  const { isAuthenticated, isLoading } = useAuth();
  return !isLoading && isAuthenticated;
};

// Helper function for components that need to check auth status
export const withAuthRequired = <T extends {}>(
  Component: React.ComponentType<T>
): React.ComponentType<T> => {
  return (props: T) => {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
      // You can return a loading component here
      return null;
    }
    
    if (!isAuthenticated) {
      // You can return a login prompt or redirect here
      return null;
    }
    
    return <Component {...props} />;
  };
};