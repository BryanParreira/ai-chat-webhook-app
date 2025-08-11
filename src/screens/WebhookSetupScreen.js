import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TextInput } from '../components/ui/TextInput';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useTheme } from '../contexts/ThemeContext';
import { useWebhook } from '../hooks/useWebhook';
import { useForm } from '../hooks/useForm';
import { validators } from '../utils/validators';

export default function WebhookSetupScreen({ navigation }) {
  const { theme } = useTheme();
  const { 
    isLoading, 
    error, 
    connectionStatus, 
    testConnection, 
    saveConfig, 
    getConfig 
  } = useWebhook();

  const {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    handleSubmit,
    reset,
  } = useForm(
    {
      url: '',
      apiKey: '',
      timeout: '30000',
    },
    {
      url: [
        validators.required('Webhook URL is required'),
        validators.url('Please enter a valid URL'),
      ],
      timeout: [
        validators.required('Timeout is required'),
        validators.number('Timeout must be a number'),
        validators.range(1000, 120000, 'Timeout must be between 1 and 120 seconds'),
      ],
    }
  );

  useEffect(() => {
    // Load existing configuration
    const config = getConfig();
    if (config.url) {
      setValue('url', config.url);
      setValue('apiKey', config.apiKey || '');
      setValue('timeout', config.timeout?.toString() || '30000');
    }
  }, []);

  const handleSave = async (formValues) => {
    const config = {
      url: formValues.url,
      apiKey: formValues.apiKey,
      timeout: parseInt(formValues.timeout),
      headers: formValues.apiKey ? {
        'Authorization': `Bearer ${formValues.apiKey}`,
        'Content-Type': 'application/json',
      } : {
        'Content-Type': 'application/json',
      },
    };

    const success = await saveConfig(config);
    if (success) {
      Alert.alert(
        'Success',
        'Webhook configuration saved successfully!',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      Alert.alert('Error', 'Failed to save webhook configuration');
    }
  };

  const handleTest = async () => {
    const isValid = await handleSubmit(async () => {
      const result = await testConnection();
      
      if (result.success) {
        Alert.alert('Success', 'Webhook connection test successful!');
      } else {
        Alert.alert('Connection Failed', result.message);
      }
    });
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return theme.success;
      case 'error': return theme.error;
      case 'connecting': return theme.warning;
      default: return theme.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'error': return 'Connection Failed';
      case 'connecting': return 'Testing...';
      default: return 'Not Connected';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Webhook Setup
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Configure your API endpoint for chat responses
          </Text>
        </View>

        {/* Connection Status */}
        <Card style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: theme.text }]}>
              Status:
            </Text>
            <View style={styles.statusIndicator}>
              <View 
                style={[
                  styles.statusDot, 
                  { backgroundColor: getStatusColor() }
                ]} 
              />
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Configuration Form */}
        <Card style={styles.formCard}>
          <TextInput
            label="Webhook URL *"
            placeholder="https://your-api.com/webhook"
            value={values.url}
            onChangeText={(text) => setValue('url', text)}
            onBlur={() => setFieldTouched('url')}
            error={touched.url ? errors.url : null}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            label="API Key (Optional)"
            placeholder="Enter your API key"
            value={values.apiKey}
            onChangeText={(text) => setValue('apiKey', text)}
            onBlur={() => setFieldTouched('apiKey')}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            label="Timeout (ms) *"
            placeholder="30000"
            value={values.timeout}
            onChangeText={(text) => setValue('timeout', text)}
            onBlur={() => setFieldTouched('timeout')}
            error={touched.timeout ? errors.timeout : null}
            keyboardType="numeric"
          />

          {error && (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: theme.error }]}>
                {error}
              </Text>
            </View>
          )}
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Test Connection"
            variant="secondary"
            onPress={handleTest}
            disabled={isLoading || !values.url}
            loading={isLoading}
            style={styles.button}
          />
          
          <Button
            title="Save Configuration"
            variant="primary"
            onPress={() => handleSubmit(handleSave)}
            disabled={isLoading}
            style={styles.button}
          />
        </View>

        {/* Help Section */}
        <Card style={styles.helpCard}>
          <Text style={[styles.helpTitle, { color: theme.text }]}>
            How it works
          </Text>
          <Text style={[styles.helpText, { color: theme.textSecondary }]}>
            Your webhook will receive POST requests with the user's message and should respond with JSON containing a "message" field.
          </Text>
          <View style={styles.codeExample}>
            <Text style={[styles.codeText, { color: theme.textSecondary }]}>
              Expected Response Format:
            </Text>
            <Text style={[styles.code, { color: theme.text, backgroundColor: theme.inputBackground }]}>
              {`{\n  "message": "Your AI response here"\n}`}
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'JetBrains Mono',
  },
  statusCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'JetBrains Mono',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'JetBrains Mono',
  },
  formCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  errorContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'JetBrains Mono',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  button: {
    marginBottom: 12,
  },
  helpCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'JetBrains Mono',
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: 'JetBrains Mono',
  },
  codeExample: {
    marginTop: 8,
  },
  codeText: {
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'JetBrains Mono',
  },
  code: {
    fontSize: 12,
    fontFamily: 'JetBrains Mono',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#404040',
  },
});