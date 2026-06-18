import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface Props { children: React.ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error('[Nutrascan] Unhandled error:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.icon}>⚠</Text>
        <Text style={styles.title}>ERREUR SYSTÈME</Text>
        <Text style={styles.message}>
          Une erreur inattendue est survenue. Redémarre l'application.
        </Text>
        <Pressable
          style={styles.btn}
          onPress={() => this.setState({ hasError: false, message: '' })}
          accessibilityRole="button"
          accessibilityLabel="Réessayer"
        >
          <Text style={styles.btnText}>RÉESSAYER</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center', padding: Spacing.xl,
  },
  icon: { fontSize: 56, marginBottom: Spacing.lg },
  title: {
    fontSize: FontSize.xl, fontWeight: '900', color: Colors.neonPink,
    letterSpacing: 4, marginBottom: Spacing.md,
    textShadowColor: Colors.neonPink, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12,
  },
  message: {
    fontSize: FontSize.sm, color: Colors.textMuted,
    textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl,
  },
  btn: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  btnText: { fontSize: FontSize.sm, color: Colors.textMuted, letterSpacing: 2, fontWeight: '700' },
});
