import React, { useEffect } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors, BorderRadius, FontSize } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface ScanButtonProps {
  onPress: () => void;
  isLoading?: boolean;
}

export function ScanButton({ onPress, isLoading = false }: ScanButtonProps) {
  const pulseScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.4);
  const ringScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1400, easing: Easing.out(Easing.cubic) }),
        withTiming(0.4, { duration: 0 })
      ),
      -1,
      false
    );

    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.45, { duration: 1400, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 0 })
      ),
      -1,
      false
    );
  }, []);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: isLoading ? 1 : pulseScale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: isLoading ? 0 : ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.pulseRing, ringStyle]} pointerEvents="none" />

      <Animated.View style={buttonStyle}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={onPress}
          disabled={isLoading}
          accessibilityLabel="Scanner un aliment"
          accessibilityRole="button"
        >
          <View style={styles.iconWrapper}>
            {isLoading ? (
              <Ionicons name="sync" size={36} color={Colors.background} />
            ) : (
              <Ionicons name="camera" size={36} color={Colors.background} />
            )}
          </View>

          <Text style={styles.label}>
            {isLoading ? 'ANALYSE...' : 'SCANNER ALIMENT'}
          </Text>

          <Text style={styles.subLabel}>
            {isLoading ? 'IA en cours de traitement' : 'Propulsé par l\'IA Claude'}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: Colors.neonPurple,
  },
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.neonPurple,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowColor: Colors.neonPurple,
    shadowOpacity: 0.9,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
    borderWidth: 2,
    borderColor: 'rgba(167,139,250,0.6)',
  },
  buttonPressed: {
    backgroundColor: '#6D28D9',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  iconWrapper: {
    marginBottom: 8,
  },
  label: {
    color: Colors.background,
    fontSize: FontSize.sm,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  subLabel: {
    color: 'rgba(8,8,16,0.7)',
    fontSize: 9,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 3,
  },
});
