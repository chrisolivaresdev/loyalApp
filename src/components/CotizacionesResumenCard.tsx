import { ResumenCotizaciones } from '@/api/cotizaciones';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { Lang } from './AppShell';

interface CotizacionesResumenCardProps {
  resumen: ResumenCotizaciones | undefined;
  lang: Lang;
  onPress?: () => void;
  onGenerate?: () => void;
}

const DATE_LOCALES: Record<Lang, string> = { es: 'es-ES', en: 'en-US', pt: 'pt-BR' };

const CARD_LABELS: Record<Lang, Record<string, string>> = {
  es: { quotes: 'Cotizaciones', generate: 'Generar Cotización', generated: 'Generada', approved: 'Aprobada', expired: 'Vencida', voided: 'Anulada', pending: 'Pendiente', sent: 'Enviada', inactive: 'Inactiva', rejected: 'Rechazada', cancelled: 'Cancelada' },
  en: { quotes: 'Quotes', generate: 'Create Quote', generated: 'Generated', approved: 'Approved', expired: 'Expired', voided: 'Voided', pending: 'Pending', sent: 'Sent', inactive: 'Inactive', rejected: 'Rejected', cancelled: 'Canceled' },
  pt: { quotes: 'Cotações', generate: 'Gerar Cotação', generated: 'Gerada', approved: 'Aprovada', expired: 'Vencida', voided: 'Anulada', pending: 'Pendente', sent: 'Enviada', inactive: 'Inativa', rejected: 'Rejeitada', cancelled: 'Cancelada' },
};

// Orden de estados igual al portal: Generada, Vencida, Aprobada, Anulada, resto al final
const ESTADO_ORDER = ['GENER', 'VENC', 'EXPIR', 'APROB', 'ANUL', 'CANCEL', 'PEND', 'ENVI', 'INAC', 'RECH'];

const estadoLabel = (desc: string, code: string, l: Record<string, string>) => {
  const raw = `${desc} ${code}`.toUpperCase();
  if (raw.includes('GENER')) return l.generated;
  if (raw.includes('APROB')) return l.approved;
  if (raw.includes('VENC') || raw.includes('EXPIR')) return l.expired;
  if (raw.includes('ANUL') || raw.includes('VOID')) return l.voided;
  if (raw.includes('PEND')) return l.pending;
  if (raw.includes('ENVI')) return l.sent;
  if (raw.includes('INAC')) return l.inactive;
  if (raw.includes('RECH')) return l.rejected;
  if (raw.includes('CANCEL')) return l.cancelled;
  return desc.trim() || raw.trim();
};

const estadoOrder = (desc: string, code: string) => {
  const raw = `${desc} ${code}`.toUpperCase();
  const idx = ESTADO_ORDER.findIndex((k) => raw.includes(k));
  return idx === -1 ? 99 : idx;
};

const fmtCountPct = (count: number, total: number, lang: Lang) => {
  const pct = total > 0 ? count / total : 0;
  const pctStr = new Intl.NumberFormat(DATE_LOCALES[lang], {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pct);
  return `${count} (${pctStr})`;
};

export function CotizacionesResumenCard({ resumen, lang, onPress, onGenerate }: CotizacionesResumenCardProps) {
  const { colors, roundness } = useTheme();
  const l = CARD_LABELS[lang];
  const total = resumen?.total ?? 0;

  const items = [...(resumen?.estados ?? [])]
    .sort((a, b) => {
      const oa = estadoOrder(a.descripcionEstadoCotizacion, a.codigoEstadoCotizacion);
      const ob = estadoOrder(b.descripcionEstadoCotizacion, b.codigoEstadoCotizacion);
      return oa - ob || b.cantidad - a.cantidad;
    })
    .map((e) => ({
      label: estadoLabel(e.descripcionEstadoCotizacion, e.codigoEstadoCotizacion, l),
      count: e.cantidad,
    }));

  return (
    <View
      style={[
        styles.card,
        { borderRadius: roundness + 4, backgroundColor: colors.surface, borderColor: colors.outlineVariant },
      ]}
    >
      <TouchableRipple onPress={onPress} borderless>
        <View>
          <View style={styles.header}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="titleMedium">{l.quotes}</Text>
              <Text variant="displaySmall" style={{ fontFamily: 'Inter_600SemiBold' }}>
                {new Intl.NumberFormat(DATE_LOCALES[lang]).format(total)}
              </Text>
            </View>
            <View style={[styles.iconWrap, { backgroundColor: '#22a06b' }]}>
              <Icon source="calculator-variant-outline" size={22} color="#FFFFFF" />
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
                    {fmtCountPct(item.count, total, lang)}
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
      {onGenerate && (
        <View style={styles.footer}>
          <Button mode="contained" icon="tag-outline" onPress={onGenerate} style={{ borderRadius: roundness - 2 }}>
            {l.generate}
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 280, borderWidth: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-start', padding: 22, paddingBottom: 14 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  list: { borderTopWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 12 },
  separator: { height: 1 },
  footer: { paddingHorizontal: 22, paddingVertical: 16 },
});
