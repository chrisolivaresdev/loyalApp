import { SolicitudListItem } from '@/api/solicitudes';
import { AppShell } from '@/components/AppShell';
import { useLogout } from '@/hooks/useAuth';
import { useResponsive } from '@/hooks/useResponsive';
import { useSolicitudes } from '@/hooks/useSolicitudes';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { palette } from '@/theme';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Chip,
  Divider,
  Icon,
  IconButton,
  Searchbar,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';

const labels = {
  es: {
    title: 'Solicitudes',
    requests: 'Solicitudes',
    subtitle: 'Solicitudes de póliza registradas',
    home: 'Inicio',
    profile: 'Mi perfil',
    logout: 'Cerrar sesión',
    language: 'Idioma',
    quotes: 'Cotizaciones',
    all: 'Todas',
    loading: 'Cargando solicitudes…',
    error: 'No pudimos cargar las solicitudes',
    retry: 'Reintentar',
    search: 'Buscar por titular, póliza o plan…',
    empty: 'No hay solicitudes',
    emptyHint: 'No se encontraron solicitudes para este estado.',
    code: 'N° Solicitud',
    policy: 'Póliza',
    holder: 'Titular',
    plan: 'Plan',
    country: 'País',
    payment: 'Forma de pago',
    premium: 'Prima',
    insureds: 'Asegurados',
    status: 'Estado',
    of: 'de',
    results: 'resultados',
    perPage: 'Por página',
    generated: 'Generada',
    inProgress: 'En proceso registro',
    pendingUw: 'Pendiente UW',
    approved: 'Aprobada',
    denied: 'Denegada',
    voided: 'Anulada',
    postponed: 'Pospuesta',
  },
  en: {
    title: 'Requests',
    requests: 'Requests',
    subtitle: 'Registered policy requests',
    home: 'Home',
    profile: 'My profile',
    logout: 'Log out',
    language: 'Language',
    quotes: 'Quotes',
    all: 'All',
    loading: 'Loading requests…',
    error: 'Could not load requests',
    retry: 'Retry',
    search: 'Search holder, policy or plan…',
    empty: 'No requests',
    emptyHint: 'No requests found for this status.',
    code: 'Request #',
    policy: 'Policy',
    holder: 'Holder',
    plan: 'Plan',
    country: 'Country',
    payment: 'Payment method',
    premium: 'Premium',
    insureds: 'Insured',
    status: 'Status',
    of: 'of',
    results: 'results',
    perPage: 'Per page',
    generated: 'Generated',
    inProgress: 'Registration in progress',
    pendingUw: 'Pending UW',
    approved: 'Approved',
    denied: 'Denied',
    voided: 'Voided',
    postponed: 'Postponed',
  },
  pt: {
    title: 'Solicitações',
    requests: 'Solicitações',
    subtitle: 'Solicitações de apólice registradas',
    home: 'Início',
    profile: 'Meu perfil',
    logout: 'Sair',
    language: 'Idioma',
    quotes: 'Cotações',
    all: 'Todas',
    loading: 'Carregando solicitações…',
    error: 'Não foi possível carregar as solicitações',
    retry: 'Tentar novamente',
    search: 'Buscar por titular, apólice ou plano…',
    empty: 'Não há solicitações',
    emptyHint: 'Nenhuma solicitação encontrada para este status.',
    code: 'Nº Solicitação',
    policy: 'Apólice',
    holder: 'Titular',
    plan: 'Plano',
    country: 'País',
    payment: 'Forma de pagamento',
    premium: 'Prêmio',
    insureds: 'Segurados',
    status: 'Status',
    of: 'de',
    results: 'resultados',
    perPage: 'Por página',
    generated: 'Gerada',
    inProgress: 'Registro em andamento',
    pendingUw: 'Pendente UW',
    approved: 'Aprovada',
    denied: 'Negada',
    voided: 'Anulada',
    postponed: 'Postergada',
  },
};

type T = (typeof labels)['es'];

const ESTADOS: { code: string; labelKey: keyof T; countKey: 'Generada' | 'Registro' | 'Evaluacion' | 'Aprobada' | 'Denegada' | 'Anulada' | 'Pospuesta' }[] = [
  { code: '01', labelKey: 'generated', countKey: 'Generada' },
  { code: '02', labelKey: 'inProgress', countKey: 'Registro' },
  { code: '03', labelKey: 'pendingUw', countKey: 'Evaluacion' },
  { code: '04', labelKey: 'approved', countKey: 'Aprobada' },
  { code: '05', labelKey: 'denied', countKey: 'Denegada' },
  { code: '06', labelKey: 'voided', countKey: 'Anulada' },
  { code: '07', labelKey: 'postponed', countKey: 'Pospuesta' },
];

