import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Colors, FontSize } from '../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CalorieRingProps {
  current: number;
  goal: number;
}

const SIZE = 180;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CalorieRing({ current, goal }: CalorieRingProps) {
  const progress = useSharedValue(0);
  const percentage = Math.min((current / goal) * 100, 100);
  const remaining = Math.max(goal - current, 0);

  useEffect(() => {
    progress.value = withDelay(
      200,
      withTiming(percentage / 100, {
        duration: 1500,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [percentage]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={Colors.border}
          strokeWidth={STROKE}
          fill="none"
        />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={Colors.neonPurple}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>

      <View style={styles.center}>
        <Text style={styles.label}>ÉNERGIE</Text>
        <Text style={styles.current}>{current}</Text>
        <Text style={styles.unit}>kcal</Text>
        <View style={styles.divider} />
        <Text style={styles.remaining}>{remaining} restant</Text>
      </View>

      <View style={styles.glow} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  svg: {
    position: 'absolute',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 2,
  },
  current: {
    fontSize: 38,
    color: Colors.neonPurple,
    fontWeight: '900',
    lineHeight: 42,
    fontVariant: ['tabular-nums'],
    textShadowColor: Colors.neonPurple,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  unit: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 1,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 6,
  },
  remaining: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  glow: {
    position: 'absolute',
    width: SIZE * 0.6,
    height: SIZE * 0.6,
    borderRadius: SIZE * 0.3,
    backgroundColor: Colors.neonPurpleGlow,
    shadowColor: Colors.neonPurple,
    shadowOpacity: 0.5,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
});
