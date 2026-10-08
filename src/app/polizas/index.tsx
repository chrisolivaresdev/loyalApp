import { OPCION } from '@/api/agent';
import { reportePolizasUrl } from '@/api/certificados';
import { PolizaActiva } from '@/api/polizas';
import { AppShell, Lang } from '@/components/AppShell';
import { Paginator } from '@/components/Paginator';
import { SelectField } from '@/components/SelectField';
import { useLogout } from '@/hooks/useAuth';
import { usePermisos, useRequirePermiso } from '@/hooks/usePermisos';
import { usePolizasActivas } from '@/hooks/usePolizas';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { palette } from '@/theme';
import { descargarArchivoAutenticado } from '@/utils/downloadFile';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Button,
    Divider,
    Icon,
    IconButton,
    Searchbar,
    Text,
    TextInput,
    TouchableRipple,
    useTheme
} from 'react-native-paper';

const labels = {
  es: {
    policies: 'Pólizas',
    subtitle: 'Pólizas activas de tu cartera',
    search: 'Buscar por titular…',
    filters: 'Filtros',
    policyNumber: 'N° de póliza',
    product: 'Producto',
    state: 'Estado',
    saleType: 'Tipo de venta',
    all: 'Todos',
    holder: 'Titular',
    plan: 'Plan',
    country: 'País',
    insureds: 'Asegurados',
    premium: 'Prima',
    validity: 'Vigencia',
    payment: 'Forma de pago',
    cert: 'Certificado',
    loading: 'Cargando pólizas…',
    error: 'No pudimos cargar las pólizas',
    retry: 'Reintentar',
    empty: 'No hay pólizas',
    emptyHint: 'No se encontraron pólizas con estos filtros.',
    clearFilters: 'Limpiar filtros',
    of: 'de',
    results: 'resultados',
    perPage: 'Por página',
    active: 'Activa',
    gracePeriod: 'Período de Gracia',
    pendingPayment: 'Pendiente de Pago',
    cancelled: 'Cancelada',
    newBusiness: 'Nuevo Negocio',
    renewals: 'Renovaciones',
    exportExcel: 'Excel',
    exportPdf: 'PDF',
    exporting: 'Exportando…',
    allLevels: 'Todos los niveles',
  },
  en: {
    policies: 'Policies',
    subtitle: 'Active policies in your portfolio',
    search: 'Search by holder…',
    filters: 'Filters',
    policyNumber: 'Policy number',
    product: 'Product',
    state: 'Status',
    saleType: 'Sale type',
    all: 'All',
    holder: 'Holder',
    plan: 'Plan',
    country: 'Country',
    insureds: 'Insured',
    premium: 'Premium',
    validity: 'Validity',
    payment: 'Payment method',
    cert: 'Certificate',
    loading: 'Loading policies…',
    error: 'Could not load policies',
    retry: 'Retry',
    empty: 'No policies',
    emptyHint: 'No policies found with these filters.',
    clearFilters: 'Clear filters',
    of: 'of',
    results: 'results',
    perPage: 'Per page',
    active: 'Active',
    gracePeriod: 'Grace Period',
    pendingPayment: 'Pending Payment',
    cancelled: 'Cancelled',
    newBusiness: 'New Business',
    renewals: 'Renewals',
    exportExcel: 'Excel',
    exportPdf: 'PDF',
    exporting: 'Exporting…',
    allLevels: 'All levels',
  },
  pt: {
    policies: 'Apólices',
    subtitle: 'Apólices ativas da sua carteira',
    search: 'Buscar por titular…',
    filters: 'Filtros',
    policyNumber: 'Nº da apólice',
    product: 'Produto',
    state: 'Status',
    saleType: 'Tipo de venda',
    all: 'Todos',
    holder: 'Titular',
    plan: 'Plano',
    country: 'País',
    insureds: 'Segurados',
    premium: 'Prêmio',
    validity: 'Vigência',
    payment: 'Forma de pagamento',
    cert: 'Certificado',
    loading: 'Carregando apólices…',
    error: 'Não foi possível carregar as apólices',
    retry: 'Tentar novamente',
    empty: 'Não há apólices',
    emptyHint: 'Nenhuma apólice encontrada com estes filtros.',
    clearFilters: 'Limpar filtros',
    of: 'de',
    results: 'resultados',
    perPage: 'Por página',
    active: 'Ativa',
    gracePeriod: 'Período de Carência',
    pendingPayment: 'Pagamento Pendente',
    cancelled: 'Cancelada',
    newBusiness: 'Novo Negócio',
    renewals: 'Renovações',
    exportExcel: 'Excel',
    exportPdf: 'PDF',
    exporting: 'Exportando…',
    allLevels: 'Todos os níveis',
  },
};

