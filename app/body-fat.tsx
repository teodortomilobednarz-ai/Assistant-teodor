import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { usePremium } from '../store/PremiumContext';
import { useUser } from '../store/UserContext';
import { Paywall } from '../components/Paywall';
import { analyzeBodyFat, BodyFatAnalysis } from '../services/claude';
import { saveBodyFatResult } from '../services/database';

export default function BodyFatScreen() {
  const router = useRouter();
  const { isPremium } = usePremium();
  const { profile, deviceId } = useUser();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<BodyFatAnalysis | null>(null);

  const pickImage = useCallback(async (fromCamera: boolean) => {
    const permResult = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permResult.granted) {
      Alert.alert('Permission refusée', "Autorisez l'accès dans les Réglages de votre appareil.");
      return;
    }

    const pickerResult = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, base64: true })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, base64: true });

    if (pickerResult.canceled || !pickerResult.assets[0]) return;

    const asset = pickerResult.assets[0];
    if (!asset.base64) {
      Alert.alert('Erreur', 'Impossible de lire l\'image. Réessayez.');
      return;
    }

    if (!profile) {
      Alert.alert('Profil requis', 'Complétez votre profil dans l\'onglet Profil avant d\'utiliser cette fonctionnalité.');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    try {
      const analysis = await analyzeBodyFat(asset.base64, {
        sex: profile.sex,
        weightKg: profile.weightKg,
        heightCm: profile.heightCm,
        age: profile.age,
      });
      setResult(analysis);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (deviceId) {
        saveBodyFatResult(deviceId, analysis).catch(() => {});
      }
    } catch {
      Alert.alert('Erreur d\'analyse', 'Impossible d\'analyser l\'image. Réessayez avec une meilleure photo (bonne luminosité, vue de face ou profil).');
    } finally {
      setIsAnalyzing(false);
    }
  }, [profile]);

  const premiumContent = (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.navBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.navTitle}>ANALYSE CORPORELLE</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.banner}>
          <LinearGradient
            colors={[Colors.neonPurple + '18', Colors.neonBlue + '08']}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="body" size={40} color={Colors.neonPurple} />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>IA COMPOSITION CORPORELLE</Text>
            <Text style={styles.bannerSub}>
              Claude Vision analyse votre photo et estime votre masse grasse avec précision scientifique.
            </Text>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsPanel}>
          <Text style={styles.sectionLabel}>CONSEILS PHOTO</Text>
          {[
            'Vue de face ou de profil, debout',
            'Bonne lumière naturelle ou artificielle',
            'Vêtements ajustés ou torse nu',
            'Fond neutre de préférence',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.electricGreen} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Pick image buttons */}
        {!isAnalyzing && !result && (
          <View style={styles.pickRow}>
            <Pressable
              style={({ pressed }) => [styles.pickBtn, styles.pickBtnPurple, pressed && { opacity: 0.8 }]}
              onPress={() => pickImage(true)}
            >
              <Ionicons name="camera" size={28} color={Colors.neonPurple} />
              <Text style={[styles.pickBtnText, { color: Colors.neonPurple }]}>CAMÉRA</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.pickBtn, styles.pickBtnBlue, pressed && { opacity: 0.8 }]}
              onPress={() => pickImage(false)}
            >
              <Ionicons name="images" size={28} color={Colors.neonBlue} />
              <Text style={[styles.pickBtnText, { color: Colors.neonBlue }]}>GALERIE</Text>
            </Pressable>
          </View>
        )}

        {/* Analyzing */}
        {isAnalyzing && (
          <View style={styles.loadingPanel}>
            <ActivityIndicator size="large" color={Colors.neonPurple} />
            <Text style={styles.loadingTitle}>ANALYSE EN COURS...</Text>
            <Text style={styles.loadingSub}>Claude Vision traite votre image</Text>
          </View>
        )}

        {/* Results */}
        {result && !isAnalyzing && (
          <>
            <View style={styles.resultPanel}>
              <View style={styles.resultHeader}>
                <Text style={styles.sectionLabel}>RÉSULTATS</Text>
                <View style={[styles.categoryBadge, { borderColor: getCategoryColor(result.category) + '60' }]}>
                  <Text style={[styles.categoryText, { color: getCategoryColor(result.category) }]}>
                    {result.category.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.bigStatRow}>
                <View style={styles.bigStat}>
                  <Text style={[styles.bigStatValue, { color: getCategoryColor(result.category) }]}>
                    {result.estimatedBodyFatPct.toFixed(1)}%
                  </Text>
                  <Text style={styles.bigStatLabel}>MASSE GRASSE</Text>
                </View>
                <View style={styles.bigStatDivider} />
                <View style={styles.bigStat}>
                  <Text style={[styles.bigStatValue, { color: Colors.electricGreen }]}>
                    {result.leanMassKg.toFixed(1)} kg
                  </Text>
                  <Text style={styles.bigStatLabel}>MASSE MAIGRE</Text>
                </View>
              </View>

              <ResultRow label="Masse grasse" value={`${result.fatMassKg.toFixed(1)} kg`} color={Colors.neonPink} />
              <ConfidenceBar confidence={result.confidence} />
            </View>

            {result.recommendations.length > 0 && (
              <View style={styles.recoPanel}>
                <Text style={styles.sectionLabel}>RECOMMANDATIONS IA</Text>
                {result.recommendations.map((rec, i) => (
                  <View key={i} style={styles.recoRow}>
                    <Ionicons name="flash" size={14} color={Colors.neonPurple} />
                    <Text style={styles.recoText}>{rec}</Text>
                  </View>
                ))}
              </View>
            )}

            <Pressable style={styles.retryBtn} onPress={() => setResult(null)}>
              <Ionicons name="refresh" size={18} color={Colors.textMuted} />
              <Text style={styles.retryText}>NOUVELLE ANALYSE</Text>
            </Pressable>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );

  if (!isPremium) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.navBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.navTitle}>ANALYSE CORPORELLE</Text>
          <View style={{ width: 32 }} />
        </View>
        <Paywall
          feature="ANALYSE MASSE GRASSE IA"
          description="Photographiez votre corps et obtenez une estimation scientifique de votre composition corporelle grâce à Claude Vision."
        />
      </SafeAreaView>
    );
  }

  return premiumContent;
}

function ResultRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={[styles.resultValue, color ? { color } : {}]}>{value}</Text>
    </View>
  );
}

function ConfidenceBar({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const color = pct >= 70 ? Colors.electricGreen : pct >= 50 ? Colors.neonYellow : Colors.neonPink;
  return (
    <View style={{ marginTop: Spacing.md }}>
      <View style={styles.confLabelRow}>
        <Text style={styles.resultLabel}>Confiance IA</Text>
        <Text style={[styles.resultValue, { color }]}>{pct}%</Text>
      </View>
      <View style={styles.confTrack}>
        <View style={{ flex: pct, backgroundColor: color, height: '100%', borderRadius: 3 }} />
        <View style={{ flex: 100 - pct }} />
      </View>
    </View>
  );
}

function getCategoryColor(category: string): string {
  const lc = category.toLowerCase();
  if (lc.includes('athlet')) return Colors.electricGreen;
  if (lc.includes('fitness')) return Colors.neonBlue;
  if (lc.includes('essential')) return Colors.neonYellow;
  if (lc.includes('obese')) return Colors.neonPink;
  return Colors.textPrimary;
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
  sectionLabel: { fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 2.5, fontWeight: '700', marginBottom: Spacing.md },

  banner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.lg, borderRadius: BorderRadius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.neonPurple + '30', marginBottom: Spacing.md,
  },
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: FontSize.sm, fontWeight: '900', color: Colors.textPrimary, letterSpacing: 1.5, marginBottom: 4 },
  bannerSub: { fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 18 },

  tipsPanel: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg,
  },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 8 },
  tipText: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },

  pickRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  pickBtn: {
    flex: 1, borderRadius: BorderRadius.xl, overflow: 'hidden',
    borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm,
  },
  pickBtnPurple: { borderColor: Colors.neonPurple + '50', backgroundColor: Colors.neonPurple + '12' },
  pickBtnBlue: { borderColor: Colors.neonBlue + '50', backgroundColor: Colors.neonBlue + '12' },
  pickBtnText: { fontSize: FontSize.sm, fontWeight: '900', letterSpacing: 2 },

  loadingPanel: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.xxl,
    alignItems: 'center', gap: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg,
  },
  loadingTitle: { fontSize: FontSize.md, fontWeight: '900', color: Colors.textPrimary, letterSpacing: 3 },
  loadingSub: { fontSize: FontSize.xs, color: Colors.textMuted },

  resultPanel: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md,
  },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  categoryBadge: {
    borderRadius: BorderRadius.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1,
  },
  categoryText: { fontSize: FontSize.xs, fontWeight: '900', letterSpacing: 1.5 },

  bigStatRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  bigStat: { flex: 1, alignItems: 'center' },
  bigStatValue: { fontSize: 36, fontWeight: '900', fontVariant: ['tabular-nums'] },
  bigStatLabel: { fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 1.5, fontWeight: '700', marginTop: 2 },
  bigStatDivider: { width: 1, height: 56, backgroundColor: Colors.border },

  resultRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  resultLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  resultValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary, fontVariant: ['tabular-nums'] },

  confLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  confTrack: { height: 6, backgroundColor: Colors.border, borderRadius: 3, flexDirection: 'row', overflow: 'hidden' },

  recoPanel: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md,
  },
  recoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: 8 },
  recoText: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1, lineHeight: 20 },

  retryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.lg,
  },
  retryText: { fontSize: FontSize.sm, color: Colors.textMuted, letterSpacing: 1.5, fontWeight: '700' },
});
