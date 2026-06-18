import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/theme';

const MEALS = [
  {
    time: 'MATIN', entries: [
      { name: 'Omelette aux champignons', kcal: 320, p: 24, c: 6, f: 22, icon: '🍳' },
      { name: 'Café noir', kcal: 5, p: 0, c: 1, f: 0, icon: '☕' },
    ],
  },
  {
    time: 'COLLATION', entries: [
      { name: 'Smoothie protéiné', kcal: 280, p: 30, c: 28, f: 5, icon: '🥤' },
    ],
  },
  {
    time: 'DÉJEUNER', entries: [
      { name: 'Salade César', kcal: 420, p: 22, c: 18, f: 28, icon: '🥗' },
      { name: 'Pain complet', kcal: 120, p: 4, c: 22, f: 2, icon: '🍞' },
    ],
  },
  {
    time: 'APRÈS-MIDI', entries: [
      { name: 'Barre protéinée', kcal: 195, p: 20, c: 22, f: 6, icon: '🍫' },
    ],
  },
];

const TOTALS = { kcal: 1340, p: 100, c: 97, f: 63 };

export default function JournalScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>JOURNAL</Text>
        <Pressable style={styles.addBtn} accessibilityLabel="Ajouter un aliment">
          <Ionicons name="add" size={22} color={Colors.background} />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Daily total */}
        <View style={styles.totalCard}>
          {[
            { label: 'CALORIES', value: TOTALS.kcal, unit: 'kcal', color: Colors.neonPurple },
            { label: 'PROTÉINES', value: TOTALS.p, unit: 'g', color: Colors.electricGreen },
            { label: 'GLUCIDES', value: TOTALS.c, unit: 'g', color: Colors.neonBlue },
            { label: 'LIPIDES', value: TOTALS.f, unit: 'g', color: Colors.neonPink },
          ].map((m) => (
            <View key={m.label} style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: m.color }]}>{m.value}</Text>
              <Text style={styles.totalUnit}>{m.unit}</Text>
              <Text style={styles.totalLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        {MEALS.map((group) => (
          <View key={group.time} style={styles.mealGroup}>
            <Text style={styles.groupLabel}>{group.time}</Text>
            {group.entries.map((entry, i) => (
              <View key={i} style={styles.entryRow}>
                <Text style={styles.entryIcon}>{entry.icon}</Text>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryName}>{entry.name}</Text>
                  <Text style={styles.entryMacros}>
                    P:{entry.p}g · G:{entry.c}g · L:{entry.f}g
                  </Text>
                </View>
                <Text style={styles.entryKcal}>{entry.kcal}</Text>
              </View>
            ))}
          </View>
        ))}

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
  addBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.neonPurple, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.neonPurple, shadowOpacity: 0.6, shadowRadius: 12, shadowOffset: { width: 0, height: 0 },
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
});
