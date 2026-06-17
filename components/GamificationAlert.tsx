import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Colors, BorderRadius, FontSize, Spacing } from '../constants/theme';
import { GamificationMessage } from '../types/nutrition';

interface GamificationAlertProps {
  message: GamificationMessage;
}

export function GamificationAlert({ message }: GamificationAlertProps) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.08, { duration: 300, easing: Easing.out(Easing.back(2)) }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    opacity.value = withTiming(1, { duration: 250 });
    glowOpacity.value = withSequence(
      withTiming(1, { duration: 400 }),
      withTiming(0.4, { duration: 600 })
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        { borderColor: message.color + '60' },
        containerStyle,
      ]}
    >
      <Animated.View
        style={[styles.glow, { backgroundColor: message.color }, glowStyle]}
        pointerEvents="none"
      />

      <Text style={[styles.title, { color: message.color }]}>
        {message.title}
      </Text>
      <Text style={styles.description}>{message.description}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -40,
    left: -40,
    right: -40,
    height: 80,
    borderRadius: 40,
    opacity: 0.12,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
});
