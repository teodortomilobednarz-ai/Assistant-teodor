import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withDelay, withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/theme';
import {
  UserProfile, NutritionGoals, calculateNutritionGoals, calculateBMR,
  ACTIVITY_LABELS,
} from '../../services/bmr';

export default function GoalsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    age: string; sex: string; heightCm: string; weightKg: string;
    targetWeightKg: string; activityLevel: string; goal: string;
  }>();

  const profile: UserProfile = useMemo(() => ({
    age: +params.age,
    sex: params.sex as 'male' | 'female',
    heightCm: +params.heightCm,
    weightKg: +params.weightKg,
    targetWeightKg: +params.targetWeightKg,
    activityLevel: params.activityLevel as UserProfile['activityLevel'],
    goal: params.goal as UserProfile['goal'],
    aiStyle: 'rpg',
  }), [params]);

  const goals: NutritionGoals = useMemo(() => calculateNutritionGoals(profile), [profile]);
  const bmr = useMemo(() => Math.round(calculateBMR(profile)), [profile]);

  const GOAL_LABELS = { lose: 'Perte de poids', maintain: 'Maintien', gain: 'Prise de masse' };
  const weightDiff = Math.abs(profile.targetWeightKg - profile.weightKg);
  const weeksEstimate = Math.round(weightDiff / (profile.goal === 'lose' ? 0.5 : 0.25));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ProgressHeader step={1} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['rgba(0,217,255,0.06)', 'transparent']}
          style={styles.topGlow}
          pointerEvents="none"
        />

        <Text style={styles.title}>VOS OBJECTIFS{'\n'}CALCULÉS</Text>
        <Text style={styles.subtitle}>
          Formule Mifflin-St Jeor · Précision scientifique validée
        </Text>

        {/* BMR + TDEE cards */}
        <View style={styles.metaRow}>
          <MetaCard label="MÉTABOLISME BASE" value={`${bmr}`} unit="kcal" color={Colors.neonBlue} delay={0} />
          <MetaCard label="DÉPENSE TOTALE" value={`${goals.tdee}`} unit="kcal/j" color={Colors.neonPurple} delay={100} />
        </View>

        {/* Calorie goal */}
        <AnimatedGoalCard delay={200}>
          <LinearGradient
            colors={[Colors.neonPurple + '18', Colors.neonPurple + '06']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.calorieRow}>
            <View>
              <Text style={styles.calorieLabel}>OBJECTIF CALORIQUE</Text>
              <Text style={styles.calorieValue}>{goals.calories}</Text>
              <Text style={styles.calorieUnit}>kcal / jour</Text>
            </View>
            <Ionicons name="flash" size={48} color={Colors.neonPurple} style={{ opacity: 0.6 }} />
          </View>
          <Text style={styles.calorieNote}>
            {GOAL_LABELS[profile.goal]} · {ACTIVITY_LABELS[profile.activityLevel]}
          </Text>
        </AnimatedGoalCard>

        {/* Macro breakdown */}
        <Text style={styles.sectionTitle}>RÉPARTITION DES MACROS</Text>

        <MacroBar label="PROTÉINES" value={goals.protein} pct={30} color={Colors.electricGreen} delay={300} />
        <MacroBar label="GLUCIDES" value={goals.carbs} pct={45} color={Colors.neonBlue} delay={400} />
        <MacroBar label="LIPIDES" value={goals.fat} pct={25} color={Colors.neonPink} delay={500} />

        {/* Projection */}
        {profile.goal !== 'maintain' && (
          <AnimatedGoalCard delay={600}>
            <View style={styles.projRow}>
              <Ionicons name="calendar" size={24} color={Colors.neonYellow} />
              <View style={{ flex: 1 }}>
                <Text style={styles.projTitle}>PROJECTION</Text>
                <Text style={styles.projText}>
                  Pour passer de {profile.weightKg} kg à {profile.targetWeightKg} kg,
                  comptez environ{' '}
                  <Text style={{ color: Colors.neonYellow, fontWeight: '900' }}>
                    {weeksEstimate} semaines
                  </Text>{' '}
                  à ce régime.
                </Text>
              </View>
            </View>
          </AnimatedGoalCard>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Retour"
        >
          <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
        </Pressable>

        <Pressable
          style={styles.nextButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push({ pathname: '/onboarding/ai-style', params: { ...params } });
          }}
          accessibilityLabel="Continuer vers le choix de l'IA"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={[Colors.neonPurple, '#5B21B6']}
            style={styles.nextGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextText}>CHOISIR MON IA</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function ProgressHeader({ step }: { step: number }) {
  const STEPS = ['PROFIL', 'OBJECTIFS', 'IA'];
  return (
    <View style={ph.container}>
      <View style={ph.dotsRow}>
        {STEPS.map((s, i) => (
          <View key={s} style={ph.dotItem}>
            <View style={[ph.dot, i === step && ph.dotActive, i < step && ph.dotDone]} />
            <Text style={[ph.dotLabel, i === step && ph.dotLabelActive]}>{s}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function MetaCard({ label, value, unit, color, delay }: {
  label: string; value: string; unit: string; color: string; delay: number;
}) {
  const ty = useSharedValue(20);
  const op = useSharedValue(0);
  React.useEffect(() => {
    ty.value = withDelay(delay, withSpring(0, { damping: 14 }));
    op.value = withDelay(delay, withSpring(1));
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }], opacity: op.value }));

  return (
    <Animated.View style={[mc.card, { borderColor: color + '40' }, style]}>
      <Text style={[mc.label, { color: color + 'CC' }]}>{label}</Text>
      <Text style={[mc.value, { color }]}>{value}</Text>
      <Text style={mc.unit}>{unit}</Text>
    </Animated.View>
  );
}

function AnimatedGoalCard({ children, delay }: { children: React.ReactNode; delay: number }) {
  const ty = useSharedValue(20);
  const op = useSharedValue(0);
  React.useEffect(() => {
    ty.value = withDelay(delay, withSpring(0, { damping: 14 }));
    op.value = withDelay(delay, withSpring(1));
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }], opacity: op.value }));

  return (
    <Animated.View style={[agc.card, style]}>
      {children}
    </Animated.View>
  );
}

