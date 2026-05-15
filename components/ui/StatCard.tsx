import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { fontSizes, spacing } from '../../constants/theme';
import { GlassPanel } from './GlassPanel';

type StatCardProps = {
  title: string;
  value: string;
  detail: string;
  accent: string;
  style?: StyleProp<ViewStyle>;
};

export function StatCard({
  title,
  value,
  detail,
  accent,
  style,
}: StatCardProps) {
  return (
    <GlassPanel style={[styles.card, style]} contentStyle={styles.content}>
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 148,
    padding: spacing.lg,
  },
  content: {
    gap: spacing.xs,
  },
  accent: {
    width: 34,
    height: 4,
    borderRadius: 999,
    marginBottom: spacing.sm,
  },
  value: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -1,
    color: '#F8FAFF',
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: '#D5E0F4',
  },
  detail: {
    fontSize: fontSizes.sm,
    color: '#7B8BA8',
  },
});
