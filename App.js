import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ChatProvider } from './src/contexts/ChatContext';
import { WebhookProvider } from './src/contexts/WebhookContext';
import ChatScreen from './src/screens/ChatScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import WebhookSetupScreen from './src/screens/WebhookSetupScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <WebhookProvider>
      <ChatProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="Chat"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#2563eb',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="Chat" 
              component={ChatScreen}
              options={{ title: 'AI Chat' }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{ title: 'Settings' }}
            />
            <Stack.Screen 
              name="WebhookSetup" 
              component={WebhookSetupScreen}
              options={{ title: 'Webhook Setup' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ChatProvider>
    </WebhookProvider>
  );
}
