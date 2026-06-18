import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/theme';
import { useDailyLog, FoodEntry } from '../../store/DailyLogContext';
import { AdBanner } from '../../components/AdBanner';

const MEAL_LABELS: Record<FoodEntry['mealTime'], string> = {
  breakfast: 'MATIN',
  lunch: 'DÉJEUNER',
  dinner: 'DÎNER',
  snack: 'COLLATION',
};

const MEAL_ORDER: FoodEntry['mealTime'][] = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function JournalScreen() {
  const { entries, totals, removeEntry } = useDailyLog();

  const groups = MEAL_ORDER.map((mealTime) => ({
    mealTime,
    label: MEAL_LABELS[mealTime],
    entries: entries.filter((e) => e.mealTime === mealTime),
  })).filter((g) => g.entries.length > 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>JOURNAL</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Daily totals */}
        <View style={styles.totalCard}>
          {[
            { label: 'CALORIES', value: totals.calories, unit: 'kcal', color: Colors.neonPurple },
            { label: 'PROTÉINES', value: totals.protein, unit: 'g', color: Colors.electricGreen },
            { label: 'GLUCIDES', value: totals.carbs, unit: 'g', color: Colors.neonBlue },
            { label: 'LIPIDES', value: totals.fat, unit: 'g', color: Colors.neonPink },
          ].map((m) => (
            <View key={m.label} style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: m.color }]}>{m.value}</Text>
              <Text style={styles.totalUnit}>{m.unit}</Text>
              <Text style={styles.totalLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        {groups.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>JOURNAL VIDE</Text>
            <Text style={styles.emptySub}>Scannez vos repas depuis le tableau de bord pour les voir apparaître ici.</Text>
          </View>
        ) : (
          groups.map((group) => (
            <View key={group.mealTime} style={styles.mealGroup}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              {group.entries.map((entry) => (
                <View key={entry.id} style={styles.entryRow}>
                  <Text style={styles.entryIcon}>{entry.icon}</Text>
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryName}>{entry.foodName}</Text>
                    <Text style={styles.entryMacros}>
                      P:{entry.protein}g · G:{entry.carbs}g · L:{entry.fat}g
                    </Text>
                  </View>
                  <Text style={styles.entryKcal}>{entry.calories}</Text>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      removeEntry(entry.id);
                    }}
                    hitSlop={8}
                    accessibilityLabel="Supprimer cet aliment"
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                  </Pressable>
                </View>
              ))}
            </View>
          ))
        )}

        <AdBanner />
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl, fontWeight: '900', color: Colors.textPrimary,
    letterSpacing: 5, textShadowColor: Colors.neonBlue,
    textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.lg },
  totalCard: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg,
    justifyContent: 'space-around',
  },
  totalItem: { alignItems: 'center' },
  totalValue: { fontSize: FontSize.xl, fontWeight: '900', fontVariant: ['tabular-nums'] },
  totalUnit: { fontSize: FontSize.xs, color: Colors.textMuted },
  totalLabel: { fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 1, marginTop: 2, fontWeight: '700' },
  mealGroup: { marginBottom: Spacing.lg },
  groupLabel: {
    fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 2.5,
    fontWeight: '700', marginBottom: Spacing.sm,
  },
  entryRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: 6, borderWidth: 1, borderColor: Colors.border,
    minHeight: 56,
  },
  entryIcon: { fontSize: 22, width: 30 },
  entryInfo: { flex: 1 },
  entryName: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: '500' },
  entryMacros: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  entryKcal: { fontSize: FontSize.md, color: Colors.neonPurple, fontWeight: '700', fontVariant: ['tabular-nums'] },
  deleteBtn: { padding: 4 },
  emptyState: {
    alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm,
  },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.sm },
  emptyTitle: { fontSize: FontSize.md, fontWeight: '900', color: Colors.textMuted, letterSpacing: 3 },
  emptySub: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
