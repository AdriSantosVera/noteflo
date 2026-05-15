import { StyleSheet, Text, View } from 'react-native';

import { fontSizes, spacing } from '../../constants/theme';
import { GlassPanel } from './GlassPanel';

type MiniCalendarDay = {
  key: string;
  label: string;
  dateNumber: number;
  isToday?: boolean;
  isActive?: boolean;
};

type MiniCalendarProps = {
  days: MiniCalendarDay[];
};

export function MiniCalendar({ days }: MiniCalendarProps) {
  return (
    <GlassPanel style={styles.panel} contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Ritmo de esta semana</Text>
        <Text style={styles.caption}>actividad reciente</Text>
      </View>

      <View style={styles.daysRow}>
        {days.map((day) => (
          <View
            key={day.key}
            style={[
              styles.dayCard,
              day.isActive ? styles.dayCardActive : null,
              day.isToday ? styles.dayCardToday : null,
            ]}
          >
            <Text
              style={[
                styles.dayLabel,
                day.isActive ? styles.dayLabelActive : null,
                day.isToday ? styles.dayLabelToday : null,
              ]}
            >
              {day.label}
            </Text>
            <Text
              style={[
                styles.dayNumber,
                day.isActive ? styles.dayNumberActive : null,
                day.isToday ? styles.dayNumberToday : null,
              ]}
            >
              {day.dateNumber}
            </Text>
            <View
              style={[
                styles.activityDot,
                day.isActive ? styles.activityDotActive : null,
                day.isToday ? styles.activityDotToday : null,
              ]}
            />
          </View>
        ))}
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  panel: {
    paddingVertical: spacing.lg,
  },
  content: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: '#D5E0F4',
  },
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: '#7B8BA8',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  dayCard: {
    flex: 1,
    minHeight: 82,
    borderRadius: 18,
    paddingVertical: spacing.md,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(148, 163, 184, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.08)',
  },
  dayCardActive: {
    backgroundColor: 'rgba(103, 232, 249, 0.08)',
    borderColor: 'rgba(103, 232, 249, 0.18)',
  },
  dayCardToday: {
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    borderColor: 'rgba(129, 140, 248, 0.24)',
  },
  dayLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: '#70809C',
  },
  dayLabelActive: {
    color: '#CFE7FF',
  },
  dayLabelToday: {
    color: '#EEF2FF',
  },
  dayNumber: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  dayNumberActive: {
    color: '#F8FAFF',
  },
  dayNumberToday: {
    color: '#FFFFFF',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(148, 163, 184, 0.24)',
  },
  activityDotActive: {
    backgroundColor: '#67E8F9',
  },
  activityDotToday: {
    backgroundColor: '#C4B5FD',
  },
});
