import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LoginScreen from './src/screens/LoginScreen';
import ChatScreen from './src/screens/ChatScreen';
import { ChatProvider } from './src/contexts/ChatContext';
import { WebhookProvider } from './src/contexts/WebhookContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Loading Component
const LoadingScreen: React.FC = () => (
  <SafeAreaView style={styles.loadingContainer}>
    <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
    <View style={styles.loadingContent}>
      <View style={styles.loadingIcon}>
        <Ionicons name="sparkles" size={32} color="#FF6B35" />
      </View>
      <ActivityIndicator 
        size="large" 
        color="#FF6B35" 
        style={styles.loadingSpinner}
      />
      <Text style={styles.loadingText}>Loading Neural AI...</Text>
      <Text style={styles.loadingSubtext}>Initializing your AI assistant</Text>
    </View>
  </SafeAreaView>
);

// App Content
const AppContent: React.FC = () => {
  const { user, login, logout, isLoading, error } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (user) {
    return (
      <ChatScreen 
        user={user} 
        onLogout={logout}
      />
    );
  }

  return (
    <LoginScreen 
      onLogin={async (credentials) => {
        try {
          await login(credentials);
        } catch (err) {
          // Error is handled by the auth context
          console.log('Login error handled by context');
        }
      }} 
    />
  );
};

// Root App Component
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WebhookProvider>
          <ChatProvider>
            <AppContent />
          </ChatProvider>
        </WebhookProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default App;