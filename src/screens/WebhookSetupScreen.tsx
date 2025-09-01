import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  Modal,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWebhookContext } from '../contexts/WebhookContext';

interface WebhookSetupScreenProps {
  onClose: () => void;
}

const WebhookSetupScreen: React.FC<WebhookSetupScreenProps> = ({ onClose }) => {
  const { webhooks, addWebhook, updateWebhook, deleteWebhook, testWebhook } = useWebhookContext();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    active: true
  });

  // Simple n8n webhook URL validation
  const isValidWebhookUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
    } catch {
      return false;
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      active: true
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const generateWebhookName = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      if (hostname.includes('n8n')) {
        return 'n8n Workflow';
      } else if (hostname.includes('zapier')) {
        return 'Zapier Workflow';
      } else if (hostname.includes('make')) {
        return 'Make Workflow';
      } else {
        return `Webhook (${hostname})`;
      }
    } catch {
      return 'My Webhook';
    }
  };

  const handleSubmit = async () => {
    if (!formData.url.trim()) {
      Alert.alert('Missing URL', 'Please paste your webhook URL');
      return;
    }

    if (!isValidWebhookUrl(formData.url)) {
      Alert.alert('Invalid URL', 'Please enter a valid webhook URL (must start with http:// or https://)');
      return;
    }

    // Auto-generate name if empty
    const finalName = formData.name.trim() || generateWebhookName(formData.url);

    try {
      const webhookData = {
        name: finalName,
        url: formData.url.trim(),
        method: 'POST', // Always POST for simplicity
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MobileApp/1.0'
        },
        body: JSON.stringify({
          message: "{{message}}",
          user: "{{user}}",
          timestamp: "{{timestamp}}",
          channel: "{{channel}}",
          app: "mobile"
        }),
        active: formData.active,
        createdAt: editingId ? undefined : new Date().toISOString(),
        successCount: 0,
        failureCount: 0
      };

      if (editingId) {
        await updateWebhook(editingId, webhookData);
        Alert.alert('✅ Updated!', 'Your webhook has been updated successfully');
      } else {
        await addWebhook(webhookData);
        Alert.alert('🎉 Added!', 'Your webhook is ready to receive messages');
      }
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleEdit = (webhook: any) => {
    setFormData({
      name: webhook.name,
      url: webhook.url,
      active: webhook.active
    });
    setEditingId(webhook.id);
    setIsAdding(true);
  };

  const handleTest = async (webhook: any) => {
    setTestResults({ ...testResults, [webhook.id]: { testing: true } });
    
    try {
      // Send a simple test message
      const testPayload = {
        message: "🧪 Test message from your mobile app",
        user: "TestUser",
        timestamp: new Date().toISOString(),
        channel: "test",
        app: "mobile",
        test: true
      };

      const result = await testWebhook({
        ...webhook,
        testPayload
      });
      
      setTestResults({ 
        ...testResults, 
        [webhook.id]: {
          ...result,
          timestamp: new Date().toLocaleTimeString()
        }
      });
      
      // Show success message
      if (result.success) {
        Alert.alert('✅ Test Successful!', 'Your webhook received the test message');
      }
      
    } catch (error) {
      setTestResults({ 
        ...testResults, 
        [webhook.id]: { 
          testing: false, 
          success: false, 
          error: error.message || 'Connection failed',
          timestamp: new Date().toLocaleTimeString()
        } 
      });
      
      Alert.alert('❌ Test Failed', error.message || 'Could not reach your webhook');
    }

    // Clear test result after 4 seconds
    setTimeout(() => {
      setTestResults(prev => {
        const newResults = { ...prev };
        delete newResults[webhook.id];
        return newResults;
      });
    }, 4000);
  };

  const handleDelete = (webhook: any) => {
    Alert.alert(
      'Delete Webhook?',
      `"${webhook.name}" will stop receiving messages.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWebhook(webhook.id);
              // No alert needed, just silent success
            } catch (error) {
              Alert.alert('Error', 'Could not delete webhook');
            }
          }
        }
      ]
    );
  };

  const handleQuickAdd = () => {
    Alert.alert(
      '🚀 Quick Setup',
      'To get your webhook URL:\n\n1. Open your n8n workflow\n2. Add a "Webhook" node\n3. Copy the webhook URL\n4. Paste it here!',
      [
        { text: 'Got it!', onPress: () => setIsAdding(true) }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Webhooks</Text>
            <Text style={styles.headerSubtitle}>Connect to n8n, Zapier, and more</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={22} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Add Button */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity onPress={handleQuickAdd} style={styles.addButton}>
            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Webhook</Text>
          </TouchableOpacity>
        </View>

        {/* Simple Info */}
        {webhooks.length === 0 && (
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>How it works:</Text>
              <Text style={styles.infoText}>
                1. Get your webhook URL from n8n/Zapier{'\n'}
                2. Paste it here{'\n'}
                3. Your messages will trigger workflows automatically!
              </Text>
            </View>
          </View>
        )}

        {/* Webhook List */}
        <View style={styles.webhooksList}>
          {webhooks.map((webhook) => (
            <View key={webhook.id} style={styles.webhookCard}>
              <View style={styles.webhookHeader}>
                <View style={styles.webhookInfo}>
                  <Ionicons 
                    name={webhook.active ? "checkmark-circle" : "pause-circle"} 
                    size={20} 
                    color={webhook.active ? "#22C55E" : "#6B7280"} 
                  />
                  <Text style={styles.webhookName}>{webhook.name}</Text>
                </View>
                
                <View style={styles.webhookActions}>
                  <TouchableOpacity
                    onPress={() => handleTest(webhook)}
                    disabled={testResults[webhook.id]?.testing}
                    style={styles.testButton}
                  >
                    <Ionicons 
                      name={testResults[webhook.id]?.testing ? "hourglass" : "send"} 
                      size={16} 
                      color="#3B82F6" 
                    />
                    <Text style={styles.testButtonText}>Test</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => handleEdit(webhook)} style={styles.editButton}>
                    <Ionicons name="create-outline" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => handleDelete(webhook)} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.webhookUrl} numberOfLines={1}>{webhook.url}</Text>
              
              <View style={styles.webhookFooter}>
                <Text style={styles.webhookMeta}>
                  Added {new Date(webhook.createdAt || Date.now()).toLocaleDateString()}
                </Text>
                {(webhook.successCount > 0 || webhook.failureCount > 0) && (
                  <Text style={styles.webhookStats}>
                    {webhook.successCount || 0} sent • {webhook.failureCount || 0} failed
                  </Text>
                )}
              </View>
              
              {testResults[webhook.id] && (
                <View style={[
                  styles.testResult,
                  testResults[webhook.id].testing 
                    ? styles.testResultTesting
                    : testResults[webhook.id].success 
                      ? styles.testResultSuccess 
                      : styles.testResultError
                ]}>
                  <Text style={styles.testResultText}>
                    {testResults[webhook.id].testing 
                      ? '⏳ Testing...' 
                      : testResults[webhook.id].success 
                        ? '✅ Test successful!' 
                        : `❌ ${testResults[webhook.id].error}`
                    }
                  </Text>
                </View>
              )}
            </View>
          ))}
          
          {webhooks.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="link-outline" size={64} color="#4B5563" />
              <Text style={styles.emptyStateTitle}>No webhooks yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Add your first webhook to start automating
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Simple Add/Edit Modal */}
      <Modal
        visible={isAdding}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={resetForm}
      >
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
          
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingId ? '✏️ Edit Webhook' : '🔗 Add Webhook'}
            </Text>
            <TouchableOpacity onPress={resetForm} style={styles.closeButton}>
              <Ionicons name="close" size={22} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardView}
          >
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              
              {/* URL Input - Most Important */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>🔗 Webhook URL</Text>
                <View style={styles.urlInputContainer}>
                  <TextInput
                    style={styles.urlInput}
                    value={formData.url}
                    onChangeText={(text) => setFormData({...formData, url: text})}
                    placeholder="Paste your webhook URL here..."
                    placeholderTextColor="#6B7280"
                    keyboardType="url"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                    multiline={false}
                  />
                </View>
                <Text style={styles.helperText}>
                  Get this from your n8n workflow → Webhook node → Production URL
                </Text>
              </View>

              {/* Name Input - Optional */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>📝 Name (optional)</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={formData.name}
                    onChangeText={(text) => setFormData({...formData, name: text})}
                    placeholder="Auto-generated if empty"
                    placeholderTextColor="#6B7280"
                    autoCapitalize="words"
                  />
                </View>
                <Text style={styles.helperText}>
                  Leave empty to auto-generate a name
                </Text>
              </View>

              {/* Active Toggle */}
              <View style={styles.toggleSection}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Active</Text>
                  <Text style={styles.toggleDescription}>
                    {formData.active ? 'Webhook will receive messages' : 'Webhook is paused'}
                  </Text>
                </View>
                <Switch
                  value={formData.active}
                  onValueChange={(value) => setFormData({...formData, active: value})}
                  trackColor={{ false: '#374151', true: '#FF6B35' }}
                  thumbColor={formData.active ? '#ffffff' : '#f4f4f5'}
                  ios_backgroundColor="#374151"
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
                  <Text style={styles.saveButtonText}>
                    {editingId ? '💾 Update Webhook' : '🚀 Add Webhook'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={resetForm} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>

              {/* Help Section */}
              <View style={styles.helpSection}>
                <Text style={styles.helpTitle}>💡 Quick Tips:</Text>
                <Text style={styles.helpText}>
                  • Works with n8n, Zapier, Make, and any webhook service{'\n'}
                  • Your messages will include: message, user, timestamp, channel{'\n'}
                  • Test your webhook after adding to make sure it works{'\n'}
                  • Use HTTPS URLs for better security
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
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
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  addButtonContainer: {
    paddingVertical: 24,
  },
  addButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  webhooksList: {
    paddingBottom: 24,
  },
  webhookCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  webhookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  webhookInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  webhookName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  webhookActions: {
    flexDirection: 'row',
    gap: 12,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  testButtonText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webhookUrl: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#0F0F0F',
    padding: 8,
    borderRadius: 8,
  },
  webhookFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  webhookMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  webhookStats: {
    fontSize: 12,
    color: '#6B7280',
  },
  testResult: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  testResultTesting: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  testResultSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  testResultError: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  testResultText: {
    fontSize: 13,
    color: '#E5E7EB',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  modalHeader: {
    backgroundColor: '#151515',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalKeyboardView: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
    marginBottom: 12,
  },
  urlInputContainer: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  urlInput: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '400',
    minHeight: 24,
  },
  inputContainer: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textInput: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  helperText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 18,
  },
  toggleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  modalActions: {
    gap: 16,
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#374151',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  helpSection: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22C55E',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
});

export default WebhookSetupScreen;