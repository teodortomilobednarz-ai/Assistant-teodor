import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withDelay,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/theme';
import { AI_PERSONALITIES, AiStyle } from '../../constants/aiPersonalities';
import { useUser } from '../../store/UserContext';
import { UserProfile } from '../../services/bmr';

export default function AiStyleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string>>();
  const { saveProfile } = useUser();
  const [selected, setSelected] = useState<AiStyle>('rpg');
  const [isSaving, setIsSaving] = useState(false);

  const handleFinish = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const profile: UserProfile = {
      age: +params.age,
      sex: params.sex as 'male' | 'female',
      heightCm: +params.heightCm,
      weightKg: +params.weightKg,
      targetWeightKg: +params.targetWeightKg,
      activityLevel: params.activityLevel as UserProfile['activityLevel'],
      goal: params.goal as UserProfile['goal'],
      aiStyle: selected,
    };

    await saveProfile(profile);
    router.replace('/(tabs)');
  }, [isSaving, params, selected, saveProfile, router]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ProgressHeader step={2} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['rgba(124,58,237,0.1)', 'transparent']}
          style={styles.topGlow}
          pointerEvents="none"
        />

        <Text style={styles.title}>CHOISISSEZ{'\n'}VOTRE IA</Text>
        <Text style={styles.subtitle}>
          Personnalisez l'ambiance de votre assistant nutritionnel. Changeable dans les paramètres.
        </Text>

        {(Object.values(AI_PERSONALITIES)).map((p, i) => (
          <PersonalityCard
            key={p.id}
            personality={p}
            selected={selected === p.id}
            onPress={() => {
              setSelected(p.id);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            delay={i * 100}
          />
        ))}

        {/* Preview */}
        <View style={styles.preview}>
          <View style={styles.previewHeader}>
            <View style={[styles.previewDot, { backgroundColor: AI_PERSONALITIES[selected].color }]} />
            <Text style={[styles.previewTitle, { color: AI_PERSONALITIES[selected].color }]}>
              APERÇU DE LA RÉPONSE IA
            </Text>
          </View>
          <Text style={styles.previewText}>
            "{AI_PERSONALITIES[selected].scanSuccess[0]}"
          </Text>
        </View>

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
          style={[styles.finishButton, isSaving && { opacity: 0.7 }]}
          onPress={handleFinish}
          disabled={isSaving}
          accessibilityLabel="Commencer Nutrascan"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={[Colors.neonPurple, '#5B21B6']}
            style={styles.finishGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isSaving ? (
              <Text style={styles.finishText}>INITIALISATION...</Text>
            ) : (
              <>
                <Ionicons name="rocket" size={20} color="#fff" />
                <Text style={styles.finishText}>LANCER NUTRASCAN</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function PersonalityCard({ personality, selected, onPress, delay }: {
  personality: typeof AI_PERSONALITIES[AiStyle];
  selected: boolean; onPress: () => void; delay: number;
}) {
  const scale = useSharedValue(0.92);
  const op = useSharedValue(0);
  React.useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 14 }));
    op.value = withDelay(delay, withSpring(1));
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: op.value,
  }));

  return (
    <Animated.View style={style}>
      <Pressable
        style={[
          styles.card,
          selected && { borderColor: personality.color, borderWidth: 2 },
        ]}
        onPress={onPress}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={personality.name}
      >
        {selected && (
          <LinearGradient
            colors={[personality.color + '14', personality.color + '04']}
            style={StyleSheet.absoluteFill}
          />
        )}
        <View style={styles.cardTop}>
          <View style={[styles.iconBubble, { backgroundColor: personality.color + '20', borderColor: personality.color + '40' }]}>
            <Ionicons name={personality.icon as any} size={28} color={personality.color} />
          </View>
          <View style={styles.cardNames}>
            <Text style={[styles.cardTitle, selected && { color: personality.color }]}>
              {personality.name}
            </Text>
            <Text style={styles.cardSubtitle}>{personality.subtitle}</Text>
          </View>
          <View style={[styles.radio, selected && { borderColor: personality.color }]}>
            {selected && <View style={[styles.radioDot, { backgroundColor: personality.color }]} />}
          </View>
        </View>
        <Text style={styles.cardDesc}>{personality.description}</Text>
      </Pressable>
    </Animated.View>
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  topGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 160 },
  title: {
    fontSize: FontSize.xxxl, fontWeight: '900', color: Colors.textPrimary,
    letterSpacing: 3, lineHeight: 40, marginBottom: Spacing.sm,
    textShadowColor: Colors.neonPurple, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
  },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.lg },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg,
    marginBottom: Spacing.md, overflow: 'hidden',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  iconBubble: {
    width: 56, height: 56, borderRadius: 28, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  cardNames: { flex: 1 },
  cardTitle: { fontSize: FontSize.md, fontWeight: '900', color: Colors.textPrimary, letterSpacing: 1, marginBottom: 2 },
  cardSubtitle: { fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 0.5 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  cardDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  preview: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, marginTop: Spacing.sm,
  },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  previewDot: { width: 6, height: 6, borderRadius: 3 },
  previewTitle: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 2 },
  previewText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, fontStyle: 'italic' },
  footer: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg, alignItems: 'center' },
  backButton: {
    width: 52, height: 52, borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  finishButton: {
    flex: 1, borderRadius: BorderRadius.full, overflow: 'hidden',
    shadowColor: Colors.neonPurple, shadowOpacity: 0.7, shadowRadius: 16, shadowOffset: { width: 0, height: 0 },
  },
  finishGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 10, minHeight: 52,
  },
  finishText: { color: '#fff', fontSize: FontSize.md, fontWeight: '900', letterSpacing: 2 },
});
