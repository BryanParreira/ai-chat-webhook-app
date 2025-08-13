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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../contexts/ThemeContext';

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
  const { isDark, toggleTheme } = useThemeContext();

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

  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
        
        {/* Header */}
        <LinearGradient
          colors={['rgba(17, 24, 39, 0.95)', 'rgba(31, 41, 55, 0.9)']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* User Info */}
        <LinearGradient
          colors={['rgba(17, 24, 39, 0.8)', 'rgba(31, 41, 55, 0.7)']}
          style={styles.userSection}
        >
          <View style={styles.userInfo}>
            <LinearGradient
              colors={['#8b5cf6', '#a855f7']}
              style={styles.userAvatar}
            >
              <Text style={styles.userAvatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
        </LinearGradient>

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
                size={18} 
                color={activeTab === tab.id ? '#8b5cf6' : '#9ca3af'} 
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
                <LinearGradient
                  colors={['rgba(17, 24, 39, 0.8)', 'rgba(31, 41, 55, 0.6)']}
                  style={styles.settingItem}
                >
                  <View style={styles.settingInfo}>
                    <View style={styles.settingIcon}>
                      <Ionicons name="moon-outline" size={20} color="#8b5cf6" />
                    </View>
                    <View style={styles.settingDetails}>
                      <Text style={styles.settingTitle}>Dark Mode</Text>
                      <Text style={styles.settingDescription}>Toggle dark/light theme</Text>
                    </View>
                  </View>
                  <Switch
                    value={isDark}
                    onValueChange={toggleTheme}
                    trackColor={{ false: '#374151', true: '#8b5cf6' }}
                    thumbColor={isDark ? '#ffffff' : '#f4f4f5'}
                  />
                </LinearGradient>

                {/* Notifications */}
                <LinearGradient
                  colors={['rgba(17, 24, 39, 0.8)', 'rgba(31, 41, 55, 0.6)']}
                  style={styles.settingItem}
                >
                  <View style={styles.settingInfo}>
                    <View style={styles.settingIcon}>
                      <Ionicons name="notifications-outline" size={20} color="#8b5cf6" />
                    </View>
                    <View style={styles.settingDetails}>
                      <Text style={styles.settingTitle}>Notifications</Text>
                      <Text style={styles.settingDescription}>Receive message notifications</Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.notifications}
                    onValueChange={(value) => updateSetting('notifications', value)}
                    trackColor={{ false: '#374151', true: '#8b5cf6' }}
                    thumbColor={settings.notifications ? '#ffffff' : '#f4f4f5'}
                  />
                </LinearGradient>

                {/* Sound Effects */}
                <LinearGradient
                  colors={['rgba(17, 24, 39, 0.8)', 'rgba(31, 41, 55, 0.6)']}
                  style={styles.settingItem}
                >
                  <View style={styles.settingInfo}>
                    <View style={styles.settingIcon}>
                      <Ionicons name="volume-high-outline" size={20} color="#8b5cf6" />
                    </View>
                    <View style={styles.settingDetails}>
                      <Text style={styles.settingTitle}>Sound Effects</Text>
                      <Text style={styles.settingDescription}>Play sounds for messages</Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.soundEnabled}
                    onValueChange={(value) => updateSetting('soundEnabled', value)}
                    trackColor={{ false: '#374151', true: '#8b5cf6' }}
                    thumbColor={settings.soundEnabled ? '#ffffff' : '#f4f4f5'}
                  />
                </LinearGradient>

                {/* Auto Save */}
                <LinearGradient
                  colors={['rgba(17, 24, 39, 0.8)', 'rgba(31, 41, 55, 0.6)']}
                  style={styles.settingItem}
                >
                  <View style={styles.settingInfo}>
                    <View style={styles.settingIcon}>
                      <Ionicons name="save-outline" size={20} color="#8b5cf6" />
                    </View>
                    <View style={styles.settingDetails}>
                      <Text style={styles.settingTitle}>Auto Save</Text>
                      <Text style={styles.settingDescription}>Automatically save conversations</Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.autoSave}
                    onValueChange={(value) => updateSetting('autoSave', value)}
                    trackColor={{ false: '#374151', true: '#8b5cf6' }}
                    thumbColor={settings.autoSave ? '#ffffff' : '#f4f4f5'}
                  />
                </LinearGradient>

                {/* Message History */}
                <TouchableOpacity onPress={handleMessageHistoryChange}>
                  <LinearGradient
                    colors={['rgba(17, 24, 39, 0.8)', 'rgba(31, 41, 55, 0.6)']}
                    style={styles.settingItem}
                  >
                    <View style={styles.settingInfo}>
                      <View style={styles.settingIcon}>
                        <Ionicons name="time-outline" size={20} color="#8b5cf6" />
                      </View>
                      <View style={styles.settingDetails}>
                        <Text style={styles.settingTitle}>Message History Limit</Text>
                        <Text style={styles.settingDescription}>
                          {settings.messageHistory} messages
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'webhooks' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Webhook Settings</Text>
              
              <LinearGradient
                colors={['rgba(17, 24, 39, 0.8)', 'rgba(31, 41, 55, 0.6)']}
                style={styles.comingSoonContainer}
              >
                <Ionicons name="construct-outline" size={40} color="#8b5cf6" />
                <Text style={styles.comingSoonTitle}>Coming Soon</Text>
                <Text style={styles.comingSoonText}>
                  Webhook management features will be available in a future update
                </Text>
              </LinearGradient>
            </View>
          )}
        </ScrollView>

        {/* Logout Button */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LinearGradient
              colors={['#dc2626', '#b91c1c']}
              style={styles.logoutButtonGradient}
            >
              <Ionicons name="log-out-outline" size={20} color="white" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(75, 85, 99, 0.3)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f9fafb',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(75, 85, 99, 0.3)',
  },
  userSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(75, 85, 99, 0.3)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#9ca3af',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(75, 85, 99, 0.3)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#8b5cf6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  activeTabText: {
    color: '#8b5cf6',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 20,
  },
  settingsList: {
    gap: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingDetails: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#9ca3af',
  },
  comingSoonContainer: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(75, 85, 99, 0.3)',
  },
  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  logoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default SettingsScreen;