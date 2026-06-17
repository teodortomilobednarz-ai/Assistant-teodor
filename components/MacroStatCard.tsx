import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors, FontSize, BorderRadius, Spacing } from '../constants/theme';

interface MacroStatCardProps {
  label: string;
  value: number;
  unit: string;
  color: string;
  glowColor: string;
  icon: string;
  delay?: number;
}

export function MacroStatCard({
  label,
  value,
  unit,
  color,
  glowColor,
  icon,
  delay = 0,
}: MacroStatCardProps) {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 14, stiffness: 120 })
    );
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 14, stiffness: 120 })
    );
  }, [delay]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.card, cardStyle, { borderColor: color + '40' }]}>
      <View style={[styles.glowDot, { backgroundColor: color, shadowColor: color }]} />
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.unit}>{unit}</Text>
      <Text style={[styles.label, { color: color + 'CC' }]}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    marginHorizontal: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  glowDot: {
    position: 'absolute',
    top: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.15,
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  icon: {
    fontSize: 22,
    marginBottom: 6,
  },
  value: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    lineHeight: 32,
  },
  unit: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
