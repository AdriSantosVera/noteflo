import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { spacing } from '../../constants/theme';

type GlassPanelProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  glow?: boolean;
};

export function GlassPanel({
  children,
  style,
  contentStyle,
  glow = false,
}: GlassPanelProps) {
  return (
    <LinearGradient
      colors={['rgba(16, 21, 34, 0.92)', 'rgba(10, 14, 24, 0.82)']}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={[styles.panel, style]}
    >
      {glow ? (
        <LinearGradient
          colors={[
            'rgba(103, 232, 249, 0.16)',
            'rgba(96, 165, 250, 0.06)',
            'rgba(167, 139, 250, 0)',
          ]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.glow}
        />
      ) : null}
      <View style={contentStyle}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.14)',
    overflow: 'hidden',
    padding: spacing.xl,
  },
  glow: {
    position: 'absolute',
    top: -56,
    right: -16,
    width: 220,
    height: 220,
    borderRadius: 999,
  },
});
