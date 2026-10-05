import { PieChart } from '@/components/PieChart';
import { WorldMap } from '@/components/WorldMap';
import { palette } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Icon, Text, useTheme } from 'react-native-paper';
import Svg, { Line, Polygon, Rect, Path as SvgPath, Text as SvgText } from 'react-native-svg';

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

interface CarteraResumen {
  primasPropias: { activas: Cuadro; pendientePago: Cuadro; periodoGracia: Cuadro; canceladas: Cuadro; total: Cuadro };
  primasAgentes: { activas: Cuadro; pendientePago: Cuadro; periodoGracia: Cuadro; canceladas: Cuadro; total: Cuadro };
}

interface Cuadro { monto: number; cantidad: number }

interface Kpi {
  porcentajeObjetivo: number;
  polizas: number;
  nuevoNegocio: number;
  renovaciones: number;
  pagosRecibidos: number;
  objetivo: number;
}

type ChartLang = 'es' | 'en' | 'pt';

interface ChartsSectionProps {
  productos: Producto[] | undefined;
  ventas: Venta[] | undefined;
  paises: Pais[] | undefined;
  kpi?: Kpi;
  cartera?: CarteraResumen;
  lang?: ChartLang;
}

const CHART_LABELS: Record<ChartLang, Record<string, string>> = {
  es: {
    products: 'Productos comparador',
    inPremiums: 'en primas',
    noData: 'Sin datos',
    policies: 'pólizas',
    commissions: 'comisiones',
    sales: 'Progreso Mensual de Ventas',
    monthlySale: 'Venta Mensual',
    toDate: 'Total a la Fecha',
    objIndividual: 'Objetivo Cobro Individual',
    objDouble: 'Objetivo Cobro Doble',
    objMaster: 'Objetivo Cobro Master',
    countries: 'Países',
    countriesWithPolicies: 'países con pólizas',
    newBiz: 'Nuevo',
    renewals: 'Renov',
    takenPolicies: 'Pólizas Tomadas',
    newBusiness: 'Nuevo Negocio',
    payments: 'Pagos Recibidos',
    portfolio: 'Composición de cartera',
    ownProduction: 'Producción propia',
    agentsProduction: 'Producción de agentes',
    active: 'Activas',
    pendingPayment: 'Pendiente de Pago',
    gracePeriod: 'Período de Gracia',
    cancelled: 'Canceladas',
    months: 'Ene,Feb,Mar,Abr,May,Jun,Jul,Ago,Sep,Oct,Nov,Dic',
  },
  en: {
    products: 'Product comparison',
    inPremiums: 'in premiums',
    noData: 'No data',
    policies: 'policies',
    commissions: 'commissions',
    sales: 'Monthly Sales Progress',
    monthlySale: 'Monthly Sale',
    toDate: 'Total to Date',
    objIndividual: 'Individual Collection Goal',
    objDouble: 'Double Collection Goal',
    objMaster: 'Master Collection Goal',
    countries: 'Countries',
    countriesWithPolicies: 'countries with policies',
    newBiz: 'New',
    renewals: 'Renew',
    takenPolicies: 'Policies Taken',
    newBusiness: 'New Business',
    payments: 'Payments Received',
    portfolio: 'Portfolio composition',
    ownProduction: 'Own production',
    agentsProduction: 'Agents production',
    active: 'Active',
    pendingPayment: 'Pending Payment',
    gracePeriod: 'Grace Period',
    cancelled: 'Cancelled',
    months: 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec',
  },
  pt: {
    products: 'Comparador de produtos',
    inPremiums: 'em prêmios',
    noData: 'Sem dados',
    policies: 'apólices',
    commissions: 'comissões',
    sales: 'Progresso Mensal de Vendas',
    monthlySale: 'Venda Mensal',
    toDate: 'Total até a Data',
    objIndividual: 'Meta Cobrança Individual',
    objDouble: 'Meta Cobrança Dupla',
    objMaster: 'Meta Cobrança Master',
    countries: 'Países',
    countriesWithPolicies: 'países com apólices',
    newBiz: 'Novo',
    renewals: 'Renov',
    takenPolicies: 'Apólices Emitidas',
    newBusiness: 'Novos Negócios',
    payments: 'Pagamentos Recebidos',
    portfolio: 'Composição da carteira',
    ownProduction: 'Produção própria',
    agentsProduction: 'Produção de agentes',
    active: 'Ativas',
    pendingPayment: 'Pagamento Pendente',
    gracePeriod: 'Período de Carência',
    cancelled: 'Canceladas',
    months: 'Jan,Fev,Mar,Abr,Mai,Jun,Jul,Ago,Set,Out,Nov,Dez',
  },
};

