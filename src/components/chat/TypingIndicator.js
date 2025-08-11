import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export const TypingIndicator = ({ style }) => {
  const { theme } = useTheme();
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      const duration = 600;
      const delay = 200;

      const createAnimation = (dot, delayTime) =>
        Animated.sequence([
          Animated.delay(delayTime),
          Animated.timing(dot, {
            toValue: 1,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ]);

      Animated.loop(
        Animated.parallel([
          createAnimation(dot1, 0),
          createAnimation(dot2, delay),
          createAnimation(dot3, delay * 2),
        ])
      ).start();
    };

    animate();
  }, [dot1, dot2, dot3]);

  const getDotStyle = (animatedValue) => [
    styles.dot,
    {
      backgroundColor: theme.textSecondary,
      opacity: animatedValue,
      transform: [
        {
          scale: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.5],
          }),
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={getDotStyle(dot1)} />
      <Animated.View style={getDotStyle(dot2)} />
      <Animated.View style={getDotStyle(dot3)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
});