import React from 'react';
import { MessageSquare } from 'lucide-react';
import LoginScreen from './src/screens/LoginScreen';
import ChatScreen from './src/screens/ChatScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { ChatProvider } from './src/contexts/ChatContext';
import { WebhookProvider } from './src/contexts/WebhookContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Loading Component
const LoadingScreen: React.FC = () => (
  <div className="h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="bg-gradient-to-r from-purple-500 to-violet-500 w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse">
        <MessageSquare className="w-8 h-8 text-white" />
      </div>
      <p className="text-gray-400">Loading...</p>
    </div>
  </div>
);

// App Content
const AppContent: React.FC = () => {
  const auth = useAuth();
  const { user, login, isLoading } = auth;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return user ? <ChatScreen user={user} /> : <LoginScreen onLogin={login} />;
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

export default App;
