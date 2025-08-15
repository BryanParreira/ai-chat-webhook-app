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

import { useChatContext } from '../contexts/ChatContext';
import { useWebhookContext } from '../contexts/WebhookContext';
import { useThemeContext } from '../contexts/ThemeContext';
import SettingsScreen from './SettingsScreen';
import { FileX } from 'lucide-react';

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

// Enhanced typing indicator with premium dark styling
const TypingIndicator: React.FC = () => {
  const [dot1] = useState(new Animated.Value(0));
  const [dot2] = useState(new Animated.Value(0));
  const [dot3] = useState(new Animated.Value(0));
  const [containerOpacity] = useState(new Animated.Value(0));
  const [glowAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
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
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
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
      <View style={styles.typingBubble}>
        <View style={styles.typingContent}>
          <View style={styles.aiIndicator}>
            <View style={styles.aiDot} />
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

// Enhanced message bubble with refined dark styling
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
          <View style={styles.botAvatar}>
            <Ionicons name="sparkles" size={14} color="#FF6B35" />
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble
        ]}>
          <Text style={isUser ? styles.userText : styles.botText}>
            {message.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={isUser ? styles.userTime : styles.botTime}>
              {formatTime(message.timestamp)}
            </Text>
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
  const { messages, addMessage, isTyping, setIsTyping } = useChatContext();
  const { triggerWebhooks } = useWebhookContext();
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      text: input.trim(),
      sender: 'user' as const,
      user: user.name,
    };

    addMessage(userMessage);
    
    const messageToRespond = input.trim();
    setInput('');
    setInputHeight(44);
    setIsTyping(true);

    // Trigger webhooks with the enhanced context
    try {
      await triggerWebhooks(messageToRespond, user.name);
    } catch (error) {
      console.error('Failed to trigger webhooks:', error);
    }

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
                    isTyping && styles.statusDotTyping
                  ]} />
                  <Text style={styles.headerSubtitle}>
                    {isTyping ? 'Processing...' : 'Online'}
                  </Text>
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
                  Start a conversation and experience the power of AI assistance
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
            
            {isTyping && <TypingIndicator />}
            
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
                  disabled={!input.trim() || isTyping}
                  activeOpacity={0.8}
                  style={[
                    styles.sendButton,
                    (input.trim() && !isTyping) && styles.sendButtonActive
                  ]}
                >
                  <Ionicons 
                    name={isTyping ? "hourglass" : "send"} 
                    size={18} 
                    color={input.trim() && !isTyping ? "#FFFFFF" : "#6B7280"}
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
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
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