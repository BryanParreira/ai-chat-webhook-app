import React, { useRef, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { useTheme } from '../contexts/ThemeContext';

export const MessageList = ({ messages, isTyping, style }) => {
  const { theme } = useTheme();
  const scrollViewRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={[styles.container, { backgroundColor: theme.background }, style]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          index={index}
        />
      ))}
      {isTyping && (
        <MessageBubble
          message={{
            id: 'typing',
            text: '',
            isUser: false,
            timestamp: new Date(),
          }}
          style={styles.typingBubble}
        >
          <TypingIndicator />
        </MessageBubble>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  typingBubble: {
    paddingVertical: 8,
  },
});