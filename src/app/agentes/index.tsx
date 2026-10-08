import { AgentePerfilItem, OPCION } from '@/api/agent';
import { AppShell, Lang } from '@/components/AppShell';
import { Paginator } from '@/components/Paginator';
import { useListaAgentes } from '@/hooks/useAgentes';
import { useLogout } from '@/hooks/useAuth';
import { useClientPagination } from '@/hooks/useClientPagination';
import { usePermisos, useRequirePermiso } from '@/hooks/usePermisos';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { palette } from '@/theme';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
    ActivityIndicator,
    Avatar,
    Button,
    Chip,
    Icon,
    Searchbar,
    Text,
    TouchableRipple,
    useTheme,
} from 'react-native-paper';

const labels = {
  es: {
    title: 'Agentes',
    subtitle: 'Organización de tu agencia',
    search: 'Buscar agente…',
    totalAgents: 'Total de Agentes',
    activeAgents: 'Agentes Activos',
    inactiveAgents: 'Agentes Inactivos',
    code: 'Código',
    agentType: 'Tipo Agente',
    agentName: 'Nombre Agente',
    status: 'Estado',
    commission: 'Comisión',
    policies: 'Pólizas',
    sales: 'Ventas',
    days30: '30 días',
    days60: '60 días',
    days90: '90 días',
    agents: 'Agentes',
    agentsPremiums: 'Primas Agentes',
    loading: 'Cargando agentes…',
    error: 'No pudimos cargar los agentes',
    retry: 'Reintentar',
    empty: 'No hay agentes en tu organización',
    emptySearch: 'Sin resultados para esta búsqueda',
    records: 'registros',
    viewProfile: 'Ver perfil',
    sortHierarchy: 'Jerarquía',
    sortType: 'Tipo de agente',
    sortName: 'Nombre',
    sortStatus: 'Estado',
    sortSales: 'Ventas',
    sortAgents: 'Primas agentes',
    perPage: 'Por página',
    of: 'de',
    results: 'resultados',
  },
  en: {
    title: 'Agents',
    subtitle: 'Your agency organization',
    search: 'Search agent…',
    totalAgents: 'Total Agents',
    activeAgents: 'Active Agents',
    inactiveAgents: 'Inactive Agents',
    code: 'Code',
    agentType: 'Agent Type',
    agentName: 'Agent Name',
    status: 'Status',
    commission: 'Commission',
    policies: 'Policies',
    sales: 'Sales',
    days30: '30 days',
    days60: '60 days',
    days90: '90 days',
    agents: 'Agents',
    agentsPremiums: 'Agents Premiums',
    loading: 'Loading agents…',
    error: 'We could not load the agents',
    retry: 'Retry',
    empty: 'There are no agents in your organization',
    emptySearch: 'No results for this search',
    records: 'records',
    viewProfile: 'View profile',
    sortHierarchy: 'Hierarchy',
    sortType: 'Agent type',
    sortName: 'Name',
    sortStatus: 'Status',
    sortSales: 'Sales',
    sortAgents: 'Agents premiums',
    perPage: 'Per page',
    of: 'of',
    results: 'results',
  },
  pt: {
    title: 'Agentes',
    subtitle: 'Organização da sua agência',
    search: 'Buscar agente…',
    totalAgents: 'Total de Agentes',
    activeAgents: 'Agentes Ativos',
    inactiveAgents: 'Agentes Inativos',
    code: 'Código',
    agentType: 'Tipo de Agente',
    agentName: 'Nome do Agente',
    status: 'Status',
    commission: 'Comissão',
    policies: 'Apólices',
    sales: 'Vendas',
    days30: '30 dias',
    days60: '60 dias',
    days90: '90 dias',
    agents: 'Agentes',
    agentsPremiums: 'Prêmios Agentes',
    loading: 'Carregando agentes…',
    error: 'Não foi possível carregar os agentes',
    retry: 'Tentar novamente',
    empty: 'Não há agentes na sua organização',
    emptySearch: 'Sem resultados para esta busca',
    records: 'registros',
    viewProfile: 'Ver perfil',
    sortHierarchy: 'Hierarquia',
    sortType: 'Tipo de agente',
    sortName: 'Nome',
    sortStatus: 'Status',
    sortSales: 'Vendas',
    sortAgents: 'Prêmios agentes',
    perPage: 'Por página',
    of: 'de',
    results: 'resultados',
  },
} satisfies Record<Lang, Record<string, string>>;

type T = (typeof labels)['es'];

const money = (n?: number | null) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n ?? 0);

