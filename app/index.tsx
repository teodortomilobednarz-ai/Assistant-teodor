import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { EnergyGauge } from '../components/EnergyGauge';
import { CalorieRing } from '../components/CalorieRing';
import { ScanButton } from '../components/ScanButton';
import { launchMockScan, launchMockCamera } from '../hooks/useMockScan';
import { ScanResult } from '../types/nutrition';

const DAILY_GOALS = {
  calories: 2200,
  protein: 160,
  carbs: 250,
  fat: 73,
};

const CURRENT_INTAKE = {
  calories: 1340,
  protein: 88,
  carbs: 142,
  fat: 38,
};

export default function HomeScreen() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleScan = useCallback(async () => {
    setIsScanning(true);
    try {
      const result: ScanResult | null = await launchMockCamera();
      if (result) {
        router.push({
          pathname: '/scan-result',
          params: { data: JSON.stringify(result) },
        });
      }
    } finally {
      setIsScanning(false);
    }
  }, [router]);

  const handleGallery = useCallback(async () => {
    setIsScanning(true);
    try {
      const result: ScanResult | null = await launchMockScan();
      if (result) {
        router.push({
          pathname: '/scan-result',
          params: { data: JSON.stringify(result) },
        });
      }
    } finally {
      setIsScanning(false);
    }
  }, [router]);

  const handleBarcode = useCallback(() => {
    Alert.alert(
      'SCANNER CODE-BARRES',
      'Module de scan de code-barres en cours d\'intégration. Prochaine mise à jour, Capitaine.',
      [{ text: 'COMPRIS', style: 'default' }]
    );
  }, []);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    Alert.alert(
      `RECHERCHE : ${searchQuery.toUpperCase()}`,
      'Base de données nutritionnelle interrogée. Résultats disponibles dans la prochaine version, Capitaine.',
      [{ text: 'OK', style: 'default' }]
    );
  }, [searchQuery]);

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
          <Pressable style={styles.avatarButton} accessibilityLabel="Profil">
            <LinearGradient
              colors={[Colors.neonPurple, '#5B21B6']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>C</Text>
            </LinearGradient>
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>LVL 7</Text>
            </View>
          </Pressable>
        </View>

        {/* Grid overlay decoration */}
        <View style={styles.gridDecor} pointerEvents="none">
          {[...Array(4)].map((_, i) => (
            <View key={i} style={[styles.gridLine, { top: i * 60 }]} />
          ))}
        </View>

        {/* Energy panel */}
        <View style={styles.energyPanel}>
          <View style={styles.panelHeader}>
            <View style={styles.panelIndicator} />
            <Text style={styles.panelTitle}>TABLEAU DE BORD ÉNERGÉTIQUE</Text>
          </View>

          <View style={styles.ringRow}>
            <CalorieRing
              current={CURRENT_INTAKE.calories}
              goal={DAILY_GOALS.calories}
            />
            <View style={styles.ringStats}>
              <StatPill
                label="OBJECTIF"
                value={`${DAILY_GOALS.calories} kcal`}
                color={Colors.textMuted}
              />
              <StatPill
                label="CONSOMMÉ"
                value={`${CURRENT_INTAKE.calories} kcal`}
                color={Colors.neonPurple}
              />
              <StatPill
                label="RESTANT"
                value={`${DAILY_GOALS.calories - CURRENT_INTAKE.calories} kcal`}
                color={Colors.electricGreen}
              />
            </View>
          </View>
        </View>

        {/* Macro gauges */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={[styles.panelIndicator, { backgroundColor: Colors.neonBlue }]} />
            <Text style={styles.panelTitle}>RÉSERVOIRS DE MACROS</Text>
          </View>

          <EnergyGauge
            label="PROTÉINES"
            current={CURRENT_INTAKE.protein}
            max={DAILY_GOALS.protein}
            unit="g"
            color={Colors.electricGreen}
            glowColor={Colors.electricGreenGlow}
            delay={0}
          />
          <EnergyGauge
            label="GLUCIDES"
            current={CURRENT_INTAKE.carbs}
            max={DAILY_GOALS.carbs}
            unit="g"
            color={Colors.neonBlue}
            glowColor={Colors.neonBlueGlow}
            delay={100}
          />
          <EnergyGauge
            label="LIPIDES"
            current={CURRENT_INTAKE.fat}
            max={DAILY_GOALS.fat}
            unit="g"
            color={Colors.neonPink}
            glowColor={Colors.neonPinkGlow}
            delay={200}
          />
        </View>

        {/* Scan button */}
        <View style={styles.scanSection}>
          <ScanButton onPress={handleScan} isLoading={isScanning} />

          <View style={styles.altActions}>
            <Pressable style={styles.altButton} onPress={handleGallery}>
              <Ionicons name="images-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.altButtonText}>GALERIE</Text>
            </Pressable>

            <View style={styles.altDivider} />

            <Pressable style={styles.altButton} onPress={handleBarcode}>
              <Ionicons name="barcode-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.altButtonText}>CODE-BARRES</Text>
            </Pressable>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={[styles.panelIndicator, { backgroundColor: Colors.neonBlue }]} />
            <Text style={styles.panelTitle}>RECHERCHE MANUELLE</Text>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchInputWrapper}>
              <Ionicons
                name="search"
                size={16}
                color={Colors.textMuted}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un aliment..."
                placeholderTextColor={Colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                accessibilityLabel="Rechercher un aliment"
              />
            </View>
            <Pressable style={styles.searchButton} onPress={handleSearch}>
              <Ionicons name="arrow-forward" size={18} color={Colors.background} />
            </Pressable>
          </View>
        </View>

        {/* Recent meals */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={[styles.panelIndicator, { backgroundColor: Colors.neonPink }]} />
            <Text style={styles.panelTitle}>REPAS RÉCENTS</Text>
          </View>

          {[
            { name: 'Omelette aux champignons', time: '08:32', kcal: 320, icon: '🍳' },
            { name: 'Smoothie protéiné', time: '11:00', kcal: 280, icon: '🥤' },
            { name: 'Salade César', time: '13:15', kcal: 540, icon: '🥗' },
            { name: 'Barre protéinée', time: '16:00', kcal: 200, icon: '🍫' },
          ].map((meal, i) => (
            <View key={i} style={styles.mealRow}>
              <Text style={styles.mealIcon}>{meal.icon}</Text>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealTime}>{meal.time}</Text>
              </View>
              <Text style={styles.mealKcal}>{meal.kcal} kcal</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={statPillStyles.container}>
      <Text style={statPillStyles.label}>{label}</Text>
      <Text style={[statPillStyles.value, { color }]}>{value}</Text>
    </View>
  );
}

const statPillStyles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  value: {
    fontSize: FontSize.md,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});

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
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  gridDecor: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    height: 240,
    overflow: 'hidden',
    opacity: 0.04,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.neonPurple,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  appTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 6,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    textShadowColor: Colors.neonPurple,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  dateText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 2,
    marginTop: 2,
  },
  avatarButton: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.neonPurple + '60',
  },
  avatarText: {
    color: '#fff',
    fontSize: FontSize.lg,
    fontWeight: '900',
  },
  xpBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: Colors.electricGreen,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: Colors.background,
  },
  xpText: {
    fontSize: 8,
    fontWeight: '900',
    color: Colors.background,
    letterSpacing: 0.5,
  },

  // Panels
  energyPanel: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  panel: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: 8,
  },
  panelIndicator: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: Colors.neonPurple,
  },
  panelTitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 2.5,
    fontWeight: '700',
  },

  // Calorie ring row
  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  ringStats: {
    flex: 1,
    justifyContent: 'center',
  },

  // Scan section
  scanSection: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  altActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  altButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    minHeight: 44,
    justifyContent: 'center',
  },
  altButtonText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  altDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.muted,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    minHeight: 48,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neonPurple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.neonPurple,
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },

  // Meal rows
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  mealIcon: {
    fontSize: 24,
    width: 36,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  mealTime: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  mealKcal: {
    fontSize: FontSize.sm,
    color: Colors.neonPurple,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  bottomSpacer: {
    height: 20,
  },
});
