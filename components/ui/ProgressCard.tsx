import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { fontSizes, spacing } from '../../constants/theme';
import { GlassPanel } from './GlassPanel';

type ProgressCardProps = {
  eyebrow: string;
  hint?: string;
  value: string;
  detail?: string;
  progress: number;
  children?: ReactNode;
};

export function ProgressCard({
  eyebrow,
  hint,
  value,
  detail,
  progress,
  children,
}: ProgressCardProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <GlassPanel glow style={styles.card} contentStyle={styles.content}>
      <View style={styles.topRow}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Text style={styles.value}>{value}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      <View style={styles.track}>
        <LinearGradient
          colors={['#60A5FA', '#67E8F9', '#A78BFA']}
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 0 }}
          style={[styles.fill, { width: `${clampedProgress * 100}%` }]}
        />
      </View>
      {children}
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  content: {
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: '#C7D5F0',
    letterSpacing: 0.4,
  },
  hint: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: '#7B8BA8',
  },
  value: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -1,
    color: '#F8FAFF',
  },
  detail: {
    fontSize: fontSizes.sm,
    color: '#95A6C4',
  },
  track: {
    height: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
