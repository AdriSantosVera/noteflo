import { StyleSheet, Text, View } from 'react-native';

import { fontSizes, spacing } from '../../constants/theme';
import { GlassPanel } from './GlassPanel';

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <GlassPanel style={styles.wrapper} contentStyle={styles.content}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: spacing.xl,
  },
  content: {
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: '#F8FAFF',
  },
  description: {
    fontSize: fontSizes.md,
    lineHeight: 24,
    color: '#95A6C4',
  },
});