type T = (typeof labels)['es'];

// Valores reales que devuelve el backend (filtro LIKE sobre la descripción)
const ESTADO_VALUES = ['Activa', 'Periodo de Gracia', 'Pendiente de Pago', 'Cancelada'] as const;
const ESTADO_LABEL_KEYS = ['active', 'gracePeriod', 'pendingPayment', 'cancelled'] as const;
const VENTA_VALUES = ['Nuevo Negocio', 'Renovaciones'] as const;
const VENTA_LABEL_KEYS = ['newBusiness', 'renewals'] as const;

const estadoColor = (desc?: string) => {
  const d = (desc ?? '').toLowerCase();
  if (d.includes('activ')) return palette.success;
  if (d.includes('gracia') || d.includes('pendiente')) return palette.warning;
  if (d.includes('cancel') || d.includes('anulad')) return palette.danger;
  return palette.slate[500];
};

const fmtMoney = (n: number) => `$${(Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const DATE_LOCALES: Record<Lang, string> = { es: 'es-ES', en: 'en-US', pt: 'pt-BR' };
const fmtDate = (iso: string, lang: Lang) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(DATE_LOCALES[lang]);
};

function FilterInput({ label, value, onChange, style }: { label: string; value: string; onChange: (v: string) => void; style?: object }) {
  const { colors, roundness } = useTheme();
  return (
    <View style={[styles.filterField, style]}>
      <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>{label}</Text>
      <TextInput
        mode="outlined"
        dense
        value={value}
        onChangeText={onChange}
        placeholder={label}
        outlineStyle={{ borderRadius: roundness - 4, borderColor: colors.outline }}
        style={{ backgroundColor: colors.background, fontSize: 13 }}
      />
    </View>
  );
}

function EstadoChip({ desc }: { desc: string }) {
  return (
    <View style={[styles.status, { backgroundColor: estadoColor(desc) }]}>
      <View style={styles.statusDot} />
      <Text variant="labelMedium" style={{ color: '#FFFFFF' }} numberOfLines={1}>{desc}</Text>
    </View>
  );
}

function PolizaCard({ p, t, lang, onDetail, showDetail }: { p: PolizaActiva; t: T; lang: Lang; onDetail: () => void; showDetail: boolean }) {
  const { colors, roundness } = useTheme();
  return (
    <TouchableRipple onPress={showDetail ? onDetail : undefined} borderless style={{ borderRadius: roundness + 2 }}>
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness + 2 }]}>
      <View style={styles.cardTop}>
        <View style={[styles.codeBadge, { backgroundColor: palette.indigo[50] }]}>
          <Text variant="labelLarge" style={{ color: palette.indigo[600] }} numberOfLines={1}>{p.numeroPoliza.trim() || `#${p.codigoCertificado}`}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {showDetail && <IconButton icon="eye-outline" size={18} onPress={onDetail} style={{ margin: 0 }} />}
          <EstadoChip desc={p.descripcionEstadoCertificado} />
        </View>
      </View>
      <Text variant="titleMedium" numberOfLines={1}>{p.nombreCompleto}</Text>
      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>
        {p.descripcionPoliza} · {p.descripcionPlan}
      </Text>
      <View style={styles.metaRow}>
        <Icon source="map-marker-outline" size={14} color={colors.onSurfaceVariant} />
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>{p.descripcionPais}</Text>
        <Text variant="bodySmall" style={{ color: colors.outline }}>·</Text>
        <Icon source="calendar-outline" size={14} color={colors.onSurfaceVariant} />
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>{fmtDate(p.fechaInicioVigencia, lang)}</Text>
        <Text variant="bodySmall" style={{ color: colors.outline }}>·</Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>{p.descripcionFormaPago}</Text>
      </View>
      <Divider style={{ marginVertical: 4 }} />
      <View style={styles.cardBottom}>
        <View style={styles.metaItem}>
          <Icon source="account-group-outline" size={14} color={colors.onSurfaceVariant} />
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>{p.numeroAsegurados} {t.insureds.toLowerCase()}</Text>
        </View>
        <Text variant="titleMedium" style={{ color: palette.indigo[600] }}>{fmtMoney(p.prima)}</Text>
      </View>
    </View>
    </TouchableRipple>
  );
}

