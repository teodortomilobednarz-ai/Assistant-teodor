import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';

import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { MacroStatCard } from '../components/MacroStatCard';
import { GamificationAlert } from '../components/GamificationAlert';
import { ScanResult } from '../types/nutrition';

const SCAN_DURATION = 1800;

export default function ScanResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ data: string }>();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [showResults, setShowResults] = useState(false);

  const scanLineY = useSharedValue(0);
  const imageOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const headerSlide = useSharedValue(-20);

  useEffect(() => {
    if (params.data) {
      try {
        const parsed = JSON.parse(params.data) as ScanResult;
        setScanResult(parsed);
      } catch {
        router.back();
      }
    }
  }, [params.data]);

  useEffect(() => {
    imageOpacity.value = withTiming(1, { duration: 400 });
    headerSlide.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });

    scanLineY.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(1, { duration: SCAN_DURATION, easing: Easing.inOut(Easing.cubic) })
    );

    const timer = setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
      contentOpacity.value = withTiming(1, { duration: 400 });
    }, SCAN_DURATION + 300);

    return () => clearTimeout(timer);
  }, []);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value * 240 }],
    opacity: isAnalyzing ? 1 : 0,
  }));

  const imageStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerSlide.value }],
  }));

  const handleAddToLog = () => {
    Alert.alert(
      'REPAS ENREGISTRÉ',
      `${scanResult?.food.name} ajouté à votre journal alimentaire. Bonne nutrition, Capitaine !`,
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  if (!scanResult) return null;

  const { food, imageUri, gamificationMessage } = scanResult;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Animated.View style={[styles.header, headerStyle]}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Retour"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>ANALYSE IA</Text>
        <View style={styles.headerRight}>
          {isAnalyzing ? (
            <View style={styles.analysisBadge}>
              <View style={styles.analysisDot} />
              <Text style={styles.analysisBadgeText}>EN COURS</Text>
            </View>
          ) : (
            <View style={[styles.analysisBadge, { borderColor: Colors.electricGreen + '60' }]}>
              <View style={[styles.analysisDot, { backgroundColor: Colors.electricGreen }]} />
              <Text style={[styles.analysisBadgeText, { color: Colors.electricGreen }]}>COMPLÈTE</Text>
            </View>
          )}
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image + scan animation */}
        <Animated.View style={[styles.imageContainer, imageStyle]}>
          <Image
            source={{ uri: imageUri }}
            style={styles.foodImage}
            resizeMode="cover"
            accessibilityLabel={`Photo de ${food.name}`}
          />

          <LinearGradient
            colors={['transparent', Colors.background]}
            style={styles.imageGradient}
            pointerEvents="none"
          />

          {isAnalyzing && (
            <Animated.View style={[styles.scanLine, scanLineStyle]} pointerEvents="none">
              <LinearGradient
                colors={[
                  'transparent',
                  Colors.neonBlue + 'CC',
                  Colors.neonBlue,
                  Colors.neonBlue + 'CC',
                  'transparent',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.scanLineInner}
              />
            </Animated.View>
          )}

          {isAnalyzing && (
            <View style={styles.scanOverlay} pointerEvents="none">
              <View style={styles.scanCorner} />
              <View style={[styles.scanCorner, styles.scanCornerTR]} />
              <View style={[styles.scanCorner, styles.scanCornerBL]} />
              <View style={[styles.scanCorner, styles.scanCornerBR]} />
              <Text style={styles.scanLabel}>ANALYSE EN COURS...</Text>
            </View>
          )}
        </Animated.View>

        {/* Results */}
        <Animated.View style={[styles.results, contentStyle]}>
          {showResults && (
            <>
              {/* Food identity */}
              <View style={styles.foodIdentity}>
                <Text style={styles.foodEmoji}>{food.emoji}</Text>
                <View style={styles.foodNameBlock}>
                  <Text style={styles.foodName}>{food.name}</Text>
                  <Text style={styles.foodQuantity}>{food.quantity} identifiés</Text>
                </View>
                <View style={styles.healthScore}>
                  <Text
                    style={[
                      styles.healthScoreValue,
                      {
                        color:
                          food.healthScore >= 70
                            ? Colors.electricGreen
                            : food.healthScore >= 40
                            ? Colors.neonBlue
                            : Colors.neonPink,
                      },
                    ]}
                  >
                    {food.healthScore}
                  </Text>
                  <Text style={styles.healthScoreLabel}>SCORE</Text>
                </View>
              </View>

              {/* Macro stats - RPG cards */}
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIndicator, { backgroundColor: Colors.neonPurple }]} />
                <Text style={styles.sectionTitle}>RÉPARTITION DES STATS</Text>
              </View>

              <View style={styles.macroRow}>
                <MacroStatCard
                  label="PROTÉINES"
                  value={food.macros.protein}
                  unit="g"
                  color={Colors.electricGreen}
                  glowColor={Colors.electricGreenGlow}
                  icon="🥩"
                  delay={0}
                />
                <MacroStatCard
                  label="GLUCIDES"
                  value={food.macros.carbs}
                  unit="g"
                  color={Colors.neonBlue}
                  glowColor={Colors.neonBlueGlow}
                  icon="⚡"
                  delay={80}
                />
                <MacroStatCard
                  label="LIPIDES"
                  value={food.macros.fat}
                  unit="g"
                  color={Colors.neonPink}
                  glowColor={Colors.neonPinkGlow}
                  icon="💧"
                  delay={160}
                />
              </View>

              <View style={styles.caloriesBanner}>
                <LinearGradient
                  colors={[Colors.neonPurple + '20', Colors.neonPurple + '08']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
                <View>
                  <Text style={styles.caloriesBannerLabel}>ÉNERGIE TOTALE DÉTECTÉE</Text>
                  <Text style={styles.caloriesBannerValue}>
                    {food.macros.calories}{' '}
                    <Text style={styles.caloriesBannerUnit}>kcal</Text>
                  </Text>
                </View>
                <Ionicons name="flash" size={36} color={Colors.neonPurple} />
              </View>

              {/* Gamification */}
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIndicator, { backgroundColor: gamificationMessage.color }]} />
                <Text style={styles.sectionTitle}>RAPPORT DE BORD</Text>
              </View>

              <GamificationAlert message={gamificationMessage} />

              {/* Breakdown detail */}
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIndicator, { backgroundColor: Colors.neonBlue }]} />
                <Text style={styles.sectionTitle}>ANALYSE DÉTAILLÉE</Text>
              </View>

              <View style={styles.detailPanel}>
                {[
                  { label: 'Protéines', value: `${food.macros.protein}g`, pct: Math.round((food.macros.protein * 4 / food.macros.calories) * 100), color: Colors.electricGreen },
                  { label: 'Glucides', value: `${food.macros.carbs}g`, pct: Math.round((food.macros.carbs * 4 / food.macros.calories) * 100), color: Colors.neonBlue },
                  { label: 'Lipides', value: `${food.macros.fat}g`, pct: Math.round((food.macros.fat * 9 / food.macros.calories) * 100), color: Colors.neonPink },
                ].map((item) => (
                  <View key={item.label} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{item.label}</Text>
                    <View style={styles.detailBarTrack}>
                      <View
                        style={[
                          styles.detailBarFill,
                          { width: `${item.pct}%`, backgroundColor: item.color },
                        ]}
                      />
                    </View>
                    <Text style={[styles.detailValue, { color: item.color }]}>{item.pct}%</Text>
                    <Text style={styles.detailGrams}>{item.value}</Text>
                  </View>
                ))}
              </View>

              {/* CTA */}
              <Pressable style={styles.addButton} onPress={handleAddToLog}>
                <LinearGradient
                  colors={[Colors.neonPurple, '#5B21B6']}
                  style={styles.addButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="add-circle" size={22} color="#fff" />
                  <Text style={styles.addButtonText}>AJOUTER AU JOURNAL</Text>
                </LinearGradient>
              </Pressable>

              <Pressable style={styles.discardButton} onPress={() => router.back()}>
                <Text style={styles.discardText}>ANNULER LE SCAN</Text>
              </Pressable>
            </>
          )}

          {isAnalyzing && (
            <View style={styles.analyzingPlaceholder}>
              <Text style={styles.analyzingText}>
                TRAITEMENT DES DONNÉES NUTRITIONNELLES...
              </Text>
              <Text style={styles.analyzingSubText}>
                L'IA Claude analyse votre repas
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 4,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  analysisBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: Colors.neonPink + '60',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  analysisDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.neonPink,
  },
  analysisBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.neonPink,
    letterSpacing: 1.5,
  },

  // Image
  imageContainer: {
    height: 260,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    top: 0,
  },
  scanLineInner: {
    flex: 1,
    height: 3,
  },
  scanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanCorner: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: Colors.neonBlue,
    borderRadius: 3,
  },
  scanCornerTR: {
    left: undefined,
    right: 16,
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  scanCornerBL: {
    top: undefined,
    bottom: 16,
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  scanCornerBR: {
    top: undefined,
    bottom: 16,
    left: undefined,
    right: 16,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scanLabel: {
    fontSize: FontSize.xs,
    color: Colors.neonBlue,
    letterSpacing: 3,
    fontWeight: '700',
    textShadowColor: Colors.neonBlue,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  // Results
  results: {
    paddingHorizontal: Spacing.lg,
  },

  // Food identity
  foodIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  foodEmoji: {
    fontSize: 40,
  },
  foodNameBlock: {
    flex: 1,
  },
  foodName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  foodQuantity: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  healthScore: {
    alignItems: 'center',
    backgroundColor: Colors.muted,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  healthScoreValue: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  healthScoreLabel: {
    fontSize: 8,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    fontWeight: '700',
  },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  sectionIndicator: {
    width: 3,
    height: 14,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 2.5,
    fontWeight: '700',
  },

  // Macro row
  macroRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },

  // Calories banner
  caloriesBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.neonPurple + '40',
    overflow: 'hidden',
  },
  caloriesBannerLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 4,
  },
  caloriesBannerValue: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.neonPurple,
    fontVariant: ['tabular-nums'],
    textShadowColor: Colors.neonPurple,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  caloriesBannerUnit: {
    fontSize: FontSize.lg,
    fontWeight: '400',
    color: Colors.textSecondary,
  },

  // Detail panel
  detailPanel: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    width: 80,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  detailBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.muted,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  detailBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  detailValue: {
    width: 36,
    fontSize: FontSize.xs,
    fontWeight: '700',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  detailGrams: {
    width: 36,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },

  // CTA buttons
  addButton: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    shadowColor: Colors.neonPurple,
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
    minHeight: 56,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
    minHeight: 56,
  },
  addButtonText: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: '900',
    letterSpacing: 2.5,
  },
  discardButton: {
    alignItems: 'center',
    paddingVertical: 14,
    minHeight: 44,
    justifyContent: 'center',
  },
  discardText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    fontWeight: '600',
  },

  // Analyzing placeholder
  analyzingPlaceholder: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    gap: 8,
  },
  analyzingText: {
    fontSize: FontSize.xs,
    color: Colors.neonBlue,
    letterSpacing: 2,
    fontWeight: '700',
  },
  analyzingSubText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
});
