import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';
import { WeightEntry } from '../store/WeightHistoryContext';

interface Props {
  entries: WeightEntry[];
  width?: number;
  height?: number;
}

export function WeightChart({ entries, width = 340, height = 160 }: Props) {
  if (entries.length < 2) {
    return (
      <View style={[styles.empty, { width, height }]}>
        <Text style={styles.emptyText}>Enregistre au moins 2 pesées pour voir la courbe</Text>
      </View>
    );
  }

  const pad = { top: 16, bottom: 28, left: 40, right: 16 };
  const W = width - pad.left - pad.right;
  const H = height - pad.top - pad.bottom;

  const weights = entries.map((e) => e.weightKg);
  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;

  const toX = (i: number) => pad.left + (i / (entries.length - 1)) * W;
  const toY = (w: number) => pad.top + H - ((w - minW) / (maxW - minW)) * H;

  const points = entries.map((e, i) => `${toX(i)},${toY(e.weightKg)}`).join(' ');
  const latest = entries[entries.length - 1];
  const first  = entries[0];
  const diff   = latest.weightKg - first.weightKg;
  const diffColor = diff <= 0 ? Colors.electricGreen : Colors.neonPink;

  // Y-axis labels
  const yTicks = [minW + 1, (minW + maxW) / 2, maxW - 1].map(Math.round);

  return (
    <View>
      <View style={styles.legend}>
        <Text style={styles.legendVal}>{latest.weightKg} kg</Text>
        <Text style={[styles.legendDiff, { color: diffColor }]}>
          {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
        </Text>
      </View>
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {yTicks.map((t) => (
          <Line
            key={t}
            x1={pad.left} y1={toY(t)}
            x2={pad.left + W} y2={toY(t)}
            stroke={Colors.border} strokeWidth={1}
          />
        ))}
        {/* Y axis labels */}
        {yTicks.map((t) => (
          <SvgText
            key={`l${t}`}
            x={pad.left - 6} y={toY(t) + 4}
            fontSize={9} fill={Colors.textMuted} textAnchor="end"
          >
            {t}
          </SvgText>
        ))}
        {/* Line */}
        <Polyline
          points={points}
          fill="none"
          stroke={Colors.neonPurple}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Dots */}
        {entries.map((e, i) => (
          <Circle
            key={i}
            cx={toX(i)} cy={toY(e.weightKg)}
            r={i === entries.length - 1 ? 5 : 3}
            fill={i === entries.length - 1 ? Colors.neonPurple : Colors.surface}
            stroke={Colors.neonPurple} strokeWidth={2}
          />
        ))}
        {/* X axis — first and last date */}
        <SvgText
          x={toX(0)} y={height - 4}
          fontSize={9} fill={Colors.textMuted} textAnchor="start"
        >
          {first.date.slice(5)}
        </SvgText>
        <SvgText
          x={toX(entries.length - 1)} y={height - 4}
          fontSize={9} fill={Colors.textMuted} textAnchor="end"
        >
          {latest.date.slice(5)}
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  emptyText: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', padding: Spacing.md },
  legend: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm, marginBottom: 4 },
  legendVal: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.textPrimary, fontVariant: ['tabular-nums'] },
  legendDiff: { fontSize: FontSize.sm, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
