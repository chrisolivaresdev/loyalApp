import { CarteraAgente, OPCION, PrimasResumen } from '@/api/agent';
import { AppShell, Lang } from '@/components/AppShell';
import { PieChart } from '@/components/PieChart';
import { usePerfilAgente } from '@/hooks/useAgentes';
import { useLogout } from '@/hooks/useAuth';
import { usePermisos } from '@/hooks/usePermisos';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { palette } from '@/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Chip,
  Icon,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';

const labels = {
  es: {
    title: 'Perfil de Agente',
    portfolio: 'Cartera de MGA',
    portfolioTotal: 'Total Cartera',
    ownProduction: 'Producción Propia',
    agentsProduction: 'Producción Agentes',
    policies: 'Pólizas',
    premiums: 'Primas',
    active: 'Activas',
    pendingPayment: 'Pendiente de Pago',
    gracePeriod: 'Periodo de Gracia',
    total: 'Cartera (Total)',
    cancelled: 'Canceladas',
    contact: 'Información de contacto',
    bank: 'Información Bancaria',
    address: 'Información de Dirección',
    birthdate: 'Fecha de nacimiento',
    mobile: 'Celular',
    phone: 'Teléfono',
    homePhone: 'Tel. casa',
    email: 'Correo',
    bankName: 'Banco',
    accountHolder: 'Titular de cuenta',
    accountNumber: 'Cuenta',
    routing: 'Routing',
    accountType: 'Tipo de cuenta',
    homeAddress: 'Residencia',
    office: 'Oficina',
    postal: 'Postal',
    portfolioDetail: 'Cartera por agente',
    agent: 'Agente',
    collected: 'Primas Cobradas',
    totalCol: 'Total',
    commissions: 'Comisiones nuevo negocio',
    product: 'Producto',
    saleType: 'Tipo de venta',
    percent: '% Comisión',
    agentCommissions: 'Agente',
    loading: 'Cargando perfil…',
    error: 'No pudimos cargar el perfil',
    retry: 'Reintentar',
    noData: 'Sin datos',
    back: 'Volver a agentes',
    current: 'Este agente',
  },
  en: {
    title: 'Agent Profile',
    portfolio: 'MGA Portfolio',
    portfolioTotal: 'Total Portfolio',
    ownProduction: 'Own Production',
    agentsProduction: 'Agents Production',
    policies: 'Policies',
    premiums: 'Premiums',
    active: 'Active',
    pendingPayment: 'Pending Payment',
    gracePeriod: 'Grace Period',
    total: 'Portfolio (Total)',
    cancelled: 'Cancelled',
    contact: 'Contact information',
    bank: 'Banking Information',
    address: 'Address Information',
    birthdate: 'Date of birth',
    mobile: 'Mobile',
    phone: 'Phone',
    homePhone: 'Home phone',
    email: 'Email',
    bankName: 'Bank',
    accountHolder: 'Account holder',
    accountNumber: 'Account',
    routing: 'Routing',
    accountType: 'Account type',
    homeAddress: 'Home',
    office: 'Office',
    postal: 'Postal',
    portfolioDetail: 'Portfolio by agent',
    agent: 'Agent',
    collected: 'Collected Premiums',
    totalCol: 'Total',
    commissions: 'New business commissions',
    product: 'Product',
    saleType: 'Sale type',
    percent: '% Commission',
    agentCommissions: 'Agent',
    loading: 'Loading profile…',
    error: 'We could not load the profile',
    retry: 'Retry',
    noData: 'No data',
    back: 'Back to agents',
    current: 'This agent',
  },
  pt: {
    title: 'Perfil do Agente',
    portfolio: 'Carteira MGA',
    portfolioTotal: 'Carteira Total',
    ownProduction: 'Produção Própria',
    agentsProduction: 'Produção Agentes',
    policies: 'Apólices',
    premiums: 'Prêmios',
    active: 'Ativas',
    pendingPayment: 'Pagamento Pendente',
    gracePeriod: 'Período de Carência',
    total: 'Carteira (Total)',
    cancelled: 'Canceladas',
    contact: 'Informações de contato',
    bank: 'Informações Bancárias',
    address: 'Informações de Endereço',
    birthdate: 'Data de nascimento',
    mobile: 'Celular',
    phone: 'Telefone',
    homePhone: 'Tel. casa',
    email: 'E-mail',
    bankName: 'Banco',
    accountHolder: 'Titular da conta',
    accountNumber: 'Conta',
    routing: 'Routing',
    accountType: 'Tipo de conta',
    homeAddress: 'Residência',
    office: 'Escritório',
    postal: 'Postal',
    portfolioDetail: 'Carteira por agente',
    agent: 'Agente',
    collected: 'Prêmios Cobrados',
    totalCol: 'Total',
    commissions: 'Comissões novo negócio',
    product: 'Produto',
    saleType: 'Tipo de venda',
    percent: '% Comissão',
    agentCommissions: 'Agente',
    loading: 'Carregando perfil…',
    error: 'Não foi possível carregar o perfil',
    retry: 'Tentar novamente',
    noData: 'Sem dados',
    back: 'Voltar para agentes',
    current: 'Este agente',
  },
} satisfies Record<Lang, Record<string, string>>;

