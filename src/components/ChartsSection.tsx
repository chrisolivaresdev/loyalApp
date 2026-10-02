import { palette } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

interface Producto {
  descripcionPoliza: string;
  polizas: number;
  primas: number;
  comisiones: number;
  totalPolizas: number;
  totalPrimas: number;
  totalComisiones: number;
}

interface Venta {
  periodo: string;
  polizas: number;
  primas: number;
  acumulado: number;
  objetivo: number;
  individual: number;
  doble: number;
  master: number;
}

interface Pais {
  descripcionPais: string;
  polizasTotales: number;
  polizas: number;
  nuevoNegocio: string;
  renovaciones: string;
  latitud: number;
  longitud: number;
}

type ChartLang = 'es' | 'en' | 'pt';

interface ChartsSectionProps {
  productos: Producto[] | undefined;
  ventas: Venta[] | undefined;
  paises: Pais[] | undefined;
  lang?: ChartLang;
}

const CHART_LABELS: Record<ChartLang, Record<string, string>> = {
  es: {
    products: 'Productos comparador',
    inPremiums: 'en primas',
    noData: 'Sin datos',
    policies: 'pólizas',
    commissions: 'comisiones',
    sales: 'Tendencia de ventas',
    avgPerPeriod: 'promedio / periodo',
    individual: 'Individual',
    double: 'Doble',
    master: 'Master',
    countries: 'Distribución por país',
    countriesWithPolicies: 'países con pólizas activas',
    newBiz: 'Nuevo',
    renewals: 'Renov',
    months: 'Ene,Feb,Mar,Abr,May,Jun,Jul,Ago,Sep,Oct,Nov,Dic',
  },
  en: {
    products: 'Product comparison',
    inPremiums: 'in premiums',
    noData: 'No data',
    policies: 'policies',
    commissions: 'commissions',
    sales: 'Sales trend',
    avgPerPeriod: 'average / period',
    individual: 'Individual',
    double: 'Double',
    master: 'Master',
    countries: 'Distribution by country',
    countriesWithPolicies: 'countries with active policies',
    newBiz: 'New',
    renewals: 'Renew',
    months: 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec',
  },
  pt: {
    products: 'Comparador de produtos',
    inPremiums: 'em prêmios',
    noData: 'Sem dados',
    policies: 'apólices',
    commissions: 'comissões',
    sales: 'Tendência de vendas',
    avgPerPeriod: 'média / período',
    individual: 'Individual',
    double: 'Duplo',
    master: 'Master',
    countries: 'Distribuição por país',
    countriesWithPolicies: 'países com apólices ativas',
    newBiz: 'Novo',
    renewals: 'Renov',
    months: 'Jan,Fev,Mar,Abr,Mai,Jun,Jul,Ago,Set,Out,Nov,Dez',
  },
};

const CHART_COLORS = [palette.indigo[500], palette.success, palette.navy[500], palette.magenta[500], palette.warning];
const formatCurrency = (n?: number | null) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n ?? 0);
const formatNumber = (n?: number | null) => new Intl.NumberFormat('en-US').format(n ?? 0);

export function ChartsSection({ productos, ventas, paises, lang = 'es' }: ChartsSectionProps) {
  const t = CHART_LABELS[lang];
  const productosTop = useMemo(
    () => (productos || []).slice(0, 5).sort((a, b) => b.primas - a.primas),
    [productos]
  );
  const ventasRecent = useMemo(() => (ventas || []).slice(-6), [ventas]);
  const paisesTop = useMemo(() => (paises || []).slice(0, 5), [paises]);

  const maxProductos = useMemo(() => Math.max(...productosTop.map((p) => p.primas), 1), [productosTop]);
  const { maxVentas, avgVentas } = useMemo(() => {
    const max = Math.max(...ventasRecent.map((v) => v.primas), 1);
    const avg = ventasRecent.reduce((sum, v) => sum + v.primas, 0) / (ventasRecent.length || 1);
    return { maxVentas: max, avgVentas: avg };
  }, [ventasRecent]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <ProductComparisonChart productos={productosTop} max={maxProductos} t={t} />
        <CountriesMapChart paises={paisesTop} t={t} />
      </View>
      <View style={styles.row}>
        <SalesChart ventas={ventasRecent} max={maxVentas} avg={avgVentas} t={t} />
      </View>
    </View>
  );
}

type T = Record<string, string>;

