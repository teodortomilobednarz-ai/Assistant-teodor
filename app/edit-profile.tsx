import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { useUser } from '../store/UserContext';
import type { ActivityLevel, Goal } from '../services/bmr';
import { ACTIVITY_LABELS } from '../services/bmr';

const GOALS: { value: Goal; label: string; icon: string }[] = [
  { value: 'lose', label: 'Perdre du poids', icon: 'trending-down' },
  { value: 'maintain', label: 'Maintenir', icon: 'remove' },
  { value: 'gain', label: 'Prendre du muscle', icon: 'trending-up' },
];

const ACTIVITIES: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'active', 'very_active'];

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, saveProfile } = useUser();

  const [weightKg, setWeightKg] = useState(String(profile?.weightKg ?? ''));
  const [targetWeightKg, setTargetWeightKg] = useState(String(profile?.targetWeightKg ?? ''));
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile?.activityLevel ?? 'moderate');
  const [goal, setGoal] = useState<Goal>(profile?.goal ?? 'maintain');
  const [isSaving, setIsSaving] = useState(false);

  if (!profile) {
    return null;
  }

  const handleSave = async () => {
    const w = parseFloat(weightKg.replace(',', '.'));
    const tw = parseFloat(targetWeightKg.replace(',', '.'));

    if (isNaN(w) || w < 30 || w > 300) {
      Alert.alert('Poids invalide', 'Entrez un poids entre 30 et 300 kg.');
      return;
    }
    if (isNaN(tw) || tw < 30 || tw > 300) {
      Alert.alert('Poids cible invalide', 'Entrez un poids cible entre 30 et 300 kg.');
      return;
    }

    setIsSaving(true);
    try {
      await saveProfile({ ...profile, weightKg: w, targetWeightKg: tw, activityLevel, goal });
      router.back();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.navBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.navTitle}>MODIFIER LE PROFIL</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Weight */}
        <View style={styles.panel}>
          <SectionLabel label="POIDS ACTUEL (kg)" />
          <TextInput
            style={styles.input}
            value={weightKg}
            onChangeText={setWeightKg}
            keyboardType="decimal-pad"
            placeholder="Ex: 75"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="done"
          />
        </View>

        <View style={styles.panel}>
          <SectionLabel label="POIDS CIBLE (kg)" />
          <TextInput
            style={styles.input}
            value={targetWeightKg}
            onChangeText={setTargetWeightKg}
            keyboardType="decimal-pad"
            placeholder="Ex: 70"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="done"
          />
        </View>

        {/* Goal */}
        <View style={styles.panel}>
          <SectionLabel label="OBJECTIF" />
          <View style={styles.optionGroup}>
            {GOALS.map((g) => (
              <Pressable
                key={g.value}
                style={[styles.optionBtn, goal === g.value && styles.optionBtnActive]}
                onPress={() => setGoal(g.value)}
              >
                <Ionicons
                  name={g.icon as any}
                  size={18}
                  color={goal === g.value ? Colors.neonPurple : Colors.textMuted}
                />
                <Text style={[styles.optionText, goal === g.value && styles.optionTextActive]}>
                  {g.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Activity level */}
        <View style={styles.panel}>
          <SectionLabel label="NIVEAU D'ACTIVITÉ" />
          <View style={styles.activityGroup}>
            {ACTIVITIES.map((level) => (
              <Pressable
                key={level}
                style={[styles.activityBtn, activityLevel === level && styles.activityBtnActive]}
                onPress={() => setActivityLevel(level)}
              >
                <Text style={[styles.activityText, activityLevel === level && styles.activityTextActive]}>
                  {ACTIVITY_LABELS[level]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={18} color={Colors.neonBlue} />
          <Text style={styles.infoText}>
            Vos limites journalières de calories, protéines, glucides et lipides seront recalculées automatiquement.
          </Text>
        </View>

        {/* Save */}
        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }, isSaving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSaving}
          accessibilityRole="button"
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>{isSaving ? 'SAUVEGARDE...' : 'ENREGISTRER'}</Text>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  backBtn: { width: 32, height: 32, justifyContent: 'center' },
  navTitle: { fontSize: FontSize.sm, fontWeight: '900', color: Colors.textPrimary, letterSpacing: 2 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.lg },
  panel: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 2.5, fontWeight: '700', marginBottom: Spacing.md,
  },
  input: {
    backgroundColor: Colors.muted, borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border, fontVariant: ['tabular-nums'],
  },
  optionGroup: { gap: Spacing.sm },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.muted,
    minHeight: 44,
  },
  optionBtnActive: { borderColor: Colors.neonPurple + '60', backgroundColor: Colors.neonPurple + '10' },
  optionText: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: '500' },
  optionTextActive: { color: Colors.neonPurple, fontWeight: '700' },
  activityGroup: { gap: Spacing.sm },
  activityBtn: {
    padding: Spacing.md, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.muted,
    minHeight: 44, justifyContent: 'center',
  },
  activityBtnActive: { borderColor: Colors.neonBlue + '60', backgroundColor: Colors.neonBlue + '10' },
  activityText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  activityTextActive: { color: Colors.neonBlue, fontWeight: '700' },
  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    backgroundColor: Colors.neonBlue + '10', borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.neonBlue + '30',
    marginBottom: Spacing.lg,
  },
  infoText: { flex: 1, fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 18 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, backgroundColor: Colors.neonPurple,
    borderRadius: BorderRadius.full, paddingVertical: Spacing.lg, minHeight: 56,
    shadowColor: Colors.neonPurple, shadowOpacity: 0.6, shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 }, elevation: 10,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '900', letterSpacing: 2 },
});
