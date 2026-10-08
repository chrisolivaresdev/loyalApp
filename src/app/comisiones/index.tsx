import { OPCION } from '@/api/agent';
import { ComisionAgente, DetalleComision, TipoVentaComision } from '@/api/comisiones';
import { AppShell, Lang } from '@/components/AppShell';
import { Paginator } from '@/components/Paginator';
import { useLogout } from '@/hooks/useAuth';
import { useClientPagination } from '@/hooks/useClientPagination';
import { useComisionesAgente, useComisionesDashboard, useUltimoEstadoCuenta } from '@/hooks/useComisiones';
import { usePermisos, useRequirePermiso } from '@/hooks/usePermisos';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { palette } from '@/theme';
import { saveDocumentoPdf } from '@/utils/documentoPdf';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Button,
    Divider,
    Icon,
    SegmentedButtons,
    Snackbar,
    Text,
    TouchableRipple,
    useTheme
} from 'react-native-paper';

const labels = {
  es: {
    title: 'Comisiones',
    subtitle: 'Detalle de comisiones por período',
    lastPayment: 'Último pago',
    cycle: 'Ciclo',
    detail: 'Detalle',
    rates: 'Por producto',
    total: 'Total',
    newBusiness: 'Nuevos negocios',
    renewals: 'Renovaciones',
    own: 'Propias',
    agents: 'Agentes',
    commissionPeriod: 'Periodo de Comisiones',
    viewEecc: 'Ver EECC',
    policy: 'Póliza',
    holder: 'Titular',
    saleType: 'Tipo Venta',
    premium: 'Prima',
    payment: 'Forma Pago',
    percent: '% Comisión',
    commission: 'Comisión',
    agent: 'Agente',
    product: 'Producto',
    empty: 'No hay comisiones registradas',
    emptyRates: 'No hay comisiones configuradas para este tipo de venta',
    error: 'No pudimos cargar las comisiones',
    retry: 'Reintentar',
    records: 'registros',
    cycles: 'ciclos',
    noPayment: 'Sin pagos registrados',
    downloadError: 'No pudimos descargar el estado de cuenta',
    page: 'Página',
    of: 'de',
    results: 'ciclos',
    perPage: 'Por página',
    prev: 'Anterior',
    next: 'Siguiente',
    newBusinessShort: 'Nuevo negocio',
  },
  en: {
    title: 'Commissions',
    subtitle: 'Commission detail by period',
    lastPayment: 'Last payment',
    cycle: 'Cycle',
    detail: 'Detail',
    rates: 'By product',
    total: 'Total',
    newBusiness: 'New business',
    renewals: 'Renewals',
    own: 'Own',
    agents: 'Agents',
    commissionPeriod: 'Commission Period',
    viewEecc: 'View statement',
    policy: 'Policy',
    holder: 'Holder',
    saleType: 'Sale Type',
    premium: 'Premium',
    payment: 'Payment Freq.',
    percent: 'Commission %',
    commission: 'Commission',
    agent: 'Agent',
    product: 'Product',
    empty: 'No commissions recorded',
    emptyRates: 'No commissions configured for this sale type',
    error: 'We could not load the commissions',
    retry: 'Retry',
    records: 'records',
    cycles: 'cycles',
    noPayment: 'No payments recorded',
    downloadError: 'We could not download the statement',
    page: 'Page',
    of: 'of',
    results: 'cycles',
    perPage: 'Per page',
    prev: 'Previous',
    next: 'Next',
    newBusinessShort: 'New business',
  },
  pt: {
    title: 'Comissões',
    subtitle: 'Detalhe de comissões por período',
    lastPayment: 'Último pagamento',
    cycle: 'Ciclo',
    detail: 'Detalhe',
    rates: 'Por produto',
    total: 'Total',
    newBusiness: 'Novos negócios',
    renewals: 'Renovações',
    own: 'Próprias',
    agents: 'Agentes',
    commissionPeriod: 'Período de Comissões',
    viewEecc: 'Ver extrato',
    policy: 'Apólice',
    holder: 'Titular',
    saleType: 'Tipo Venda',
    premium: 'Prêmio',
    payment: 'Forma Pagto.',
    percent: '% Comissão',
    commission: 'Comissão',
    agent: 'Agente',
    product: 'Produto',
    empty: 'Não há comissões registradas',
    emptyRates: 'Não há comissões configuradas para este tipo de venda',
    error: 'Não foi possível carregar as comissões',
    retry: 'Tentar novamente',
    records: 'registros',
    cycles: 'ciclos',
    noPayment: 'Sem pagamentos registrados',
    downloadError: 'Não foi possível baixar o extrato',
    page: 'Página',
    of: 'de',
    results: 'ciclos',
    perPage: 'Por página',
    prev: 'Anterior',
    next: 'Próxima',
    newBusinessShort: 'Novo negócio',
  },
} satisfies Record<Lang, Record<string, string>>;

