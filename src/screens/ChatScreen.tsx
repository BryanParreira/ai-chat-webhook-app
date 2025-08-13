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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// Remove BlurView from react-native import - it doesn't exist there
// If you need BlurView, install: expo install expo-blur
// Then import: import { BlurView } from 'expo-blur';

import { useChatContext } from '../contexts/ChatContext';
import { useWebhookContext } from '../contexts/WebhookContext';
import { useThemeContext } from '../contexts/ThemeContext';
import SettingsScreen from './SettingsScreen';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Message interface to ensure type safety
interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  id: string;
  user?: string;
}

interface ChatScreenProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  onLogout?: () => void;
}

// Enhanced typing indicator with glow effects
const TypingIndicator: React.FC = () => {
  const [dot1] = useState(new Animated.Value(0));
  const [dot2] = useState(new Animated.Value(0));
  const [dot3] = useState(new Animated.Value(0));
  const [containerOpacity] = useState(new Animated.Value(0));
  const [glowAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    // Fade in with glow effect
    Animated.parallel([
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

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
      <Animated.View style={[
        styles.typingBubble,
        {
          shadowOpacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 0.8],
          }),
        }
      ]}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f0f23']}
          style={styles.typingBubbleGradient}
        >
          <View style={styles.typingContent}>
            <View style={styles.aiIndicator}>
              <LinearGradient
                colors={['#00d4ff', '#0099cc']}
                style={styles.aiDot}
              />
            </View>
            <Text style={styles.typingLabel}>AI is thinking</Text>
            <View style={styles.typingDots}>
              {[dot1, dot2, dot3].map((dot, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.typingDot,
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
                        outputRange: [0.3, 1],
                      }),
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
};

// Enhanced message bubble with better animations
const MessageBubble: React.FC<{
  message: Message;
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
          <LinearGradient
            colors={['#00d4ff', '#0099cc', '#006699']}
            style={styles.botAvatar}
          >
            <Ionicons name="sparkles" size={14} color="white" />
          </LinearGradient>
        )}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble
        ]}>
          {isUser ? (
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.userBubbleGradient}
            >
              <Text style={styles.userText}>{message.text}</Text>
              <View style={styles.messageFooter}>
                <Text style={styles.userTime}>
                  {formatTime(message.timestamp)}
                </Text>
                <Ionicons 
                  name="checkmark-done" 
                  size={14} 
                  color="rgba(255,255,255,0.8)" 
                  style={styles.messageStatus}
                />
              </View>
            </LinearGradient>
          ) : (
            <LinearGradient
              colors={['#1a1a2e', '#16213e', '#0f0f23']}
              style={styles.botBubbleGradient}
            >
              <Text style={styles.botText}>{message.text}</Text>
              <Text style={styles.botTime}>
                {formatTime(message.timestamp)}
              </Text>
            </LinearGradient>
          )}
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
  const { messages, addMessage, isTyping, setIsTyping } = useChatContext();
  const { webhooks } = useWebhookContext();
  const scrollViewRef = useRef<ScrollView>(null);
  const [headerOpacity] = useState(new Animated.Value(1));

  const triggerWebhooks = async (message: string) => {
    const activeWebhooks = webhooks.filter(w => w.active);
    
    for (const webhook of activeWebhooks) {
      try {
        let body = webhook.body || '{}';
        let headers = webhook.headers || '{}';
        
        body = body.replace(/\{\{message\}\}/g, message);
        body = body.replace(/\{\{user\}\}/g, user.name);
        body = body.replace(/\{\{timestamp\}\}/g, new Date().toISOString());
        
        let parsedHeaders = { 'Content-Type': 'application/json' };
        try {
          parsedHeaders = { ...parsedHeaders, ...JSON.parse(headers) };
        } catch (e) {
          console.warn('Failed to parse webhook headers:', e);
        }

        await fetch(webhook.url, {
          method: webhook.method || 'POST',
          headers: parsedHeaders,
          body: webhook.method.toUpperCase() === 'GET' ? undefined : body
        });
      } catch (error) {
        console.error('Webhook error:', error);
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      text: input.trim(),
      sender: 'user' as const,
      user: user.name,
      timestamp: new Date(),
      id: Date.now().toString(),
    };

    addMessage(userMessage);
    triggerWebhooks(input.trim());
    
    const messageToRespond = input.trim();
    setInput('');
    setInputHeight(44);
    setIsTyping(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    const responseDelay = 1200 + Math.random() * 2000;
    setTimeout(() => {
      const responses = [
        `I understand you mentioned: "${messageToRespond}". Let me help you with that!`,
        `That's fascinating! Regarding "${messageToRespond}", here's what I think...`,
        `Great question about "${messageToRespond}"! Let me break this down for you.`,
        `Thanks for sharing that. About "${messageToRespond}" - I have some insights to share.`,
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      addMessage({
        text: randomResponse,
        sender: 'bot',
        timestamp: new Date(),
        id: Date.now().toString(),
      });
      setIsTyping(false);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, responseDelay);
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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0f', '#1a1a2e', '#16213e']}
        style={styles.backgroundGradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" translucent />
          
          {/* Enhanced Header */}
          <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
            <LinearGradient
              colors={['rgba(10, 10, 15, 0.95)', 'rgba(26, 26, 46, 0.9)']}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <View style={styles.headerLeft}>
                  <LinearGradient
                    colors={['#00d4ff', '#c0ebf9ff']}
                    style={styles.headerAvatar}
                  >
                    <Ionicons name="sparkles" size={20} color="white" />
                  </LinearGradient>
                  <View style={styles.headerText}>
                    <Text style={styles.headerTitle}>Neural AI</Text>
                    <View style={styles.headerStatusContainer}>
                      <Animated.View style={[
                        styles.statusDot, 
                        isTyping && styles.statusDotTyping,
                        {
                          shadowOpacity: isTyping ? 0.8 : 0.4,
                        }
                      ]} />
                      <Text style={styles.headerSubtitle}>
                        {isTyping ? 'Processing...' : 'Ready to assist'}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={() => setShowSettings(true)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.headerButtonGradient}
                  >
                    <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>

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
                  <LinearGradient
                    colors={['#00d4ff', '#0099cc', '#ade1fcff']}
                    style={styles.emptyStateIcon}
                  >
                    <Ionicons name="sparkles" size={48} color="white" />
                  </LinearGradient>
                  <Text style={styles.emptyStateTitle}>Welcome to Neural AI</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    Start a conversation and experience the power of AI assistance
                  </Text>
                  <View style={styles.suggestionChips}>
                    {['Ask a question', 'Get help with coding', 'Creative writing'].map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionChip}
                        onPress={() => setInput(suggestion)}
                      >
                        <LinearGradient
                          colors={['rgba(102, 126, 234, 0.2)', 'rgba(118, 75, 162, 0.2)']}
                          style={styles.suggestionChipGradient}
                        >
                          <Text style={styles.suggestionChipText}>{suggestion}</Text>
                        </LinearGradient>
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
              
              {isTyping && <TypingIndicator />}
              
              <View style={{ height: 24 }} />
            </ScrollView>

            {/* Enhanced Input Container */}
            <View style={styles.inputSection}>
              <LinearGradient
                colors={['rgba(10, 10, 15, 0.98)', 'rgba(26, 26, 46, 0.95)']}
                style={styles.inputContainer}
              >
                <View style={[
                  styles.inputWrapper,
                  isInputFocused && styles.inputWrapperFocused
                ]}>
                  <LinearGradient
                    colors={isInputFocused ? 
                      ['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)'] : 
                      ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
                    }
                    style={[
                      styles.textInputContainer,
                      { height: inputHeight + 24 }
                    ]}
                  >
                    <TextInput
                      style={[styles.textInput, { height: inputHeight }]}
                      value={input}
                      onChangeText={setInput}
                      placeholder="Type your message..."
                      placeholderTextColor="#6b7280"
                      multiline
                      maxLength={2000}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      onContentSizeChange={handleContentSizeChange}
                      textAlignVertical="top"
                    />
                  </LinearGradient>
                  
                  <TouchableOpacity
                    onPress={sendMessage}
                    disabled={!input.trim() || isTyping}
                    activeOpacity={0.8}
                    style={styles.sendButtonContainer}
                  >
                    <LinearGradient
                      colors={
                        input.trim() && !isTyping
                          ? ['#667eea', '#4b4c4cff']
                          : ['rgba(75, 85, 99, 0.5)', 'rgba(55, 65, 81, 0.5)']
                      }
                      style={styles.sendButton}
                    >
                      <Ionicons 
                        name={isTyping ? "hourglass" : "send"} 
                        size={20} 
                        color="white" 
                        style={[
                          styles.sendIcon,
                          isTyping && { transform: [{ rotate: '45deg' }] }
                        ]}
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
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
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  backgroundGradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 6,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00ff88',
    marginRight: 8,
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 4,
  },
  statusDotTyping: {
    backgroundColor: '#ffaa00',
    shadowColor: '#ffaa00',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#a0a0a0',
    fontWeight: '500',
  },
  headerButton: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  headerButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    elevation: 12,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  emptyStateTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
    marginBottom: 32,
  },
  suggestionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  suggestionChip: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  suggestionChipGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },
  suggestionChipText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  messageWrapper: {
    marginBottom: 20,
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
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  userBubble: {
    borderBottomRightRadius: 8,
    marginLeft: 50,
  },
  botBubble: {
    borderBottomLeftRadius: 8,
    marginRight: 60,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  userBubbleGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  botBubbleGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  userText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 8,
  },
  botText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
    color: '#f0f0f0',
    marginBottom: 8,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  botTime: {
    fontSize: 12,
    color: '#a0a0a0',
    fontWeight: '500',
  },
  messageStatus: {
    marginLeft: 8,
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 8,
    elevation: 6,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  typingContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
    marginLeft: 44,
  },
  typingBubble: {
    borderRadius: 24,
    borderBottomLeftRadius: 8,
    elevation: 8,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    overflow: 'hidden',
  },
  typingBubbleGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  typingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIndicator: {
    marginRight: 12,
  },
  aiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingLabel: {
    color: '#a0a0a0',
    fontSize: 14,
    marginRight: 16,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00d4ff',
  },
  inputSection: {
    paddingTop: 16,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  inputWrapperFocused: {
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  textInputContainer: {
    flex: 1,
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textInput: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '400',
    textAlignVertical: 'center',
  },
  sendButtonContainer: {
    borderRadius: 26,
    overflow: 'hidden',
  },
  sendButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  sendIcon: {
    marginLeft: 2,
  },
});

export default ChatScreen;