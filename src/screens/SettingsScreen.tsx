import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../contexts/ThemeContext';
import { useWebhookContext } from '../contexts/WebhookContext';
// Import your simplified webhook screen
import WebhookSetupScreen from './WebhookSetupScreen';

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

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Export your chat history and settings?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => {
          // TODO: Implement export functionality
          Alert.alert('Coming Soon', 'Data export feature will be available in a future update.');
        }}
      ]
    );
  };

  const handlePrivacySettings = () => {
    Alert.alert(
      'Privacy & Security',
      'Privacy settings will be available in a future update.',
      [{ text: 'OK' }]
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
                <TouchableOpacity onPress={handleExportData}>
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
                <TouchableOpacity onPress={handlePrivacySettings}>
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
              <Text style={styles.sectionTitle}>Automation & Webhooks</Text>
              
              {/* Quick Stats */}
              {webhooks.length > 0 && (
                <View style={styles.statsCard}>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <View style={styles.statIconContainer}>
                        <Ionicons name="link" size={16} color="#FF6B35" />
                      </View>
                      <View>
                        <Text style={styles.statValue}>{stats.totalWebhooks}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                      </View>
                    </View>
                    
                    <View style={styles.statItem}>
                      <View style={styles.statIconContainer}>
                        <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                      </View>
                      <View>
                        <Text style={styles.statValue}>{stats.activeWebhooks}</Text>
                        <Text style={styles.statLabel}>Active</Text>
                      </View>
                    </View>
                    
                    <View style={styles.statItem}>
                      <View style={styles.statIconContainer}>
                        <Ionicons name="trending-up" size={16} color="#3B82F6" />
                      </View>
                      <View>
                        <Text style={styles.statValue}>{stats.successRate.toFixed(0)}%</Text>
                        <Text style={styles.statLabel}>Success</Text>
                      </View>
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
                  <View style={styles.webhookIconLarge}>
                    <Ionicons name="link-outline" size={20} color="#FF6B35" />
                  </View>
                  <View style={styles.webhookManageText}>
                    <Text style={styles.webhookManageTitle}>
                      {webhooks.length > 0 ? 'Manage Webhooks' : 'Setup Webhooks'}
                    </Text>
                    <Text style={styles.webhookManageDescription}>
                      {webhooks.length > 0 
                        ? `${webhooks.length} webhook${webhooks.length !== 1 ? 's' : ''} configured`
                        : 'Connect with n8n, Zapier, and more'
                      }
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#6B7280" />
                </View>
              </TouchableOpacity>

              {/* Active Webhooks Preview */}
              {webhooks.length > 0 && (
                <View style={styles.webhookPreview}>
                  <Text style={styles.previewTitle}>Active Webhooks</Text>
                  {webhooks.slice(0, 3).map((webhook) => (
                    <View key={webhook.id} style={styles.previewItem}>
                      <View style={styles.previewIcon}>
                        <Ionicons 
                          name={webhook.active ? "checkmark-circle" : "pause-circle"} 
                          size={16} 
                          color={webhook.active ? "#22C55E" : "#6B7280"} 
                        />
                      </View>
                      <View style={styles.previewInfo}>
                        <Text style={styles.previewName}>{webhook.name}</Text>
                        <Text style={styles.previewUrl} numberOfLines={1}>
                          {webhook.url.replace(/^https?:\/\//, '')}
                        </Text>
                      </View>
                      <Text style={styles.previewStatus}>
                        {webhook.active ? 'Active' : 'Paused'}
                      </Text>
                    </View>
                  ))}
                  
                  {webhooks.length > 3 && (
                    <TouchableOpacity 
                      style={styles.viewMoreButton}
                      onPress={() => setShowWebhookScreen(true)}
                    >
                      <Text style={styles.viewMoreText}>
                        View {webhooks.length - 3} more webhook{webhooks.length - 3 !== 1 ? 's' : ''}
                      </Text>
                      <Ionicons name="chevron-forward" size={14} color="#FF6B35" />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Info Card for new users */}
              {webhooks.length === 0 && (
                <View style={styles.webhookInfoCard}>
                  <View style={styles.webhookInfoHeader}>
                    <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
                    <Text style={styles.webhookInfoTitle}>Automate with Webhooks</Text>
                  </View>
                  <Text style={styles.webhookInfoText}>
                    Connect your messages to powerful automation tools like n8n, Zapier, or Make. 
                    Set up workflows to send notifications, save data, or trigger any action automatically.
                  </Text>
                  
                  <View style={styles.webhookBenefits}>
                    <View style={styles.benefitItem}>
                      <Ionicons name="flash" size={14} color="#FF6B35" />
                      <Text style={styles.benefitText}>Real-time notifications</Text>
                    </View>
                    <View style={styles.benefitItem}>
                      <Ionicons name="sync" size={14} color="#FF6B35" />
                      <Text style={styles.benefitText}>Automatic data sync</Text>
                    </View>
                    <View style={styles.benefitItem}>
                      <Ionicons name="globe" size={14} color="#FF6B35" />
                      <Text style={styles.benefitText}>Connect anywhere</Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={styles.getStartedButton}
                    onPress={() => setShowWebhookScreen(true)}
                  >
                    <Text style={styles.getStartedButtonText}>Get Started</Text>
                    <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
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

      {/* Webhook Setup Modal */}
      <Modal
        visible={showWebhookScreen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowWebhookScreen(false)}
      >
        <WebhookSetupScreen onClose={() => setShowWebhookScreen(false)} />
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
    gap: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
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
  
  // Webhook-specific styles
  statsCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  webhookManageButton: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 20,
  },
  webhookManageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  webhookIconLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  webhookManageText: {
    flex: 1,
  },
  webhookManageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  webhookManageDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  webhookPreview: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewIcon: {
    marginRight: 12,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  previewUrl: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  previewStatus: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    gap: 4,
  },
  viewMoreText: {
    fontSize: 13,
    color: '#FF6B35',
    fontWeight: '500',
  },
  webhookInfoCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  webhookInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  webhookInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  webhookInfoText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 16,
  },
  webhookBenefits: {
    gap: 8,
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 13,
    color: '#E5E7EB',
  },
  getStartedButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  getStartedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
});

export default SettingsScreen;