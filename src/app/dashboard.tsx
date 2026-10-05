import { OPCION } from '@/api/agent';
import { AgentCard } from '@/components/AgentCard';
import { AppShell, Lang } from '@/components/AppShell';
import { BreakdownCard } from '@/components/BreakdownCard';
import { ChartsSection } from '@/components/ChartsSection';
import { CotizacionesResumenCard } from '@/components/CotizacionesResumenCard';
import { GoalCard } from '@/components/GoalCard';
import { SolicitudesResumenCard } from '@/components/SolicitudesResumenCard';
import { StatCard } from '@/components/StatCard';
import { usePerfilAgente } from '@/hooks/useAgentes';
import { useLogout } from '@/hooks/useAuth';
import { useCharts } from '@/hooks/useCharts';
import { useResumenCotizaciones } from '@/hooks/useCotizaciones';
import { useDashboard } from '@/hooks/useDashboard';
import { usePermisos } from '@/hooks/usePermisos';
import { useResponsive } from '@/hooks/useResponsive';
import { useSolicitudes } from '@/hooks/useSolicitudes';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { palette } from '@/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Avatar,
    Button,
    Dialog,
    Icon,
    Portal,
    Switch,
    Text,
    useTheme
} from 'react-native-paper';

const labels: Record<Lang, { [key: string]: string }> = {
  es: {
    dashboard: 'Panel principal',
    home: 'Inicio',
    greeting: 'Bienvenido de nuevo',
    period: 'Período actual',
    metrics: 'Indicadores clave',
    policies: 'Pólizas activas',
    premiums: 'Primas',
    commissions: 'Comisiones',
    goal: 'Objetivo',
    goalTitle: 'Cumplimiento del objetivo anual',
    achieved: 'Producción',
    summary: 'Actividad comercial',
    charts: 'Gráficos',
    quotes: 'Cotizaciones',
    requests: 'Solicitudes',
    requestsEntered: 'Solicitudes Ingresadas',
    lastRequest: 'Última solicitud',
    stGenerated: 'Generada',
    stInProgress: 'En Proceso Registro',
    stPendingUw: 'Pendiente UW',
    stApproved: 'Aprobada',
    stDenied: 'Denegada',
    stVoided: 'Anulada',
    stPostponed: 'Evaluación Pospuesta',
    lastPayment: 'Último pago de comisiones',
    breakdownPolicies: 'Cartera - Pólizas',
    breakdownPremiums: 'Cartera - Primas',
    active: 'Activas',
    gracePeriod: 'Período de Gracia',
    pendingPayment: 'Pendiente de Pago',
    total: 'Total',
    newBusiness: 'Nuevo negocio',
    renewals: 'Renovaciones',
    cancelled: 'Canceladas',
    pending: 'Pendientes de pago',
    language: 'Idioma',
    profile: 'Mi perfil',
    close: 'Cerrar',
    logout: 'Cerrar sesión',
    retry: 'Reintentar',
    error: 'No pudimos cargar tu información',
    errorHint: 'Verificá tu conexión e intentá de nuevo.',
    email: 'Correo',
    role: 'Perfil',
    agency: 'Página',
    agentCode: 'Código',
    address: 'Dirección',
    mobile: 'Celular',
    phone: 'Teléfono',
    activeAgent: 'Agente activo',
    noData: 'Sin datos',
    structure: 'Mostrar información de toda la estructura de agentes',
    structureOn: 'Datos de toda la estructura',
    structureOff: 'Datos propios del agente',
  },
  en: {
    dashboard: 'Dashboard',
    home: 'Home',
    greeting: 'Welcome back',

    period: 'Current period',
    metrics: 'Key indicators',
    policies: 'Active policies',
    premiums: 'Premiums',
    commissions: 'Commissions',
    goal: 'Goal',
    goalTitle: 'Annual goal achievement',
    achieved: 'Production',
    summary: 'Sales activity',
    charts: 'Charts',
    quotes: 'Quotes',
    requests: 'Applications',
    requestsEntered: 'Applications submitted',
    lastRequest: 'Last application',
    stGenerated: 'Generated',
    stInProgress: 'Registration in progress',
    stPendingUw: 'Pending UW',
    stApproved: 'Approved',
    stDenied: 'Denied',
    stVoided: 'Voided',
    stPostponed: 'Postponed evaluation',
    lastPayment: 'Last commission payment',
    breakdownPolicies: 'Portfolio - Policies',
    breakdownPremiums: 'Portfolio - Premiums',
    active: 'Active',
    gracePeriod: 'Grace Period',
    pendingPayment: 'Pending Payment',
    total: 'Total',
    newBusiness: 'New business',
    renewals: 'Renewals',
    cancelled: 'Cancelled',
    pending: 'Pending payment',
    language: 'Language',
    profile: 'My profile',
    close: 'Close',
    logout: 'Sign out',
    retry: 'Retry',
    error: "We couldn't load your information",
    errorHint: 'Check your connection and try again.',
    email: 'Email',
    role: 'Role',
    agency: 'Page',
    agentCode: 'Code',
    address: 'Address',
    mobile: 'Mobile',
    phone: 'Phone',
    activeAgent: 'Active agent',
    noData: 'No data',
    structure: 'Show info for the whole agent structure',
    structureOn: 'Whole structure data',
    structureOff: 'Agent own data',
  },
  pt: {
    dashboard: 'Painel principal',
    home: 'Início',
    greeting: 'Bem-vindo de volta',
    period: 'Período atual',
    metrics: 'Indicadores-chave',
    policies: 'Apólices ativas',
    premiums: 'Prêmios',
    commissions: 'Comissões',
    goal: 'Meta',
    goalTitle: 'Cumprimento da meta anual',
    achieved: 'Produção',
    summary: 'Atividade comercial',
    charts: 'Gráficos',
    quotes: 'Cotações',
    requests: 'Solicitações',
    requestsEntered: 'Solicitações registradas',
    lastRequest: 'Última solicitação',
    stGenerated: 'Gerada',
    stInProgress: 'Registro em andamento',
    stPendingUw: 'Pendente UW',
    stApproved: 'Aprovada',
    stDenied: 'Negada',
    stVoided: 'Anulada',
    stPostponed: 'Avaliação postergada',
    lastPayment: 'Último pagamento de comissões',
    breakdownPolicies: 'Carteira - Apólices',
    breakdownPremiums: 'Carteira - Prêmios',
    active: 'Ativas',
    gracePeriod: 'Período de carência',
    pendingPayment: 'Pagamento pendente',
    total: 'Total',
    newBusiness: 'Novos negócios',
    renewals: 'Renovações',
    cancelled: 'Canceladas',
    pending: 'Pagamentos pendentes',
    language: 'Idioma',
    profile: 'Meu perfil',
    close: 'Fechar',
    logout: 'Sair',
    retry: 'Tentar novamente',
    error: 'Não foi possível carregar suas informações',
    errorHint: 'Verifique sua conexão e tente novamente.',
    email: 'E-mail',
    role: 'Perfil',
    agency: 'Página',
    agentCode: 'Código',
    address: 'Endereço',
    mobile: 'Celular',
    phone: 'Telefone',
    activeAgent: 'Agente ativo',
    noData: 'Sem dados',
    structure: 'Mostrar informações de toda a estrutura de agentes',
    structureOn: 'Dados de toda a estrutura',
    structureOff: 'Dados do próprio agente',
  },
};

