import { OPCION } from '@/api/agent';
import { Cotizacion, reporteCotizacionesUrl } from '@/api/cotizaciones';
import { AppShell, Lang } from '@/components/AppShell';
import { Paginator } from '@/components/Paginator';
import { useLogout } from '@/hooks/useAuth';
import { useCotizaciones } from '@/hooks/useCotizaciones';
import { usePermisos, useRequirePermiso } from '@/hooks/usePermisos';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { palette } from '@/theme';
import { descargarArchivoAutenticado } from '@/utils/downloadFile';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Button,
    Chip,
    Divider,
    FAB,
    Icon,
    Searchbar,
    Text,
    TouchableRipple,
    useTheme
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const labels: Record<Lang, { [key: string]: string }> = {
  es: {
    quotes: 'Cotizaciones',
    requests: 'Solicitudes',
    home: 'Inicio',
    profile: 'Mi perfil',
    logout: 'Cerrar sesión',
    language: 'Idioma',
    newQuote: 'Nueva cotización',
    subtitle: 'Gestioná y consultá las cotizaciones de tus clientes',
    search: 'Buscar por nombre, código o correo',
    loading: 'Cargando cotizaciones…',
    empty: 'No hay cotizaciones para mostrar',
    exportExcel: 'Excel',
    exportPdf: 'PDF',
    exporting: 'Exportando…',
    emptyHint: 'Registrá una nueva cotización para comenzar.',
    error: 'No pudimos cargar las cotizaciones',
    retry: 'Reintentar',
    all: 'Todas',
    code: 'Código',
    date: 'Fecha',
    status: 'Estado',
    holder: 'Solicitante',
    country: 'País',
    contact: 'Contacto',
    age: 'Edad',
    years: 'años',
    dependents: 'Dependientes',
    spouse: 'Cónyuge',
    maternity: 'Maternidad',
    transplant: 'Trasplante',
    total: 'Total',
    detail: 'Detalle de cotización',
    validity: 'Inicio de vigencia',
    gender: 'Género',
    birthdate: 'Nacimiento',
    email: 'Correo',
    premiums: 'Primas cotizadas',
    noPremiums: 'Sin primas registradas',
    close: 'Cerrar',
    yes: 'Sí',
    no: 'No',
    results: 'resultados',
    of: 'de',
    perPage: 'Por página',
    products: 'Productos cotizados',
    annual: 'Anual',
    semiannual: 'Semestral',
    quarterly: 'Trimestral',
    monthly: 'Mensual',
  },
  en: {
    quotes: 'Quotes',
    requests: 'Requests',
    home: 'Home',
    profile: 'My profile',
    logout: 'Sign out',
    language: 'Language',
    newQuote: 'New quote',
    subtitle: 'Manage and review your customers quotes',
    search: 'Search by name, code or email',
    loading: 'Loading quotes…',
    empty: 'No quotes to show',
    exportExcel: 'Excel',
    exportPdf: 'PDF',
    exporting: 'Exporting…',
    emptyHint: 'Create a new quote to get started.',
    error: "We couldn't load the quotes",
    retry: 'Retry',
    all: 'All',
    code: 'Code',
    date: 'Date',
    status: 'Status',
    holder: 'Applicant',
    country: 'Country',
    contact: 'Contact',
    age: 'Age',
    years: 'years',
    dependents: 'Dependents',
    spouse: 'Spouse',
    maternity: 'Maternity',
    transplant: 'Transplant',
    total: 'Total',
    detail: 'Quote detail',
    validity: 'Validity start',
    gender: 'Gender',
    birthdate: 'Birthdate',
    email: 'Email',
    premiums: 'Quoted premiums',
    noPremiums: 'No premiums registered',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    results: 'results',
    of: 'of',
    perPage: 'Per page',
    products: 'Quoted products',
    annual: 'Annual',
    semiannual: 'Semiannual',
    quarterly: 'Quarterly',
    monthly: 'Monthly',
  },
  pt: {
    quotes: 'Cotações',
    requests: 'Solicitações',
    home: 'Início',
    profile: 'Meu perfil',
    logout: 'Sair',
    language: 'Idioma',
    newQuote: 'Nova cotação',
    subtitle: 'Gerencie e consulte as cotações dos seus clientes',
    search: 'Buscar por nome, código ou e-mail',
    loading: 'Carregando cotações…',
    empty: 'Não há cotações para mostrar',
    exportExcel: 'Excel',
    exportPdf: 'PDF',
    exporting: 'Exportando…',
    emptyHint: 'Registre uma nova cotação para começar.',
    error: 'Não foi possível carregar as cotações',
    retry: 'Tentar novamente',
    all: 'Todas',
    code: 'Código',
    date: 'Data',
    status: 'Status',
    holder: 'Solicitante',
    country: 'País',
    contact: 'Contato',
    age: 'Idade',
    years: 'anos',
    dependents: 'Dependentes',
    spouse: 'Cônjuge',
    maternity: 'Maternidade',
    transplant: 'Transplante',
    total: 'Total',
    detail: 'Detalhe da cotação',
    validity: 'Início de vigência',
    gender: 'Gênero',
    birthdate: 'Nascimento',
    email: 'E-mail',
    premiums: 'Prêmios cotados',
    noPremiums: 'Sem prêmios registrados',
    close: 'Fechar',
    yes: 'Sim',
    no: 'Não',
    results: 'resultados',
    of: 'de',
    perPage: 'Por página',
    products: 'Produtos cotados',
    annual: 'Anual',
    semiannual: 'Semestral',
    quarterly: 'Trimestral',
    monthly: 'Mensal',
  },
};

const statusColors: Record<string, string> = {
  A: palette.success,         // Aprobada - verde
  G: palette.indigo[500],     // Generada - teal
  P: palette.navy[500],       // Pendiente - azul
  E: palette.indigo[300],     // Enviada - celeste
  I: palette.warning,         // Inactiva - naranja
  C: palette.danger,          // Cancelada - magenta
  R: palette.magenta[700],    // Rechazada - magenta oscuro
  '1': palette.success,       // Aprobada (numérico)
  '3': palette.indigo[500],   // Generada (numérico)
  '01': palette.success,      // Aprobada con ceros
  '03': palette.indigo[500],  // Generada con ceros
};

const statusLabels: Record<Lang, Record<string, string>> = {
  es: { A: 'Aprobada', G: 'Generada', P: 'Pendiente', E: 'Enviada', I: 'Inactiva', C: 'Cancelada', R: 'Rechazada', '1': 'Aprobada', '3': 'Generada', '01': 'Aprobada', '03': 'Generada' },
  en: { A: 'Approved', G: 'Generated', P: 'Pending', E: 'Sent', I: 'Inactive', C: 'Canceled', R: 'Rejected', '1': 'Approved', '3': 'Generated', '01': 'Approved', '03': 'Generated' },
  pt: { A: 'Aprovada', G: 'Gerada', P: 'Pendente', E: 'Enviada', I: 'Inativa', C: 'Cancelada', R: 'Rejeitada', '1': 'Aprovada', '3': 'Gerada', '01': 'Aprovada', '03': 'Gerada' },
};

const normalizeStatusCode = (code: string) => {
  const trimmed = String(code ?? '').trim().toUpperCase().replace(/^0+/, '');
  return trimmed || '0';
};

const statusLabel = (code: string, lang: Lang) => statusLabels[lang][normalizeStatusCode(code)] ?? code;

const statusColor = (code: string, desc?: string) => {
  const raw = [normalizeStatusCode(code), String(desc ?? '').trim().toUpperCase()].join(' ').trim();
  if (statusColors[raw]) return statusColors[raw];
  const first = raw.replace(/[^A-Z0-9]/g, '').charAt(0);
  if (statusColors[first]) return statusColors[first];
  if (raw.includes('APROB')) return statusColors.A;
  if (raw.includes('GENER')) return statusColors.G;
  if (raw.includes('PEND')) return statusColors.P;
  if (raw.includes('ENVI')) return statusColors.E;
  if (raw.includes('INAC') || raw.includes('INACT')) return statusColors.I;
  if (raw.includes('CANCEL')) return statusColors.C;
  if (raw.includes('RECH')) return statusColors.R;
  return palette.slate[500];
};
const isYes = (v?: string) => /^(s|y|1|true)/i.test((v ?? '').trim());

function StatusChip({ code, description }: { code: string; description?: string }) {
  const lang = useSettingsStore((s) => s.lang);
  const color = statusColor(code, description);
  const label = statusLabel(code, lang);
  return (
    <View style={[styles.status, { backgroundColor: color }]}>
      <View style={[styles.statusDot, { backgroundColor: '#FFFFFF' }]} />
      <Text variant="labelMedium" style={{ color: '#FFFFFF' }} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function Flag({ on, label }: { on: boolean; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.flag}>
      <Icon source={on ? 'check-circle' : 'close-circle-outline'} size={16} color={on ? palette.success : colors.outline} />
      <Text variant="bodySmall" style={{ color: on ? colors.onSurface : colors.onSurfaceVariant }}>{label}</Text>
    </View>
  );
}

function QuoteCard({ c, t, onPress }: { c: Cotizacion; t: Record<string, string>; onPress: () => void }) {
  const { colors, roundness } = useTheme();
  return (
    <TouchableRipple onPress={onPress} borderless style={{ borderRadius: roundness + 2 }}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness + 2 }]}>
        <View style={styles.cardTop}>
          <View style={[styles.codeBadge, { backgroundColor: palette.indigo[50] }]}>
            <Text variant="labelLarge" style={{ color: palette.indigo[600] }}>#{c.CodigoCotizacion}</Text>
          </View>
          <StatusChip code={c.CodigoEstadoCotizacion} description={c.DescripcionEstadoCotizacion} />
        </View>
        <Text variant="titleMedium" numberOfLines={1}>{c.NombreCompleto}</Text>
        <View style={styles.metaRow}>
          <Icon source="calendar-outline" size={14} color={colors.onSurfaceVariant} />
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>{c.FechaCotizacion}</Text>
          <Text variant="bodySmall" style={{ color: colors.outline }}>·</Text>
          <Icon source="map-marker-outline" size={14} color={colors.onSurfaceVariant} />
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>{c.DescripcionPais}</Text>
          <Text variant="bodySmall" style={{ color: colors.outline }}>·</Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>{c.EdadTitular} {t.years}</Text>
        </View>
        {!!c.CorreoElectronico && (
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>{c.CorreoElectronico}</Text>
        )}
        <Divider style={{ marginVertical: 4 }} />
        <View style={styles.flags}>
          <Flag on={c.Dependientes > 0} label={`${c.Dependientes} ${t.dependents.toLowerCase()}`} />
          <Flag on={(c.EdadConyuge ?? '').trim() !== ''} label={t.spouse} />
          <Flag on={isYes(c.Maternidad)} label={t.maternity} />
          <Flag on={isYes(c.Trasplante)} label={t.transplant} />
        </View>
      </View>
    </TouchableRipple>
  );
}

function QuoteRow({ c, t, onPress }: { c: Cotizacion; t: Record<string, string>; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <TouchableRipple onPress={onPress}>
      <View style={[styles.tr, { borderBottomColor: colors.outlineVariant }]}>
        <Text variant="labelLarge" style={[styles.colCode, { color: palette.indigo[600] }]}>#{c.CodigoCotizacion}</Text>
        <Text variant="bodyMedium" style={styles.colDate}>{c.FechaCotizacion}</Text>
        <View style={styles.colHolder}>
          <Text variant="bodyMedium" numberOfLines={1} style={{ fontFamily: 'Inter_600SemiBold' }}>{c.NombreCompleto}</Text>
          <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.onSurfaceVariant }}>
            {c.EdadTitular} {t.years} · {c.SexoTitular}
            {c.Dependientes > 0 ? ` · ${c.Dependientes} ${t.dependents.toLowerCase()}` : ''}
          </Text>
        </View>
        <Text variant="bodyMedium" style={styles.colCountry} numberOfLines={1}>{c.DescripcionPais}</Text>
        <View style={styles.colContact}>
          <Text variant="bodySmall" numberOfLines={1}>{c.CorreoElectronico || '—'}</Text>
          <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.onSurfaceVariant }}>{c.Telefono || ''}</Text>
        </View>
        <View style={styles.colStatus}>
          <StatusChip code={c.CodigoEstadoCotizacion} description={c.DescripcionEstadoCotizacion} />
        </View>
        <Icon source="chevron-right" size={20} color={colors.onSurfaceVariant} />
      </View>
    </TouchableRipple>
  );
}


export default function CotizacionesScreen() {
  const user = useAuthStore((s) => s.user);
  const allowed = useRequirePermiso(OPCION.cotizaciones);
  const { canSee, canExecute } = usePermisos();
  const canCreate = canExecute(OPCION.cotizaciones);
  const modOk = canSee(OPCION.cotizaciones);
  const [estado, setEstado] = useState<string | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const params = useLocalSearchParams<{ detalle?: string }>();

  useEffect(() => {
    const codigo = Number(params.detalle);
    if (Number.isFinite(codigo) && codigo > 0) router.replace(`/cotizaciones/${codigo}` as any);
  }, [params.detalle]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 600);
    return () => clearTimeout(id);
  }, [query]);

  const { data, isLoading, isError, error, refetch, isRefetching, isFetching } = useCotizaciones(estado, page, limit, debouncedQuery, modOk);
  const { data: all } = useCotizaciones(undefined, 1, 100, undefined, modOk);
  const logout = useLogout();
  const router = useRouter();
  const { colors, roundness } = useTheme();
  const { isDesktop } = useResponsive();
  const insets = useSafeAreaInsets();
  const lang = useSettingsStore((s) => s.lang);
  const setLang = useSettingsStore((s) => s.setLang);
  const t = labels[lang];

  const cotizaciones = useMemo<Cotizacion[]>(() => (Array.isArray(data?.data) ? data!.data : []), [data]);
  const meta = data?.meta;
  const totalPages = Math.max(1, meta?.totalPages ?? 1);
  const todas = useMemo<Cotizacion[]>(() => (Array.isArray(all?.data) ? all!.data : []), [all]);
  const totalGeneral = all?.meta?.total ?? todas.length;

  const estados = useMemo(() => {
    const map = new Map<string, string>();
    todas.forEach((c) => map.set(c.CodigoEstadoCotizacion, statusLabel(c.CodigoEstadoCotizacion, lang)));
    return [...map.entries()].map(([code, label]) => ({ code, label }));
  }, [todas, lang]);

  const changeEstado = (value?: string) => { setEstado(value); setPage(1); };

  const [exporting, setExporting] = useState('');
  const exportar = async (formato: 'excel' | 'pdf') => {
    const url = reporteCotizacionesUrl(formato, estado, debouncedQuery || undefined);
    const nombre = `cotizaciones.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
    try {
      setExporting(formato);
      await descargarArchivoAutenticado(url, nombre, formato === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf');
    } finally {
      setExporting('');
    }
  };
  const changeLimit = (value: number) => { setLimit(value); setPage(1); };
  const goPage = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  const filtered = cotizaciones;

  const goNew = () => router.push('/cotizaciones/nueva' as any);

  if (!allowed) return null;

  return (
    <>
      <AppShell
        title={t.quotes}
        userName={user?.NombreCompletoUsuario ?? ''}
        userRole={user?.NombrePerfil}
        lang={lang}
        onLangChange={setLang}
        onProfile={() => router.push('/perfil' as any)}
        onLogout={() => logout.mutate()}
        onHome={() => router.push('/dashboard' as any)}
        onCotizaciones={() => {}}
        onSolicitudes={() => router.push('/solicitudes' as any)}
        onPolizas={() => router.push('/polizas' as any)}
      >
        <View style={styles.header}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="headlineSmall">{t.quotes}</Text>
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>{t.subtitle}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            <Button mode="outlined" icon="file-excel-outline" compact onPress={() => exportar('excel')} loading={exporting === 'excel'} disabled={!!exporting} style={{ borderRadius: roundness - 4 }}>
              {exporting === 'excel' ? t.exporting : t.exportExcel}
            </Button>
            <Button mode="outlined" icon="file-pdf-box" compact onPress={() => exportar('pdf')} loading={exporting === 'pdf'} disabled={!!exporting} style={{ borderRadius: roundness - 4 }}>
              {exporting === 'pdf' ? t.exporting : t.exportPdf}
            </Button>
            {isDesktop && canCreate && (
              <Button mode="contained" icon="plus" onPress={goNew} style={{ borderRadius: roundness - 4 }}>
                {t.newQuote}
              </Button>
            )}
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
            <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>{t.total}</Text>
            <Text variant="headlineSmall">{totalGeneral}</Text>
          </View>
          {estados.slice(0, 3).map((e) => (
            <View key={e.code} style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
              <View style={styles.statLabel}>
                <View style={[styles.statusDot, { backgroundColor: statusColor(e.code, e.label) }]} />
                <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>{e.label}</Text>
              </View>
              <Text variant="headlineSmall">{todas.filter((c) => c.CodigoEstadoCotizacion === e.code).length}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.toolbar, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
          <Searchbar
            placeholder={t.search}
            value={query}
            onChangeText={setQuery}
            style={[styles.search, { backgroundColor: colors.background, borderRadius: roundness - 4 }]}
            inputStyle={{ fontSize: 14, minHeight: 0 }}
            elevation={0}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            <Chip
              selected={estado === undefined}
              onPress={() => changeEstado(undefined)}
              showSelectedOverlay
              style={estado === undefined ? { backgroundColor: palette.indigo[50] } : undefined}
              textStyle={estado === undefined ? { color: palette.indigo[600] } : undefined}
            >
              {t.all}
            </Chip>
            {estados.map((e) => {
              const active = estado === e.code;
              return (
                <Chip
                  key={e.code}
                  selected={active}
                  onPress={() => changeEstado(active ? undefined : e.code)}
                  showSelectedOverlay
                  style={active ? { backgroundColor: `${statusColor(e.code, e.label)}1A` } : undefined}
                  textStyle={active ? { color: statusColor(e.code, e.label) } : undefined}
                >
                  {e.label}
                </Chip>
              );
            })}
          </ScrollView>
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
        ) : filtered.length === 0 ? (
          <View style={styles.centered}>
            <View style={[styles.emptyIcon, { backgroundColor: palette.indigo[50] }]}>
              <Icon source="file-document-outline" size={32} color={palette.indigo[500]} />
            </View>
            <Text variant="titleMedium" style={{ marginTop: 12 }}>{t.empty}</Text>
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, marginTop: 4 }}>{t.emptyHint}</Text>
            {canCreate && <Button mode="contained" icon="plus" onPress={goNew} style={{ marginTop: 16 }}>{t.newQuote}</Button>}
          </View>
        ) : isDesktop ? (
          <View style={[styles.table, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
            <View style={[styles.tr, styles.th, { borderBottomColor: colors.outlineVariant, backgroundColor: colors.background }]}>
              <Text variant="labelMedium" style={[styles.colCode, { color: colors.onSurfaceVariant }]}>{t.code}</Text>
              <Text variant="labelMedium" style={[styles.colDate, { color: colors.onSurfaceVariant }]}>{t.date}</Text>
              <Text variant="labelMedium" style={[styles.colHolder, { color: colors.onSurfaceVariant }]}>{t.holder}</Text>
              <Text variant="labelMedium" style={[styles.colCountry, { color: colors.onSurfaceVariant }]}>{t.country}</Text>
              <Text variant="labelMedium" style={[styles.colContact, { color: colors.onSurfaceVariant }]}>{t.contact}</Text>
              <Text variant="labelMedium" style={[styles.colStatus, { color: colors.onSurfaceVariant }]}>{t.status}</Text>
              <View style={{ width: 20 }} />
            </View>
            {filtered.map((c) => (
              <QuoteRow key={c.CodigoCotizacion} c={c} t={t} onPress={() => router.push(`/cotizaciones/${c.CodigoCotizacion}` as any)} />
            ))}
            <Paginator
              page={meta?.page ?? page}
              totalPages={totalPages}
              total={meta?.total ?? filtered.length}
              limit={limit}
              onPage={goPage}
              onLimit={changeLimit}
              loading={isFetching}
              labels={t}
            />
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((c) => (
              <QuoteCard key={c.CodigoCotizacion} c={c} t={t} onPress={() => router.push(`/cotizaciones/${c.CodigoCotizacion}` as any)} />
            ))}
            <View style={[styles.table, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
              <Paginator
                page={meta?.page ?? page}
                totalPages={totalPages}
                total={meta?.total ?? filtered.length}
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

      {!isDesktop && canCreate && (
        <FAB icon="plus" label={t.newQuote} onPress={goNew} style={[styles.fab, { bottom: insets.bottom, backgroundColor: palette.indigo[500] }]} color="#FFFFFF" />
      )}

    </>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stat: { flex: 1, minWidth: 140, padding: 16, gap: 4, borderWidth: 1 },
  statLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toolbar: { padding: 12, gap: 12, borderWidth: 1 },
  search: { height: 44 },
  chips: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  list: { gap: 12 },
  card: { padding: 16, gap: 8, borderWidth: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  codeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  flags: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  flag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  table: { borderWidth: 1, overflow: 'hidden' },
  tr: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  th: { paddingVertical: 10 },
  colCode: { width: 80 },
  colDate: { width: 100 },
  colHolder: { flex: 2, gap: 2 },
  colCountry: { flex: 1 },
  colContact: { flex: 1.6, gap: 2 },
  colStatus: { width: 130 },
  tableFooter: { paddingHorizontal: 16, paddingVertical: 10 },
  paginator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1 },
  paginatorCompact: { flexDirection: 'column', alignItems: 'stretch', borderTopWidth: 0 },
  paginatorInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  paginatorControls: { flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  pageSizes: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pages: { flexDirection: 'row', alignItems: 'center', gap: 2, justifyContent: 'center' },
  pageBtn: { minWidth: 32, height: 32, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});
