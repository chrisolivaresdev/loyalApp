import { StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

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
  onPress?: () => void;
  icon?: string;
  iconColor?: string;
}

export function BreakdownCard({ title, subtitle, items, onPress, icon, iconColor = '#22a06b' }: BreakdownCardProps) {
  const { colors, roundness } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { borderRadius: roundness + 4, backgroundColor: colors.surface, borderColor: colors.outlineVariant },
      ]}
    >
      <TouchableRipple onPress={onPress} borderless disabled={!onPress} style={styles.ripple}>
        <View>
          <View style={styles.header}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="titleMedium">{title}</Text>
              {!!subtitle && (
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                  {subtitle}
                </Text>
              )}
            </View>
            {!!icon && (
              <View style={[styles.iconWrap, { backgroundColor: iconColor }]}>
                <Icon source={icon} size={22} color="#FFFFFF" />
              </View>
            )}
            {!!onPress && !icon && (
              <Icon source="chevron-right" size={20} color={colors.onSurfaceVariant} />
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
      </TouchableRipple>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 280, borderWidth: 1, overflow: 'hidden' },
  ripple: { padding: 22 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 16 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  list: { gap: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  separator: { height: 1 },
});
