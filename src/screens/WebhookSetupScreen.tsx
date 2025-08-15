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
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate URL format
    try {
      new URL(formData.url);
    } catch (error) {
      Alert.alert('Error', 'Please enter a valid URL (must start with http:// or https://)');
      return;
    }

    try {
      // Validate JSON headers
      JSON.parse(formData.headers);
    } catch (e) {
      Alert.alert('Error', 'Invalid JSON format in headers');
      return;
    }

    try {
      // Validate JSON body
      JSON.parse(formData.body);
    } catch (e) {
      Alert.alert('Error', 'Invalid JSON format in body');
      return;
    }

    try {
      if (editingId) {
        await updateWebhook(editingId, formData);
        Alert.alert('Success', 'Webhook updated successfully!');
      } else {
        await addWebhook(formData);
        Alert.alert('Success', 'Webhook created successfully!');
      }
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save webhook. Please try again.');
    }
  };

  const handleEdit = (webhook: any) => {
    setFormData({
      name: webhook.name,
      url: webhook.url,
      method: webhook.method,
      headers: typeof webhook.headers === 'string' ? webhook.headers : JSON.stringify(webhook.headers),
      body: webhook.body,
      active: webhook.active
    });
    setEditingId(webhook.id);
    setIsAdding(true);
  };

  const handleTest = async (webhook: any) => {
    setTestResults({ ...testResults, [webhook.id]: { testing: true } });
    try {
      const result = await testWebhook(webhook);
      setTestResults({ ...testResults, [webhook.id]: result });
      
      // Clear test result after 3 seconds
      setTimeout(() => {
        setTestResults(prev => {
          const newResults = { ...prev };
          delete newResults[webhook.id];
          return newResults;
        });
      }, 3000);
    } catch (error) {
      setTestResults({ 
        ...testResults, 
        [webhook.id]: { 
          testing: false, 
          success: false, 
          error: 'Test failed' 
        } 
      });
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

  const methodOptions: ('POST' | 'PUT' | 'PATCH')[] = ['POST', 'PUT', 'PATCH'];

  const selectMethod = () => {
    Alert.alert(
      'Select Method',
      'Choose HTTP method for this webhook',
      methodOptions.map(method => ({
        text: method,
        onPress: () => setFormData({ ...formData, method })
      }))
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Webhook Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={22} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add Webhook Button */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            onPress={() => setIsAdding(true)}
            style={styles.addButton}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Webhook</Text>
          </TouchableOpacity>
        </View>

        {/* Webhook List */}
        <View style={styles.webhooksList}>
          {webhooks.map((webhook) => (
            <View key={webhook.id} style={styles.webhookCard}>
              <View style={styles.webhookHeader}>
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
                    disabled={testResults[webhook.id]?.testing}
                    style={[styles.actionButton, styles.testButton]}
                  >
                    <Ionicons 
                      name={testResults[webhook.id]?.testing ? "hourglass" : "checkmark"} 
                      size={16} 
                      color="#3B82F6" 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => handleEdit(webhook)}
                    style={[styles.actionButton, styles.editButton]}
                  >
                    <Ionicons name="settings-outline" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => handleDelete(webhook)}
                    style={[styles.actionButton, styles.deleteButton]}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.webhookUrl}>{webhook.url}</Text>
              <Text style={styles.webhookMeta}>
                {webhook.method} • Created {new Date(webhook.createdAt || Date.now()).toLocaleDateString()}
              </Text>
              
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
                      ? 'Testing webhook...' 
                      : testResults[webhook.id].success 
                        ? `✓ Test successful (${testResults[webhook.id].status})` 
                        : `✗ Test failed: ${testResults[webhook.id].error}`
                    }
                  </Text>
                </View>
              )}
            </View>
          ))}
          
          {webhooks.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="link-outline" size={48} color="#6B7280" />
              <Text style={styles.emptyStateTitle}>No webhooks configured</Text>
              <Text style={styles.emptyStateSubtitle}>
                Add your first webhook to get started
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Webhook Modal */}
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
              {editingId ? 'Edit Webhook' : 'Add New Webhook'}
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
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name *</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={formData.name}
                    onChangeText={(text) => setFormData({...formData, name: text})}
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
                    onChangeText={(text) => setFormData({...formData, url: text})}
                    placeholder="https://your-webhook-url.com/endpoint"
                    placeholderTextColor="#6B7280"
                    keyboardType="url"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Method and Active Toggle */}
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
                    onValueChange={(value) => setFormData({...formData, active: value})}
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
                    onChangeText={(text) => setFormData({...formData, headers: text})}
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
                    onChangeText={(text) => setFormData({...formData, body: text})}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
                <Text style={styles.helperText}>
                  Use {"{{message}}"} for message content, {"{{user}}"} for username, {"{{timestamp}}"} for timestamp
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                  <Text style={styles.submitButtonText}>
                    {editingId ? 'Update' : 'Create'} Webhook
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={resetForm} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  addButtonContainer: {
    paddingVertical: 20,
  },
  addButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  webhooksList: {
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
  webhookHeader: {
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
  testButton: {},
  editButton: {},
  deleteButton: {},
  webhookUrl: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  webhookMeta: {
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
    fontSize: 12,
    color: '#E5E7EB',
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  modalHeader: {
    backgroundColor: '#151515',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalKeyboardView: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
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
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textInput: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  methodContainer: {
    flex: 1,
  },
  methodSelector: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textArea: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlignVertical: 'top',
    minHeight: 60,
  },
  helperText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 16,
  },
  modalActions: {
    paddingVertical: 20,
    gap: 12,
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#374151',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default WebhookSetupScreen;