const pct = (n?: number | null) => `${((n ?? 0) * 100).toFixed(1)}%`;
const pad = (n: number) => String(n).padStart(4, '0');

type SortKey = 'hierarchy' | 'tipo' | 'nombre' | 'estado' | 'ventas' | 'primasAgentes';

const tipoIcon = (desc: string) => {
  const d = (desc ?? '').toLowerCase();
  if (d.includes('mga') || d.includes('master')) return 'domain';
  if (d.includes('agencia')) return 'office-building-outline';
  return 'account-tie-outline';
};

const tipoColor = (desc: string) => {
  const d = (desc ?? '').toLowerCase();
  if (d.includes('mga') || d.includes('master')) return '#7B1FA2';
  if (d.includes('agencia')) return palette.indigo[600];
  return palette.navy[500];
};

function SummaryCard({ label, value, hint, color, icon }: { label: string; value: string; hint?: string; color: string; icon: string }) {
  const { colors, roundness } = useTheme();
  return (
    <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness + 2 }]}>
      <View style={[styles.summaryIcon, { backgroundColor: `${color}1A` }]}>
        <Icon source={icon} size={22} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>{label}</Text>
        <View style={styles.summaryValueRow}>
          <Text variant="headlineSmall" style={{ color }}>{value}</Text>
          {!!hint && <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>{hint}</Text>}
        </View>
      </View>
    </View>
  );
}

