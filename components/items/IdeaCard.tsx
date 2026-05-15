import { StyleSheet, Text, View } from 'react-native';

type IdeaCardProps = {
  title?: string;
  summary?: string;
};

/**
 * Base card placeholder for idea items.
 * Future variants can extend this component without coupling it to a screen.
 */
export function IdeaCard({
  title = 'Idea title',
  summary = 'Idea summary',
}: IdeaCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.summary}>{summary}</Text>
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
  summary: {
    fontSize: 14,
    color: '#475569',
  },
});
