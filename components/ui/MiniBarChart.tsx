import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { fontSizes, spacing } from '../../constants/theme';

type MiniBarChartItem = {
  label: string;
  value: number;
  accent?: boolean;
};

type MiniBarChartProps = {
  data: MiniBarChartItem[];
  height?: number;
};

export function MiniBarChart({
  data,
  height = 180,
}: MiniBarChartProps) {
  return (
    <View style={[styles.chart, { height }]}>
      {data.map((item) => (
        <View key={item.label} style={styles.column}>
          <View style={[styles.track, { height: height - 40 }]}>
            <LinearGradient
              colors={
                item.accent
                  ? ['#67E8F9', '#60A5FA']
                  : ['rgba(148, 163, 184, 0.34)', 'rgba(148, 163, 184, 0.18)']
              }
              end={{ x: 0, y: 0 }}
              start={{ x: 0, y: 1 }}
              style={[styles.fill, { height: `${item.value}%` }]}
            />
          </View>
          <Text style={[styles.label, item.accent ? styles.labelAccent : null]}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 10,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  track: {
    width: '100%',
    maxWidth: 26,
    justifyContent: 'flex-end',
    borderRadius: 999,
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
    padding: 3,
  },
  fill: {
    width: '100%',
    borderRadius: 999,
  },
  label: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: '#70809C',
  },
  labelAccent: {
    color: '#67E8F9',
  },
});
