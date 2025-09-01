import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useChatContext } from '../contexts/ChatContext';
import { useWebhookContext } from '../contexts/WebhookContext';
import SettingsScreen from './SettingsScreen';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ChatScreenProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  onLogout?: () => void;
}

const TypingIndicator: React.FC<{ source?: 'ai' | 'webhook' }> = ({ source = 'ai' }) => {
  const [dot1] = useState(new Animated.Value(0));
  const [dot2] = useState(new Animated.Value(0));
  const [dot3] = useState(new Animated.Value(0));
  const [containerOpacity] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(containerOpacity, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 600,
            easing: Easing.bezier(0.68, -0.55, 0.265, 1.55),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 600,
            easing: Easing.bezier(0.68, -0.55, 0.265, 1.55),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  return (
    <Animated.View style={[styles.typingContainer, { opacity: containerOpacity }]}>
      <View style={styles.typingBubble}>
        <View style={styles.typingContent}>
          <View style={styles.aiIndicator}>
            <View style={[
              styles.aiDot,
              source === 'webhook' && styles.webhookDot
            ]} />
          </View>
          <Text style={styles.typingLabel}>
            {source === 'webhook' ? 'Processing workflow...' : 'AI is thinking'}
          </Text>
          <View style={styles.typingDots}>
            {[dot1, dot2, dot3].map((dot, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.typingDot,
                  source === 'webhook' && styles.webhookTypingDot,
                  {
                    transform: [
                      {
                        scale: dot.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.6, 1.4],
                        }),
                      },
                      {
                        translateY: dot.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -6],
                        }),
                      },
                    ],
                    opacity: dot.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.4, 1],
                    }),
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const MessageBubble: React.FC<{
  message: any;
  isUser: boolean;
}> = ({ message, isUser }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(isUser ? 80 : -80));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSourceIcon = () => {
    if (isUser) return null;
    
    switch (message.source) {
      case 'webhook':
        return <Ionicons name="link" size={12} color="#3B82F6" />;
      case 'n8n':
        return <Ionicons name="flash" size={12} color="#3B82F6" />;
      default:
        return <Ionicons name="sparkles" size={12} color="#FF6B35" />;
    }
  };

  const getSourceLabel = () => {
    if (isUser || !message.source) return null;
    
    switch (message.source) {
      case 'webhook':
        return 'via webhook';
      case 'n8n':
        return 'via n8n';
      case 'ai':
        return 'AI';
      default:
        return message.source;
    }
  };

  return (
    <Animated.View
      style={[
        styles.messageWrapper,
        isUser ? styles.userMessageWrapper : styles.botMessageWrapper,
        {
          opacity: fadeAnim,
          transform: [
            { translateX: slideAnim },
            { scale: scaleAnim }
          ],
        },
      ]}
    >
      <View style={styles.messageBubbleContainer}>
        {!isUser && (
          <View style={[
            styles.botAvatar,
            message.source === 'webhook' && styles.webhookAvatar,
            message.source === 'n8n' && styles.n8nAvatar
          ]}>
            {getSourceIcon()}
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble,
          (message.source === 'webhook' || message.source === 'n8n') && styles.webhookBubble
        ]}>
          <Text style={isUser ? styles.userText : styles.botText}>
            {message.text}
          </Text>
          <View style={styles.messageFooter}>
            <View style={styles.messageFooterLeft}>
              <Text style={isUser ? styles.userTime : styles.botTime}>
                {formatTime(message.timestamp)}
              </Text>
              {!isUser && getSourceLabel() && (
                <Text style={styles.sourceLabel}>
                  {getSourceLabel()}
                </Text>
              )}
            </View>
            {isUser && (
              <Ionicons 
                name="checkmark-done" 
                size={12} 
                color="#6B7280" 
                style={styles.messageStatus}
              />
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const ChatScreen: React.FC<ChatScreenProps> = ({ user, onLogout = () => {} }) => {
  const [input, setInput] = useState('');
  const [inputHeight, setInputHeight] = useState(44);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [webhookTyping, setWebhookTyping] = useState(false);
  
  const { messages, addMessage, isTyping, setIsTyping } = useChatContext();
  const { triggerWebhooks, webhooks } = useWebhookContext();
  const scrollViewRef = useRef<ScrollView>(null);

  const processWebhookResponse = (responseData: any): string => {
    if (!responseData) return '';
    
    if (typeof responseData === 'string') {
      return responseData.trim();
    }
    
    // Check common response fields
    if (responseData.message) return responseData.message;
    if (responseData.text) return responseData.text;
    if (responseData.response) return responseData.response;
    if (responseData.content) return responseData.content;
    if (responseData.reply) return responseData.reply;
    
    // If it's an object, try to stringify it nicely
    if (typeof responseData === 'object') {
      try {
        return JSON.stringify(responseData, null, 2);
      } catch {
        return String(responseData);
      }
    }
    
    return String(responseData);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      text: input.trim(),
      sender: 'user' as const,
      user: user.name,
    };

    addMessage(userMessage);
    
    const messageToRespond = input.trim();
    const messageId = `msg-${Date.now()}`;
    setInput('');
    setInputHeight(44);

    const activeWebhooks = webhooks.filter(w => w.active);
    const hasWebhooks = activeWebhooks.length > 0;

    if (hasWebhooks) {
      setWebhookTyping(true);

      try {
        console.log(`Triggering ${activeWebhooks.length} active webhooks...`);
        
        // Trigger webhooks and get responses
        const webhookResponses = await triggerWebhooks(
          messageToRespond, 
          user.name, 
          'general',
          messageId
        );

        console.log('Webhook responses:', webhookResponses);

        // Process successful webhook responses
        let hasValidResponse = false;
        
        webhookResponses.forEach((response, index) => {
          if (response.success && response.responseData) {
            const messageText = processWebhookResponse(response.responseData);
            
            if (messageText && messageText.trim()) {
              const webhook = activeWebhooks[index];
              const source = webhook.name.toLowerCase().includes('n8n') || 
                           webhook.url.includes('n8n') ? 'n8n' : 'webhook';
              
              console.log(`Adding webhook response from ${webhook.name}:`, messageText);
              
              addMessage({
                text: messageText,
                sender: 'bot',
                source: source,
                webhookId: webhook.id,
              });
              
              hasValidResponse = true;
            }
          } else if (!response.success) {
            console.error(`Webhook failed:`, response.error);
          }
        });

        if (!hasValidResponse) {
          console.log('No valid webhook responses, showing fallback message');
          addMessage({
            text: "I received your message and sent it to the configured workflows, but didn't get a response back. The workflows might be processing in the background.",
            sender: 'bot',
            source: 'ai',
          });
        }

      } catch (error) {
        console.error('Failed to trigger webhooks:', error);
        addMessage({
          text: "There was an error sending your message to the configured workflows. Please check your webhook settings.",
          sender: 'bot',
          source: 'ai',
        });
      } finally {
        setWebhookTyping(false);
      }
    } else {
      // Fallback to AI response if no webhooks
      setIsTyping(true);
      
      setTimeout(() => {
        const responses = [
          `I understand you mentioned: "${messageToRespond}". Let me help you with that!`,
          `That's interesting! Regarding "${messageToRespond}", here's what I think...`,
          `Great question about "${messageToRespond}"! Let me break this down for you.`,
          `Thanks for sharing that. About "${messageToRespond}" - I have some insights to share.`,
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        addMessage({
          text: randomResponse,
          sender: 'bot',
          source: 'ai',
        });
        setIsTyping(false);
      }, 1500);
    }

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    setInputHeight(Math.max(44, Math.min(120, height)));
  };

  const showWebhookInfo = () => {
    const activeCount = webhooks.filter(w => w.active).length;
    
    Alert.alert(
      'Webhook Status',
      activeCount > 0 
        ? `${activeCount} webhook${activeCount !== 1 ? 's' : ''} active. Your messages will trigger workflows and responses will appear in chat.`
        : 'No active webhooks. Messages will be handled by AI only.',
      [
        { text: 'Settings', onPress: () => setShowSettings(true) },
        { text: 'OK' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" translucent />
        
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.headerAvatar}>
                <Ionicons name="sparkles" size={20} color="#FF6B35" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Neural AI</Text>
                <View style={styles.headerStatusContainer}>
                  <View style={[
                    styles.statusDot, 
                    (isTyping || webhookTyping) && styles.statusDotTyping,
                    webhookTyping && styles.statusDotWebhook
                  ]} />
                  <Text style={styles.headerSubtitle}>
                    {webhookTyping ? 'Processing workflow...' : 
                     isTyping ? 'Thinking...' : 'Online'}
                  </Text>
                  {webhooks.filter(w => w.active).length > 0 && (
                    <TouchableOpacity 
                      style={styles.webhookIndicator}
                      onPress={showWebhookInfo}
                    >
                      <Ionicons name="link" size={12} color="#3B82F6" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowSettings(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length === 0 && (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <Ionicons name="sparkles" size={32} color="#FF6B35" />
                </View>
                <Text style={styles.emptyStateTitle}>Welcome to Neural AI</Text>
                <Text style={styles.emptyStateSubtitle}>
                  {webhooks.filter(w => w.active).length > 0
                    ? 'Your messages will trigger automated workflows and receive instant responses'
                    : 'Start a conversation and experience the power of AI assistance'
                  }
                </Text>
                <View style={styles.suggestionChips}>
                  {['Ask a question', 'Get help with coding', 'Creative writing'].map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionChip}
                      onPress={() => setInput(suggestion)}
                    >
                      <Text style={styles.suggestionChipText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isUser={message.sender === 'user'}
              />
            ))}
            
            {(isTyping || webhookTyping) && (
              <TypingIndicator source={webhookTyping ? 'webhook' : 'ai'} />
            )}
            
            <View style={{ height: 24 }} />
          </ScrollView>

          {/* Enhanced Input Container */}
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <View style={[
                styles.inputWrapper,
                isInputFocused && styles.inputWrapperFocused
              ]}>
                <View style={[
                  styles.textInputContainer,
                  { height: inputHeight + 24 },
                  isInputFocused && styles.textInputContainerFocused
                ]}>
                  <TextInput
                    style={[styles.textInput, { height: inputHeight }]}
                    value={input}
                    onChangeText={setInput}
                    placeholder="Type your message..."
                    placeholderTextColor="#6B7280"
                    multiline
                    maxLength={2000}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    onContentSizeChange={handleContentSizeChange}
                    textAlignVertical="top"
                  />
                </View>
                
                <TouchableOpacity
                  onPress={sendMessage}
                  disabled={!input.trim() || isTyping || webhookTyping}
                  activeOpacity={0.8}
                  style={[
                    styles.sendButton,
                    (input.trim() && !isTyping && !webhookTyping) && styles.sendButtonActive
                  ]}
                >
                  <Ionicons 
                    name={isTyping || webhookTyping ? "hourglass" : "send"} 
                    size={18} 
                    color={input.trim() && !isTyping && !webhookTyping ? "#FFFFFF" : "#6B7280"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Settings Modal */}
        <Modal
          visible={showSettings}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowSettings(false)}
        >
          <SettingsScreen
            user={user}
            onClose={() => setShowSettings(false)}
            onLogout={() => {
              setShowSettings(false);
              onLogout();
            }}
          />
        </Modal>
      </SafeAreaView>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusDotTyping: {
    backgroundColor: '#F59E0B',
  },
  statusDotWebhook: {
    backgroundColor: '#3B82F6',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  webhookIndicator: {
    marginLeft: 8,
    padding: 2,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: screenHeight * 0.15,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
    marginBottom: 32,
  },
  suggestionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  suggestionChipText: {
    fontSize: 12,
    color: '#E5E7EB',
    fontWeight: '500',
  },
  messageWrapper: {
    marginBottom: 16,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  botMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: screenWidth * 0.8,
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: '#FF6B35',
    borderBottomRightRadius: 4,
    marginLeft: 40,
  },
  botBubble: {
    backgroundColor: '#1F1F1F',
    borderBottomLeftRadius: 4,
    marginRight: 40,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  webhookBubble: {
    borderColor: '#3B82F6',
  },
  userText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  botText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
    color: '#E5E7EB',
    marginBottom: 4,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '400',
  },
  botTime: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  sourceLabel: {
    fontSize: 9,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  messageStatus: {
    marginLeft: 4,
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  webhookAvatar: {
    borderColor: '#3B82F6',
  },
  n8nAvatar: {
    borderColor: '#3B82F6',
  },
  typingContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
    marginLeft: 36,
  },
  typingBubble: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  typingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIndicator: {
    marginRight: 8,
  },
  aiDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B35',
  },
  webhookDot: {
    backgroundColor: '#3B82F6',
  },
  typingLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginRight: 12,
    fontStyle: 'italic',
    fontWeight: '400',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B35',
  },
  webhookTypingDot: {
    backgroundColor: '#3B82F6',
  },
  inputSection: {
    backgroundColor: '#151515',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#262626',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputWrapperFocused: {},
  textInputContainer: {
    flex: 1,
    backgroundColor: '#1F1F1F',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    minHeight: 44,
  },
  textInputContainerFocused: {
    borderColor: '#FF6B35',
  },
  textInput: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '400',
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  sendButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
});

export default ChatScreen;