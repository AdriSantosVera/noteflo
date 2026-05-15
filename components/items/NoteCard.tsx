import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fontSizes, lightColors, spacing } from '../../constants/theme';

type NoteCardProps = {
  title: string;
  content: string;
  date: string;
  variant?: 'featured' | 'compact';
  onPress?: () => void;
};

/**
 * Reusable note card with two visual modes:
 * `featured` for the protagonist note and `compact` for recent notes.
 */
export function NoteCard({
  title,
  content,
  date,
  variant = 'compact',
  onPress,
}: NoteCardProps) {
  const preview = getPreviewText(content);
  const dateLabel = formatNoteDate(date);
  const isFeatured = variant === 'featured';

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isFeatured ? styles.featuredCard : styles.compactCard,
        pressed && onPress ? styles.cardPressed : null,
      ]}
    >
      <View style={styles.metaRow}>
        {isFeatured ? <Text style={styles.eyebrow}>Nota destacada</Text> : null}
        <Text style={styles.dateLabel}>{dateLabel}</Text>
      </View>
      <Text numberOfLines={isFeatured ? 2 : 1} style={[styles.title, isFeatured ? styles.featuredTitle : styles.compactTitle]}>
        {title}
      </Text>
      <Text
        numberOfLines={isFeatured ? 6 : 2}
        style={[styles.preview, isFeatured ? styles.featuredPreview : styles.compactPreview]}
      >
        {preview}
      </Text>
    </Pressable>
  );
}

function getPreviewText(content: string) {
  const normalized = content.replace(/\s+/g, ' ').trim();
  return normalized || 'Esta nota todavía no tiene contenido.';
}

function formatNoteDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Fecha pendiente';
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    backgroundColor: lightColors.surface,
    gap: spacing.sm,
    shadowColor: '#0F172A',
    shadowOpacity: 0.07,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 3,
  },
  featuredCard: {
    minHeight: 260,
    padding: spacing.xl,
    justifyContent: 'space-between',
    backgroundColor: '#FFFCF7',
  },
  compactCard: {
    padding: spacing.lg,
  },
  cardPressed: {
    opacity: 0.94,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#8C735C',
  },
  title: {
    fontWeight: '700',
    color: lightColors.text,
    letterSpacing: -0.4,
  },
  featuredTitle: {
    fontSize: 30,
    lineHeight: 36,
  },
  compactTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  preview: {
    color: lightColors.textMuted,
  },
  featuredPreview: {
    fontSize: fontSizes.md,
    lineHeight: 28,
    color: '#334155',
  },
  compactPreview: {
    fontSize: fontSizes.sm,
    lineHeight: 22,
  },
  dateLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: '#8B94A7',
    textTransform: 'capitalize',
  },
});