type T = (typeof labels)['es'];

const DATE_LOCALES: Record<Lang, string> = { es: 'es-ES', en: 'en-US', pt: 'pt-BR' };
const money = (n?: number | null) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0);
const fmtDate = (iso: string | null | undefined, lang: Lang) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString(DATE_LOCALES[lang]);
};
const pad = (n: number) => String(n).padStart(4, '0');

const PIE_COLORS = { activas: '#219653', pendientePago: '#828282', periodoGracia: '#2F80ED', canceladas: '#EB5757' };

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.infoRow}>
      <Icon source={icon} size={16} color={colors.onSurfaceVariant} />
      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, width: 118 }}>{label}</Text>
      <Text variant="bodySmall" style={{ flex: 1, fontFamily: 'Inter_500Medium' }} numberOfLines={2}>
        {value?.trim() ? value.trim() : '—'}
      </Text>
    </View>
  );
}

function SectionCard({ title, icon, children, style }: { title: string; icon: string; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors, roundness } = useTheme();
  return (
    <View style={[styles.card, style, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness + 2 }]}>
      <View style={styles.cardHeader}>
        <Icon source={icon} size={18} color={palette.indigo[500]} />
        <Text variant="titleSmall">{title}</Text>
      </View>
      {children}
    </View>
  );
}

function ProduccionTable({ title, resumen, t }: { title: string; resumen: PrimasResumen; t: T }) {
  const { colors } = useTheme();
  const rows = [
    { label: t.active, data: resumen.activas },
    { label: t.pendingPayment, data: resumen.pendientePago },
    { label: t.gracePeriod, data: resumen.periodoGracia },
    { label: t.total, data: resumen.total, bold: true },
    { label: t.cancelled, data: resumen.canceladas },
  ];
  return (
    <View style={styles.prodTable}>
      <Text variant="labelLarge" style={{ color: palette.indigo[600] }}>{title}</Text>
      <View style={[styles.prodHeaderRow, { borderBottomColor: colors.outlineVariant }]}>
        <View style={{ flex: 1 }} />
        <Text variant="labelSmall" style={[styles.prodNum, { color: colors.onSurfaceVariant }]}>{t.policies}</Text>
        <Text variant="labelSmall" style={[styles.prodNum, { color: colors.onSurfaceVariant }]}>{t.premiums}</Text>
      </View>
      {rows.map((r, i) => (
        <View key={i} style={[styles.prodRow, { borderBottomColor: colors.outlineVariant }]}>
          <Text variant="bodySmall" style={[{ flex: 1 }, r.bold && { fontFamily: 'Inter_600SemiBold' }]}>{r.label}</Text>
          <Text variant="bodySmall" style={[styles.prodNum, r.bold && { fontFamily: 'Inter_600SemiBold' }]}>{r.data.cantidad}</Text>
          <Text variant="bodySmall" style={[styles.prodNum, r.bold && { fontFamily: 'Inter_600SemiBold' }]}>{money(r.data.monto)}</Text>
        </View>
      ))}
    </View>
  );
}