type T = (typeof labels)['es'];

const PRODUCT_COLORS: Record<string, string> = {
  beyond: '#326295', privilege: '#8dc341', liberty: '#30b6b5', legacy: '#841a66', esencial: '#526A36', essential: '#526A36', 'critical care': '#EAC734', criticalcare: '#EAC734',
};
const productColor = (name: string) => PRODUCT_COLORS[name.trim().toLowerCase()] ?? palette.indigo[500];

const DATE_LOCALES: Record<Lang, string> = { es: 'es-ES', en: 'en-US', pt: 'pt-BR' };
const fmtDate = (iso: string, lang: Lang) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(DATE_LOCALES[lang]);
};

const formatPercent = (v: number, lang: Lang) =>
  new Intl.NumberFormat(DATE_LOCALES[lang], { style: 'percent', maximumFractionDigits: 2 }).format(v);

const formatCurrency = (v: number, lang: Lang) =>
  new Intl.NumberFormat(DATE_LOCALES[lang], { style: 'currency', currency: 'USD' }).format(v);

function PercentBadge({ value, color, lang }: { value: number; color: string; lang: Lang }) {
  return (
    <View style={[styles.badge, { backgroundColor: `${color}1A`, borderColor: `${color}55` }]}>
      <Text variant="titleMedium" style={{ color, fontFamily: 'Inter_600SemiBold' }}>{formatPercent(value, lang)}</Text>
    </View>
  );
}

function ComisionCard({ c, lang, t }: { c: ComisionAgente; lang: Lang; t: T }) {
  const { colors, roundness } = useTheme();
  const color = productColor(c.descripcionPoliza);
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness + 2 }]}>
      <View style={[styles.cardBar, { backgroundColor: color }]} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="titleMedium">{c.descripcionPoliza}</Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>{t.agent}: {c.nombreAgente}</Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>{c.descripcionTipoVenta}</Text>
      </View>
      <PercentBadge value={c.porcentajeComision} color={color} lang={lang} />
    </View>
  );
}