function MacroBar({ label, value, pct, color, delay }: {
  label: string; value: number; pct: number; color: string; delay: number;
}) {
  const width = useSharedValue(0);
  React.useEffect(() => {
    width.value = withDelay(delay, withSpring(pct, { damping: 14 }));
  }, []);
  const barStyle = useAnimatedStyle(() => ({ width: `${width.value}%` as any }));

  return (
    <View style={mb.row}>
      <View style={mb.labelRow}>
        <Text style={[mb.label, { color }]}>{label}</Text>
        <Text style={mb.value}>{value}g <Text style={mb.pct}>({pct}%)</Text></Text>
      </View>
      <View style={mb.track}>
        <Animated.View style={[mb.fill, { backgroundColor: color, shadowColor: color }, barStyle]} />
      </View>
    </View>
  );
}

const ph = StyleSheet.create({
  container: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.xl },
  dotItem: { alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.neonBlue, width: 24, borderRadius: 4 },
  dotDone: { backgroundColor: Colors.electricGreen },
  dotLabel: { fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 1 },
  dotLabelActive: { color: Colors.neonBlue },
});
const mc = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, marginHorizontal: 4, alignItems: 'center',
  },
  label: { fontSize: FontSize.xs, letterSpacing: 1.5, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  value: { fontSize: FontSize.xxl, fontWeight: '900', fontVariant: ['tabular-nums'] },
  unit: { fontSize: FontSize.xs, color: Colors.textMuted },
});
const agc = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md, overflow: 'hidden',
  },
});
const mb = StyleSheet.create({
  row: { marginBottom: Spacing.md },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 2 },
  value: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: '700' },
  pct: { color: Colors.textMuted },
  track: {
    height: 12, backgroundColor: Colors.muted, borderRadius: BorderRadius.full,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.border,
  },
  fill: {
    height: '100%', borderRadius: BorderRadius.full,
    shadowOpacity: 0.8, shadowRadius: 6, shadowOffset: { width: 0, height: 0 },
  },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  topGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 150 },
  title: {
    fontSize: FontSize.xxxl, fontWeight: '900', color: Colors.textPrimary,
    letterSpacing: 3, lineHeight: 40, marginBottom: Spacing.sm,
    textShadowColor: Colors.neonBlue, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
  },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted, letterSpacing: 1, marginBottom: Spacing.lg },
  metaRow: { flexDirection: 'row', marginBottom: Spacing.md },
  sectionTitle: {
    fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 2.5,
    fontWeight: '700', marginBottom: Spacing.md, marginTop: Spacing.sm,
  },
  calorieRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  calorieLabel: { fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 2, fontWeight: '700', marginBottom: 4 },
  calorieValue: {
    fontSize: 48, fontWeight: '900', color: Colors.neonPurple,
    fontVariant: ['tabular-nums'],
    textShadowColor: Colors.neonPurple, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12,
  },
  calorieUnit: { fontSize: FontSize.sm, color: Colors.textSecondary },
  calorieNote: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.sm },
  projRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  projTitle: { fontSize: FontSize.xs, color: Colors.neonYellow, letterSpacing: 2, fontWeight: '700', marginBottom: 4 },
  projText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  footer: {
    flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg,
    alignItems: 'center',
  },
  backButton: {
    width: 52, height: 52, borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  nextButton: {
    flex: 1, borderRadius: BorderRadius.full, overflow: 'hidden',
    shadowColor: Colors.neonPurple, shadowOpacity: 0.6, shadowRadius: 16, shadowOffset: { width: 0, height: 0 },
  },
  nextGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 10, minHeight: 52,
  },
  nextText: { color: '#fff', fontSize: FontSize.md, fontWeight: '900', letterSpacing: 2 },
});
