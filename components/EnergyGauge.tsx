import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Colors, FontSize, BorderRadius } from '../constants/theme';

interface EnergyGaugeProps {
  label: string;
  current: number;
  max: number;
  unit: string;
  color: string;
  glowColor: string;
  delay?: number;
}

export function EnergyGauge({
  label,
  current,
  max,
  unit,
  color,
  glowColor,
  delay = 0,
}: EnergyGaugeProps) {
  const progress = useSharedValue(0);
  const percentage = Math.min((current / max) * 100, 100);
  const remaining = Math.max(max - current, 0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(percentage / 100, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [percentage, delay]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const isWarning = percentage > 90;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: color }]}>{label}</Text>
        <View style={styles.values}>
          <Text style={[styles.current, { color: color }]}>{current}</Text>
          <Text style={styles.separator}> / </Text>
          <Text style={styles.max}>{max}{unit}</Text>
        </View>
      </View>

      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            fillStyle,
            {
              backgroundColor: isWarning ? Colors.neonPink : color,
              shadowColor: isWarning ? Colors.neonPink : color,
            },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.remaining}>
          {remaining}{unit} restants
        </Text>
        <Text style={[styles.percentage, { color: isWarning ? Colors.neonPink : color }]}>
          {Math.round(percentage)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  values: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  current: {
    fontSize: FontSize.md,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  separator: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  max: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 10,
    backgroundColor: Colors.muted,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  fill: {
    height: '100%',
    borderRadius: BorderRadius.full,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  remaining: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  percentage: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
