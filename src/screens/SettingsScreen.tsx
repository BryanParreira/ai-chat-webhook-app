import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../contexts/ThemeContext';
import { useWebhookContext } from '../contexts/WebhookContext';

interface SettingsScreenProps {
  onClose: () => void;
  onLogout: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
}

interface SettingsState {
  notifications: boolean;
  soundEnabled: boolean;
  autoSave: boolean;
  messageHistory: number;
}

// Simple Webhook Management Component (inline)
const SimpleWebhookScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { webhooks, addWebhook, deleteWebhook, testWebhook } = useWebhookContext();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    method: 'POST' as 'POST' | 'PUT' | 'PATCH',
    headers: '{"Content-Type": "application/json"}',
    body: '{"message": "{{message}}", "user": "{{user}}", "timestamp": "{{timestamp}}"}',
    active: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      method: 'POST',
      headers: '{"Content-Type": "application/json"}',
      body: '{"message": "{{message}}", "user": "{{user}}", "timestamp": "{{timestamp}}"}',
      active: true
    });
    setIsAdding(false);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      Alert.alert('Error', 'Please fill in name and URL');
      return;
    }

    // Validate URL format
    try {
      new URL(formData.url);
    } catch (error) {
      Alert.alert('Error', 'Please enter a valid URL (must start with http:// or https://)');
      return;
    }

    // Validate JSON headers
    try {
      JSON.parse(formData.headers);
    } catch (error) {
      Alert.alert('Error', 'Headers must be valid JSON format');
      return;
    }

    // Validate JSON body
    try {
      JSON.parse(formData.body);
    } catch (error) {
      Alert.alert('Error', 'Body must be valid JSON format');
      return;
    }

    try {
      await addWebhook({
        name: formData.name.trim(),
        url: formData.url.trim(),
        method: formData.method,
        headers: formData.headers,
        body: formData.body,
        active: formData.active,
      });
      resetForm();
      Alert.alert('Success', 'Webhook added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add webhook. Please try again.');
    }
  };

  const handleTest = async (webhook: any) => {
    try {
      const result = await testWebhook(webhook);
      Alert.alert(
        'Test Result', 
        result.success 
          ? `✓ Success (Status: ${result.status})\nResponse time: ${result.responseTime}ms` 
          : `✗ Failed: ${result.error}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to test webhook');
    }
  };

  const handleDelete = (webhook: any) => {
    Alert.alert(
      'Delete Webhook',
      `Are you sure you want to delete "${webhook.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWebhook(webhook.id);
              Alert.alert('Success', 'Webhook deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete webhook');
            }
          }
        }
      ]
    );
  };

  const selectMethod = () => {
    Alert.alert(
      'Select HTTP Method',
      'Choose the HTTP method for this webhook',
      [
        { text: 'POST', onPress: () => setFormData({ ...formData, method: 'POST' }) },
        { text: 'PUT', onPress: () => setFormData({ ...formData, method: 'PUT' }) },
        { text: 'PATCH', onPress: () => setFormData({ ...formData, method: 'PATCH' }) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.webhookContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      
      {/* Header */}
      <View style={styles.webhookHeader}>
        <Text style={styles.webhookTitle}>Webhook Management</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={22} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.webhookContent} showsVerticalScrollIndicator={false}>
        {/* Add Webhook Section */}
        {!isAdding ? (
          <TouchableOpacity 
            style={styles.addWebhookButton}
            onPress={() => setIsAdding(true)}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addWebhookText}>Add New Webhook</Text>
          </TouchableOpacity>
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.addFormContainer}
          >
            <View style={styles.addForm}>
              <Text style={styles.formTitle}>Add New Webhook</Text>
              
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name *</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    placeholder="My Webhook"
                    placeholderTextColor="#6B7280"
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* URL Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>URL *</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={formData.url}
                    onChangeText={(text) => setFormData({ ...formData, url: text })}
                    placeholder="https://your-webhook-url.com/endpoint"
                    placeholderTextColor="#6B7280"
                    keyboardType="url"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Method and Active Toggle Row */}
              <View style={styles.rowContainer}>
                <View style={styles.methodContainer}>
                  <Text style={styles.inputLabel}>Method</Text>
                  <TouchableOpacity onPress={selectMethod} style={styles.methodSelector}>
                    <Text style={styles.methodText}>{formData.method}</Text>
                    <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.toggleContainer}>
                  <Text style={styles.inputLabel}>Active</Text>
                  <Switch
                    value={formData.active}
                    onValueChange={(value) => setFormData({ ...formData, active: value })}
                    trackColor={{ false: '#374151', true: '#FF6B35' }}
                    thumbColor={formData.active ? '#ffffff' : '#f4f4f5'}
                    ios_backgroundColor="#374151"
                  />
                </View>
              </View>

              {/* Headers Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Headers (JSON)</Text>
                <View style={styles.textAreaContainer}>
                  <TextInput
                    style={styles.textArea}
                    value={formData.headers}
                    onChangeText={(text) => setFormData({ ...formData, headers: text })}
                    placeholder='{"Authorization": "Bearer your-token"}'
                    placeholderTextColor="#6B7280"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Body Template Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Body Template (JSON)</Text>
                <View style={styles.textAreaContainer}>
                  <TextInput
                    style={styles.textArea}
                    value={formData.body}
                    onChangeText={(text) => setFormData({ ...formData, body: text })}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
                <Text style={styles.helperText}>
                  Use {"{{message}}"} for message content, {"{{user}}"} for username, {"{{timestamp}}"} for timestamp
                </Text>
              </View>

              {/* Form Actions */}
              <View style={styles.formActions}>
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>Create Webhook</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={resetForm}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        )}

        {/* Webhook List */}
        <View style={styles.webhookList}>
          {webhooks.map((webhook) => (
            <View key={webhook.id} style={styles.webhookCard}>
              <View style={styles.webhookCardHeader}>
                <View style={styles.webhookInfo}>
                  <Text style={styles.webhookName}>{webhook.name}</Text>
                  <View style={[
                    styles.statusBadge,
                    webhook.active ? styles.statusActive : styles.statusInactive
                  ]}>
                    <Text style={[
                      styles.statusText,
                      webhook.active ? styles.statusTextActive : styles.statusTextInactive
                    ]}>
                      {webhook.active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.webhookActions}>
                  <TouchableOpacity
                    onPress={() => handleTest(webhook)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="checkmark" size={16} color="#3B82F6" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => handleDelete(webhook)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.webhookUrl}>{webhook.url}</Text>
              <Text style={styles.webhookMeta}>
                {webhook.method} • {webhook.active ? 'Active' : 'Inactive'}
                {webhook.lastTriggered && ` • Last triggered: ${new Date(webhook.lastTriggered).toLocaleDateString()}`}
              </Text>
            </View>
          ))}
          
          {webhooks.length === 0 && !isAdding && (
            <View style={styles.emptyState}>
              <Ionicons name="link-outline" size={48} color="#6B7280" />
              <Text style={styles.emptyStateTitle}>No webhooks configured</Text>
              <Text style={styles.emptyStateSubtitle}>
                Add your first webhook to get started with real-time notifications
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose, onLogout, user }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [showWebhookScreen, setShowWebhookScreen] = useState(false);
  const { isDark, toggleTheme } = useThemeContext();
  const { webhooks, getWebhookStats } = useWebhookContext();

  const [settings, setSettings] = useState<SettingsState>({
    notifications: true,
    soundEnabled: true,
    autoSave: true,
    messageHistory: 100
  });

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: onLogout
        }
      ]
    );
  };

  const handleMessageHistoryChange = () => {
    Alert.alert(
      'Message History',
      'Select message history limit',
      [
        { text: '50 messages', onPress: () => updateSetting('messageHistory', 50) },
        { text: '100 messages', onPress: () => updateSetting('messageHistory', 100) },
        { text: '500 messages', onPress: () => updateSetting('messageHistory', 500) },
        { text: '1000 messages', onPress: () => updateSetting('messageHistory', 1000) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const tabs = [
    { id: 'general', label: 'General', icon: 'settings-outline' },
    { id: 'webhooks', label: 'Webhooks', icon: 'link-outline' },
  ];

  const stats = getWebhookStats();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab
              ]}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={16} 
                color={activeTab === tab.id ? '#FF6B35' : '#6B7280'} 
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'general' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>General Settings</Text>
              
              <View style={styles.settingsList}>
                {/* Dark Mode */}
                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <View style={styles.settingIcon}>
                      <Ionicons name="moon-outline" size={18} color="#FF6B35" />
                    </View>
                    <View style={styles.settingDetails}>
                      <Text style={styles.settingTitle}>Dark Mode</Text>
                      <Text style={styles.settingDescription}>Toggle dark/light theme</Text>
                    </View>
                  </View>
                  <Switch
                    value={isDark}
                    onValueChange={toggleTheme}
                    trackColor={{ false: '#374151', true: '#FF6B35' }}
                    thumbColor={isDark ? '#ffffff' : '#f4f4f5'}
                    ios_backgroundColor="#374151"
                  />
                </View>

                {/* Notifications */}
                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <View style={styles.settingIcon}>
                      <Ionicons name="notifications-outline" size={18} color="#FF6B35" />
                    </View>
                    <View style={styles.settingDetails}>
                      <Text style={styles.settingTitle}>Notifications</Text>
                      <Text style={styles.settingDescription}>Receive message notifications</Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.notifications}
                    onValueChange={(value) => updateSetting('notifications', value)}
                    trackColor={{ false: '#374151', true: '#FF6B35' }}
                    thumbColor={settings.notifications ? '#ffffff' : '#f4f4f5'}
                    ios_backgroundColor="#374151"
                  />
                </View>

                {/* Sound Effects */}
                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <View style={styles.settingIcon}>
                      <Ionicons name="volume-high-outline" size={18} color="#FF6B35" />
                    </View>
                    <View style={styles.settingDetails}>
                      <Text style={styles.settingTitle}>Sound Effects</Text>
                      <Text style={styles.settingDescription}>Play sounds for messages</Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.soundEnabled}
                    onValueChange={(value) => updateSetting('soundEnabled', value)}
                    trackColor={{ false: '#374151', true: '#FF6B35' }}
                    thumbColor={settings.soundEnabled ? '#ffffff' : '#f4f4f5'}
                    ios_backgroundColor="#374151"
                  />
                </View>

                {/* Auto Save */}
                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <View style={styles.settingIcon}>
                      <Ionicons name="save-outline" size={18} color="#FF6B35" />
                    </View>
                    <View style={styles.settingDetails}>
                      <Text style={styles.settingTitle}>Auto Save</Text>
                      <Text style={styles.settingDescription}>Automatically save conversations</Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.autoSave}
                    onValueChange={(value) => updateSetting('autoSave', value)}
                    trackColor={{ false: '#374151', true: '#FF6B35' }}
                    thumbColor={settings.autoSave ? '#ffffff' : '#f4f4f5'}
                    ios_backgroundColor="#374151"
                  />
                </View>

                {/* Message History */}
                <TouchableOpacity onPress={handleMessageHistoryChange}>
                  <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                      <View style={styles.settingIcon}>
                        <Ionicons name="time-outline" size={18} color="#FF6B35" />
                      </View>
                      <View style={styles.settingDetails}>
                        <Text style={styles.settingTitle}>Message History Limit</Text>
                        <Text style={styles.settingDescription}>
                          {settings.messageHistory} messages
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#6B7280" />
                  </View>
                </TouchableOpacity>

                {/* Export Data */}
                <TouchableOpacity>
                  <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                      <View style={styles.settingIcon}>
                        <Ionicons name="download-outline" size={18} color="#FF6B35" />
                      </View>
                      <View style={styles.settingDetails}>
                        <Text style={styles.settingTitle}>Export Data</Text>
                        <Text style={styles.settingDescription}>Download your chat history</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#6B7280" />
                  </View>
                </TouchableOpacity>

                {/* Privacy */}
                <TouchableOpacity>
                  <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                      <View style={styles.settingIcon}>
                        <Ionicons name="shield-checkmark-outline" size={18} color="#FF6B35" />
                      </View>
                      <View style={styles.settingDetails}>
                        <Text style={styles.settingTitle}>Privacy & Security</Text>
                        <Text style={styles.settingDescription}>Manage your privacy settings</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#6B7280" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'webhooks' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Webhook Settings</Text>
              
              {/* Webhook Stats Card */}
              {webhooks.length > 0 && (
                <View style={styles.statsCard}>
                  <View style={styles.statsHeader}>
                    <Ionicons name="analytics-outline" size={20} color="#FF6B35" />
                    <Text style={styles.statsTitle}>Statistics</Text>
                  </View>
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{stats.totalWebhooks}</Text>
                      <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{stats.activeWebhooks}</Text>
                      <Text style={styles.statLabel}>Active</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{stats.totalTriggers}</Text>
                      <Text style={styles.statLabel}>Triggers</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{stats.successRate.toFixed(1)}%</Text>
                      <Text style={styles.statLabel}>Success</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Manage Webhooks Button */}
              <TouchableOpacity 
                style={styles.webhookManageButton}
                onPress={() => setShowWebhookScreen(true)}
              >
                <View style={styles.webhookManageContent}>
                  <View style={styles.webhookIcon}>
                    <Ionicons name="link-outline" size={18} color="#FF6B35" />
                  </View>
                  <View style={styles.webhookManageText}>
                    <Text style={styles.webhookManageTitle}>Manage Webhooks</Text>
                    <Text style={styles.webhookManageDescription}>
                      {webhooks.length > 0 
                        ? `Configure ${webhooks.length} webhook${webhooks.length !== 1 ? 's' : ''}`
                        : 'Configure webhook endpoints for real-time notifications'
                      }
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#6B7280" />
                </View>
              </TouchableOpacity>

              {/* Info Card */}
              <View style={styles.webhookInfoCard}>
                <View style={styles.webhookInfoHeader}>
                  <Ionicons name="information-circle-outline" size={20} color="#FF6B35" />
                  <Text style={styles.webhookInfoTitle}>About Webhooks</Text>
                </View>
                <Text style={styles.webhookInfoText}>
                  Webhooks allow you to receive real-time notifications when messages are sent. 
                  Configure endpoints to integrate with external services like Slack, Discord, or custom applications.
                </Text>
                
                {webhooks.length === 0 && (
                  <TouchableOpacity 
                    style={styles.getStartedButton}
                    onPress={() => setShowWebhookScreen(true)}
                  >
                    <Text style={styles.getStartedButtonText}>Get Started</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Logout Button */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <View style={styles.logoutButtonContent}>
              <Ionicons name="log-out-outline" size={18} color="#EF4444" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Simple Webhook Setup Modal */}
      <Modal
        visible={showWebhookScreen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowWebhookScreen(false)}
      >
        <SimpleWebhookScreen onClose={() => setShowWebhookScreen(false)} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: '#151515',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  userSection: {
    backgroundColor: '#151515',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#151515',
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B35',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FF6B35',
  },
  content: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  settingsList: {
    gap: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingDetails: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  // Webhook styles
  statsCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B35',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  webhookManageButton: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 16,
  },
  webhookManageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  webhookIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  webhookManageText: {
    flex: 1,
  },
  webhookManageTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  webhookManageDescription: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  webhookInfoCard: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  webhookInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  webhookInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  webhookInfoText: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
    marginBottom: 12,
  },
  getStartedButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  getStartedButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footer: {
    backgroundColor: '#151515',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#262626',
  },
  logoutButton: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#EF4444',
  },
  // Simple Webhook Screen Styles
  webhookContainer: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  webhookHeader: {
    backgroundColor: '#151515',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  webhookTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  webhookContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  addWebhookButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginVertical: 20,
  },
  addWebhookText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  addFormContainer: {
    marginVertical: 20,
  },
  addForm: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E5E7EB',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    backgroundColor: '#151515',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  textInput: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  methodContainer: {
    flex: 1,
  },
  methodSelector: {
    backgroundColor: '#151515',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  methodText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  toggleContainer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  textAreaContainer: {
    backgroundColor: '#151515',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  textArea: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    minHeight: 60,
  },
  helperText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 16,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  webhookList: {
    paddingBottom: 20,
  },
  webhookCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  webhookCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  webhookInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  webhookName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  statusInactive: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusTextActive: {
    color: '#22C55E',
  },
  statusTextInactive: {
    color: '#6B7280',
  },
  webhookActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#151515',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  webhookUrl: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  webhookMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default SettingsScreen;