export default function PerfilAgenteScreen() {
  const user = useAuthStore((s) => s.user);
  const lang = useSettingsStore((s) => s.lang);
  const setLang = useSettingsStore((s) => s.setLang);
  const router = useRouter();
  const logout = useLogout();
  const { colors, roundness } = useTheme();
  const { isDesktop } = useResponsive();
  const t = labels[lang];

  const { id } = useLocalSearchParams<{ id: string }>();
  const codigo = Number(id) || 0;
  const { canSee, canExecute, ready } = usePermisos();
  // Cartera (ejec. de Perfil) o Listado Agentes habilitan el perfil (igual que el portal)
  const allowed = ready && (canSee(OPCION.agentes) || canExecute(OPCION.perfil));
  useEffect(() => {
    if (ready && !allowed) router.replace('/dashboard' as any);
  }, [ready, allowed]);
  const { data, isLoading, isError, refetch, isRefetching } = usePerfilAgente(codigo || null, true, allowed);

  const agente = data?.datosAgente;

  const pieSlices = (r: PrimasResumen | undefined) => !r ? [] : [
    { label: t.active, value: r.activas.monto, color: PIE_COLORS.activas },
    { label: t.pendingPayment, value: r.pendientePago.monto, color: PIE_COLORS.pendientePago },
    { label: t.gracePeriod, value: r.periodoGracia.monto, color: PIE_COLORS.periodoGracia },
    { label: t.cancelled, value: r.canceladas.monto, color: PIE_COLORS.canceladas },
  ];

  const goAgent = (a: CarteraAgente) => router.push(`/agentes/${a.codigoAgente}` as any);

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator animating size="large" />
          <Text style={{ color: colors.onSurfaceVariant, marginTop: 12 }}>{t.loading}</Text>
        </View>
      );
    }
    if (isError || !data || !agente) {
      return (
        <View style={styles.centered}>
          <Icon source="cloud-off-outline" size={40} color={colors.onSurfaceVariant} />
          <Text variant="titleMedium" style={{ marginTop: 8 }}>{t.error}</Text>
          <Button mode="contained-tonal" icon="refresh" onPress={() => refetch()} loading={isRefetching} style={{ marginTop: 12 }}>{t.retry}</Button>
        </View>
      );
    }

    return (
      <View style={{ gap: 16 }}>
        {/* Breadcrumb jerarquía */}
        <View style={styles.breadcrumb}>
          <TouchableRipple onPress={() => router.push('/agentes' as any)} borderless style={{ borderRadius: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon source="arrow-left" size={16} color={palette.indigo[600]} />
              <Text variant="labelLarge" style={{ color: palette.indigo[600] }}>{t.back}</Text>
            </View>
          </TouchableRipple>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {data.navegacion.map((n, i) => (
              <Chip
                key={i}
                compact
                mode={n.codigoAgente === codigo ? 'flat' : 'outlined'}
                selected={n.codigoAgente === codigo}
                onPress={n.codigoAgente !== codigo ? () => router.push(`/agentes/${n.codigoAgente}` as any) : undefined}
                style={{ borderRadius: roundness }}
              >
                {n.nombreAgente}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.profileRow}>
          {/* Columna izquierda: datos del agente */}
          <View style={[styles.leftCol, { flex: isDesktop ? 1 : 0, minWidth: isDesktop ? 300 : 0, flexBasis: isDesktop ? 300 : undefined, width: isDesktop ? undefined : '100%' }]}>
            <SectionCard title={t.contact} icon="account-outline">
              <View style={styles.agentHead}>
                <Avatar.Text
                  size={52}
                  label={(agente.nombreAgente || agente.nombreCompleto || 'A').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                  style={{ backgroundColor: palette.indigo[100] }}
                  labelStyle={{ color: palette.indigo[700], fontFamily: 'Inter_600SemiBold' }}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" numberOfLines={2}>{agente.nombreAgente || agente.nombreCompleto}</Text>
                  <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                    {agente.descripcionTipoAgente} · {agente.descripcionPais}
                  </Text>
                </View>
              </View>
              <InfoRow icon="account-outline" label={t.agent} value={agente.nombreCompleto} />
              <InfoRow icon="cake-variant-outline" label={t.birthdate} value={fmtDate(agente.fechaNacimiento, lang)} />
              <InfoRow icon="cellphone" label={t.mobile} value={agente.celular} />
              <InfoRow icon="phone-outline" label={t.phone} value={agente.telefono} />
              <InfoRow icon="phone-classic" label={t.homePhone} value={agente.telefonoCasa} />
              <InfoRow icon="email-outline" label={t.email} value={agente.correo} />
              {!!agente.nombreAgenteDependencia?.trim() && (
                <InfoRow icon="account-arrow-up-outline" label={t.agentCommissions} value={agente.nombreAgenteDependencia} />
              )}
            </SectionCard>

            <SectionCard title={t.bank} icon="bank-outline">
              <InfoRow icon="bank-outline" label={t.bankName} value={agente.descripcionBanco || agente.nombreTitularCuenta} />
              <InfoRow icon="account-cash-outline" label={t.accountHolder} value={agente.nombreTitularCuenta} />
              <InfoRow icon="card-account-details-outline" label={t.accountNumber} value={agente.numeroCuentaDeposito} />
              <InfoRow icon="barcode" label={t.routing} value={agente.codigoRouting} />
              <InfoRow icon="credit-card-outline" label={t.accountType} value={agente.tipoCuentaDeposito} />
            </SectionCard>

            <SectionCard title={t.address} icon="map-marker-outline">
              <InfoRow icon="home-outline" label={t.homeAddress} value={[agente.direccion, agente.ciudad, agente.provincia, agente.codigoPostal].filter((s) => s?.trim()).join(', ')} />
              <InfoRow icon="office-building-outline" label={t.office} value={[agente.direccionOficina, agente.ciudadOficina, agente.provinciaOficina, agente.codigoPostalOficina, agente.descripcionPaisOficina].filter((s) => s?.trim()).join(', ')} />
              <InfoRow icon="email-box" label={t.postal} value={[agente.direccionPostal, agente.ciudadPostal, agente.provinciaPostal, agente.codigoPostalPostal, agente.descripcionPaisPostal].filter((s) => s?.trim()).join(', ')} />
            </SectionCard>
          </View>

          {/* Columna derecha: cartera y gráficos */}
          <View style={[styles.rightCol, { flex: isDesktop ? 1.6 : 0, minWidth: isDesktop ? 340 : 0, flexBasis: isDesktop ? 420 : undefined, width: isDesktop ? undefined : '100%' }]}>
            <View style={[styles.carteraCard, { backgroundColor: palette.indigo[500], borderRadius: roundness + 2 }]}>
              <Text variant="labelLarge" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {t.portfolio} · {agente.descripcionTipoAgente}
              </Text>
              <Text variant="headlineMedium" style={{ color: '#FFFFFF' }}>{money(data.totalPrimas)}</Text>
              <Text variant="labelMedium" style={{ color: 'rgba(255,255,255,0.8)' }}>{t.portfolioTotal}</Text>
            </View>

            <View style={styles.prodRow2}>
              <View style={[styles.card, styles.prodHalf, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness + 2 }]}>
                <ProduccionTable title={t.ownProduction} resumen={data.primasPropias} t={t} />
              </View>
              <View style={[styles.card, styles.prodHalf, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness + 2 }]}>
                <ProduccionTable title={t.agentsProduction} resumen={data.primasAgentes} t={t} />
              </View>
            </View>

            <View style={styles.prodRow2}>
              <SectionCard title={t.ownProduction} icon="chart-pie" style={styles.prodHalf}>
                <PieChart slices={pieSlices(data.primasPropias)} />
              </SectionCard>
              <SectionCard title={t.agentsProduction} icon="chart-pie" style={styles.prodHalf}>
                <PieChart slices={pieSlices(data.primasAgentes)} />
              </SectionCard>
            </View>
          </View>
        </View>

        {/* Cartera por agente */}
        <SectionCard title={t.portfolioDetail} icon="table">
          <ScrollView horizontal contentContainerStyle={styles.tableGrow}>
            <View style={styles.tableInner}>
              <View style={[styles.carHeader, { borderBottomColor: colors.outlineVariant, backgroundColor: colors.background }]}>
                <Text variant="labelSmall" style={[styles.carAgent, { color: colors.onSurfaceVariant }]}>{t.agent}</Text>
                <Text variant="labelSmall" style={[styles.carPol, { color: colors.onSurfaceVariant }]}>{t.policies}</Text>
                <Text variant="labelSmall" style={[styles.carNum, { color: colors.onSurfaceVariant }]}>{t.collected}</Text>
                <Text variant="labelSmall" style={[styles.carNum, { color: colors.onSurfaceVariant }]}>{t.gracePeriod}</Text>
                <Text variant="labelSmall" style={[styles.carNum, { color: colors.onSurfaceVariant }]}>{t.pendingPayment}</Text>
                <Text variant="labelSmall" style={[styles.carNum, { color: colors.onSurfaceVariant }]}>{t.totalCol}</Text>
                <Text variant="labelSmall" style={[styles.carNum, { color: colors.onSurfaceVariant }]}>{t.cancelled}</Text>
              </View>
              {data.cartera.map((c, i) => {
                const isSelf = c.codigoAgente === codigo;
                return (
                  <TouchableRipple key={c.codigoAgente} onPress={isSelf ? undefined : () => goAgent(c)} borderless>
                    <View
                      style={[
                        styles.carRow,
                        { borderBottomColor: colors.outlineVariant },
                        isSelf && { backgroundColor: `${palette.indigo[500]}12` },
                        !isSelf && i % 2 === 1 && { backgroundColor: `${colors.outlineVariant}30` },
                      ]}
                    >
                      <View style={[styles.carAgent, styles.carAgentCell]}>
                        <Avatar.Text
                          size={24}
                          label={(c.nombreAgente || 'A').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                          style={{ backgroundColor: isSelf ? palette.indigo[500] : palette.indigo[100] }}
                          labelStyle={{ fontSize: 10, color: isSelf ? '#FFFFFF' : palette.indigo[700] }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text variant="bodySmall" numberOfLines={1} style={{ fontFamily: 'Inter_600SemiBold', color: isSelf ? colors.onSurface : palette.indigo[600] }}>
                            {pad(c.codigoAgente)} - {c.nombreAgente}
                          </Text>
                        </View>
                        {isSelf && (
                          <View style={[styles.selfChip, { backgroundColor: palette.indigo[500] }]}>
                            <Text variant="labelSmall" style={{ color: '#FFFFFF' }}>{t.current}</Text>
                          </View>
                        )}
                      </View>
                      <Text variant="bodySmall" style={styles.carPol}>
                        {c.cantidadActivas + c.cantidadPeriodoGracia + c.cantidadPendientePago}
                      </Text>
                      <Text variant="bodySmall" style={styles.carNum}>{money(c.activas)}</Text>
                      <Text variant="bodySmall" style={styles.carNum}>{money(c.periodoGracia)}</Text>
                      <Text variant="bodySmall" style={styles.carNum}>{money(c.pendientePago)}</Text>
                      <Text variant="bodySmall" style={[styles.carNum, { fontFamily: 'Inter_600SemiBold' }]}>{money(c.total)}</Text>
                      <Text variant="bodySmall" style={[styles.carNum, { color: c.cancelado > 0 ? colors.error : colors.onSurface }]}>{money(c.cancelado)}</Text>
                    </View>
                  </TouchableRipple>
                );
              })}
              {/* Totales */}
              <View style={[styles.carRow, styles.carTotalRow, { borderTopColor: colors.outlineVariant, backgroundColor: colors.background }]}>
                <Text variant="labelMedium" style={styles.carAgent}>{t.totalCol}</Text>
                <Text variant="labelMedium" style={styles.carPol}>{data.cartera.reduce((s, c) => s + c.cantidadActivas + c.cantidadPeriodoGracia + c.cantidadPendientePago, 0)}</Text>
                <Text variant="labelMedium" style={styles.carNum}>{money(data.cartera.reduce((s, c) => s + c.activas, 0))}</Text>
                <Text variant="labelMedium" style={styles.carNum}>{money(data.cartera.reduce((s, c) => s + c.periodoGracia, 0))}</Text>
                <Text variant="labelMedium" style={styles.carNum}>{money(data.cartera.reduce((s, c) => s + c.pendientePago, 0))}</Text>
                <Text variant="labelMedium" style={[styles.carNum, { color: palette.indigo[600] }]}>{money(data.cartera.reduce((s, c) => s + c.total, 0))}</Text>
                <Text variant="labelMedium" style={[styles.carNum, { color: colors.error }]}>{money(data.cartera.reduce((s, c) => s + c.cancelado, 0))}</Text>
              </View>
            </View>
          </ScrollView>
        </SectionCard>

        {/* Comisiones nuevo negocio */}
        {data.comisionesNuevoNegocio.length > 0 && (
          <SectionCard title={t.commissions} icon="percent-outline">
            <ScrollView horizontal contentContainerStyle={styles.tableGrow}>
              <View style={styles.tableInner}>
                <View style={[styles.carHeader, { borderBottomColor: colors.outlineVariant, backgroundColor: colors.background }]}>
                  <Text variant="labelSmall" style={[styles.carAgent, { color: colors.onSurfaceVariant }]}>{t.agentCommissions}</Text>
                  <Text variant="labelSmall" style={[styles.carNum, styles.comProduct, { color: colors.onSurfaceVariant }]}>{t.product}</Text>
                  <Text variant="labelSmall" style={[styles.carNum, { color: colors.onSurfaceVariant }]}>{t.saleType}</Text>
                  <Text variant="labelSmall" style={[styles.carNum, { color: colors.onSurfaceVariant }]}>{t.percent}</Text>
                </View>
                {(() => {
                  const map = new Map<string, typeof data.comisionesNuevoNegocio>();
                  for (const c of [...data.comisionesNuevoNegocio].sort((a, b) =>
                    (a.nombreCompleto || a.nombreAgente).localeCompare(b.nombreCompleto || b.nombreAgente) ||
                    a.descripcionPoliza.localeCompare(b.descripcionPoliza))) {
                    const key = c.nombreCompleto || c.nombreAgente;
                    map.set(key, [...(map.get(key) ?? []), c]);
                  }
                  return [...map.entries()].map(([agente, coms]) => (
                    <View key={agente}>
                      <View style={[styles.comGroupHeader, { backgroundColor: `${palette.indigo[500]}0F`, borderBottomColor: colors.outlineVariant }]}>
                        <Avatar.Text
                          size={24}
                          label={(agente || 'A').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                          style={{ backgroundColor: palette.indigo[100] }}
                          labelStyle={{ fontSize: 10, color: palette.indigo[700] }}
                        />
                        <Text variant="labelLarge" style={{ flex: 1 }} numberOfLines={1}>{agente}</Text>
                        <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>{coms.length} {t.product}s</Text>
                      </View>
                      {coms.map((c, i) => (
                        <View key={`${agente}-${i}`} style={[styles.carRow, { borderBottomColor: colors.outlineVariant }, i % 2 === 1 && { backgroundColor: `${colors.outlineVariant}30` }]}>
                          <View style={styles.carAgent} />
                          <Text variant="bodySmall" style={[styles.carNum, styles.comProduct, { fontFamily: 'Inter_600SemiBold' }]} numberOfLines={1}>{c.descripcionPoliza}</Text>
                          <Text variant="bodySmall" style={styles.carNum}>{c.descripcionTipoVenta}</Text>
                          <View style={styles.carNum}>
                            <View style={[styles.pctChip, { backgroundColor: `${palette.success}1A` }]}>
                              <Text variant="labelSmall" style={{ color: palette.success }}>{(c.porcentajeComision * 100).toFixed(1)}%</Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  ));
                })()}
              </View>
            </ScrollView>
          </SectionCard>
        )}
      </View>
    );
  };

  if (!allowed) return null;

  return (
    <AppShell
      title={agente?.nombreAgente ?? t.title}
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
      onAgentes={() => router.push('/agentes' as any)}
    >
      {renderBody()}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  breadcrumb: { flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
  profileRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' },
  leftCol: { gap: 16, minWidth: 300, flexBasis: 300 },
  rightCol: { gap: 16, minWidth: 340, flexBasis: 420 },
  card: { borderWidth: 1, padding: 16, gap: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  agentHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 3 },
  carteraCard: { padding: 18, alignItems: 'center', gap: 2 },
  prodRow2: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  prodHalf: { flex: 1, minWidth: 220 },
  prodTable: { gap: 6 },
  prodHeaderRow: { flexDirection: 'row', borderBottomWidth: 1, paddingBottom: 4 },
  prodRow: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 4 },
  prodNum: { width: 90, textAlign: 'right' },
  carHeader: { flexDirection: 'row', gap: 8, paddingHorizontal: 8, paddingVertical: 8, borderBottomWidth: 1 },
  carRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 8, paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
  carTotalRow: { borderTopWidth: 1, borderBottomWidth: 0 },
  carAgent: { flex: 1.9, minWidth: 160 },
  carPol: { flex: 0.7, minWidth: 56, textAlign: 'right' },
  tableGrow: { flexGrow: 1 },
  tableInner: { flex: 1, minWidth: 620 },
  comGroupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8, paddingVertical: 7, borderBottomWidth: StyleSheet.hairlineWidth },
  carAgentCell: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  carNum: { flex: 1, minWidth: 76, textAlign: 'right', alignItems: 'flex-end' },
  selfChip: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  pctChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  comProduct: { minWidth: 110 },
});
