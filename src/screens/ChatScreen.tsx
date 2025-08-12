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
} from 'react-native';
import { useChatContext } from '../contexts/ChatContext';
import { useWebhookContext } from '../contexts/WebhookContext';
import { useThemeContext } from '../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

interface ChatScreenProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
}

// Enhanced typing indicator with smooth animations
const TypingIndicator: React.FC = () => {
  const [dot1] = useState(new Animated.Value(0));
  const [dot2] = useState(new Animated.Value(0));
  const [dot3] = useState(new Animated.Value(0));
  const [containerOpacity] = useState(new Animated.Value(0));

  React.useEffect(() => {
    // Fade in the typing indicator
    Animated.timing(containerOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 500,
            easing: Easing.bezier(0.68, -0.55, 0.265, 1.55),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 500,
            easing: Easing.bezier(0.68, -0.55, 0.265, 1.55),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, [dot1, dot2, dot3, containerOpacity]);

  return (
    <Animated.View style={[styles.typingContainer, { opacity: containerOpacity }]}>
      <View style={styles.typingBubble}>
        <Text style={styles.typingLabel}>AI is typing</Text>
        <View style={styles.typingDots}>
          <Animated.View
            style={[
              styles.typingDot,
              {
                transform: [
                  {
                    scale: dot1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  },
                  {
                    translateY: dot1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -4],
                    }),
                  },
                ],
                opacity: dot1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 1],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.typingDot,
              {
                transform: [
                  {
                    scale: dot2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  },
                  {
                    translateY: dot2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -4],
                    }),
                  },
                ],
                opacity: dot2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 1],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.typingDot,
              {
                transform: [
                  {
                    scale: dot3.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  },
                  {
                    translateY: dot3.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -4],
                    }),
                  },
                ],
                opacity: dot3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 1],
                }),
              },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
};

// Message bubble component
const MessageBubble: React.FC<{
  message: any;
  isUser: boolean;
  colors: any;
}> = ({ message, isUser, colors }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(isUser ? 50 : -50));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
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
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <View style={styles.messageBubbleContainer}>
        <View
          style={[
            styles.messageBubble,
            isUser
              ? [styles.userBubble, { backgroundColor: colors.primary }]
              : [styles.botBubble, { backgroundColor: colors.surface, borderColor: colors.border }]
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isUser ? '#ffffff' : colors.text }
            ]}
          >
            {message.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                { color: isUser ? 'rgba(255,255,255,0.8)' : colors.textSecondary }
              ]}
            >
              {formatTime(message.timestamp)}
            </Text>
            {isUser && (
              <Text style={styles.messageStatus}>✓✓</Text>
            )}
          </View>
        </View>
        {!isUser && (
          <View style={[styles.botAvatar, { backgroundColor: colors.accent }]}>
            <Text style={styles.botAvatarText}>🤖</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const ChatScreen: React.FC<ChatScreenProps> = ({ user }) => {
  const [input, setInput] = useState('');
  const [inputHeight, setInputHeight] = useState(40);
  const { messages, addMessage, isTyping, setIsTyping } = useChatContext();
  const { webhooks } = useWebhookContext();
  const { colors, isDark } = useThemeContext();
  const scrollViewRef = useRef<ScrollView>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

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
      user: user.name
    };

    addMessage(userMessage);
    triggerWebhooks(input.trim());
    
    const messageToRespond = input.trim();
    setInput('');
    setInputHeight(40);
    setIsTyping(true);

    // Scroll to bottom after sending
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate more realistic bot response with varying delay
    const responseDelay = 1000 + Math.random() * 2000;
    setTimeout(() => {
      const responses = [
        `I understand you said: "${messageToRespond}". How can I help you further?`,
        `Thanks for sharing that with me! Is there anything specific you'd like to know?`,
        `That's interesting! Let me think about "${messageToRespond}" for a moment...`,
        `I've processed your message about "${messageToRespond}". What would you like to explore next?`,
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      addMessage({
        text: randomResponse,
        sender: 'bot'
      });
      setIsTyping(false);
      
      // Scroll to bottom after bot response
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, responseDelay);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    setInputHeight(Math.max(40, Math.min(120, height)));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background} 
      />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <View style={[styles.userAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.userAvatarText}>👤</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>AI Assistant</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {isTyping ? 'Typing...' : 'Online'}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.background }]}>
            <Text style={styles.headerButtonText}>⋯</Text>
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
              <Text style={styles.emptyStateEmoji}>💬</Text>
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                Start a conversation
              </Text>
              <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
                Send a message to begin chatting with the AI assistant
              </Text>
            </View>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isUser={message.sender === 'user'}
              colors={colors}
            />
          ))}
          
          {isTyping && <TypingIndicator />}
          
          {/* Bottom padding for better scrolling */}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Input Container */}
        <View style={[
          styles.inputContainer, 
          { 
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            shadowColor: colors.text,
            ...(isInputFocused && {
              borderTopColor: colors.primary,
              borderTopWidth: 2,
            })
          }
        ]}>
          <View style={styles.inputWrapper}>
            <View style={[
              styles.textInputContainer,
              {
                backgroundColor: colors.background,
                borderColor: isInputFocused ? colors.primary : colors.border,
                height: inputHeight + 16,
              }
            ]}>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    color: colors.text,
                    height: inputHeight,
                  }
                ]}
                value={input}
                onChangeText={setInput}
                placeholder="Type a message..."
                placeholderTextColor={colors.textSecondary}
                multiline
                maxLength={1000}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onContentSizeChange={handleContentSizeChange}
                textAlignVertical="top"
              />
            </View>
            
            <TouchableOpacity
              onPress={sendMessage}
              style={[
                styles.sendButton,
                { 
                  backgroundColor: input.trim() ? colors.primary : colors.border,
                  transform: [{ scale: input.trim() ? 1 : 0.9 }],
                }
              ]}
              disabled={!input.trim()}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.sendButtonText,
                { opacity: input.trim() ? 1 : 0.5 }
              ]}>
                ↗️
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 18,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 16,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userBubble: {
    borderBottomRightRadius: 4,
    marginLeft: 40,
  },
  botBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    marginRight: 50,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  messageTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  messageStatus: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 8,
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 4,
  },
  botAvatarText: {
    fontSize: 14,
  },
  typingContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  typingBubble: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  typingLabel: {
    color: '#9ca3af',
    fontSize: 14,
    marginRight: 12,
    fontStyle: 'italic',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8b5cf6',
    marginHorizontal: 2,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    elevation: 8,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInputContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 16,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sendButtonText: {
    fontSize: 20,
  },
});

export default ChatScreen;