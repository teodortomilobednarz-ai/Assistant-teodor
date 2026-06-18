import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, BorderRadius, FontSize, Spacing } from '../constants/theme';

interface PaywallProps {
  feature: string;
  description: string;
  children?: React.ReactNode;
}

export function Paywall({ feature, description, children }: PaywallProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {children && <View style={styles.blurredContent} pointerEvents="none">{children}</View>}

      <View style={styles.overlay}>
        <LinearGradient
          colors={['rgba(8,8,16,0.3)', 'rgba(8,8,16,0.97)']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.content}>
          <View style={styles.lockIcon}>
            <Ionicons name="lock-closed" size={32} color={Colors.neonPurple} />
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>✦ PREMIUM</Text>
          </View>

          <Text style={styles.featureTitle}>{feature}</Text>
          <Text style={styles.featureDescription}>{description}</Text>

          <Pressable
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
            onPress={() => router.push('/subscription')}
            accessibilityLabel="Passer à Premium"
            accessibilityRole="button"
          >
            <LinearGradient
              colors={[Colors.neonPurple, '#5B21B6']}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="flash" size={18} color="#fff" />
              <Text style={styles.ctaText}>PASSER À PREMIUM — 9,99€/mois</Text>
            </LinearGradient>
          </Pressable>

          <Text style={styles.fine}>Résiliable à tout moment · Facturation mensuelle</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: BorderRadius.xl,
  },
  blurredContent: {
    opacity: 0.15,
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  lockIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.neonPurpleGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neonPurple + '40',
  },
  badge: {
    backgroundColor: Colors.neonPurple + '25',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.neonPurple + '60',
    marginBottom: Spacing.md,
  },
  badgeText: {
    fontSize: FontSize.xs,
    color: Colors.neonPurple,
    fontWeight: '900',
    letterSpacing: 3,
  },
  featureTitle: {
    fontSize: FontSize.xl,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  featureDescription: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  cta: {
    width: '100%',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    shadowColor: Colors.neonPurple,
    shadowOpacity: 0.7,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
    marginBottom: Spacing.md,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  ctaText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  fine: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
});