const CHART_COLORS = [palette.indigo[500], palette.success, palette.navy[500], palette.magenta[500], palette.warning];
const formatCurrency = (n?: number | null) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n ?? 0);
const formatNumber = (n?: number | null) => new Intl.NumberFormat('en-US').format(n ?? 0);

export function ChartsSection({ productos, ventas, paises, kpi, cartera, lang = 'es' }: ChartsSectionProps) {
  const t = CHART_LABELS[lang];
  const productosTop = useMemo(
    () => (productos || []).slice(0, 5).sort((a, b) => b.primas - a.primas),
    [productos]
  );
  const paisesConDatos = useMemo(() => paises || [], [paises]);

  const maxProductos = useMemo(() => Math.max(...productosTop.map((p) => p.primas), 1), [productosTop]);

  return (
    <View style={styles.container}>
      {!!kpi && <KpiStrip kpi={kpi} t={t} />}
      <View style={styles.row}>
        <SalesProgressChart ventas={ventas || []} t={t} />
      </View>
      {!!cartera && <PortfolioComposition cartera={cartera} t={t} />}
      <View style={styles.row}>
        <ProductComparisonChart productos={productosTop} max={maxProductos} t={t} />
        <CountriesMapChart paises={paisesConDatos} t={t} />
      </View>
    </View>
  );
}

type T = Record<string, string>;

/* ---------- Franja de KPIs (como el portal: % objetivo, pólizas, NN, renovaciones, pagos, objetivo) ---------- */

