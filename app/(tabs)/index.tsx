import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/theme';
import { EnergyGauge } from '../../components/EnergyGauge';
import { CalorieRing } from '../../components/CalorieRing';
import { ScanButton } from '../../components/ScanButton';
import { XPPopup } from '../../components/XPPopup';
import { AdBanner } from '../../components/AdBanner';
import { useUser } from '../../store/UserContext';
import { usePremium } from '../../store/PremiumContext';
import { useDailyLog } from '../../store/DailyLogContext';
import { useRealScan } from '../../hooks/useRealScan';
import { useInterstitial } from '../../hooks/useInterstitial';
import { useHealthKit } from '../../hooks/useHealthKit';
import { AI_PERSONALITIES } from '../../constants/aiPersonalities';
import type { ScanResult } from '../../types/nutrition';

const DEFAULT_GOALS = { calories: 2200, protein: 160, carbs: 250, fat: 73 };

export default function DashboardScreen() {
  const router = useRouter();
  const { profile, goals } = useUser();
  const { isPremium } = usePremium();
  const { totals } = useDailyLog();
  const { isScanning, scanWithCamera, scanFromGallery } = useRealScan();
  const { showAd } = useInterstitial();
  const { steps, bonusKcal, isAvailable: healthAvailable } = useHealthKit();

  const [searchQuery, setSearchQuery] = useState('');
  const [xpPopup, setXpPopup] = useState<{
    visible: boolean; title: string; description: string; xp: number; color: string;
  }>({ visible: false, title: '', description: '', xp: 0, color: Colors.electricGreen });

  const dailyGoals = goals ?? DEFAULT_GOALS;
  const adjustedCalories = dailyGoals.calories + bonusKcal;
  const personality = profile ? AI_PERSONALITIES[profile.aiStyle] : AI_PERSONALITIES.rpg;
  const caloriesPct = (totals.calories / adjustedCalories) * 100;
  const isOverLimit = caloriesPct > 100;
  const remaining = Math.max(adjustedCalories - totals.calories, 0);

  const showXP = useCallback((message: string, color: string, xp: number) => {
    setXpPopup({ visible: true, title: personality.name, description: message, xp, color });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [personality]);

  const navigate = useCallback((result: ScanResult) => {
    router.push({ pathname: '/scan-result', params: { data: JSON.stringify(result) } });
    showXP(personality.scanSuccess[0], personality.color, 50);
  }, [router, showXP, personality]);

  const handleScan = useCallback(async () => {
    if (!isPremium) {
      showAd();
      router.push('/subscription');
      return;
    }
    const result = await scanWithCamera();
    if (result) navigate(result);
  }, [isPremium, showAd, router, scanWithCamera, navigate]);

  const handleGallery = useCallback(async () => {
    if (!isPremium) {
      showAd();
      router.push('/subscription');
      return;
    }
    const result = await scanFromGallery();
    if (result) navigate(result);
  }, [isPremium, showAd, router, scanFromGallery, navigate]);

  const handleBodyFat = useCallback(() => {
    router.push('/body-fat');
  }, [router]);

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <XPPopup
        visible={xpPopup.visible}
        title={xpPopup.title}
        description={xpPopup.description}
        xp={xpPopup.xp}
        color={xpPopup.color}
        onDismiss={() => setXpPopup((p) => ({ ...p, visible: false }))}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['rgba(124,58,237,0.08)', 'transparent']}
          style={styles.topGradient}
          pointerEvents="none"
        />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>NUTRASCAN</Text>
            <Text style={styles.dateText}>{today.toUpperCase()}</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable style={styles.bodyFatButton} onPress={handleBodyFat}>
              <Ionicons name="body" size={18} color={Colors.neonPurple} />
              {!isPremium && (
                <View style={styles.premiumTag}>
                  <Text style={styles.premiumTagText}>✦</Text>
                </View>
              )}
            </Pressable>
            <Pressable style={styles.avatar} onPress={() => router.push('/edit-profile')}>
              <LinearGradient colors={[Colors.neonPurple, '#5B21B6']} style={styles.avatarGradient}>
                <Text style={styles.avatarText}>{profile?.sex === 'female' ? '♀' : '♂'}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        {/* Calorie ring */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={[styles.panelDot, { backgroundColor: isOverLimit ? Colors.neonPink : Colors.neonPurple }]} />
            <Text style={styles.panelTitle}>JAUGE D'ÉNERGIE</Text>
            {isOverLimit && (
              <View style={styles.overloadBadge}>
                <Text style={styles.overloadText}>⚠ SURCHARGE</Text>
              </View>
            )}
          </View>
          <View style={styles.ringRow}>
            <CalorieRing current={totals.calories} goal={adjustedCalories} />
            <View style={styles.ringStats}>
              <StatRow label="OBJECTIF" value={`${adjustedCalories} kcal`} color={Colors.textMuted} />
              <StatRow label="CONSOMMÉ" value={`${totals.calories} kcal`} color={Colors.neonPurple} />
              <StatRow
                label="RESTANT"
                value={`${remaining} kcal`}
                color={isOverLimit ? Colors.neonPink : Colors.electricGreen}
              />
              {healthAvailable && bonusKcal > 0 && (
                <StatRow label={`+${steps.toLocaleString('fr')} PAS`} value={`+${bonusKcal} kcal`} color={Colors.electricGreen} />
              )}
            </View>
          </View>
        </View>

        {/* Macro gauges */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={[styles.panelDot, { backgroundColor: Colors.neonBlue }]} />
            <Text style={styles.panelTitle}>RÉSERVOIRS DE MACROS</Text>
          </View>
          <EnergyGauge label="PROTÉINES" current={totals.protein} max={dailyGoals.protein} unit="g" color={Colors.electricGreen} glowColor={Colors.electricGreenGlow} delay={0} />
          <EnergyGauge label="GLUCIDES" current={totals.carbs} max={dailyGoals.carbs} unit="g" color={Colors.neonBlue} glowColor={Colors.neonBlueGlow} delay={100} />
          <EnergyGauge label="LIPIDES" current={totals.fat} max={dailyGoals.fat} unit="g" color={Colors.neonPink} glowColor={Colors.neonPinkGlow} delay={200} />
        </View>

        {/* Ad banner — non-premium */}
        <AdBanner />

        {/* Scan section */}
        <View style={styles.scanSection}>
          {!isPremium && (
            <View style={styles.premiumScanNote}>
              <Ionicons name="lock-closed" size={14} color={Colors.neonPurple} />
              <Text style={styles.premiumScanNoteText}>SCAN IA — PREMIUM</Text>
            </View>
          )}
          <ScanButton onPress={handleScan} isLoading={isScanning} />
          <View style={styles.altActions}>
            <Pressable style={styles.altBtn} onPress={handleGallery}>
              <Ionicons name="images-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.altBtnText}>GALERIE</Text>
            </Pressable>
            <View style={styles.altDivider} />
            <Pressable
              style={styles.altBtn}
              onPress={() => Alert.alert('CODE-BARRES', 'Scanner code-barres — prochaine mise à jour, Capitaine.')}
            >
              <Ionicons name="barcode-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.altBtnText}>CODE-BARRES</Text>
            </Pressable>
          </View>
        </View>

        {/* Search */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={[styles.panelDot, { backgroundColor: Colors.neonBlue }]} />
            <Text style={styles.panelTitle}>RECHERCHE MANUELLE</Text>
          </View>
          <View style={styles.searchRow}>
            <View style={styles.searchInputWrap}>
              <Ionicons name="search" size={16} color={Colors.textMuted} />
              <TextInput
                style={styles.searchTextField}
                placeholder="Rechercher un aliment..."
                placeholderTextColor={Colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                onSubmitEditing={() =>
                  Alert.alert(`RECHERCHE : ${searchQuery.toUpperCase()}`, 'Base de données disponible prochainement.')
                }
                accessibilityLabel="Rechercher un aliment"
              />
            </View>
            <Pressable style={styles.searchBtn}>
              <Ionicons name="arrow-forward" size={18} color={Colors.background} />
            </Pressable>
          </View>
        </View>

        {/* Body fat premium CTA */}
        <Pressable style={styles.premiumBanner} onPress={handleBodyFat}>
          <LinearGradient
            colors={[Colors.neonPurple + '20', Colors.neonPurple + '08']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          <Ionicons name="body" size={28} color={Colors.neonPurple} />
          <View style={{ flex: 1 }}>
            <Text style={styles.premiumBannerTitle}>ANALYSE MASSE GRASSE IA</Text>
            <Text style={styles.premiumBannerSub}>Photo → % Body Fat par Claude Vision</Text>
          </View>
          <View style={styles.premiumPill}>
            <Text style={styles.premiumPillText}>✦ PREMIUM</Text>
          </View>
        </Pressable>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={sr.row}>
      <Text style={sr.label}>{label}</Text>
      <Text style={[sr.value, { color }]}>{value}</Text>
    </View>
  );
}

const sr = StyleSheet.create({
  row: { marginBottom: 10 },
  label: { fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 1.5, marginBottom: 1 },
  value: { fontSize: FontSize.md, fontWeight: '700', fontVariant: ['tabular-nums'] },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.lg,
  },
  appTitle: {
    fontSize: FontSize.xxl, fontWeight: '900', color: Colors.textPrimary, letterSpacing: 6,
    textShadowColor: Colors.neonPurple, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12,
  },
  dateText: { fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 2, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  bodyFatButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.neonPurple + '18',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.neonPurple + '40',
    position: 'relative',
  },
  premiumTag: {
    position: 'absolute', top: -3, right: -3, backgroundColor: Colors.neonPurple,
    borderRadius: 6, width: 12, height: 12, alignItems: 'center', justifyContent: 'center',
  },
  premiumTagText: { fontSize: 7, color: '#fff', fontWeight: '900' },
  avatar: { overflow: 'hidden', borderRadius: 24 },
  avatarGradient: {
    width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.neonPurple + '60',
  },
  avatarText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '900' },

  panel: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
  },
  panelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: 8 },
  panelDot: { width: 3, height: 14, borderRadius: 2 },
  panelTitle: { fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 2.5, fontWeight: '700', flex: 1 },
  overloadBadge: {
    backgroundColor: Colors.neonPink + '20', borderRadius: BorderRadius.full,
    paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: Colors.neonPink + '50',
  },
  overloadText: { fontSize: 8, color: Colors.neonPink, fontWeight: '900', letterSpacing: 1.5 },

  ringRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  ringStats: { flex: 1, justifyContent: 'center' },

  scanSection: { paddingVertical: Spacing.xl, alignItems: 'center', gap: Spacing.md },
  premiumScanNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.neonPurple + '15', borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.neonPurple + '30',
  },
  premiumScanNoteText: { fontSize: FontSize.xs, color: Colors.neonPurple, fontWeight: '700', letterSpacing: 2 },
  altActions: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.full,
    paddingVertical: 10, paddingHorizontal: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
  },
  altBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 4, minHeight: 44, justifyContent: 'center',
  },
  altBtnText: { fontSize: FontSize.xs, color: Colors.textSecondary, letterSpacing: 1.5, fontWeight: '600' },
  altDivider: { width: 1, height: 20, backgroundColor: Colors.border },

  searchRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  searchInputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.muted, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, minHeight: 48, gap: 8,
  },
  searchTextField: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary, minHeight: 48 },
  searchBtn: {
    width: 48, height: 48, borderRadius: BorderRadius.md, backgroundColor: Colors.neonPurple,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.neonPurple, shadowOpacity: 0.6, shadowRadius: 10, shadowOffset: { width: 0, height: 0 },
  },

  premiumBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    padding: Spacing.lg, borderRadius: BorderRadius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.neonPurple + '40', minHeight: 72,
  },
  premiumBannerTitle: { fontSize: FontSize.sm, fontWeight: '900', color: Colors.textPrimary, letterSpacing: 1 },
  premiumBannerSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  premiumPill: {
    backgroundColor: Colors.neonPurple + '25', borderRadius: BorderRadius.full,
    paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: Colors.neonPurple + '60',
  },
  premiumPillText: { fontSize: 9, color: Colors.neonPurple, fontWeight: '900', letterSpacing: 2 },
});
