import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fontSizes, spacing } from '../../constants/theme';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
};

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  trailing,
}: SectionHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {trailing ? <View>{trailing}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  eyebrow: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: '#8DA1C8',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#F8FAFF',
  },
  subtitle: {
    fontSize: fontSizes.sm,
    lineHeight: 22,
    color: '#95A6C4',
  },
});
