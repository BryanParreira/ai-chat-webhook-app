import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export const MessageBubble = ({ message, index = 0, style }) => {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim, index]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const bubbleStyle = [
    styles.bubble,
    {
      backgroundColor: message.isUser ? theme.userBubble : theme.aiBubble,
      alignSelf: message.isUser ? 'flex-end' : 'flex-start',
      borderBottomRightRadius: message.isUser ? 8 : 20,
      borderBottomLeftRadius: message.isUser ? 20 : 8,
      borderWidth: message.isUser ? 0 : 1,
      borderColor: theme.border,
    },
    style,
  ];

  const textStyle = [
    styles.text,
    {
      color: message.isUser ? '#ffffff' : theme.text,
    },
  ];

  const timestampStyle = [
    styles.timestamp,
    {
      color: message.isUser ? 'rgba(255,255,255,0.7)' : theme.textSecondary,
      textAlign: message.isUser ? 'right' : 'left',
    },
  ];

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }}
    >
      <View style={bubbleStyle}>
        <Text style={textStyle}>{message.text}</Text>
        <Text style={timestampStyle}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 20,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'JetBrains Mono',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
    fontFamily: 'JetBrains Mono',
  },
});