const estadoColor: Record<string, string> = {
  '01': palette.indigo[500],
  '02': palette.navy[500],
  '03': palette.warning,
  '04': palette.success,
  '05': palette.danger,
  '06': palette.slate[500],
  '07': palette.magenta[700],
};

const estadoLabel = (code: string, t: T): string => {
  const estado = ESTADOS.find((e) => e.code === code);
  return estado ? t[estado.labelKey] : code;
};

function StatusChip({ code, description }: { code: string; description?: string }) {
  const t = labels[useSettingsStore((s) => s.lang)];
  const color = estadoColor[code] ?? palette.slate[500];
  const label = estadoLabel(code, t) !== code ? estadoLabel(code, t) : (description || code);
  return (
    <View style={[styles.status, { backgroundColor: color }]}>
      <View style={styles.statusDot} />
      <Text variant="labelMedium" style={{ color: '#FFFFFF' }} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const fmtMoney = (n: number) => `$${(Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function SolicitudCard({ s, t }: { s: SolicitudListItem; t: T }) {
  const { colors, roundness } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness + 2 }]}>
      <View style={styles.cardTop}>
        <View style={[styles.codeBadge, { backgroundColor: palette.indigo[50] }]}>
          <Text variant="labelLarge" style={{ color: palette.indigo[600] }}>#{s.CodigoSolicitud}</Text>
        </View>
        <StatusChip code={s.CodigoEstadoSolicitud} description={s.DescripcionEstadoSolicitud} />
      </View>
      <Text variant="titleMedium" numberOfLines={1}>{s.NombreTitular}</Text>
      <View style={styles.metaRow}>
        <Icon source="file-document-outline" size={14} color={colors.onSurfaceVariant} />
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>{s.NumeroPoliza || '—'}</Text>
        <Text variant="bodySmall" style={{ color: colors.outline }}>·</Text>
        <Icon source="map-marker-outline" size={14} color={colors.onSurfaceVariant} />
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>{s.DescripcionPais}</Text>
      </View>
      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>
        {s.DescripcionPoliza} · {s.DescripcionPlan} · {s.DescripcionFormaPago}
      </Text>
      <Divider style={{ marginVertical: 4 }} />
      <View style={styles.cardBottom}>
        <View style={styles.metaItem}>
          <Icon source="account-group-outline" size={14} color={colors.onSurfaceVariant} />
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>{s.NumeroAsegurados} {t.insureds.toLowerCase()}</Text>
        </View>
        <Text variant="titleMedium" style={{ color: palette.indigo[600] }}>{fmtMoney(s.Prima)}</Text>
      </View>
    </View>
  );
}

function SolicitudRow({ s, t }: { s: SolicitudListItem; t: T }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.tr, { borderBottomColor: colors.outlineVariant }]}>
      <Text variant="labelLarge" style={[styles.colCode, { color: palette.indigo[600] }]}>#{s.CodigoSolicitud}</Text>
      <Text variant="bodyMedium" style={styles.colPolicy} numberOfLines={1}>{s.NumeroPoliza || '—'}</Text>
      <View style={styles.colHolder}>
        <Text variant="bodyMedium" numberOfLines={1} style={{ fontFamily: 'Inter_600SemiBold' }}>{s.NombreTitular}</Text>
        <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.onSurfaceVariant }}>
          {s.DescripcionPlan} · {s.DescripcionFormaPago}
        </Text>
      </View>
      <Text variant="bodyMedium" style={styles.colCountry} numberOfLines={1}>{s.DescripcionPais}</Text>
      <Text variant="bodyMedium" style={styles.colNum} numberOfLines={1}>{s.NumeroAsegurados}</Text>
      <Text variant="bodyMedium" style={styles.colPremium} numberOfLines={1}>{fmtMoney(s.Prima)}</Text>
      <View style={styles.colStatus}>
        <StatusChip code={s.CodigoEstadoSolicitud} description={s.DescripcionEstadoSolicitud} />
      </View>
    </View>
  );
}

const PAGE_SIZES = [10, 25, 50];

function pageWindow(current: number, total: number, span: number) {
  const half = Math.floor(span / 2);
  const start = Math.max(1, Math.min(current - half, total - span + 1));
  const end = Math.min(total, start + span - 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function Paginator({ page, totalPages, total, limit, onPage, onLimit, loading, t, compact }: {
  page: number; totalPages: number; total: number; limit: number;
  onPage: (p: number) => void; onLimit: (l: number) => void; loading: boolean; t: T; compact: boolean;
}) {
  const { colors, roundness } = useTheme();
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);
  return (
    <View style={[styles.paginator, compact && styles.paginatorCompact, { borderTopColor: colors.outlineVariant }]}>
      <View style={styles.paginatorInfo}>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {from}–{to} {t.of} {total} {t.results}
        </Text>
        {loading && <ActivityIndicator animating size={14} />}
      </View>
      <View style={styles.paginatorControls}>
        {!compact && (
          <View style={styles.pageSizes}>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>{t.perPage}</Text>
            {PAGE_SIZES.map((s) => {
              const active = s === limit;
              return (
                <TouchableRipple key={s} onPress={() => onLimit(s)} borderless style={{ borderRadius: roundness - 6 }}>
                  <View style={[styles.pageBtn, active && { backgroundColor: palette.indigo[500] }]}>
                    <Text variant="labelMedium" style={{ color: active ? '#FFFFFF' : colors.onSurface }}>{s}</Text>
                  </View>
                </TouchableRipple>
              );
            })}
          </View>
        )}
        <View style={styles.pages}>
          <IconButton icon="chevron-double-left" size={18} disabled={page <= 1} onPress={() => onPage(1)} />
          <IconButton icon="chevron-left" size={18} disabled={page <= 1} onPress={() => onPage(page - 1)} />
          {pageWindow(page, totalPages, compact ? 3 : 5).map((p) => {
            const active = p === page;
            return (
              <TouchableRipple key={p} onPress={() => onPage(p)} borderless style={{ borderRadius: roundness - 6 }}>
                <View style={[styles.pageBtn, active && { backgroundColor: palette.indigo[500] }]}>
                  <Text variant="labelMedium" style={{ color: active ? '#FFFFFF' : colors.onSurface }}>{p}</Text>
                </View>
              </TouchableRipple>
            );
          })}
          <IconButton icon="chevron-right" size={18} disabled={page >= totalPages} onPress={() => onPage(page + 1)} />
          <IconButton icon="chevron-double-right" size={18} disabled={page >= totalPages} onPress={() => onPage(totalPages)} />
        </View>
      </View>
    </View>
  );
}

export default function SolicitudesScreen() {
  const user = useAuthStore((s) => s.user);
  const [estado, setEstado] = useState('99');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, isError, error, refetch, isRefetching, isFetching } = useSolicitudes(estado, page, limit);
  const logout = useLogout();
  const router = useRouter();
  const { colors, roundness } = useTheme();
  const { isDesktop } = useResponsive();
  const lang = useSettingsStore((s) => s.lang);
  const setLang = useSettingsStore((s) => s.setLang);
  const t = labels[lang];

  const solicitudes = useMemo<SolicitudListItem[]>(() => {
    const items = Array.isArray(data?.ListadoSolicitudes) ? data!.ListadoSolicitudes : [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((s) =>
      [s.NombreTitular, s.NumeroPoliza, s.DescripcionPlan, s.DescripcionPoliza, s.DescripcionPais]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [data, query]);
  const meta = data?.Meta;
  const totalPages = Math.max(1, meta?.totalPages ?? 1);
  const totalGeneral = useMemo(
    () => (data ? ESTADOS.reduce((acc, e) => acc + (data[e.countKey] || 0), 0) : 0),
    [data],
  );

  const changeEstado = (code: string) => { setEstado(code); setPage(1); };
  const changeLimit = (value: number) => { setLimit(value); setPage(1); };
  const goPage = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <AppShell
      title={t.requests}
      userName={user?.NombreCompletoUsuario ?? ''}
      userRole={user?.NombrePerfil}
      lang={lang}
      onLangChange={setLang}
      onProfile={() => router.push('/perfil' as any)}
      onLogout={() => logout.mutate()}
      onHome={() => router.push('/dashboard' as any)}
      onCotizaciones={() => router.push('/cotizaciones' as any)}
      onSolicitudes={() => {}}
      onPolizas={() => router.push('/polizas' as any)}
    >
      <View style={styles.header}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="headlineSmall">{t.requests}</Text>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>{t.subtitle}</Text>
        </View>
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
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip
          selected={estado === '99'}
          onPress={() => changeEstado('99')}
          showSelectedOverlay
          style={estado === '99' ? { backgroundColor: palette.indigo[50] } : undefined}
          textStyle={estado === '99' ? { color: palette.indigo[600] } : undefined}
        >
          {`${t.all} (${totalGeneral})`}
        </Chip>
        {ESTADOS.map((e) => {
          const active = estado === e.code;
          const color = estadoColor[e.code];
          const count = data?.[e.countKey] ?? 0;
          return (
            <Chip
              key={e.code}
              selected={active}
              onPress={() => changeEstado(e.code)}
              showSelectedOverlay
              style={active ? { backgroundColor: `${color}1A` } : undefined}
              textStyle={active ? { color } : undefined}
            >
              {`${t[e.labelKey] as string} (${count})`}
            </Chip>
          );
        })}
      </ScrollView>

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
      ) : solicitudes.length === 0 ? (
        <View style={styles.centered}>
          <View style={[styles.emptyIcon, { backgroundColor: palette.indigo[50] }]}>
            <Icon source="clipboard-text-outline" size={32} color={palette.indigo[500]} />
          </View>
          <Text variant="titleMedium" style={{ marginTop: 12 }}>{t.empty}</Text>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, marginTop: 4 }}>{t.emptyHint}</Text>
        </View>
      ) : isDesktop ? (
        <View style={[styles.table, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
          <View style={[styles.tr, styles.th, { borderBottomColor: colors.outlineVariant, backgroundColor: colors.background }]}>
            <Text variant="labelMedium" style={[styles.colCode, { color: colors.onSurfaceVariant }]}>{t.code}</Text>
            <Text variant="labelMedium" style={[styles.colPolicy, { color: colors.onSurfaceVariant }]}>{t.policy}</Text>
            <Text variant="labelMedium" style={[styles.colHolder, { color: colors.onSurfaceVariant }]}>{t.holder}</Text>
            <Text variant="labelMedium" style={[styles.colCountry, { color: colors.onSurfaceVariant }]}>{t.country}</Text>
            <Text variant="labelMedium" style={[styles.colNum, { color: colors.onSurfaceVariant }]}>{t.insureds}</Text>
            <Text variant="labelMedium" style={[styles.colPremium, { color: colors.onSurfaceVariant }]}>{t.premium}</Text>
            <Text variant="labelMedium" style={[styles.colStatus, { color: colors.onSurfaceVariant }]}>{t.status}</Text>
          </View>
          {solicitudes.map((s) => (
            <SolicitudRow key={s.CodigoSolicitud} s={s} t={t} />
          ))}
          <Paginator
            page={meta?.page ?? page}
            totalPages={totalPages}
            total={meta?.total ?? solicitudes.length}
            limit={limit}
            onPage={goPage}
            onLimit={changeLimit}
            loading={isFetching}
            t={t}
            compact={false}
          />
        </View>
      ) : (
        <View style={styles.list}>
          {solicitudes.map((s) => (
            <SolicitudCard key={s.CodigoSolicitud} s={s} t={t} />
          ))}
          <View style={[styles.table, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
            <Paginator
              page={meta?.page ?? page}
              totalPages={totalPages}
              total={meta?.total ?? solicitudes.length}
              limit={limit}
              onPage={goPage}
              onLimit={changeLimit}
              loading={isFetching}
              t={t}
              compact
            />
          </View>
        </View>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  toolbar: { borderWidth: 1, padding: 8 },
  search: { minWidth: 200 },
  chips: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64, gap: 4 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  list: { gap: 12 },
  card: { borderWidth: 1, padding: 16, gap: 6 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  codeBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  table: { borderWidth: 1, overflow: 'hidden' },
  tr: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  th: { paddingVertical: 10 },
  colCode: { width: 90 },
  colPolicy: { width: 100 },
  colHolder: { flex: 1, minWidth: 140 },
  colCountry: { width: 110 },
  colNum: { width: 70, textAlign: 'right' },
  colPremium: { width: 90, textAlign: 'right' },
  colStatus: { width: 150 },
  paginator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1 },
  paginatorCompact: { flexDirection: 'column', gap: 4 },
  paginatorInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  paginatorControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pageSizes: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pages: { flexDirection: 'row', alignItems: 'center' },
  pageBtn: { minWidth: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
});