export default function ComisionesScreen() {
  const user = useAuthStore((s) => s.user);
  const allowed = useRequirePermiso(OPCION.comisiones);
  const lang = useSettingsStore((s) => s.lang);
  const setLang = useSettingsStore((s) => s.setLang);
  const router = useRouter();
  const logout = useLogout();
  const { colors, roundness } = useTheme();
  const { isDesktop } = useResponsive();
  const t = labels[lang];

  const [tab, setTab] = useState<'detalle' | 'porcentajes'>('detalle');
  const [tipoVenta, setTipoVenta] = useState<TipoVentaComision>('01');
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [downloading, setDownloading] = useState<number | null>(null);
  const [snack, setSnack] = useState('');

  const { canSee } = usePermisos();
  const modOk = canSee(OPCION.comisiones);
  const ratesQuery = useComisionesAgente(tipoVenta, modOk);
  const dashQuery = useComisionesDashboard(modOk);
  const { data: estadoCuenta } = useUltimoEstadoCuenta(modOk);

  const dash = dashQuery.data;
  const groups = useMemo(() => {
    const map = new Map<number, DetalleComision[]>();
    for (const c of dash?.listaComisiones ?? []) {
      const arr = map.get(c.codigoCicloComisiones) ?? [];
      arr.push(c);
      map.set(c.codigoCicloComisiones, arr);
    }
    return [...map.entries()]
      .map(([ciclo, rows]) => ({ ciclo, rows, eecc: rows[0]?.codigoEstadoCuenta, inicio: rows[0]?.fechaInicio, fin: rows[0]?.fechaFin }))
      .sort((a, b) => b.ciclo - a.ciclo);
  }, [dash]);

  const { page, limit, totalPages, pageItems: pageGroups, goPage, changeLimit } = useClientPagination(groups, 5);
  const isOpen = (ciclo: number, idx: number) => expanded[ciclo] ?? idx === 0;

  const downloadEecc = async (codigo: number) => {
    if (!codigo || downloading) return;
    setDownloading(codigo);
    try {
      await saveDocumentoPdf(codigo, `EECC-${codigo}.pdf`);
    } catch {
      setSnack(t.downloadError);
    } finally {
      setDownloading(null);
    }
  };

  const rateRows = useMemo(
    () => (ratesQuery.data ?? []).slice().sort((a, b) => Number(a.codigoPoliza) - Number(b.codigoPoliza)),
    [ratesQuery.data],
  );

  const summaryCards = dash
    ? [
        { label: t.total, value: dash.totalComisiones, color: palette.success },
        { label: t.newBusiness, value: dash.totalComisionesNuevosNegocios, color: palette.indigo[500] },
        { label: t.renewals, value: dash.totalComisionesRenovaciones, color: palette.indigo[400] },
        { label: t.own, value: dash.totalComisionesPropias, color: palette.warning },
        { label: t.agents, value: dash.totalComisionesAgentes, color: palette.warning },
      ]
    : [];

  if (!allowed) return null;

  return (
    <AppShell
      title={t.title}
      userName={user?.NombreCompletoUsuario ?? ''}
      userRole={user?.NombrePerfil}
      lang={lang}
      onLangChange={setLang}
      onProfile={() => router.push('/perfil' as any)}
      onLogout={() => logout.mutate()}
      onHome={() => router.push('/dashboard' as any)}
      onCotizaciones={() => router.push('/cotizaciones' as any)}
      onSolicitudes={() => router.push('/solicitudes' as any)}
      onPolizas={() => router.push('/polizas' as any)}
      onComisiones={() => {}}
    >
      <View style={styles.header}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="headlineSmall">{t.title}</Text>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>{t.subtitle}</Text>
        </View>
      </View>

      {/* Último estado de cuenta */}
      <View style={[styles.payCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
        <View style={[styles.payIcon, { backgroundColor: `${palette.warning}22` }]}>
          <Icon source="bank-transfer" size={26} color={palette.warning} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>{t.lastPayment}</Text>
          <Text variant="headlineSmall" style={{ fontFamily: 'Inter_600SemiBold' }}>
            {estadoCuenta ? formatCurrency(estadoCuenta.MontoPagadoComisiones, lang) : '—'}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {estadoCuenta?.DescripcionCicloComisiones ? `${t.cycle}: ${estadoCuenta.DescripcionCicloComisiones}` : t.noPayment}
          </Text>
        </View>
      </View>

      {/* Cards de resumen */}
      <View style={styles.summaryRow}>
        {summaryCards.map((s) => (
          <View
            key={s.label}
            style={[
              styles.summaryCard,
              { flexBasis: isDesktop ? 140 : '47%', backgroundColor: colors.surface, borderColor: `${s.color}55`, borderRadius: roundness },
            ]}
          >
            <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }} numberOfLines={1}>{s.label}</Text>
            <Text
              variant="titleSmall"
              style={{ color: s.color, fontFamily: 'Inter_600SemiBold', textAlign: 'center' }}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {formatCurrency(s.value, lang)}
            </Text>
          </View>
        ))}
      </View>

      <SegmentedButtons
        value={tab}
        onValueChange={(v) => setTab(v as 'detalle' | 'porcentajes')}
        buttons={[
          { value: 'detalle', label: t.detail, icon: 'format-list-bulleted' },
          { value: 'porcentajes', label: t.rates, icon: 'percent-outline' },
        ]}
        style={isDesktop ? { maxWidth: 420 } : undefined}
      />

      {tab === 'porcentajes' ? (
        <>
          <SegmentedButtons
            value={tipoVenta}
            onValueChange={(v) => setTipoVenta(v as TipoVentaComision)}
            buttons={[
              { value: '01', label: t.newBusinessShort, icon: 'star-outline' },
              { value: '02', label: t.renewals, icon: 'autorenew' },
            ]}
            style={isDesktop ? { maxWidth: 420 } : undefined}
          />
          {ratesQuery.isLoading ? (
            <View style={styles.centered}><ActivityIndicator animating size="large" /></View>
          ) : ratesQuery.isError ? (
            <View style={styles.centered}>
              <Icon source="cloud-off-outline" size={40} color={colors.onSurfaceVariant} />
              <Text variant="titleMedium" style={{ marginTop: 8 }}>{t.error}</Text>
              <Button mode="contained-tonal" icon="refresh" onPress={() => ratesQuery.refetch()} style={{ marginTop: 12 }}>{t.retry}</Button>
            </View>
          ) : rateRows.length === 0 ? (
            <View style={styles.centered}>
              <Icon source="hand-coin-outline" size={40} color={colors.onSurfaceVariant} />
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, marginTop: 8, textAlign: 'center' }}>{t.emptyRates}</Text>
            </View>
          ) : isDesktop ? (
            <View style={[styles.table, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness, opacity: ratesQuery.isFetching ? 0.6 : 1 }]}>
              <View style={[styles.tr, styles.th, { borderBottomColor: colors.outlineVariant, backgroundColor: colors.surfaceVariant }]}>
                <Text variant="labelMedium" style={styles.colProduct}>{t.product}</Text>
                <Text variant="labelMedium" style={styles.colAgent}>{t.agent}</Text>
                <Text variant="labelMedium" style={styles.colType}>{t.commission}</Text>
                <Text variant="labelMedium" style={[styles.colPct, { textAlign: 'right' }]}>{t.percent}</Text>
              </View>
              {rateRows.map((c, i) => {
                const color = productColor(c.descripcionPoliza);
                return (
                  <View key={`${c.codigoPoliza}-${c.codigoAgenteComision}-${i}`} style={[styles.tr, { borderBottomColor: colors.outlineVariant }]}>
                    <View style={[styles.colProduct, styles.productCell]}>
                      <View style={[styles.dot, { backgroundColor: color }]} />
                      <Text variant="bodyMedium" style={{ fontFamily: 'Inter_600SemiBold' }}>{c.descripcionPoliza}</Text>
                    </View>
                    <Text variant="bodyMedium" style={styles.colAgent} numberOfLines={1}>{c.nombreAgente}</Text>
                    <Text variant="bodyMedium" style={styles.colType}>{c.descripcionTipoVenta}</Text>
                    <View style={[styles.colPct, { alignItems: 'flex-end' }]}>
                      <PercentBadge value={c.porcentajeComision} color={color} lang={lang} />
                    </View>
                  </View>
                );
              })}
              <View style={styles.tableFooter}>
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>{rateRows.length} {t.records}</Text>
              </View>
            </View>
          ) : (
            <View style={{ gap: 12, opacity: ratesQuery.isFetching ? 0.6 : 1 }}>
              {rateRows.map((c, i) => <ComisionCard key={`${c.codigoPoliza}-${i}`} c={c} lang={lang} t={t} />)}
            </View>
          )}
        </>
      ) : dashQuery.isLoading ? (
        <View style={styles.centered}><ActivityIndicator animating size="large" /></View>
      ) : dashQuery.isError ? (
        <View style={styles.centered}>
          <Icon source="cloud-off-outline" size={40} color={colors.onSurfaceVariant} />
          <Text variant="titleMedium" style={{ marginTop: 8 }}>{t.error}</Text>
          <Button mode="contained-tonal" icon="refresh" onPress={() => dashQuery.refetch()} style={{ marginTop: 12 }}>{t.retry}</Button>
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.centered}>
          <Icon source="hand-coin-outline" size={40} color={colors.onSurfaceVariant} />
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, marginTop: 8, textAlign: 'center' }}>{t.empty}</Text>
        </View>
      ) : (
        <View style={{ gap: 12, opacity: dashQuery.isFetching ? 0.6 : 1 }}>
          {isDesktop && (
            <View style={[styles.tr, styles.th, { borderBottomColor: colors.outlineVariant, backgroundColor: colors.surfaceVariant, borderRadius: roundness - 4 }]}>
              <Text variant="labelMedium" style={styles.colPolicy}>{t.policy}</Text>
              <Text variant="labelMedium" style={styles.colHolder}>{t.holder}</Text>
              <Text variant="labelMedium" style={styles.colSaleType}>{t.saleType}</Text>
              <Text variant="labelMedium" style={[styles.colMoney, { textAlign: 'right' }]}>{t.premium}</Text>
              <Text variant="labelMedium" style={styles.colPayment}>{t.payment}</Text>
              <Text variant="labelMedium" style={[styles.colSmall, { textAlign: 'right' }]}>{t.percent}</Text>
              <Text variant="labelMedium" style={[styles.colMoney, { textAlign: 'right' }]}>{t.commission}</Text>
              <Text variant="labelMedium" style={styles.colAgent}>{t.agent}</Text>
            </View>
          )}
          {pageGroups.map((g, gi) => {
            const open = isOpen(g.ciclo, gi);
            return (
              <View key={g.ciclo} style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
                <View style={[styles.groupHeader, { backgroundColor: `${palette.indigo[500]}14` }]}>
                  <TouchableRipple onPress={() => downloadEecc(g.eecc ?? 0)} style={styles.eeccBtn} disabled={!g.eecc || downloading === g.eecc}>
                    <View style={styles.eeccInner}>
                      {downloading === g.eecc ? (
                        <ActivityIndicator animating size={14} />
                      ) : (
                        <Icon source="file-pdf-box" size={14} color={palette.indigo[600]} />
                      )}
                      <Text variant="labelMedium" style={{ color: palette.indigo[600] }}>{t.viewEecc}</Text>
                    </View>
                  </TouchableRipple>
                  <TouchableRipple style={{ flex: 1 }} onPress={() => setExpanded((e) => ({ ...e, [g.ciclo]: !open }))}>
                    <View style={styles.periodBtn}>
                      <Text variant="titleSmall" style={{ flex: 1 }} numberOfLines={1}>
                        {t.commissionPeriod}: {fmtDate(g.inicio ?? '', lang)} - {fmtDate(g.fin ?? '', lang)}
                      </Text>
                      <Icon source={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.onSurfaceVariant} />
                    </View>
                  </TouchableRipple>
                </View>
                {open &&
                  g.rows.map((c, i) =>
                    isDesktop ? (
                      <View key={`${c.numeroPoliza}-${i}`} style={[styles.tr, { borderBottomColor: colors.outlineVariant, borderBottomWidth: i < g.rows.length - 1 ? 1 : 0 }]}>
                        <Text variant="bodyMedium" style={[styles.colPolicy, { fontFamily: 'Inter_600SemiBold' }]}>{c.numeroPoliza}</Text>
                        <Text variant="bodyMedium" style={styles.colHolder} numberOfLines={1}>{c.nombreCompleto}</Text>
                        <Text variant="bodyMedium" style={styles.colSaleType} numberOfLines={1}>{c.descripcionTipoVenta}</Text>
                        <Text variant="bodyMedium" style={[styles.colMoney, { textAlign: 'right' }]}>{formatCurrency(c.primaComisionable, lang)}</Text>
                        <Text variant="bodyMedium" style={styles.colPayment} numberOfLines={1}>{c.descripcionFormaPago}</Text>
                        <Text variant="bodyMedium" style={[styles.colSmall, { textAlign: 'right' }]}>{formatPercent(c.porcentajeComision, lang)}</Text>
                        <Text variant="bodyMedium" style={[styles.colMoney, { textAlign: 'right', fontFamily: 'Inter_600SemiBold' }]}>{formatCurrency(c.valorComision, lang)}</Text>
                        <Text variant="bodySmall" style={styles.colAgent} numberOfLines={1}>
                          {String(c.codigoAgenteGenera).padStart(4, '0')} - ({c.nombreAgenteGenera})
                        </Text>
                      </View>
                    ) : (
                      <View key={`${c.numeroPoliza}-${i}`} style={{ paddingHorizontal: 14, paddingVertical: 10 }}>
                        <View style={styles.mobileRow}>
                          <Text variant="titleSmall" style={{ flex: 1 }} numberOfLines={1}>{c.numeroPoliza} · {c.nombreCompleto}</Text>
                          <Text variant="titleSmall" style={{ color: palette.success }}>{formatCurrency(c.valorComision, lang)}</Text>
                        </View>
                        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>
                          {c.descripcionTipoVenta} · {t.premium}: {formatCurrency(c.primaComisionable, lang)} · {c.descripcionFormaPago} · {formatPercent(c.porcentajeComision, lang)}
                        </Text>
                        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>
                          {t.agent}: {String(c.codigoAgenteGenera).padStart(4, '0')} - {c.nombreAgenteGenera}
                        </Text>
                        {i < g.rows.length - 1 && <Divider style={{ marginTop: 10 }} />}
                      </View>
                    ),
                  )}
              </View>
            );
          })}
          <View style={[styles.paginatorWrap, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
            <Paginator
              page={page}
              totalPages={totalPages}
              total={groups.length}
              limit={limit}
              onPage={goPage}
              onLimit={changeLimit}
              labels={t}
              sizes={[5, 10, 25]}
            />
          </View>
        </View>
      )}
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>{snack}</Snackbar>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  payCard: { flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1, padding: 16 },
  payIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  summaryCard: { flexGrow: 1, flexBasis: 140, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12, gap: 2 },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  table: { borderWidth: 1, overflow: 'hidden' },
  tr: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  th: { paddingVertical: 10, borderBottomWidth: 1 },
  colProduct: { flex: 1.4 },
  colAgent: { flex: 2 },
  colType: { flex: 1.2 },
  colPct: { width: 130 },
  colPolicy: { width: 90 },
  colHolder: { flex: 1.6 },
  colSaleType: { flex: 1 },
  colMoney: { width: 90 },
  colPayment: { width: 80 },
  colSmall: { width: 80 },
  productCell: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  tableFooter: { paddingHorizontal: 16, paddingVertical: 10 },
  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, padding: 14, overflow: 'hidden' },
  cardBar: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
  group: { borderWidth: 1, overflow: 'hidden' },
  groupHeader: { flexDirection: 'row', alignItems: 'center', paddingLeft: 12 },
  eeccBtn: { borderRadius: 8 },
  eeccInner: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 12 },
  periodBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 12 },
  mobileRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  paginatorWrap: { borderWidth: 1, overflow: 'hidden' },
});