function ProductComparisonChart({ productos, max, t }: { productos: Producto[]; max: number; t: T }) {
  const { colors, roundness } = useTheme();
  const total = useMemo(() => productos.reduce((sum, p) => sum + p.primas, 0) || 1, [productos]);

  return (
    <Card style={[styles.card, { borderRadius: roundness + 4, backgroundColor: colors.surface }]}>
      <Card.Content style={{ gap: 14 }}>
        <View style={styles.header}>
          <Text variant="titleMedium">{t.products}</Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {formatCurrency(total)} {t.inPremiums}
          </Text>
        </View>
        {productos.length === 0 ? (
          <Text style={{ color: colors.onSurfaceVariant }}>{t.noData}</Text>
        ) : (
          productos.map((p, i) => {
            const pctOfMax = max ? (p.primas / max) * 100 : 0;
            const pctOfTotal = (p.primas / total) * 100;
            const barWidth = Math.max(pctOfMax, 4);
            return (
              <View key={i} style={styles.productRow}>
                <View style={styles.productTop}>
                  <View style={styles.rowLabel}>
                    <View style={styles.badge}>
                      <Text variant="labelSmall" style={{ color: '#FFFFFF' }}>{i + 1}</Text>
                    </View>
                    <Text variant="bodyMedium" style={{ flex: 1 }} numberOfLines={1}>
                      {p.descripcionPoliza}
                    </Text>
                  </View>
                  <Text variant="titleSmall" style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>
                    {formatCurrency(p.primas)}
                  </Text>
                </View>
                <View style={styles.barRow}>
                  <View style={[styles.track, { flex: 1 }]}>
                    <View
                      style={[
                        styles.bar,
                        {
                          width: `${barWidth}%`,
                          minWidth: 4,
                          borderRadius: roundness,
                          overflow: 'hidden',
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={[CHART_COLORS[i % CHART_COLORS.length], palette.indigo[800]]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </View>
                  </View>
                  <View style={[styles.percentBadge, { backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }]}>
                    <Text variant="labelSmall" style={{ color: '#FFFFFF' }}>{pctOfTotal.toFixed(0)}%</Text>
                  </View>
                </View>
                <View style={styles.chipsRow}>
                  <View style={[styles.chip, { backgroundColor: colors.background }]}>
                    <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                      {formatNumber(p.polizas)} {t.policies}
                    </Text>
                  </View>
                  <View style={[styles.chip, { backgroundColor: colors.background }]}>
                    <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                      {formatCurrency(p.comisiones)} {t.commissions}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </Card.Content>
    </Card>
  );
}

function SalesChart({ ventas, max, avg, t }: { ventas: Venta[]; max: number; avg: number; t: T }) {
  const { colors, roundness } = useTheme();

  return (
    <Card style={[styles.card, { borderRadius: roundness + 4, backgroundColor: colors.surface }]}>
      <Card.Content style={{ gap: 14 }}>
        <View style={styles.header}>
          <Text variant="titleMedium">{t.sales}</Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {formatCurrency(avg)} {t.avgPerPeriod}
          </Text>
        </View>
        {ventas.length === 0 ? (
          <Text style={{ color: colors.onSurfaceVariant }}>{t.noData}</Text>
        ) : (
          <View style={{ gap: 12 }}>
            <View style={styles.chartWrap}>
              <View style={styles.yAxis}>
                {[100, 75, 50, 25, 0].map((s) => (
                  <Text key={s} numberOfLines={1} style={[styles.axisText, { color: colors.onSurfaceVariant }]}>
                    {formatCompact((max * s) / 100)}
                  </Text>
                ))}
              </View>
              <View style={[styles.plot, { borderLeftColor: colors.outlineVariant, borderBottomColor: colors.outlineVariant }]}>
                {[100, 75, 50, 25].map((s) => (
                  <View
                    key={s}
                    style={[styles.gridLine, { top: `${100 - s}%`, backgroundColor: colors.outlineVariant }]}
                  />
                ))}
                <View style={styles.barsRow}>
                  {ventas.map((v, i) => {
                    const pct = max ? Math.max((v.primas / max) * 100, 1.5) : 0;
                    const parts = [
                      { value: v.individual, color: palette.success },
                      { value: v.doble, color: palette.indigo[500] },
                      { value: v.master, color: palette.navy[500] },
                    ].filter((p) => p.value > 0);
                    const sum = parts.reduce((s, p) => s + p.value, 0);
                    return (
                      <View key={i} style={styles.barColumn}>
                        <View style={[styles.barWrap, { height: `${pct}%` }]}>
                          <Text numberOfLines={1} style={[styles.barValue, { color: colors.onSurface }]}>
                            {formatCompact(v.primas)}
                          </Text>
                          <View style={styles.stackedBar}>
                            {parts.length === 0 ? (
                              <View style={[styles.stack, { flex: 1, backgroundColor: palette.indigo[500] }]} />
                            ) : (
                              parts.map((p, j) => (
                                <View key={j} style={[styles.stack, { flex: p.value / sum, backgroundColor: p.color }]} />
                              ))
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
            <View style={styles.xAxis}>
              {ventas.map((v, i) => (
                <Text key={i} numberOfLines={1} style={[styles.axisText, { color: colors.onSurfaceVariant, flex: 1, textAlign: 'center' }]}>
                  {formatPeriod(v.periodo, t.months)}
                </Text>
              ))}
            </View>
            <View style={styles.legend}>
              {[
                { label: t.individual, color: palette.success },
                { label: t.double, color: palette.indigo[500] },
                { label: t.master, color: palette.navy[500] },
              ].map((l) => (
                <View key={l.label} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                  <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>{l.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

function CountriesMapChart({ paises, t }: { paises: Pais[]; t: T }) {
  const { colors, roundness } = useTheme();
  const total = useMemo(() => paises.reduce((sum, p) => sum + p.polizas, 0) || 1, [paises]);

  return (
    <Card style={[styles.card, { borderRadius: roundness + 4, backgroundColor: colors.surface }]}>
      <Card.Content style={{ gap: 14 }}>
        <View style={styles.header}>
          <Text variant="titleMedium">{t.countries}</Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {paises.length} {t.countriesWithPolicies}
          </Text>
        </View>
        {paises.length === 0 ? (
          <Text style={{ color: colors.onSurfaceVariant }}>{t.noData}</Text>
        ) : (
          <View style={{ gap: 12 }}>
            {paises.map((p, i) => {
              const pct = (p.polizas / total) * 100;
              return (
                <View key={i} style={{ gap: 6 }}>
                  <View style={styles.rowLabel}>
                    <Text variant="bodyMedium" style={{ flex: 1 }} numberOfLines={1}>
                      {p.descripcionPais}
                    </Text>
                    <Text variant="titleSmall">{formatNumber(p.polizas)}</Text>
                  </View>
                  <View style={styles.track}>
                    <View
                      style={{
                        width: `${pct}%`,
                        height: 8,
                        borderRadius: roundness,
                        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                  </View>
                  <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                    {t.newBiz}: {p.nuevoNegocio} · {t.renewals}: {p.renovaciones}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

function formatCompact(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${Math.round(n)}`;
}

function formatPeriod(periodo: string, monthsCsv: string) {
  if (!periodo || periodo.length < 7) return periodo;
  const months = monthsCsv.split(',');
  const month = parseInt(periodo.slice(5, 7), 10) - 1;
  return `${months[month] || periodo.slice(5, 7)} '${periodo.slice(2, 4)}`;
}

const styles = StyleSheet.create({
  container: { marginTop: 8, gap: 20 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  card: { flex: 1, minWidth: 280, minHeight: 480, elevation: 0 },
  header: { gap: 2 },
  productRow: { gap: 8, paddingVertical: 4 },
  productTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  percentBadge: {
    minWidth: 44,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    alignItems: 'center',
  },
  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  rowLabel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowValues: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: palette.indigo[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  bar: { height: '100%' },
  chartWrap: { flexDirection: 'row', height: 200, paddingTop: 22 },
  yAxis: { width: 44, justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 8, marginTop: -7, marginBottom: -7 },
  plot: { flex: 1, position: 'relative', borderLeftWidth: 1, borderBottomWidth: 1 },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, opacity: 0.4 },
  barsRow: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'flex-end' },
  barColumn: { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 6 },
  barWrap: { width: '100%', maxWidth: 48, alignItems: 'center' },
  barValue: { position: 'absolute', top: -18, fontSize: 10, fontWeight: '600', width: 70, textAlign: 'center' },
  stackedBar: { flex: 1, width: '100%', borderTopLeftRadius: 6, borderTopRightRadius: 6, overflow: 'hidden' },
  stack: { width: '100%' },
  xAxis: { flexDirection: 'row', paddingLeft: 44 },
  axisText: { fontSize: 10 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 18, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
});
