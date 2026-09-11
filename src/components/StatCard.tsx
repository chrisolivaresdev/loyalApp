import { StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
}

export function StatCard({ icon, label, value, hint, accent }: StatCardProps) {
  const { colors, roundness } = useTheme();
  const color = accent ?? colors.primary;

  return (
    <View
      style={[
        styles.card,
        {
          borderRadius: roundness,
          backgroundColor: colors.surface,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: `${color}14` }]}>
          <Icon source={icon} size={20} color={color} />
        </View>
        <View style={[styles.accentDot, { backgroundColor: color }]} />
      </View>
      <Text
        variant="labelMedium"
        style={{ color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8 }}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text variant="headlineSmall" style={{ color: colors.onSurface }} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {!!hint && (
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>
          {hint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 150, padding: 20, gap: 6, borderWidth: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  accentDot: { width: 8, height: 8, borderRadius: 4, opacity: 0.6 },
});