function MiniGauge({ percent, value, label }: { percent: number; value: string; label: string }) {
  const { colors } = useTheme();
  const pct = Math.max(0, Math.min(percent > 1 ? percent / 100 : percent, 1));
  const r = 30;
  const cx = 36;
  const cy = 34;
  // arco de 180° (semi gauge como el portal)
  const angle = Math.PI * (1 - pct);
  const ex = cx + r * Math.cos(angle);
  const ey = cy - r * Math.sin(angle);
  const large = pct > 0.5 ? 1 : 0;
  const d = pct <= 0 ? '' : `M ${cx - r} ${cy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;

  return (
    <View style={kpiStyles.gaugeWrap}>
      <Svg width={72} height={40}>
        <SvgPath d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#E5E7EB" strokeWidth={7} strokeLinecap="round" />
        {!!d && <SvgPath d={d} fill="none" stroke="#3B82F6" strokeWidth={7} strokeLinecap="round" />}
        <SvgText x={cx} y={cy - 6} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#3B82F6">
          {Math.round(pct * 100)}%
        </SvgText>
      </Svg>
      <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }} numberOfLines={2}>{label}</Text>
      <Text variant="labelMedium" style={{ color: colors.onSurface }} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function KpiStrip({ kpi, t }: { kpi: Kpi; t: T }) {
  const { colors, roundness } = useTheme();
  const items = [
    { label: t.takenPolicies, value: formatNumber(kpi.polizas) },
    { label: t.newBusiness, value: formatCurrency(kpi.nuevoNegocio) },
    { label: t.renewals, value: formatCurrency(kpi.renovaciones) },
    { label: t.payments, value: formatCurrency(kpi.pagosRecibidos) },
  ];
  return (
    <Card style={[styles.card, { borderRadius: roundness + 4, backgroundColor: colors.surface, minHeight: 0 }]}>
      <Card.Content style={kpiStyles.strip}>
        <MiniGauge percent={kpi.porcentajeObjetivo / 100} value={`${Math.round(kpi.porcentajeObjetivo)}%`} label={t.monthlySale} />
        {items.map((it) => (
          <View key={it.label} style={kpiStyles.item}>
            <Text variant="titleLarge" style={{ fontFamily: 'Inter_600SemiBold' }} numberOfLines={1}>{it.value}</Text>
            <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }} numberOfLines={2}>{it.label}</Text>
          </View>
        ))}
        <MiniGauge percent={kpi.porcentajeObjetivo / 100} value={formatCurrency(kpi.objetivo)} label={t.toDate} />
      </Card.Content>
    </Card>
  );
}

/* ---------- Gráfico de progreso mensual: barras venta mensual + área total a la fecha + líneas de objetivo ---------- */

const CH_W = 760;
const CH_H = 240;
const PAD_L = 52;
const PAD_R = 12;
const PAD_T = 14;
const PAD_B = 30;

function SalesProgressChart({ ventas, t }: { ventas: Venta[]; t: T }) {
  const { colors, roundness } = useTheme();

  const model = useMemo(() => {
    const n = ventas.length;
    if (!n) return null;
    const plotW = CH_W - PAD_L - PAD_R;
    const plotH = CH_H - PAD_T - PAD_B;
    const maxY = Math.max(
      ...ventas.map((v) => Math.max(v.acumulado, v.primas, v.objetivo, v.individual, v.doble, v.master)),
      1,
    ) * 1.05;
    const x = (i: number) => PAD_L + (n === 1 ? plotW / 2 : (i * plotW) / (n - 1));
    const y = (v: number) => PAD_T + plotH - (v / maxY) * plotH;
    const linePts = ventas.map((v, i) => `${x(i).toFixed(1)},${y(v.acumulado).toFixed(1)}`).join(' ');
    const area = `${linePts} ${x(n - 1).toFixed(1)},${y(0).toFixed(1)} ${x(0).toFixed(1)},${y(0).toFixed(1)}`;
    const barW = Math.max(2, (plotW / n) * 0.5);
    const labelEvery = Math.ceil(n / 12);
    return { plotW, plotH, maxY, x, y, linePts, area, barW, labelEvery };
  }, [ventas]);

  const goalLines = model
    ? [
        { label: t.objIndividual, value: ventas[0]?.individual ?? 0, color: '#22C55E' },
        { label: t.objDouble, value: ventas[0]?.doble ?? 0, color: '#F59E0B' },
        { label: t.objMaster, value: ventas[0]?.master ?? 0, color: palette.navy[500] },
      ].filter((g) => g.value > 0)
    : [];

  return (
    <Card style={[styles.card, { borderRadius: roundness + 4, backgroundColor: colors.surface }]}>
      <Card.Content style={{ gap: 10 }}>
        <View style={styles.headerCenter}>
          <Text variant="titleSmall" style={{ textAlign: 'center' }}>{t.sales}</Text>
        </View>
        {!model ? (
          <Text style={{ color: colors.onSurfaceVariant }}>{t.noData}</Text>
        ) : (
          <>
            <Svg width="100%" height={CH_H} viewBox={`0 0 ${CH_W} ${CH_H}`} preserveAspectRatio="none">
              {[1, 0.75, 0.5, 0.25, 0].map((s) => (
                <Line key={s} x1={PAD_L} x2={CH_W - PAD_R} y1={PAD_T + model.plotH * (1 - s)} y2={PAD_T + model.plotH * (1 - s)} stroke={colors.outlineVariant} strokeWidth={0.5} />
              ))}
              <Polygon points={model.area} fill={palette.indigo[500]} opacity={0.18} />
              {ventas.map((v, i) => (
                <Rect
                  key={`b${i}`}
                  x={model.x(i) - model.barW / 2}
                  y={model.y(v.primas)}
                  width={model.barW}
                  height={Math.max(1, PAD_T + model.plotH - model.y(v.primas))}
                  fill="#60A5FA"
                  rx={1}
                />
              ))}
              <SvgPath d={`M ${model.linePts.replace(/ /g, ' L ')}`} fill="none" stroke={palette.indigo[500]} strokeWidth={1.8} />
              {goalLines.map((g) => (
                <Line
                  key={g.label}
                  x1={PAD_L}
                  x2={CH_W - PAD_R}
                  y1={model.y(g.value)}
                  y2={model.y(g.value)}
                  stroke={g.color}
                  strokeWidth={1.2}
                  strokeDasharray="6 4"
                />
              ))}
              {ventas.map((v, i) =>
                i % model.labelEvery === 0 || i === ventas.length - 1 ? (
                  <SvgText key={`l${i}`} x={model.x(i)} y={CH_H - 8} textAnchor="middle" fontSize={9} fill={colors.onSurfaceVariant}>
                    {formatPeriod(v.periodo, t.months)}
                  </SvgText>
                ) : null,
              )}
              {[1, 0.75, 0.5, 0.25, 0].map((s) => (
                <SvgText key={`y${s}`} x={PAD_L - 6} y={PAD_T + model.plotH * (1 - s) + 3} textAnchor="end" fontSize={9} fill={colors.onSurfaceVariant}>
                  {formatCompact(model.maxY * s)}
                </SvgText>
              ))}
            </Svg>
            <View style={styles.legend}>
              <LegendDot label={t.monthlySale} color="#60A5FA" />
              <LegendDot label={t.toDate} color={palette.indigo[500]} />
              {goalLines.map((g) => (
                <LegendDot key={g.label} label={g.label} color={g.color} dash />
              ))}
            </View>
          </>
        )}
      </Card.Content>
    </Card>
  );
}

function LegendDot({ label, color, dash }: { label: string; color: string; dash?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={styles.legendItem}>
      {dash ? (
        <View style={{ width: 14, height: 2, backgroundColor: color }} />
      ) : (
        <View style={[styles.legendDot, { backgroundColor: color }]} />
      )}
      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>{label}</Text>
    </View>
  );
}

/* ---------- Composición de cartera: producción propia vs agentes (pies como GraficoAgenteVentaPropia/Agentes) ---------- */

function carteraSlices(r: CarteraResumen['primasPropias'], t: T) {
  return [
    { label: t.active, value: r.activas.monto, color: palette.navy[500] },
    { label: t.pendingPayment, value: r.pendientePago.monto, color: palette.warning },
    { label: t.gracePeriod, value: r.periodoGracia.monto, color: palette.success },
    { label: t.cancelled, value: r.canceladas.monto, color: palette.danger },
  ];
}

function PortfolioComposition({ cartera, t }: { cartera: CarteraResumen; t: T }) {
  const { colors, roundness } = useTheme();
  // El gráfico de agentes siempre se muestra — PieChart dibuja un círculo vacío si todo es 0
  return (
    <View>
      <View style={{ marginBottom: 12 }}>
        <Text variant="titleMedium">{t.portfolio}</Text>
      </View>
      <View style={styles.row}>
        <Card style={[styles.card, { borderRadius: roundness + 4, backgroundColor: colors.surface }]}>
          <Card.Content style={{ gap: 12 }}>
            <View style={styles.header}>
              <Text variant="titleMedium">{t.ownProduction}</Text>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>{formatCurrency(cartera.primasPropias.total.monto)}</Text>
            </View>
            <PieChart slices={carteraSlices(cartera.primasPropias, t)} />
          </Card.Content>
        </Card>
        <Card style={[styles.card, { borderRadius: roundness + 4, backgroundColor: colors.surface }]}>
          <Card.Content style={{ gap: 12 }}>
            <View style={styles.header}>
              <Text variant="titleMedium">{t.agentsProduction}</Text>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>{formatCurrency(cartera.primasAgentes.total.monto)}</Text>
            </View>
            <PieChart slices={carteraSlices(cartera.primasAgentes, t)} />
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

/* ---------- Productos comparador ---------- */

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

/* ---------- Mapa de países ---------- */

function CountriesMapChart({ paises, t }: { paises: Pais[]; t: T }) {
  const { colors, roundness } = useTheme();
  const markers = useMemo(
    () => paises.map((p) => ({ latitud: p.latitud, longitud: p.longitud, label: p.descripcionPais, value: p.polizas })),
    [paises],
  );

  return (
    <Card style={[styles.card, { borderRadius: roundness + 4, backgroundColor: colors.surface }]}>
      <Card.Content style={{ gap: 12 }}>
        <View style={styles.header}>
          <Text variant="titleMedium">{t.countries}</Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {paises.length} {t.countriesWithPolicies}
          </Text>
        </View>
        {paises.length === 0 ? (
          <Text style={{ color: colors.onSurfaceVariant }}>{t.noData}</Text>
        ) : (
          <>
            <WorldMap markers={markers} height={250} />
            <View style={{ gap: 6 }}>
              {paises.slice(0, 5).map((p) => (
                <View key={p.descripcionPais} style={styles.rowLabel}>
                  <Icon source="map-marker" size={14} color="#3B82F6" />
                  <Text variant="bodyMedium" style={{ flex: 1 }} numberOfLines={1}>{p.descripcionPais}</Text>
                  <Text variant="titleSmall">{formatNumber(p.polizas)}</Text>
                  <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>
                    {t.newBiz}: {p.nuevoNegocio} · {t.renewals}: {p.renovaciones}
                  </Text>
                </View>
              ))}
            </View>
          </>
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
  card: { flex: 1, minWidth: 280, minHeight: 360, elevation: 0 },
  header: { gap: 2 },
  headerCenter: { alignItems: 'center' },
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
  rowLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 18, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
});

const kpiStyles = StyleSheet.create({
  strip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, paddingVertical: 6 },
  item: { alignItems: 'center', gap: 2, minWidth: 110, flex: 1 },
  gaugeWrap: { alignItems: 'center', gap: 2, minWidth: 90 },
});
