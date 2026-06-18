import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { usePremium } from '../store/PremiumContext';

const FEATURES = [
  { icon: 'body', title: 'Analyse masse grasse IA', desc: 'Photo → % masse grasse estimé par Claude Vision' },
  { icon: 'nutrition', title: 'Scan repas illimité', desc: 'Analysez tous vos repas sans restriction' },
  { icon: 'trending-up', title: 'Projections avancées', desc: 'Courbes de progression et macros optimisées' },
  { icon: 'flash', title: 'IA personnalisée', desc: 'Coach adaptatif avec mémoire longue durée' },
  { icon: 'ban', title: 'Sans publicité', desc: 'Expérience sans interruption publicitaire' },
];

type Plan = 'monthly' | 'yearly';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { isPremium, isPurchasing, subscribe, restore } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');

  if (isPremium) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.successContainer}>
          <LinearGradient
            colors={[Colors.electricGreen + '12', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="checkmark-circle" size={80} color={Colors.electricGreen} />
          <Text style={styles.successTitle}>PREMIUM ACTIF</Text>
          <Text style={styles.successSub}>Toutes les fonctionnalités sont déverrouillées.</Text>
          <Pressable style={styles.backCtaBtn} onPress={() => router.back()}>
            <Text style={styles.backCtaBtnText}>← RETOUR</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.navBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.navTitle}>PREMIUM</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <LinearGradient
            colors={[Colors.neonPurple + '18', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroIconWrap}>
            <LinearGradient
              colors={[Colors.neonPurple, '#5B21B6']}
              style={styles.heroIconGradient}
            >
              <Ionicons name="flash" size={36} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.heroTitle}>{'NUTRASCAN\nPREMIUM'}</Text>
        </View>

        {/* Plan toggle */}
        <View style={styles.plansRow}>
          <Pressable
            style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardActive]}
            onPress={() => setSelectedPlan('monthly')}
          >
            {selectedPlan === 'monthly' && (
              <LinearGradient
                colors={[Colors.neonPurple + '18', Colors.neonPurple + '06']}
                style={StyleSheet.absoluteFill}
              />
            )}
            <Text style={[styles.planName, selectedPlan === 'monthly' && styles.planNameActive]}>MENSUEL</Text>
            <View style={styles.planPriceRow}>
              <Text style={[styles.planPrice, selectedPlan === 'monthly' && styles.planPriceActive]}>9,99€</Text>
              <Text style={styles.planPer}>/mois</Text>
            </View>
            {selectedPlan === 'monthly' && (
              <View style={styles.selectedDot} />
            )}
          </Pressable>

          <Pressable
            style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardActive]}
            onPress={() => setSelectedPlan('yearly')}
          >
            {selectedPlan === 'yearly' && (
              <LinearGradient
                colors={[Colors.neonPurple + '18', Colors.neonPurple + '06']}
                style={StyleSheet.absoluteFill}
              />
            )}
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>−33%</Text>
            </View>
            <Text style={[styles.planName, selectedPlan === 'yearly' && styles.planNameActive]}>ANNUEL</Text>
            <View style={styles.planPriceRow}>
              <Text style={[styles.planPrice, selectedPlan === 'yearly' && styles.planPriceActive]}>79,99€</Text>
              <Text style={styles.planPer}>/an</Text>
            </View>
            <Text style={styles.planEquiv}>soit 6,67€/mois</Text>
            {selectedPlan === 'yearly' && (
              <View style={styles.selectedDot} />
            )}
          </Pressable>
        </View>

        {/* Features list */}
        <View style={styles.featuresPanel}>
          {FEATURES.map((f, i) => (
            <View
              key={i}
              style={[styles.featureRow, i < FEATURES.length - 1 && styles.featureRowBorder]}
            >
              <View style={styles.featureIconWrap}>
                <Ionicons name={f.icon as any} size={20} color={Colors.neonPurple} />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
              <Ionicons name="checkmark" size={18} color={Colors.electricGreen} />
            </View>
          ))}
        </View>

        {/* Subscribe CTA */}
        <Pressable
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }, isPurchasing && styles.ctaDisabled]}
          onPress={() => subscribe(selectedPlan)}
          disabled={isPurchasing}
          accessibilityRole="button"
          accessibilityLabel="S'abonner à Premium"
        >
          <LinearGradient
            colors={[Colors.neonPurple, '#5B21B6']}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="flash" size={20} color="#fff" />
            <Text style={styles.ctaText}>
              {isPurchasing
                ? 'TRAITEMENT...'
                : selectedPlan === 'yearly'
                ? "S'ABONNER · 79,99€/AN"
                : "S'ABONNER · 9,99€/MOIS"}
            </Text>
          </LinearGradient>
        </Pressable>

        {/* Restore */}
        <Pressable style={styles.restoreBtn} onPress={restore} disabled={isPurchasing}>
          <Text style={styles.restoreText}>Restaurer un achat existant</Text>
        </Pressable>

        <Text style={styles.legal}>
          {selectedPlan === 'yearly'
            ? "L'abonnement se renouvelle automatiquement chaque année au tarif de 79,99€ sauf résiliation 24h avant l'échéance.\n"
            : "L'abonnement se renouvelle automatiquement chaque mois au tarif de 9,99€ sauf résiliation 24h avant l'échéance.\n"}
          {Platform.select({
            ios: 'Gérez vos abonnements dans Réglages > Apple ID > Abonnements.',
            android: 'Gérez vos abonnements dans le Play Store > Abonnements.',
            default: '',
          })}
        </Text>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  backBtn: { width: 32, height: 32, justifyContent: 'center' },
  navTitle: { fontSize: FontSize.sm, fontWeight: '900', color: Colors.textPrimary, letterSpacing: 3 },

  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.lg },

  hero: {
    alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
    borderRadius: BorderRadius.xl, overflow: 'hidden', marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.neonPurple + '30',
  },
  heroIconWrap: { marginBottom: Spacing.lg },
  heroIconGradient: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.neonPurple, shadowOpacity: 0.8, shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  heroTitle: {
    fontSize: 28, fontWeight: '900', color: Colors.textPrimary, letterSpacing: 5,
    textAlign: 'center',
    textShadowColor: Colors.neonPurple, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 16,
  },

  plansRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  planCard: {
    flex: 1, borderRadius: BorderRadius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg,
    backgroundColor: Colors.surface, alignItems: 'center', gap: 4, minHeight: 120,
    position: 'relative',
  },
  planCardActive: { borderColor: Colors.neonPurple + '70' },
  planName: { fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 2, fontWeight: '700' },
  planNameActive: { color: Colors.neonPurple },
  planPriceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  planPrice: { fontSize: 26, fontWeight: '900', color: Colors.textPrimary, fontVariant: ['tabular-nums'] },
  planPriceActive: { color: Colors.neonPurple },
  planPer: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 4 },
  planEquiv: { fontSize: 10, color: Colors.textMuted, letterSpacing: 0.5 },
  savingsBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: Colors.electricGreen + '20', borderRadius: BorderRadius.full,
    paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: Colors.electricGreen + '40',
  },
  savingsText: { fontSize: 10, fontWeight: '900', color: Colors.electricGreen, letterSpacing: 0.5 },
  selectedDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.neonPurple, marginTop: 4,
  },

  featuresPanel: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg, overflow: 'hidden',
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg },
  featureRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  featureIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.neonPurple + '18', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.neonPurple + '30',
  },
  featureTextWrap: { flex: 1 },
  featureTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  featureDesc: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },

  cta: {
    borderRadius: BorderRadius.full, overflow: 'hidden',
    shadowColor: Colors.neonPurple, shadowOpacity: 0.7, shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 }, elevation: 14, marginBottom: Spacing.md,
  },
  ctaDisabled: { opacity: 0.6 },
  ctaGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, gap: 10,
  },
  ctaText: { color: '#fff', fontSize: FontSize.md, fontWeight: '900', letterSpacing: 1.5 },

  restoreBtn: { alignItems: 'center', paddingVertical: Spacing.md, marginBottom: Spacing.lg },
  restoreText: { fontSize: FontSize.sm, color: Colors.textMuted, textDecorationLine: 'underline' },

  legal: {
    fontSize: 10, color: Colors.textMuted, textAlign: 'center',
    lineHeight: 16, paddingHorizontal: Spacing.md,
  },

  successContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: Spacing.xl, gap: Spacing.lg, overflow: 'hidden',
  },
  successTitle: {
    fontSize: FontSize.xxl, fontWeight: '900', color: Colors.electricGreen, letterSpacing: 5,
    textShadowColor: Colors.electricGreen, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 16,
  },
  successSub: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center' },
  backCtaBtn: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  backCtaBtnText: { fontSize: FontSize.sm, color: Colors.textMuted, letterSpacing: 2, fontWeight: '700' },
});