function PolizaRow({ p, t, lang, onDetail, showDetail }: { p: PolizaActiva; t: T; lang: Lang; onDetail: () => void; showDetail: boolean }) {
  const { colors } = useTheme();
  return (
    <TouchableRipple onPress={showDetail ? onDetail : undefined} borderless>
      <View style={[styles.tr, { borderBottomColor: colors.outlineVariant }]}>
        <Text variant="labelLarge" style={[styles.colPolicy, { color: palette.indigo[600] }]}>{p.numeroPoliza.trim() || `#${p.codigoCertificado}`}</Text>
        <View style={styles.colHolder}>
          <Text variant="bodyMedium" numberOfLines={1} style={{ fontFamily: 'Inter_600SemiBold' }}>{p.nombreCompleto}</Text>
          <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.onSurfaceVariant }}>
            {p.descripcionPoliza} · {p.descripcionPlan}
          </Text>
        </View>
        <Text variant="bodyMedium" style={styles.colVenta} numberOfLines={1}>{p.descripcionTipoVenta}</Text>
        <Text variant="bodyMedium" style={styles.colCountry} numberOfLines={1}>{p.descripcionPais}</Text>
        <Text variant="bodyMedium" style={styles.colDate}>{fmtDate(p.fechaInicioVigencia, lang)}</Text>
        <Text variant="bodyMedium" style={styles.colPremium} numberOfLines={1}>{fmtMoney(p.prima)}</Text>
        <View style={styles.colStatus}>
          <EstadoChip desc={p.descripcionEstadoCertificado} />
        </View>
        {showDetail && <IconButton icon="eye-outline" size={18} onPress={onDetail} style={{ margin: 0, width: 28 }} />}
      </View>
    </TouchableRipple>
  );
}