const formatCurrency = (n?: number | null) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n ?? 0);

const formatNumber = (n?: number | null) => new Intl.NumberFormat('en-US').format(n ?? 0);

const formatDate = (value: string | null | undefined, lang: Lang) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const locales: Record<Lang, string> = { es: 'es-ES', en: 'en-US', pt: 'pt-BR' };
  return d.toLocaleDateString(locales[lang], { day: '2-digit', month: 'short', year: 'numeric' });
};

const getInitials = (name: string) =>
  name.trim().split(/\s+/).map((n) => n[0]).join('').slice(0, 2).toUpperCase();

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionTitle}>
      <Text variant="titleMedium">{title}</Text>
      {!!subtitle && (
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

function StateCard({ icon, title, hint, action }: { icon: string; title: string; hint?: string; action?: React.ReactNode }) {
  const { colors, roundness } = useTheme();
  return (
    <View style={[styles.stateCard, { borderRadius: roundness + 4, backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
      <View style={[styles.stateIcon, { backgroundColor: colors.primaryContainer }]}>
        <Icon source={icon} size={28} color={colors.primary} />
      </View>
      <Text variant="titleMedium" style={{ textAlign: 'center' }}>{title}</Text>
      {!!hint && (
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
          {hint}
        </Text>
      )}
      {action}
    </View>
  );
}

function ProfileRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.profileRow}>
      <View style={[styles.profileIcon, { backgroundColor: colors.primaryContainer }]}>
        <Icon source={icon} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {label}
        </Text>
        <Text variant="bodyMedium">{value}</Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const [estructura, setEstructura] = useState(false);
  const { data, isLoading, isError, refetch, isRefetching } = useDashboard(estructura);
  const { productos, ventas, paises } = useCharts();
  const { canSee, canExecute } = usePermisos();
  const { data: solicitudesResumen } = useSolicitudes('99', 1, 1, canSee(OPCION.solicitudes));
  const { data: cotizacionesResumen } = useResumenCotizaciones(canSee(OPCION.cotizaciones));
  const codigoAgente = user?.CodigoAgente || user?.CodigoPersonalInterno || 0;
  const { data: perfil } = usePerfilAgente(codigoAgente || null, false, canSee(OPCION.agentes));
  const logout = useLogout();
  const router = useRouter();
  const { isMobile } = useResponsive();
  const lang = useSettingsStore((s) => s.lang);
  const setLang = useSettingsStore((s) => s.setLang);
  const [profileVisible, setProfileVisible] = useState(false);
  const t = labels[lang];
  const { colors, roundness } = useTheme();
  const year = new Date().getFullYear();

  const userName = user?.NombreCompletoUsuario ?? '';

  return (
    <>
      <AppShell
        title={t.dashboard}
        userName={userName}
        userRole={user?.NombrePerfil}
        lang={lang}
        onLangChange={setLang}
        onProfile={() => router.push('/perfil' as any)}
        onLogout={() => logout.mutate()}
        onHome={() => {}}
        onCotizaciones={() => router.push('/cotizaciones' as any)}
        onSolicitudes={() => router.push('/solicitudes' as any)}
        onPolizas={() => router.push('/polizas' as any)}
      >
        {!isMobile && (
          <View style={styles.hero}>
            <View>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                {t.greeting},
              </Text>
              <Text variant="headlineMedium">{userName.trim()}</Text>
            </View>
            <View style={[styles.periodChip, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
              <Icon source="calendar-range" size={16} color={colors.primary} />
              <Text variant="labelLarge" style={{ color: colors.onSurface }}>
                {t.period}: {year}
              </Text>
            </View>
          </View>
        )}

        {isLoading && (
          <StateCard icon="timer-sand" title={t.dashboard} action={<ActivityIndicator animating size="large" />} />
        )}

        {isError && !isLoading && (
          <StateCard
            icon="cloud-off-outline"
            title={t.error}
            hint={t.errorHint}
            action={
              <Button mode="contained" icon="refresh" onPress={() => refetch()} loading={isRefetching}>
                {t.retry}
              </Button>
            }
          />
        )}

        {data && (
          <>
            <AgentCard data={data} t={t} />

            <View style={[styles.structureToggle, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium" style={{ fontFamily: 'Inter_600SemiBold' }}>{t.structure}</Text>
                <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
                  {estructura ? t.structureOn : t.structureOff}
                </Text>
              </View>
              <Switch value={estructura} onValueChange={setEstructura} />
            </View>

            <View>
              <SectionTitle title={t.metrics} subtitle={`${t.period} ${year}`} />
              <View style={styles.grid}>
                <StatCard icon="shield-check-outline" label={t.policies} value={formatNumber(data.TotalPolizasActivas)} accent={palette.navy[600]} />
                <StatCard icon="cash-multiple" label={t.premiums} value={formatCurrency(data.TotalPrimas)} accent={palette.success} />
                <StatCard icon="hand-coin-outline" label={t.commissions} value={formatCurrency(data.TotalComisiones)} accent={palette.gold[600]} />
                <StatCard icon="target" label={t.goal} value={formatCurrency(data.Objetivo)} accent={palette.violet} />
              </View>
            </View>

            <GoalCard
              title={t.goalTitle}
              achievedLabel={t.achieved}
              goalLabel={t.goal}
              achieved={data.TotalPrimas}
              goal={data.Objetivo}
              percent={data.PorcentajeObjetivo ?? (data.Objetivo ? (data.TotalPrimas / data.Objetivo) * 100 : 0)}
              format={formatCurrency}
            />

            <View>
              <SectionTitle title={t.summary} />
              <View style={styles.grid}>
                {canSee(OPCION.cotizaciones) && (
                  <StatCard icon="calculator-variant-outline" label={t.quotes} value={formatNumber(data.TotalCotizaciones)} accent={palette.info} />
                )}
                {canSee(OPCION.solicitudes) && (
                  <StatCard
                    icon="file-document-outline"
                    label={t.requests}
                    value={formatNumber(data.TotalSolicitudesIngresadas)}
                    hint={formatDate(data.FechaUltimaSolicitud, lang) ? `${t.lastRequest}: ${formatDate(data.FechaUltimaSolicitud, lang)}` : undefined}
                    accent="#DB2777"
                  />
                )}
                {canSee(OPCION.comisiones) && (
                  <StatCard
                    icon="bank-transfer"
                    label={t.lastPayment}
                    value={formatCurrency(data.MontoPagadoComisiones)}
                    hint={data.DescripcionCicloComisiones || undefined}
                    accent={palette.warning}
                    action={{ label: t.commissions, onPress: () => router.push('/comisiones' as any) }}
                  />
                )}
              </View>
            </View>

            <View style={styles.grid}>
              {canSee(OPCION.cotizaciones) && (
                <CotizacionesResumenCard
                  resumen={cotizacionesResumen}
                  lang={lang}
                  onPress={() => router.push('/cotizaciones' as any)}
                  onGenerate={canExecute(OPCION.cotizaciones) ? () => router.push('/cotizaciones/nueva' as any) : undefined}
                />
              )}
              {canSee(OPCION.solicitudes) && <SolicitudesResumenCard
                title={t.requestsEntered}
                lastRequestLabel={t.lastRequest}
                lastRequestDate={formatDate(data.FechaUltimaSolicitud, lang)}
                total={data.TotalSolicitudesIngresadas ?? 0}
                lang={lang}
                onPress={() => router.push('/solicitudes' as any)}
                items={[
                  { label: t.stGenerated, count: solicitudesResumen?.Generada ?? 0 },
                  { label: t.stInProgress, count: solicitudesResumen?.Registro ?? 0 },
                  { label: t.stPendingUw, count: solicitudesResumen?.Evaluacion ?? 0 },
                  { label: t.stApproved, count: solicitudesResumen?.Aprobada ?? 0 },
                  { label: t.stDenied, count: solicitudesResumen?.Denegada ?? 0 },
                  { label: t.stVoided, count: solicitudesResumen?.Anulada ?? 0 },
                  { label: t.stPostponed, count: solicitudesResumen?.Pospuesta ?? 0 },
                ]}
              />}
              {canSee(OPCION.cartera) && (
                <BreakdownCard
                  title={t.breakdownPolicies}
                  subtitle={`${formatNumber(data.TotalPolizasActivas)} ${t.active.toLowerCase()}`}
                  onPress={() => router.push('/polizas' as any)}
                  icon="shield-check-outline"
                  iconColor={palette.navy[600]}
                  items={[
                    { label: t.active, value: formatNumber(data.TotalPolizasActivas), color: palette.navy[600] },
                    { label: t.gracePeriod, value: formatNumber(0), color: palette.success },
                    { label: t.pendingPayment, value: formatNumber(0), color: palette.warning },
                    { label: t.total, value: formatNumber(data.TotalPolizasActivas), color: palette.navy[900] },
                    { label: t.cancelled, value: formatNumber(data.PolizasCanceladas), color: palette.danger },
                  ]}
                />
              )}
              {canSee(OPCION.primas) && (
                <BreakdownCard
                  title={t.breakdownPremiums}
                  subtitle={formatCurrency(data.TotalPrimasPagadas)}
                  items={[
                    { label: t.active, value: formatCurrency(data.TotalPrimasPagadas), color: palette.navy[600] },
                    { label: t.gracePeriod, value: formatCurrency(data.PrimasComisionablesPeriodoGracias), color: palette.success },
                    { label: t.pendingPayment, value: formatCurrency(data.PrimasPendientesPago), color: palette.warning },
                    { label: t.total, value: formatCurrency((data.TotalPrimasPagadas || 0) + (data.PrimasComisionablesPeriodoGracias || 0) + (data.PrimasPendientesPago || 0)), color: palette.navy[900] },
                    { label: t.cancelled, value: formatCurrency(data.PrimasCanceladas), color: palette.danger },
                  ]}
                />
              )}
            </View>

            <View>
              <SectionTitle title={t.charts} />
              <ChartsSection
                productos={productos.data}
                ventas={ventas.data}
                paises={paises.data}
                kpi={{
                  porcentajeObjetivo: data.PorcentajeObjetivo ?? 0,
                  polizas: data.TotalPolizasActivas ?? 0,
                  nuevoNegocio: data.PrimasNuevoNegocio ?? 0,
                  renovaciones: data.PrimasRenovaciones ?? 0,
                  pagosRecibidos: data.TotalPrimasPagadas ?? 0,
                  objetivo: data.Objetivo ?? 0,
                }}
                cartera={perfil ? { primasPropias: perfil.primasPropias, primasAgentes: perfil.primasAgentes } : undefined}
                lang={lang}
              />
            </View>
          </>
        )}
      </AppShell>

      <Portal>
        <Dialog
          visible={profileVisible}
          onDismiss={() => setProfileVisible(false)}
          style={[styles.dialog, { borderRadius: roundness + 8, backgroundColor: colors.surface }]}
        >
          <Dialog.Content style={{ paddingTop: 24 }}>
            {user ? (
              <View style={styles.profile}>
                <Avatar.Text
                  size={84}
                  label={getInitials(user.NombreCompletoUsuario)}
                  style={{ backgroundColor: palette.gold[500] }}
                  labelStyle={{ color: palette.navy[900], fontFamily: 'Inter_700Bold' }}
                />
                <Text variant="titleLarge" style={{ textAlign: 'center' }}>
                  {user.NombreCompletoUsuario.trim()}
                </Text>
                <View style={[styles.roleChip, { backgroundColor: colors.primaryContainer }]}>
                  <Text variant="labelMedium" style={{ color: colors.onPrimaryContainer }}>
                    {user.NombrePerfil}
                  </Text>
                </View>
                <View style={styles.profileRows}>
                  <ProfileRow icon="email-outline" label={t.email} value={user.DireccionEmail} />
                  <ProfileRow icon="office-building-outline" label={t.agency} value={user.NombrePagina.trim()} />
                  <ProfileRow icon="identifier" label={t.agentCode} value={String(user.CodigoUsuario)} />
                </View>
              </View>
            ) : (
              <Text>{t.noData}</Text>
            )}
          </Dialog.Content>
          <Dialog.Actions style={{ paddingHorizontal: 24, paddingBottom: 20 }}>
            <Button mode="contained-tonal" onPress={() => setProfileVisible(false)}>
              {t.close}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  periodChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1 },
  structureToggle: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1 },
  sectionTitle: { marginBottom: 12, gap: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  stateCard: { padding: 32, alignItems: 'center', gap: 12, borderWidth: 1 },
  stateIcon: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  dialog: { maxWidth: 440, width: '100%', alignSelf: 'center' },
  profile: { alignItems: 'center', gap: 10 },
  roleChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  profileRows: { width: '100%', gap: 14, marginTop: 12 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
