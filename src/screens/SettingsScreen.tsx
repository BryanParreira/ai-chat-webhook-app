import React, { useState } from 'react';
import { Settings, Webhook, X, LogOut } from 'lucide-react';
import { useThemeContext } from '../contexts/ThemeContext';
const WebhookSetupScreen = () => {
  // Component implementation
};

interface SettingsScreenProps {
  onClose: () => void;
};

interface SettingsScreenProps {
  onClose: () => void;
  onLogout: () => void;
  user: {
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

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  ];

  return (
    <div className="bg-gray-800 border-l border-gray-700 w-96 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="text-white font-medium">{user.name}</p>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-gray-700/50'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Dark Mode</p>
                  <p className="text-gray-400 text-sm">Toggle dark/light theme</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isDark ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDark ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Notifications</p>
                  <p className="text-gray-400 text-sm">Receive message notifications</p>
                </div>
                <button
                  onClick={() => updateSetting('notifications', !settings.notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Sound Effects</p>
                  <p className="text-gray-400 text-sm">Play sounds for messages</p>
                </div>
                <button
                  onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.soundEnabled ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Message History Limit
                </label>
                <select
                  value={settings.messageHistory}
                  onChange={(e) => updateSetting('messageHistory', parseInt(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={50}>50 messages</option>
                  <option value={100}>100 messages</option>
                  <option value={500}>500 messages</option>
                  <option value={1000}>1000 messages</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'webhooks' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Webhook Settings</h3>

            <div className="space-y-4">
              {/* Add your webhook settings here */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsScreen