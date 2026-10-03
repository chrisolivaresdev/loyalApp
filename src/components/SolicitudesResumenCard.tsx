import { StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { Lang } from './AppShell';

export interface SolicitudEstadoCount {
  label: string;
  count: number;
}

interface SolicitudesResumenCardProps {
  title: string;
  lastRequestLabel: string;
  lastRequestDate?: string | null;
  total: number;
  items: SolicitudEstadoCount[];
  lang: Lang;
  onPress?: () => void;
}

const DATE_LOCALES: Record<Lang, string> = { es: 'es-ES', en: 'en-US', pt: 'pt-BR' };

const fmtCountPct = (count: number, total: number, lang: Lang) => {
  const pct = total > 0 ? count / total : 0;
  const pctStr = new Intl.NumberFormat(DATE_LOCALES[lang], {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pct);
  return `${count} (${pctStr})`;
};

export function SolicitudesResumenCard({
  title,
  lastRequestLabel,
  lastRequestDate,
  total,
  items,
  lang,
  onPress,
}: SolicitudesResumenCardProps) {
  const { colors, roundness } = useTheme();
  const sum = items.reduce((acc, i) => acc + i.count, 0);

  return (
    <TouchableRipple
      onPress={onPress}
      borderless
      style={[
        styles.card,
        { borderRadius: roundness + 4, backgroundColor: colors.surface, borderColor: colors.outlineVariant },
      ]}
    >
      <View>
        <View style={styles.header}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="titleMedium">
              {title}
              {!!lastRequestDate && (
                <Text variant="titleMedium" style={{ color: colors.onSurfaceVariant }}>
                  {`  -  ${lastRequestLabel} : ${lastRequestDate}`}
                </Text>
              )}
            </Text>
            <Text variant="displaySmall" style={{ fontFamily: 'Inter_600SemiBold' }}>
              {new Intl.NumberFormat(DATE_LOCALES[lang]).format(total)}
            </Text>
          </View>
          <View style={[styles.iconWrap, { backgroundColor: paletteGreen }]}>
            <Icon source="folder-outline" size={22} color="#FFFFFF" />
          </View>
        </View>
        <View style={[styles.list, { borderTopColor: colors.outlineVariant }]}>
          {items.map((item, i) => (
            <View key={item.label}>
              <View style={styles.row}>
                <Text variant="bodyMedium" style={{ flex: 1, color: colors.onSurface }}>
                  {item.label}
                </Text>
                <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, fontVariant: ['tabular-nums'] }}>
                  {fmtCountPct(item.count, sum, lang)}
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
  );
}

const paletteGreen = '#22a06b';

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 280, borderWidth: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-start', padding: 22, paddingBottom: 14 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  list: { borderTopWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 12 },
  separator: { height: 1 },
});
