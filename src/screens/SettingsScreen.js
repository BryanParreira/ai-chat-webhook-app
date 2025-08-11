import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useTheme } from '../contexts/ThemeContext';
import { useChat } from '../contexts/ChatContext';
import { storageService } from '../services/storageService';

export default function SettingsScreen({ navigation }) {
  const { theme, currentTheme, toggleTheme } = useTheme();
  const { clearChat } = useChat();

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat History',
      'Are you sure you want to clear all chat messages? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            clearChat();
            Alert.alert('Success', 'Chat history has been cleared.');
          }
        },
      ]
    );
  };

  const handleResetApp = () => {
    Alert.alert(
      'Reset App',
      'This will clear all app data including chat history, webhook settings, and preferences. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            await storageService.clearAll();
            clearChat();
            Alert.alert('Success', 'App has been reset to default settings.');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        </View>

        {/* Theme Settings */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Appearance
          </Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                Dark Mode
              </Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Switch between light and dark themes
              </Text>
            </View>
            <Switch
              value={currentTheme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={currentTheme === 'dark' ? theme.primary : '#ffffff'}
            />
          </View>
        </Card>

        {/* Webhook Settings */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Integration
          </Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                Webhook Configuration
              </Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Configure API endpoint for chat responses
              </Text>
            </View>
          </View>
          <Button
            title="Configure Webhook"
            variant="secondary"
            onPress={() => navigation.navigate('WebhookSetup')}
            style={styles.configButton}
          />
        </Card>

        {/* Data Management */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Data Management
          </Text>
          <Button
            title="Clear Chat History"
            variant="secondary"
            onPress={handleClearChat}
            style={styles.actionButton}
          />
          <Button
            title="Reset App"
            variant="danger"
            onPress={handleResetApp}
            style={styles.actionButton}
          />
        </Card>

        {/* App Info */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            About
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Version
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              1.0.0
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Build
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {new Date().getFullYear()}.{new Date().getMonth() + 1}
            </Text>
          </View>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'JetBrains Mono',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'JetBrains Mono',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'JetBrains Mono',
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'JetBrains Mono',
  },
  configButton: {
    marginTop: 8,
  },
  actionButton: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'JetBrains Mono',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'JetBrains Mono',
  },
});