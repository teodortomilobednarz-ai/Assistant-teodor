import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/theme';
import { Sex, ActivityLevel, Goal, ACTIVITY_LABELS, ACTIVITY_DESCRIPTIONS } from '../../services/bmr';

const STEPS = ['PROFIL', 'OBJECTIFS', 'IA'];

interface FormData {
  age: string;
  sex: Sex | null;
  heightCm: string;
  weightKg: string;
  targetWeightKg: string;
  activityLevel: ActivityLevel | null;
  goal: Goal | null;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    age: '',
    sex: null,
    heightCm: '',
    weightKg: '',
    targetWeightKg: '',
    activityLevel: null,
    goal: null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validate = useCallback((): boolean => {
    const newErrors: typeof errors = {};
    if (!form.age || +form.age < 10 || +form.age > 100) newErrors.age = 'Âge invalide (10–100)';
    if (!form.sex) newErrors.sex = 'Sélectionnez votre sexe';
    if (!form.heightCm || +form.heightCm < 100 || +form.heightCm > 250)
      newErrors.heightCm = 'Taille invalide (100–250 cm)';
    if (!form.weightKg || +form.weightKg < 30 || +form.weightKg > 300)
      newErrors.weightKg = 'Poids invalide (30–300 kg)';
    if (!form.targetWeightKg || +form.targetWeightKg < 30 || +form.targetWeightKg > 300)
      newErrors.targetWeightKg = 'Poids cible invalide';
    if (!form.activityLevel) newErrors.activityLevel = 'Sélectionnez votre niveau';
    if (!form.goal) newErrors.goal = 'Sélectionnez votre objectif';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleNext = useCallback(() => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/onboarding/goals',
      params: {
        age: form.age,
        sex: form.sex!,
        heightCm: form.heightCm,
        weightKg: form.weightKg,
        targetWeightKg: form.targetWeightKg,
        activityLevel: form.activityLevel!,
        goal: form.goal!,
      },
    });
  }, [form, validate, router]);

  const isComplete =
    form.age && form.sex && form.heightCm && form.weightKg &&
    form.targetWeightKg && form.activityLevel && form.goal;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ProgressHeader step={0} steps={STEPS} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={['rgba(124,58,237,0.08)', 'transparent']}
            style={styles.topGlow}
            pointerEvents="none"
          />

          <Text style={styles.title}>INITIALISATION{'\n'}DU PROFIL</Text>
          <Text style={styles.subtitle}>
            Ces données permettent de calculer vos besoins caloriques avec précision scientifique.
          </Text>

          {/* Age + Sex */}
          <View style={styles.row}>
            <View style={styles.fieldHalf}>
              <FieldLabel label="ÂGE" error={errors.age} />
              <NumberInput
                placeholder="25"
                value={form.age}
                onChangeText={(v) => setForm((f) => ({ ...f, age: v }))}
                suffix="ans"
              />
            </View>
            <View style={styles.fieldHalf}>
              <FieldLabel label="SEXE" error={errors.sex} />
              <View style={styles.toggleRow}>
                <ToggleChip
                  label="HOMME"
                  selected={form.sex === 'male'}
                  onPress={() => setForm((f) => ({ ...f, sex: 'male' }))}
                  color={Colors.neonBlue}
                />
                <ToggleChip
                  label="FEMME"
                  selected={form.sex === 'female'}
                  onPress={() => setForm((f) => ({ ...f, sex: 'female' }))}
                  color={Colors.neonPink}
                />
              </View>
            </View>
          </View>

          {/* Height + Weight */}
          <View style={styles.row}>
            <View style={styles.fieldHalf}>
              <FieldLabel label="TAILLE" error={errors.heightCm} />
              <NumberInput
                placeholder="175"
                value={form.heightCm}
                onChangeText={(v) => setForm((f) => ({ ...f, heightCm: v }))}
                suffix="cm"
              />
            </View>
            <View style={styles.fieldHalf}>
              <FieldLabel label="POIDS ACTUEL" error={errors.weightKg} />
              <NumberInput
                placeholder="75"
                value={form.weightKg}
                onChangeText={(v) => setForm((f) => ({ ...f, weightKg: v }))}
                suffix="kg"
              />
            </View>
          </View>

          {/* Target weight */}
          <FieldLabel label="POIDS CIBLE" error={errors.targetWeightKg} />
          <NumberInput
            placeholder="70"
            value={form.targetWeightKg}
            onChangeText={(v) => setForm((f) => ({ ...f, targetWeightKg: v }))}
            suffix="kg"
          />

          {/* Goal */}
          <FieldLabel label="OBJECTIF PRINCIPAL" error={errors.goal} />
          <View style={styles.goalRow}>
            {([
              { id: 'lose', label: 'PERDRE', icon: 'trending-down' },
              { id: 'maintain', label: 'MAINTENIR', icon: 'remove' },
              { id: 'gain', label: 'PRENDRE', icon: 'trending-up' },
            ] as const).map((g) => (
              <Pressable
                key={g.id}
                style={[
                  styles.goalChip,
                  form.goal === g.id && { borderColor: Colors.neonPurple, backgroundColor: Colors.neonPurpleGlow },
                ]}
                onPress={() => {
                  setForm((f) => ({ ...f, goal: g.id }));
                  Haptics.selectionAsync();
                }}
              >
                <Ionicons
                  name={g.icon as any}
                  size={18}
                  color={form.goal === g.id ? Colors.neonPurple : Colors.textMuted}
                />
                <Text style={[styles.goalChipText, form.goal === g.id && { color: Colors.neonPurple }]}>
                  {g.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Activity level */}
          <FieldLabel label="NIVEAU D'ACTIVITÉ" error={errors.activityLevel} />
          {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((level) => (
            <Pressable
              key={level}
              style={[
                styles.activityRow,
                form.activityLevel === level && { borderColor: Colors.neonBlue, backgroundColor: Colors.neonBlueGlow },
              ]}
              onPress={() => {
                setForm((f) => ({ ...f, activityLevel: level }));
                Haptics.selectionAsync();
              }}
            >
              <View style={[
                styles.activityDot,
                { backgroundColor: form.activityLevel === level ? Colors.neonBlue : Colors.border },
              ]} />
              <View style={styles.activityInfo}>
                <Text style={[styles.activityLabel, form.activityLevel === level && { color: Colors.neonBlue }]}>
                  {ACTIVITY_LABELS[level].toUpperCase()}
                </Text>
                <Text style={styles.activityDesc}>{ACTIVITY_DESCRIPTIONS[level]}</Text>
              </View>
              {form.activityLevel === level && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.neonBlue} />
              )}
            </Pressable>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* CTA */}
        <View style={styles.footer}>
          <Pressable
            style={[styles.nextButton, !isComplete && { opacity: 0.5 }]}
            onPress={handleNext}
            disabled={!isComplete}
            accessibilityLabel="Continuer"
            accessibilityRole="button"
          >
            <LinearGradient
              colors={[Colors.neonPurple, '#5B21B6']}
              style={styles.nextGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.nextText}>CALCULER MES OBJECTIFS</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ProgressHeader({ step, steps }: { step: number; steps: string[] }) {
  return (
    <View style={ph.container}>
      <View style={ph.dotsRow}>
        {steps.map((s, i) => (
          <View key={s} style={ph.dotItem}>
            <View style={[
              ph.dot,
              i === step && ph.dotActive,
              i < step && ph.dotDone,
            ]} />
            <Text style={[ph.dotLabel, i === step && ph.dotLabelActive]}>{s}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function FieldLabel({ label, error }: { label: string; error?: string }) {
  return (
    <View style={{ marginBottom: 6, marginTop: 14 }}>
      <Text style={fl.label}>{label}</Text>
      {error && <Text style={fl.error}>{error}</Text>}
    </View>
  );
}

function NumberInput({
  placeholder, value, onChangeText, suffix,
}: {
  placeholder: string; value: string; onChangeText: (v: string) => void; suffix: string;
}) {
  return (
    <View style={ni.wrapper}>
      <TextInput
        style={ni.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        returnKeyType="done"
      />
      <Text style={ni.suffix}>{suffix}</Text>
    </View>
  );
}

function ToggleChip({ label, selected, onPress, color }: {
  label: string; selected: boolean; onPress: () => void; color: string;
}) {
  return (
    <Pressable
      style={[tc.chip, selected && { borderColor: color, backgroundColor: color + '20' }]}
      onPress={() => { onPress(); Haptics.selectionAsync(); }}
    >
      <Text style={[tc.text, selected && { color }]}>{label}</Text>
    </Pressable>
  );
}

const ph = StyleSheet.create({
  container: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.xl },
  dotItem: { alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.neonPurple, width: 24, borderRadius: 4 },
  dotDone: { backgroundColor: Colors.electricGreen },
  dotLabel: { fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 1 },
  dotLabelActive: { color: Colors.neonPurple },
});
const fl = StyleSheet.create({
  label: { fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 2, fontWeight: '700' },
  error: { fontSize: FontSize.xs, color: Colors.neonPink, marginTop: 2, letterSpacing: 0.5 },
});
const ni = StyleSheet.create({
  wrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, minHeight: 48,
  },
  input: { flex: 1, fontSize: FontSize.lg, color: Colors.textPrimary, fontWeight: '700', minHeight: 48 },
  suffix: { fontSize: FontSize.sm, color: Colors.textMuted, marginLeft: 4 },
});
const tc = StyleSheet.create({
  chip: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingVertical: 10, minHeight: 44,
  },
  text: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '700', letterSpacing: 1 },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  topGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 180 },
  title: {
    fontSize: FontSize.xxxl, fontWeight: '900', color: Colors.textPrimary,
    letterSpacing: 3, lineHeight: 40, marginBottom: Spacing.sm,
    textShadowColor: Colors.neonPurple, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
  },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.lg },
  row: { flexDirection: 'row', gap: Spacing.md },
  fieldHalf: { flex: 1 },
  toggleRow: { flexDirection: 'row', gap: 8 },
  goalRow: { flexDirection: 'row', gap: 8 },
  goalChip: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md,
    paddingVertical: 12, minHeight: 60,
    backgroundColor: Colors.surface,
  },
  goalChipText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '700', letterSpacing: 1 },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, marginBottom: 8, minHeight: 56,
  },
  activityDot: { width: 10, height: 10, borderRadius: 5 },
  activityInfo: { flex: 1 },
  activityLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '700', letterSpacing: 1 },
  activityDesc: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  footer: { padding: Spacing.lg, paddingBottom: Spacing.lg },
  nextButton: {
    borderRadius: BorderRadius.full, overflow: 'hidden',
    shadowColor: Colors.neonPurple, shadowOpacity: 0.6, shadowRadius: 16, shadowOffset: { width: 0, height: 0 },
  },
  nextGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 10, minHeight: 56,
  },
  nextText: { color: '#fff', fontSize: FontSize.md, fontWeight: '900', letterSpacing: 2 },
});