export default function PolizasScreen() {
  const user = useAuthStore((s) => s.user);
  const allowed = useRequirePermiso(OPCION.cartera);
  const [titular, setTitular] = useState('');
  const [poliza, setPoliza] = useState('');
  const [producto, setProducto] = useState('');
  const [estado, setEstado] = useState('');
  const [tipoVenta, setTipoVenta] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [todosNiveles, setTodosNiveles] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [debounced, setDebounced] = useState({ titular: '', poliza: '', producto: '' });

  useEffect(() => {
    const id = setTimeout(() => setDebounced({ titular, poliza, producto }), 500);
    return () => clearTimeout(id);
  }, [titular, poliza, producto]);

  const filtros = useMemo(() => ({
    titular: debounced.titular || undefined,
    poliza: debounced.poliza || undefined,
    descripcionPoliza: debounced.producto || undefined,
    estado: estado || undefined,
    tipoVenta: tipoVenta || undefined,
    todosLosNiveles: todosNiveles ? 'true' : undefined,
  }), [debounced, estado, tipoVenta, todosNiveles]);

  useEffect(() => { setPage(1); }, [filtros]);

  const { canSee } = usePermisos();
  const canDetail = canSee(OPCION.consultarPoliza);
  const { data, isLoading, isError, error, refetch, isRefetching, isFetching } = usePolizasActivas(filtros, page, limit, canSee(OPCION.cartera));
  const [exporting, setExporting] = useState('');
  const logout = useLogout();
  const router = useRouter();
  const { colors, roundness } = useTheme();
  const { isDesktop } = useResponsive();
  const lang = useSettingsStore((s) => s.lang);
  const setLang = useSettingsStore((s) => s.setLang);
  const t = labels[lang];

  const polizas = useMemo<PolizaActiva[]>(() => (Array.isArray(data?.data) ? data!.data : []), [data]);
  const meta = data?.meta;
  const totalPages = Math.max(1, meta?.totalPages ?? 1);

  const estadoOptions = useMemo(() => ESTADO_VALUES.map((v, i) => ({ value: v, label: t[ESTADO_LABEL_KEYS[i]] })), [t]);
  const ventaOptions = useMemo(() => VENTA_VALUES.map((v, i) => ({ value: v, label: t[VENTA_LABEL_KEYS[i]] })), [t]);

  const hasFilters = !!(titular || poliza || producto || estado || tipoVenta);
  const clearFilters = () => { setTitular(''); setPoliza(''); setProducto(''); setEstado(''); setTipoVenta(''); };

  const exportar = async (formato: 'excel' | 'pdf') => {
    const url = reportePolizasUrl(formato, {
      titular: debounced.titular || undefined,
      poliza: debounced.poliza || undefined,
      descripcionPoliza: debounced.producto || undefined,
      estado: estado || undefined,
      tipoVenta: tipoVenta || undefined,
      todosLosNiveles: todosNiveles ? 'true' : undefined,
    });
    const nombre = `polizas.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
    try {
      setExporting(formato);
      await descargarArchivoAutenticado(url, nombre, formato === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf');
    } finally {
      setExporting('');
    }
  };
  const goPage = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));
  const changeLimit = (value: number) => { setLimit(value); setPage(1); };

  if (!allowed) return null;

  return (
    <AppShell
      title={t.policies}
      userName={user?.NombreCompletoUsuario ?? ''}
      userRole={user?.NombrePerfil}
      lang={lang}
      onLangChange={setLang}
      onProfile={() => router.push('/perfil' as any)}
      onLogout={() => logout.mutate()}
      onHome={() => router.push('/dashboard' as any)}
      onCotizaciones={() => router.push('/cotizaciones' as any)}
      onSolicitudes={() => router.push('/solicitudes' as any)}
      onPolizas={() => {}}
    >
      <View style={styles.header}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="headlineSmall">{t.policies}</Text>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>{t.subtitle}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Button mode="outlined" icon="file-excel-outline" compact onPress={() => exportar('excel')} loading={exporting === 'excel'} disabled={!!exporting} style={{ borderRadius: roundness - 4 }}>
            {exporting === 'excel' ? t.exporting : t.exportExcel}
          </Button>
          <Button mode="outlined" icon="file-pdf-box" compact onPress={() => exportar('pdf')} loading={exporting === 'pdf'} disabled={!!exporting} style={{ borderRadius: roundness - 4 }}>
            {exporting === 'pdf' ? t.exporting : t.exportPdf}
          </Button>
        </View>
      </View>

      <View style={[styles.toolbar, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
        <View style={styles.toolbarRow}>
          <Searchbar
            placeholder={t.search}
            value={titular}
            onChangeText={setTitular}
            style={[styles.search, { backgroundColor: colors.background, borderRadius: roundness - 4 }]}
            inputStyle={{ fontSize: 14, minHeight: 0 }}
            elevation={0}
          />
          <Button
            mode={todosNiveles ? 'contained-tonal' : 'outlined'}
            icon="account-group-outline"
            onPress={() => setTodosNiveles((v) => !v)}
            compact
            style={{ borderRadius: roundness - 4 }}
          >
            {t.allLevels}
          </Button>
          <Button
            mode={showFilters || hasFilters ? 'contained-tonal' : 'outlined'}
            icon="tune-variant"
            onPress={() => setShowFilters((v) => !v)}
            compact
            style={{ borderRadius: roundness - 4 }}
          >
            {t.filters}
          </Button>
        </View>
        {showFilters && (
          <View style={styles.filtersGrid}>
            <FilterInput label={t.policyNumber} value={poliza} onChange={setPoliza} />
            <FilterInput label={t.product} value={producto} onChange={setProducto} />
            <SelectField label={t.state} value={estado} options={estadoOptions} onChange={setEstado} placeholder={t.all} style={styles.filterField} />
            <SelectField label={t.saleType} value={tipoVenta} options={ventaOptions} onChange={setTipoVenta} placeholder={t.all} style={styles.filterField} />
            {hasFilters && (
              <Button mode="text" icon="filter-remove-outline" onPress={clearFilters} compact>
                {t.clearFilters}
              </Button>
            )}
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator animating size="large" />
          <Text style={{ color: colors.onSurfaceVariant, marginTop: 12 }}>{t.loading}</Text>
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Icon source="cloud-off-outline" size={40} color={colors.onSurfaceVariant} />
          <Text variant="titleMedium" style={{ marginTop: 8 }}>{t.error}</Text>
          {__DEV__ && !!error && (
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginTop: 4, textAlign: 'center' }}>
              {String((error as any)?.response?.status ?? '')}{' '}
              {String((error as any)?.response?.data?.message ?? (error as any)?.message ?? '')}
            </Text>
          )}
          <Button mode="contained-tonal" icon="refresh" onPress={() => refetch()} loading={isRefetching} style={{ marginTop: 12 }}>
            {t.retry}
          </Button>
        </View>
      ) : polizas.length === 0 ? (
        <View style={styles.centered}>
          <View style={[styles.emptyIcon, { backgroundColor: palette.indigo[50] }]}>
            <Icon source="shield-outline" size={32} color={palette.indigo[500]} />
          </View>
          <Text variant="titleMedium" style={{ marginTop: 12 }}>{t.empty}</Text>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, marginTop: 4 }}>{t.emptyHint}</Text>
          {hasFilters && (
            <Button mode="contained-tonal" icon="filter-remove-outline" onPress={clearFilters} style={{ marginTop: 12 }}>
              {t.clearFilters}
            </Button>
          )}
        </View>
      ) : isDesktop ? (
        <View style={[styles.table, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
          <View style={[styles.tr, styles.th, { borderBottomColor: colors.outlineVariant, backgroundColor: colors.background }]}>
            <Text variant="labelMedium" style={[styles.colPolicy, { color: colors.onSurfaceVariant }]}>{t.policyNumber}</Text>
            <Text variant="labelMedium" style={[styles.colHolder, { color: colors.onSurfaceVariant }]}>{t.holder}</Text>
            <Text variant="labelMedium" style={[styles.colVenta, { color: colors.onSurfaceVariant }]}>{t.saleType}</Text>
            <Text variant="labelMedium" style={[styles.colCountry, { color: colors.onSurfaceVariant }]}>{t.country}</Text>
            <Text variant="labelMedium" style={[styles.colDate, { color: colors.onSurfaceVariant }]}>{t.validity}</Text>
            <Text variant="labelMedium" style={[styles.colPremium, { color: colors.onSurfaceVariant }]}>{t.premium}</Text>
            <Text variant="labelMedium" style={[styles.colStatus, { color: colors.onSurfaceVariant }]}>{t.state}</Text>
          </View>
          {polizas.map((p) => (
            <PolizaRow key={p.codigoCertificado} p={p} t={t} lang={lang} showDetail={canDetail} onDetail={() => router.push(`/polizas/${p.codigoCertificado}` as any)} />
          ))}
          <Paginator
            page={meta?.page ?? page}
            totalPages={totalPages}
            total={meta?.total ?? polizas.length}
            limit={limit}
            onPage={goPage}
            onLimit={changeLimit}
            loading={isFetching}
            labels={t}
          />
        </View>
      ) : (
        <View style={styles.list}>
          {polizas.map((p) => (
            <PolizaCard key={p.codigoCertificado} p={p} t={t} lang={lang} showDetail={canDetail} onDetail={() => router.push(`/polizas/${p.codigoCertificado}` as any)} />
          ))}
          <View style={[styles.table, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
            <Paginator
              page={meta?.page ?? page}
              totalPages={totalPages}
              total={meta?.total ?? polizas.length}
              limit={limit}
              onPage={goPage}
              onLimit={changeLimit}
              loading={isFetching}
              labels={t}
              compact
            />
          </View>
        </View>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  toolbar: { borderWidth: 1, padding: 10, gap: 10 },
  toolbarRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  search: { flex: 1, minWidth: 180 },
  filtersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  filterField: { flexGrow: 1, flexBasis: 180, minWidth: 160 },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64, gap: 4 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  list: { gap: 12 },
  card: { borderWidth: 1, padding: 16, gap: 6 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  codeBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, flexShrink: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, flexShrink: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  table: { borderWidth: 1, overflow: 'hidden' },
  tr: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  th: { paddingVertical: 10 },
  colPolicy: { width: 100 },
  colHolder: { flex: 1, minWidth: 140 },
  colVenta: { width: 110 },
  colCountry: { width: 100 },
  colDate: { width: 90 },
  colPremium: { width: 90, textAlign: 'right' },
  colStatus: { width: 140 },
  paginator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1 },
  paginatorCompact: { flexDirection: 'column', gap: 4 },
  paginatorInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  paginatorControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pageSizes: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pages: { flexDirection: 'row', alignItems: 'center' },
  pageBtn: { minWidth: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
});
