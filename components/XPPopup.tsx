import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, BorderRadius, Spacing } from '../constants/theme';

interface XPPopupProps {
  visible: boolean;
  title: string;
  description: string;
  xp?: number;
  color?: string;
  onDismiss: () => void;
}

export function XPPopup({
  visible,
  title,
  description,
  xp = 100,
  color = Colors.electricGreen,
  onDismiss,
}: XPPopupProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);
  const xpScale = useSharedValue(0);

  const runEntrance = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    opacity.value = withTiming(1, { duration: 200 });
    scale.value = withSequence(
      withTiming(1.12, { duration: 280, easing: Easing.out(Easing.back(2)) }),
      withSpring(1, { damping: 12, stiffness: 180 })
    );
    translateY.value = withSpring(0, { damping: 14, stiffness: 160 });
    xpScale.value = withDelay(
      400,
      withSequence(
        withTiming(1.2, { duration: 200, easing: Easing.out(Easing.back(2)) }),
        withTiming(1, { duration: 150 })
      )
    );
  }, []);

  const runExit = useCallback((cb: () => void) => {
    opacity.value = withTiming(0, { duration: 250 });
    scale.value = withTiming(0.8, { duration: 250 });
    translateY.value = withTiming(-20, { duration: 250, easing: Easing.in(Easing.cubic) });
    setTimeout(cb, 260);
  }, []);

  useEffect(() => {
    if (!visible) {
      scale.value = 0;
      opacity.value = 0;
      translateY.value = 40;
      xpScale.value = 0;
      return;
    }

    runEntrance();
    const timer = setTimeout(() => runExit(onDismiss), 3200);
    return () => clearTimeout(timer);
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const xpStyle = useAnimatedStyle(() => ({
    transform: [{ scale: xpScale.value }],
  }));

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <View style={styles.overlay} pointerEvents="none">
        <Animated.View style={[styles.card, containerStyle, { borderColor: color + '50' }]}>
          <LinearGradient
            colors={[color + '18', color + '06']}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <Animated.View style={[styles.xpBadge, { backgroundColor: color }, xpStyle]}>
            <Text style={styles.xpText}>+{xp} XP</Text>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 100,
    paddingHorizontal: Spacing.lg,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 20,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 14,
  },
  xpBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  xpText: {
    fontSize: FontSize.md,
    fontWeight: '900',
    color: Colors.background,
    letterSpacing: 1.5,
  },
});
