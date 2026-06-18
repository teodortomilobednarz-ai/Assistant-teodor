import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/theme';
import { useUser } from '../../store/UserContext';
import { usePremium } from '../../store/PremiumContext';
import { useWeightHistory } from '../../store/WeightHistoryContext';
import { AI_PERSONALITIES } from '../../constants/aiPersonalities';
import { ACTIVITY_LABELS } from '../../services/bmr';
import { AdBanner } from '../../components/AdBanner';
import { WeightChart } from '../../components/WeightChart';
import { scheduleMealReminders } from '../../services/notifications';

const NOTIF_KEY = '@nutrascan_notifications_enabled';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, goals, clearProfile } = useUser();
  const { isPremium } = usePremium();
  const { entries: weightEntries } = useWeightHistory();
  const [notifEnabled, setNotifEnabled] = useState(false);

  const personality = profile ? AI_PERSONALITIES[profile.aiStyle] : null;

  useEffect(() => {
    AsyncStorage.getItem(NOTIF_KEY).then((v) => setNotifEnabled(v === 'true'));
  }, []);

  const handleToggleNotif = async (value: boolean) => {
    setNotifEnabled(value);
    await AsyncStorage.setItem(NOTIF_KEY, String(value));
    await scheduleMealReminders(value);
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Réinitialiser le profil',
      'Êtes-vous sûr ? Toutes vos données seront effacées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser', style: 'destructive',
          onPress: async () => {
            await clearProfile();
            router.replace('/onboarding/profile');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>PROFIL</Text>

        {/* Premium status */}
        {!isPremium ? (
          <Pressable
            style={styles.premiumCard}
            onPress={() => router.push('/subscription')}
            accessibilityRole="button"
            accessibilityLabel="Passer à Premium"
          >
            <LinearGradient colors={[Colors.neonPurple + '20', Colors.neonPurple + '08']} style={StyleSheet.absoluteFill} />
            <View style={styles.premiumRow}>
              <Ionicons name="flash" size={24} color={Colors.neonPurple} />
              <View style={{ flex: 1 }}>
                <Text style={styles.premiumTitle}>PASSER À PREMIUM</Text>
                <Text style={styles.premiumSub}>9,99€/mois ou 79,99€/an · Analyse IA illimitée</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.neonPurple} />
            </View>
          </Pressable>
        ) : (
          <View style={[styles.premiumCard, { borderColor: Colors.electricGreen + '40' }]}>
            <LinearGradient colors={[Colors.electricGreen + '12', Colors.electricGreen + '04']} style={StyleSheet.absoluteFill} />
            <View style={styles.premiumRow}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.electricGreen} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.premiumTitle, { color: Colors.electricGreen }]}>PREMIUM ACTIF</Text>
                <Text style={styles.premiumSub}>Toutes les fonctionnalités déverrouillées</Text>
              </View>
            </View>
          </View>
        )}

        {/* Weight history chart */}
        {weightEntries.length > 0 && (
          <View style={styles.panel}>
            <SectionHeader label="ÉVOLUTION DU POIDS" color={Colors.neonPurple} />
            <WeightChart entries={weightEntries} width={340} height={160} />
          </View>
        )}

        {/* Profile stats */}
        {profile && (
          <View style={styles.panel}>
            <SectionHeader label="MES DONNÉES" color={Colors.neonBlue} />
            <InfoRow icon="person"    label="Sexe"         value={profile.sex === 'male' ? 'Homme' : 'Femme'} />
            <InfoRow icon="calendar"  label="Âge"          value={`${profile.age} ans`} />
            <InfoRow icon="resize"    label="Taille"        value={`${profile.heightCm} cm`} />
            <InfoRow icon="scale"     label="Poids actuel"  value={`${profile.weightKg} kg`} />
            <InfoRow icon="flag"      label="Poids cible"   value={`${profile.targetWeightKg} kg`} />
            <InfoRow icon="fitness"   label="Activité"      value={ACTIVITY_LABELS[profile.activityLevel]} />
          </View>
        )}

        {/* Nutrition goals */}
        {goals && (
          <View style={styles.panel}>
            <SectionHeader label="OBJECTIFS JOURNALIERS" color={Colors.neonPurple} />
            <InfoRow icon="flash"     label="Calories"          value={`${goals.calories} kcal`} color={Colors.neonPurple} />
            <InfoRow icon="flash"     label="Métabolisme de base" value={`${goals.bmr} kcal`} />
            <InfoRow icon="flash"     label="Dépense totale"    value={`${goals.tdee} kcal`} />
            <InfoRow icon="nutrition" label="Protéines"         value={`${goals.protein}g`} color={Colors.electricGreen} />
            <InfoRow icon="nutrition" label="Glucides"          value={`${goals.carbs}g`} color={Colors.neonBlue} />
            <InfoRow icon="nutrition" label="Lipides"           value={`${goals.fat}g`} color={Colors.neonPink} />
          </View>
        )}

        {/* AI personality */}
        {personality && (
          <View style={styles.panel}>
            <SectionHeader label="ASSISTANT IA" color={personality.color} />
            <View style={styles.aiRow}>
              <View style={[styles.aiIcon, { backgroundColor: personality.color + '20', borderColor: personality.color + '40' }]}>
                <Ionicons name={personality.icon as any} size={24} color={personality.color} />
              </View>
              <View>
                <Text style={[styles.aiName, { color: personality.color }]}>{personality.name}</Text>
                <Text style={styles.aiSub}>{personality.subtitle}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Notifications */}
        <View style={styles.panel}>
          <SectionHeader label="NOTIFICATIONS" color={Colors.neonBlue} />
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Rappels repas</Text>
              <Text style={styles.switchSub}>12h30 et 20h00 chaque jour</Text>
            </View>
            <Switch
              value={notifEnabled}
              onValueChange={handleToggleNotif}
              trackColor={{ false: Colors.border, true: Colors.neonPurple + '80' }}
              thumbColor={notifEnabled ? Colors.neonPurple : Colors.textMuted}
              accessibilityLabel="Activer les rappels repas"
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.panel}>
          <SectionHeader label="ACTIONS" color={Colors.textMuted} />
          <Pressable
            style={styles.actionRow}
            onPress={() => router.push('/edit-profile')}
            accessibilityRole="button"
            accessibilityLabel="Modifier le profil"
          >
            <Ionicons name="create-outline" size={18} color={Colors.neonBlue} />
            <Text style={[styles.actionText, { color: Colors.neonBlue }]}>Modifier le profil</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} style={{ marginLeft: 'auto' }} />
          </Pressable>
          <Pressable
            style={styles.actionRow}
            onPress={handleResetOnboarding}
            accessibilityRole="button"
            accessibilityLabel="Réinitialiser le profil"
          >
            <Ionicons name="refresh" size={18} color={Colors.neonPink} />
            <Text style={[styles.actionText, { color: Colors.neonPink }]}>Réinitialiser le profil</Text>
          </Pressable>
        </View>

        <AdBanner />
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ label, color }: { label: string; color: string }) {
  return (
    <View style={sh.row}>
      <View style={[sh.dot, { backgroundColor: color }]} />
      <Text style={sh.label}>{label}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value, color }: { icon: string; label: string; value: string; color?: string }) {
  return (
    <View style={ir.row}>
      <Ionicons name={icon as any} size={16} color={Colors.textMuted} style={ir.icon} />
      <Text style={ir.label}>{label}</Text>
      <Text style={[ir.value, color ? { color } : {}]}>{value}</Text>
    </View>
  );
}

const sh = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md },
  dot: { width: 3, height: 14, borderRadius: 2 },
  label: { fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 2.5, fontWeight: '700' },
});

const ir = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 10,
  },
  icon: { width: 20 },
  label: { flex: 1, fontSize: FontSize.md, color: Colors.textSecondary },
  value: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, fontVariant: ['tabular-nums'] },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  title: {
    fontSize: FontSize.xxl, fontWeight: '900', color: Colors.textPrimary,
    letterSpacing: 5, marginBottom: Spacing.lg,
    textShadowColor: Colors.neonPurple, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
  },
  premiumCard: {
    borderRadius: BorderRadius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.neonPurple + '40',
    marginBottom: Spacing.md, minHeight: 64,
  },
  premiumRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg },
  premiumTitle: { fontSize: FontSize.md, fontWeight: '900', color: Colors.neonPurple, letterSpacing: 1 },
  premiumSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  panel: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md,
  },
  aiRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  aiIcon: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  aiName: { fontSize: FontSize.md, fontWeight: '900', letterSpacing: 1 },
  aiSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, minHeight: 44 },
  switchLabel: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: '600' },
  switchSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md, minHeight: 44,
  },
  actionText: { fontSize: FontSize.md, fontWeight: '600' },
});
