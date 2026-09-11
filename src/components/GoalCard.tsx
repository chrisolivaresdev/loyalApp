import { palette } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

interface GoalCardProps {
  title: string;
  achievedLabel: string;
  goalLabel: string;
  achieved: number;
  goal: number;
  percent: number;
  format: (n: number) => string;
}

export function GoalCard({ title, achievedLabel, goalLabel, achieved, goal, percent, format }: GoalCardProps) {
  const { roundness } = useTheme();
  const pct = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0));

  return (
    <LinearGradient
      colors={[palette.navy[700], palette.navy[900]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { borderRadius: roundness + 4 }]}
    >
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Icon source="flag-checkered" size={20} color={palette.gold[500]} />
        </View>
        <Text variant="titleMedium" style={{ color: '#FFFFFF', flex: 1 }}>
          {title}
        </Text>
        <Text variant="headlineMedium" style={{ color: palette.gold[300] }}>
          {pct.toFixed(0)}%
        </Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>

      <View style={styles.footer}>
        <View>
          <Text variant="labelSmall" style={{ color: palette.navy[200], textTransform: 'uppercase', letterSpacing: 0.8 }}>
            {achievedLabel}
          </Text>
          <Text variant="titleMedium" style={{ color: '#FFFFFF' }}>
            {format(achieved)}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="labelSmall" style={{ color: palette.navy[200], textTransform: 'uppercase', letterSpacing: 0.8 }}>
            {goalLabel}
          </Text>
          <Text variant="titleMedium" style={{ color: '#FFFFFF' }}>
            {format(goal)}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { padding: 24, gap: 18, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: { height: 10, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999, backgroundColor: palette.gold[500] },
  footer: { flexDirection: 'row', justifyContent: 'space-between' },
});
