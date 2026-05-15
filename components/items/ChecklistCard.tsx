import { StyleSheet, Text, View } from 'react-native';

type ChecklistCardProps = {
  title?: string;
  progressLabel?: string;
};

/**
 * Base card placeholder for checklist items.
 * It is intentionally simple to keep the initial structure lightweight.
 */
export function ChecklistCard({
  title = 'Checklist title',
  progressLabel = '0/0 completed',
}: ChecklistCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.progress}>{progressLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  progress: {
    fontSize: 14,
    color: '#475569',
  },
});
