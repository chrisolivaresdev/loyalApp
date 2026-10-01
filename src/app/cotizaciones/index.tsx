import { Cotizacion } from '@/api/cotizaciones';
import { AppShell, Lang } from '@/components/AppShell';
import { useLogout } from '@/hooks/useAuth';
import { useCotizacion, useCotizaciones } from '@/hooks/useCotizaciones';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { palette } from '@/theme';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Chip,
  Dialog,
  Divider,
  FAB,
  Icon,
  IconButton,
  Searchbar,
  Text,
  TouchableRipple,
  useTheme
} from 'react-native-paper';

const labels: Record<Lang, { [key: string]: string }> = {
  es: {
    quotes: 'Cotizaciones',
    home: 'Inicio',
    profile: 'Mi perfil',
    logout: 'Cerrar sesión',
    language: 'Idioma',
    newQuote: 'Nueva cotización',
    subtitle: 'Gestioná y consultá las cotizaciones de tus clientes',
    search: 'Buscar por nombre, código o correo',
    loading: 'Cargando cotizaciones…',
    empty: 'No hay cotizaciones para mostrar',
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
    home: 'Home',
    profile: 'My profile',
    logout: 'Sign out',
    language: 'Language',
    newQuote: 'New quote',
    subtitle: 'Manage and review your customers quotes',
    search: 'Search by name, code or email',
    loading: 'Loading quotes…',
    empty: 'No quotes to show',
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

function getInitials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function QuoteDetail({ codigo, t, onClose }: { codigo: number; t: Record<string, string>; onClose: () => void }) {
  const { data, isLoading, isError } = useCotizacion(codigo);
  const { colors, roundness } = useTheme();

  const productos = useMemo(() => {
    if (!data) return [];
    const defs = [
      { name: 'Beyond', items: data.ListaPrimasAnualBeyond },
      { name: 'Privilege', items: data.ListaPrimasAnualPrivilege },
      { name: 'Liberty', items: data.ListaPrimasAnualLiberty },
      { name: 'Legacy', items: data.ListaPrimasAnualLegacy },
      { name: 'Essential', items: data.ListaPrimasAnualEssential },
    ].map((d) => ({ ...d, items: d.items || [] }));
    return defs.filter((d) => d.items.length > 0);
  }, [data]);

  const frecuencias = useMemo(() => {
    if (!data) return [];
    const listas = [
      [t.annual, data.ListaPrimasAnualBeyond],
      [t.semiannual, data.ListaPrimasSemiAnualBeyond],
      [t.quarterly, data.ListaPrimasTrimestralBeyond],
      [t.monthly, data.ListaPrimasMensualBeyond],
    ] as [string, any[]][];
    return listas.filter(([, arr]) => (arr || []).length > 0).map(([freq, arr]) => ({ freq, total: (arr || []).reduce((s, p) => s + Number(p.Opcion2 || 0), 0) }));
  }, [data, t]);

  const Field = ({ label, value, icon }: { label: string; value?: string | number | null; icon: string }) => (
    <View style={[styles.field, { backgroundColor: colors.background, borderColor: colors.outlineVariant }]}>
      <View style={styles.fieldLabel}>
        <Icon source={icon} size={14} color={palette.indigo[500]} />
        <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>{label}</Text>
      </View>
      <Text variant="bodyMedium" style={{ fontFamily: 'Inter_600SemiBold' }} numberOfLines={2}>
        {value === undefined || value === null || String(value).trim() === '' ? '—' : String(value)}
      </Text>
    </View>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={{ gap: 10 }}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionBar, { backgroundColor: palette.indigo[500] }]} />
        <Text variant="labelLarge" style={{ color: colors.onSurface }}>{title}</Text>
      </View>
      {children}
    </View>
  );

  return (
    <Dialog visible onDismiss={onClose} style={[styles.dialog, { backgroundColor: colors.surface }]}>
      <View style={[styles.dialogHeader, { borderBottomColor: colors.outlineVariant }]}>
        <View style={[styles.detailAvatar, { backgroundColor: palette.indigo[500] }]}>
          <Text variant="titleMedium" style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold' }}>
            {data ? getInitials(data.NombreSolicitante) : '#'}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="titleMedium" numberOfLines={1}>
            {data?.NombreSolicitante ?? `${t.detail} #${codigo}`}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>
            {t.detail} #{codigo}{data?.DescripcionPais ? ` · ${data.DescripcionPais}` : ''}
          </Text>
        </View>
        {data && (
          <StatusChip code={data.CodigoEstadoCotizacion} description={data.DescripcionEstadoCotizacion} />
        )}
        <IconButton icon="close" size={20} onPress={onClose} style={{ margin: 0 }} />
      </View>

      <Dialog.ScrollArea style={{ paddingHorizontal: 0, borderTopWidth: 0, borderBottomWidth: 0 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 20 }}>
          {isLoading && <ActivityIndicator animating style={{ marginVertical: 24 }} />}
          {isError && <Text style={{ color: colors.error, textAlign: 'center' }}>{t.error}</Text>}
          {data && (
            <>
              <Section title={t.detail}>
                <View style={styles.fieldGrid}>
                  <Field icon="calendar-outline" label={t.validity} value={data.FechaInicioSolicitada} />
                  <Field icon="cake-variant" label={t.birthdate} value={data.FechaNacimnientoSolicitante} />
                  <Field icon="timer-sand" label={t.age} value={`${data.EdadSolicitante || 0} ${t.years}`} />
                  <Field icon="gender-male-female" label={t.gender} value={data.SexoSolicitante} />
                  <Field icon="email-outline" label={t.email} value={data.Correo} />
                  <Field icon="account-group-outline" label={t.dependents} value={data.NumeroDependientes || 0} />
                  <Field icon="baby-carriage" label={t.maternity} value={isYes(data.ComplicacionesMaternidad) ? t.yes : t.no} />
                  <Field icon="heart-pulse" label={t.transplant} value={isYes(data.TrasplanteOrganos) ? t.yes : t.no} />
                </View>
              </Section>

              {!!data.FechaNacimnientoConyuge && (
                <Section title={t.spouse}>
                  <View style={styles.fieldGrid}>
                    <Field icon="cake-variant" label={t.birthdate} value={data.FechaNacimnientoConyuge} />
                    <Field icon="timer-sand" label={t.age} value={`${data.EdadConyuge || 0} ${t.years}`} />
                    <Field icon="gender-male-female" label={t.gender} value={data.SexoConyuge} />
                  </View>
                </Section>
              )}

              {frecuencias.length > 0 && (
                <Section title={t.premiums}>
                  <View style={styles.fieldGrid}>
                    {frecuencias.map((f) => (
                      <View key={f.freq} style={[styles.field, { backgroundColor: palette.indigo[50], borderColor: palette.indigo[100] }]}>
                        <Text variant="labelSmall" style={{ color: palette.indigo[700] }}>{f.freq}</Text>
                        <Text variant="titleMedium" style={{ color: palette.indigo[700] }}>${f.total.toLocaleString('en-US')}</Text>
                      </View>
                    ))}
                  </View>
                </Section>
              )}

              {productos.length > 0 && (
                <Section title={t.products}>
                  <View style={[styles.productTable, { borderColor: colors.outlineVariant }]}>
                    {productos.map((p, idx) => (
                      <View key={p.name} style={[styles.productBlock, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.outlineVariant }]}>
                        <View style={[styles.productHead, { backgroundColor: colors.background }]}>
                          <Text variant="labelLarge" style={{ color: palette.indigo[600] }}>{p.name}</Text>
                        </View>
                        {p.items.map((pr, i) => (
                          <View key={i} style={[styles.productLine, i > 0 && { borderTopWidth: 1, borderTopColor: colors.outlineVariant }]}>
                            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, flex: 1 }} numberOfLines={1}>
                              {pr.FormaPago} · {pr.Cobertura}
                            </Text>
                            <Text variant="bodyMedium" style={{ fontFamily: 'Inter_600SemiBold' }}>{pr.Opcion1}</Text>
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                </Section>
              )}
            </>
          )}
        </ScrollView>
      </Dialog.ScrollArea>
      <View style={[styles.dialogFooter, { borderTopColor: colors.outlineVariant }]}>
        <Button onPress={onClose} mode="contained" style={{ borderRadius: 6 }} contentStyle={{ paddingHorizontal: 12 }}>
          {t.close}
        </Button>
      </View>
    </Dialog>
  );
}

const PAGE_SIZES = [10, 25, 50];

function pageWindow(page: number, totalPages: number, size = 5): number[] {
  const half = Math.floor(size / 2);
  let start = Math.max(1, page - half);
  const end = Math.min(totalPages, start + size - 1);
  start = Math.max(1, end - size + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function Paginator({
  page, totalPages, total, limit, onPage, onLimit, loading, t, compact,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPage: (p: number) => void;
  onLimit: (l: number) => void;
  loading?: boolean;
  t: Record<string, string>;
  compact: boolean;
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

export default function CotizacionesScreen() {
  const user = useAuthStore((s) => s.user);
  const [estado, setEstado] = useState<string | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 600);
    return () => clearTimeout(id);
  }, [query]);

  const { data, isLoading, isError, refetch, isRefetching, isFetching } = useCotizaciones(estado, page, limit, debouncedQuery);
  const { data: all } = useCotizaciones(undefined, 1, 100);
  const logout = useLogout();
  const router = useRouter();
  const { colors, roundness } = useTheme();
  const { isDesktop } = useResponsive();
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
  const changeLimit = (value: number) => { setLimit(value); setPage(1); };
  const goPage = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  const filtered = cotizaciones;

  const goNew = () => router.push('/cotizaciones/nueva' as any);

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
        labels={{ profile: t.profile, logout: t.logout, language: t.language, home: t.home, quotes: t.quotes }}
      >
        <View style={styles.header}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="headlineSmall">{t.quotes}</Text>
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>{t.subtitle}</Text>
          </View>
          {isDesktop && (
            <Button mode="contained" icon="plus" onPress={goNew} style={{ borderRadius: roundness - 4 }}>
              {t.newQuote}
            </Button>
          )}
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
            <Button mode="contained" icon="plus" onPress={goNew} style={{ marginTop: 16 }}>{t.newQuote}</Button>
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
              <QuoteRow key={c.CodigoCotizacion} c={c} t={t} onPress={() => setSelected(c.CodigoCotizacion)} />
            ))}
            <Paginator
              page={meta?.page ?? page}
              totalPages={totalPages}
              total={meta?.total ?? filtered.length}
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
            {filtered.map((c) => (
              <QuoteCard key={c.CodigoCotizacion} c={c} t={t} onPress={() => setSelected(c.CodigoCotizacion)} />
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
                t={t}
                compact
              />
            </View>
          </View>
        )}
      </AppShell>

      {!isDesktop && (
        <FAB icon="plus" label={t.newQuote} onPress={goNew} style={[styles.fab, { backgroundColor: palette.indigo[500] }]} color="#FFFFFF" />
      )}

      {selected !== null && <QuoteDetail codigo={selected} t={t} onClose={() => setSelected(null)} />}
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
  dialog: { maxWidth: 640, width: '94%', alignSelf: 'center', maxHeight: '90%', borderRadius: 8, overflow: 'hidden' },
  dialogHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 20, paddingRight: 8, paddingVertical: 14, borderBottomWidth: 1 },
  dialogFooter: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1 },
  detailAvatar: { width: 40, height: 40, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionBar: { width: 3, height: 16, borderRadius: 2 },
  fieldGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  field: { flexGrow: 1, flexBasis: '45%', minWidth: 140, padding: 12, gap: 4, borderWidth: 1, borderRadius: 6 },
  fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  productTable: { borderWidth: 1, borderRadius: 6, overflow: 'hidden' },
  productBlock: {},
  productHead: { paddingHorizontal: 12, paddingVertical: 8 },
  productLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
});
