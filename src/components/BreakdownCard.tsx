import { StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

export interface BreakdownItem {
  label: string;
  value: string;
  color: string;
  icon?: string;
}

interface BreakdownCardProps {
  title: string;
  subtitle?: string;
  items: BreakdownItem[];
}

export function BreakdownCard({ title, subtitle, items }: BreakdownCardProps) {
  const { colors, roundness } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { borderRadius: roundness + 4, backgroundColor: colors.surface, borderColor: colors.outlineVariant },
      ]}
    >
      <View style={styles.header}>
        <Text variant="titleMedium">{title}</Text>
        {!!subtitle && (
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {subtitle}
          </Text>
        )}
      </View>
      <View style={styles.list}>
        {items.map((item, i) => (
          <View key={item.label}>
            <View style={styles.row}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              {!!item.icon && <Icon source={item.icon} size={18} color={colors.onSurfaceVariant} />}
              <Text variant="bodyMedium" style={{ flex: 1, color: colors.onSurface }}>
                {item.label}
              </Text>
              <Text variant="titleSmall" style={{ color: colors.onSurface }}>
                {item.value}
              </Text>
            </View>
            {i < items.length - 1 && (
              <View style={[styles.separator, { backgroundColor: colors.outlineVariant }]} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 280, padding: 22, gap: 16, borderWidth: 1 },
  header: { gap: 2 },
  list: { gap: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  separator: { height: 1 },
});