export default function AgentesScreen() {
  const user = useAuthStore((s) => s.user);
  const allowed = useRequirePermiso(OPCION.agentes);
  const lang = useSettingsStore((s) => s.lang);
  const setLang = useSettingsStore((s) => s.setLang);
  const router = useRouter();
  const logout = useLogout();
  const { colors, roundness } = useTheme();
  const { isDesktop } = useResponsive();
  const t = labels[lang];

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('hierarchy');
  const { canSee } = usePermisos();
  const { data, isLoading, isError, refetch, isRefetching } = useListaAgentes(canSee(OPCION.agentes));

  const SORTS: { key: SortKey; label: string }[] = [
    { key: 'hierarchy', label: t.sortHierarchy },
    { key: 'tipo', label: t.sortType },
    { key: 'nombre', label: t.sortName },
    { key: 'estado', label: t.sortStatus },
    { key: 'ventas', label: t.sortSales },
    { key: 'primasAgentes', label: t.sortAgents },
  ];

  const rows = useMemo(() => {
    let list = [...(data?.listaAgentesPerfil ?? [])];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((a) =>
        `${a.codigoAgente} ${a.nombreAgente} ${a.descripcionTipoAgente} ${a.estadoAgente}`.toLowerCase().includes(q),
      );
    }
    switch (sort) {
      case 'tipo':
        list.sort((a, b) =>
          a.descripcionTipoAgente.localeCompare(b.descripcionTipoAgente) || a.nivel - b.nivel || a.nombreAgente.localeCompare(b.nombreAgente));
        break;
      case 'nombre':
        list.sort((a, b) => a.nombreAgente.localeCompare(b.nombreAgente));
        break;
      case 'estado':
        list.sort((a, b) => a.estadoAgente.localeCompare(b.estadoAgente) || a.nombreAgente.localeCompare(b.nombreAgente));
        break;
      case 'ventas':
        list.sort((a, b) => b.primas - a.primas);
        break;
      case 'primasAgentes':
        list.sort((a, b) => b.primasAgentes - a.primasAgentes);
        break;
      default: // jerarquía: orden original del SP (padres → hijos)
        break;
    }
    return list;
  }, [data, search, sort]);

  const { page, limit, totalPages, pageItems, goPage, changeLimit } = useClientPagination(rows);

  const goProfile = (a: AgentePerfilItem) => router.push(`/agentes/${a.codigoAgente}` as any);

  // Estados: 01 Habilitado, 02 Sin Contrato, 03 Inactivo, 04 Bloqueado
  const estadoColor = (a: AgentePerfilItem) =>
    ({ '01': palette.success, '02': palette.warning, '03': palette.slate[500], '04': colors.error } as Record<string, string>)[
      a.codigoEstadoAgente
    ] ?? (/inactiv|bloque/i.test(a.estadoAgente) ? colors.error : palette.success);

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
      onAgentes={() => {}}
      onBack={() => (router.canGoBack() ? router.back() : router.push('/dashboard' as any))}
    >
      <View style={styles.header}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="headlineSmall">{t.title}</Text>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>{t.subtitle}</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <SummaryCard label={t.totalAgents} value={String(data?.totalAgentes ?? 0)} color={palette.indigo[600]} icon="account-network-outline" />
        <SummaryCard label={t.activeAgents} value={String(data?.totalActivos ?? 0)} hint={pct(data?.porcentajeActivos)} color={palette.success} icon="account-check-outline" />
        <SummaryCard label={t.inactiveAgents} value={String(data?.totalInactivos ?? 0)} hint={pct(data?.porcentajeInactivos)} color={colors.error} icon="account-off-outline" />
      </View>

      <Searchbar
        placeholder={t.search}
        value={search}
        onChangeText={setSearch}
        style={[styles.search, { backgroundColor: colors.surface, borderRadius: roundness - 4 }]}
        inputStyle={{ fontSize: 14, minHeight: 0 }}
        elevation={0}
      />

      <View style={styles.sortRow}>
        {SORTS.map((s) => (
          <Chip
            key={s.key}
            compact
            selected={sort === s.key}
            showSelectedCheck={false}
            mode={sort === s.key ? 'flat' : 'outlined'}
            onPress={() => setSort(s.key)}
            style={{ borderRadius: roundness }}
          >
            {s.label}
          </Chip>
        ))}
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
          <Button mode="contained-tonal" icon="refresh" onPress={() => refetch()} loading={isRefetching} style={{ marginTop: 12 }}>{t.retry}</Button>
        </View>
      ) : rows.length === 0 ? (
        <View style={styles.centered}>
          <View style={[styles.emptyIcon, { backgroundColor: palette.indigo[50] }]}>
            <Icon source="account-network-outline" size={32} color={palette.indigo[500]} />
          </View>
          <Text variant="titleMedium" style={{ marginTop: 12 }}>{search ? t.emptySearch : t.empty}</Text>
        </View>
      ) : isDesktop ? (
        <View style={[styles.table, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
          <ScrollView horizontal>
            <View>
              <View style={[styles.tr, styles.th, { borderBottomColor: colors.outlineVariant, backgroundColor: colors.background }]}>
                <Text variant="labelMedium" style={[styles.cCode, { color: colors.onSurfaceVariant }]}>{t.code}</Text>
                <Text variant="labelMedium" style={[styles.cType, { color: colors.onSurfaceVariant }]}>{t.agentType}</Text>
                <Text variant="labelMedium" style={[styles.cName, { color: colors.onSurfaceVariant }]}>{t.agentName}</Text>
                <Text variant="labelMedium" style={[styles.cStatus, { color: colors.onSurfaceVariant }]}>{t.status}</Text>
                <Text variant="labelMedium" style={[styles.cNum, { color: colors.onSurfaceVariant }]}>{t.commission}</Text>
                <Text variant="labelMedium" style={[styles.cNum, { color: colors.onSurfaceVariant }]}>{t.policies}</Text>
                <Text variant="labelMedium" style={[styles.cNum, { color: colors.onSurfaceVariant }]}>{t.sales}</Text>
                <Text variant="labelMedium" style={[styles.cNum, { color: colors.onSurfaceVariant }]}>{t.days30}</Text>
                <Text variant="labelMedium" style={[styles.cNum, { color: colors.onSurfaceVariant }]}>{t.days60}</Text>
                <Text variant="labelMedium" style={[styles.cNum, { color: colors.onSurfaceVariant }]}>{t.days90}</Text>
                <Text variant="labelMedium" style={[styles.cNum, { color: colors.onSurfaceVariant }]}>{t.agents}</Text>
                <Text variant="labelMedium" style={[styles.cNum, { color: colors.onSurfaceVariant }]}>{t.agentsPremiums}</Text>
              </View>
              {pageItems.map((a) => (
                <TouchableRipple key={`${a.nivel}-${a.codigoAgente}`} onPress={() => goProfile(a)} borderless>
                  <View style={[styles.tr, { borderBottomColor: colors.outlineVariant }]}>
                    <Text variant="bodySmall" style={[styles.cCode, { fontFamily: 'Inter_600SemiBold', color: palette.indigo[600] }]}>
                      {pad(a.codigoAgente)}
                    </Text>
                    <View style={styles.cType}>
                      <View style={[styles.tipoChip, { backgroundColor: `${tipoColor(a.descripcionTipoAgente)}1A` }]}>
                        <Icon source={tipoIcon(a.descripcionTipoAgente)} size={12} color={tipoColor(a.descripcionTipoAgente)} />
                        <Text variant="labelSmall" style={{ color: tipoColor(a.descripcionTipoAgente) }} numberOfLines={1}>
                          {a.descripcionTipoAgente}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.cName}>
                      <Text
                        variant="bodySmall"
                        numberOfLines={1}
                        style={{ fontFamily: 'Inter_600SemiBold', paddingLeft: (a.nivel - 1) * 14 }}
                      >
                        {a.nombreAgente}
                      </Text>
                    </View>
                    <View style={styles.cStatus}>
                      <View style={[styles.statusChip, { backgroundColor: `${estadoColor(a)}1A` }]}>
                        <Text variant="labelSmall" style={{ color: estadoColor(a) }}>{a.estadoAgente}</Text>
                      </View>
                    </View>
                    <Text variant="bodySmall" style={styles.cNum}>NN {pct(a.comisionAgente)}{'\n'}RN {pct(a.comisionRenovacion)}</Text>
                    <Text variant="bodySmall" style={styles.cNum}>{a.polizas}</Text>
                    <Text variant="bodySmall" style={styles.cNum}>{money(a.primas)}</Text>
                    <Text variant="bodySmall" style={styles.cNum}>{money(a.primas30)}</Text>
                    <Text variant="bodySmall" style={styles.cNum}>{money(a.primas60)}</Text>
                    <Text variant="bodySmall" style={styles.cNum}>{money(a.primas90)}</Text>
                    <Text variant="bodySmall" style={styles.cNum}>{a.cantidadAgentes}</Text>
                    <Text variant="bodySmall" style={styles.cNum}>{money(a.primasAgentes)}</Text>
                  </View>
                </TouchableRipple>
              ))}
            </View>
          </ScrollView>
          <Paginator
            page={page}
            totalPages={totalPages}
            total={rows.length}
            limit={limit}
            onPage={goPage}
            onLimit={changeLimit}
            labels={t}
          />
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {pageItems.map((a) => (
            <TouchableOpacity
              key={`${a.nivel}-${a.codigoAgente}`}
              activeOpacity={0.8}
              onPress={() => goProfile(a)}
              style={[styles.mCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness + 2 }]}
            >
              <View style={styles.mCardTop}>
                <Avatar.Text
                  size={38}
                  label={(a.nombreAgente || 'A').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                  style={{ backgroundColor: palette.indigo[100] }}
                  labelStyle={{ color: palette.indigo[700], fontFamily: 'Inter_600SemiBold' }}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="titleSmall" numberOfLines={1} style={{ paddingLeft: (a.nivel - 1) * 10 }}>{a.nombreAgente}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Icon source={tipoIcon(a.descripcionTipoAgente)} size={13} color={tipoColor(a.descripcionTipoAgente)} />
                    <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                      {pad(a.codigoAgente)} · {a.descripcionTipoAgente}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusChip, { backgroundColor: `${estadoColor(a)}1A` }]}>
                  <Text variant="labelSmall" style={{ color: estadoColor(a) }}>{a.estadoAgente}</Text>
                </View>
                <Icon source="chevron-right" size={20} color={colors.onSurfaceVariant} />
              </View>
              <View style={styles.mStats}>
                <Text variant="bodySmall" style={styles.mStat}><Text style={{ color: colors.onSurfaceVariant }}>{t.policies}: </Text>{a.polizas}</Text>
                <Text variant="bodySmall" style={styles.mStat}><Text style={{ color: colors.onSurfaceVariant }}>{t.sales}: </Text>{money(a.primas)}</Text>
                <Text variant="bodySmall" style={styles.mStat}><Text style={{ color: colors.onSurfaceVariant }}>{t.agents}: </Text>{a.cantidadAgentes}</Text>
                <Text variant="bodySmall" style={styles.mStat}><Text style={{ color: colors.onSurfaceVariant }}>{t.agentsPremiums}: </Text>{money(a.primasAgentes)}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={[styles.mPaginator, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
            <Paginator
              page={page}
              totalPages={totalPages}
              total={rows.length}
              limit={limit}
              onPage={goPage}
              onLimit={changeLimit}
              labels={t}
            />
          </View>
        </View>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  summaryCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderWidth: 1, flex: 1, minWidth: 200 },
  summaryIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  summaryValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  search: { borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  table: { borderWidth: 1, overflow: 'hidden' },
  tr: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1 },
  th: { paddingVertical: 10 },
  cCode: { width: 60 },
  cType: { width: 80 },
  cName: { width: 210 },
  cStatus: { width: 90 },
  cNum: { width: 82, textAlign: 'right' },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, alignSelf: 'flex-start' },
  tipoChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' },
  sortRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tableFooter: { paddingHorizontal: 16, paddingVertical: 10 },
  mPaginator: { borderWidth: 1, overflow: 'hidden' },
  mCard: { borderWidth: 1, padding: 14, gap: 10 },
  mCardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mStats: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 4 },
  mStat: { fontSize: 12 },
});
