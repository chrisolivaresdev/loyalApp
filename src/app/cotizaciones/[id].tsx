import { OPCION } from '@/api/agent';
import { aprobarCotizacion, enviarCotizacion, getPlanesPorPoliza } from '@/api/cotizaciones';
import { AppShell } from '@/components/AppShell';
import { PdfPreview } from '@/components/PdfPreview';
import { useLogout } from '@/hooks/useAuth';
import { useCotizacion } from '@/hooks/useCotizaciones';
import { usePermisos, useRequirePermiso } from '@/hooks/usePermisos';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { palette } from '@/theme';
import { saveCotizacionPdf } from '@/utils/quotePdf';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Button,
    Checkbox,
    Chip,
    Dialog,
    Divider,
    Icon,
    Portal,
    SegmentedButtons,
    Snackbar,
    Text,
    TextInput,
    useTheme
} from 'react-native-paper';

const labels = {
  es: {
    detail: 'Detalle de cotización',
    quote: 'Cotización',
    back: 'Volver',
    applicant: 'Datos del solicitante',
    agent: 'Agente',
    name: 'Nombre',
    age: 'Edad',
    gender: 'Género',
    birthdate: 'Nacimiento',
    email: 'Correo',
    country: 'País',
    dependents: 'Dependientes',
    spouseAge: 'Edad cónyuge',
    transplant: 'Trasplante de órganos',
    maternity: 'Complicaciones de maternidad',
    validity: 'Inicio de vigencia',
    status: 'Estado',
    document: 'Documento',
    product: 'Producto',
    saleType: 'Tipo de venta',
    newBusiness: 'Nuevo negocio',
    renewal: 'Renovación',
    preview: 'Vista previa del PDF (cotización + folleto)',
    download: 'Descargar PDF',
    downloading: 'Generando PDF…',
    share: 'Compartir / Descargar',
    loadingPdf: 'Cargando vista previa…',
    pdfError: 'No se pudo cargar el documento',
    noProducts: 'Esta cotización no tiene productos asociados',
    noData: 'Sin datos',
    yes: 'Sí',
    no: 'No',
    male: 'Masculino',
    female: 'Femenino',
    code: 'Nro.',
    coverage: 'Cobertura',
    person: 'Persona',
    annual: 'Anual',
    semiannual: 'Semestral',
    quarterly: 'Trimestral',
    monthly: 'Mensual',
    premiums: 'Primas',
    holder: 'Titular',
    spouse: 'Cónyuge',
    dependent: 'Dependiente',
    error: 'No pudimos cargar la cotización',
    retry: 'Reintentar',
    saved: 'PDF descargado',
    send: 'Enviar por correo',
    sendTitle: 'Enviar cotización',
    products: 'Selecciona producto',
    to: 'Para:',
    cc: 'Con copia a:',
    bcc: 'Con copia oculta a:',
    sendBtn: 'Enviar correo',
    cancel: 'Cancelar',
    sending: 'Enviando…',
    errSend: 'No se pudo enviar la cotización',
    emailRequired: 'Ingresá un correo destinatario válido',
    productRequired: 'Seleccioná al menos un producto',
    approve: 'Aprobar cotización',
    edit: 'Editar',
    approveTitle: 'Aprobar cotización',
    selectProduct: 'Selecciona producto',
    selectPlan: 'Selecciona plan',
    payMethod: 'Selecciona forma de pago',
    approveBtn: 'Aprobar cotización',
    approving: 'Aprobando…',
    planRequired: 'Seleccioná un plan',
    errApprove: 'No se pudo aprobar la cotización',
  },
  en: {
    detail: 'Quote detail',
    quote: 'Quote',
    back: 'Back',
    applicant: 'Applicant data',
    agent: 'Agent',
    name: 'Name',
    age: 'Age',
    gender: 'Gender',
    birthdate: 'Birthdate',
    email: 'Email',
    country: 'Country',
    dependents: 'Dependents',
    spouseAge: 'Spouse age',
    transplant: 'Organ transplant',
    maternity: 'Maternity complications',
    validity: 'Validity start',
    status: 'Status',
    document: 'Document',
    product: 'Product',
    saleType: 'Sale type',
    newBusiness: 'New business',
    renewal: 'Renewal',
    preview: 'PDF preview (quote + product brochure)',
    download: 'Download PDF',
    downloading: 'Generating PDF…',
    share: 'Share / Download',
    loadingPdf: 'Loading preview…',
    pdfError: 'Could not load the document',
    noProducts: 'This quote has no products',
    noData: 'No data',
    yes: 'Yes',
    no: 'No',
    male: 'Male',
    female: 'Female',
    code: 'No.',
    coverage: 'Coverage',
    person: 'Person',
    annual: 'Annual',
    semiannual: 'Semiannual',
    quarterly: 'Quarterly',
    monthly: 'Monthly',
    premiums: 'Premiums',
    holder: 'Holder',
    spouse: 'Spouse',
    dependent: 'Dependent',
    error: 'We could not load the quote',
    retry: 'Retry',
    saved: 'PDF downloaded',
    send: 'Send by email',
    sendTitle: 'Send quote',
    products: 'Select product',
    to: 'To:',
    cc: 'Cc:',
    bcc: 'Bcc:',
    sendBtn: 'Send email',
    cancel: 'Cancel',
    sending: 'Sending…',
    errSend: 'Could not send the quote',
    emailRequired: 'Enter a valid recipient email',
    productRequired: 'Select at least one product',
    approve: 'Approve quote',
    edit: 'Edit',
    approveTitle: 'Approve quote',
    selectProduct: 'Select product',
    selectPlan: 'Select plan',
    payMethod: 'Select payment method',
    approveBtn: 'Approve quote',
    approving: 'Approving…',
    planRequired: 'Select a plan',
    errApprove: 'Could not approve the quote',
  },
  pt: {
    detail: 'Detalhe da cotação',
    quote: 'Cotação',
    back: 'Voltar',
    applicant: 'Dados do solicitante',
    agent: 'Agente',
    name: 'Nome',
    age: 'Idade',
    gender: 'Gênero',
    birthdate: 'Nascimento',
    email: 'E-mail',
    country: 'País',
    dependents: 'Dependentes',
    spouseAge: 'Idade do cônjuge',
    transplant: 'Transplante de órgãos',
    maternity: 'Complicações de maternidade',
    validity: 'Início de vigência',
    status: 'Status',
    document: 'Documento',
    product: 'Produto',
    saleType: 'Tipo de venda',
    newBusiness: 'Novo negócio',
    renewal: 'Renovação',
    preview: 'Prévia do PDF (cotação + folheto)',
    download: 'Baixar PDF',
    downloading: 'Gerando PDF…',
    share: 'Compartilhar / Baixar',
    loadingPdf: 'Carregando prévia…',
    pdfError: 'Não foi possível carregar o documento',
    noProducts: 'Esta cotação não tem produtos associados',
    noData: 'Sem dados',
    yes: 'Sim',
    no: 'Não',
    male: 'Masculino',
    female: 'Feminino',
    code: 'Nro.',
    coverage: 'Cobertura',
    person: 'Pessoa',
    annual: 'Anual',
    semiannual: 'Semestral',
    quarterly: 'Trimestral',
    monthly: 'Mensal',
    premiums: 'Prêmios',
    holder: 'Titular',
    spouse: 'Cônjuge',
    dependent: 'Dependente',
    error: 'Não foi possível carregar a cotação',
    retry: 'Tentar novamente',
    saved: 'PDF baixado',
    send: 'Enviar por e-mail',
    sendTitle: 'Enviar cotação',
    products: 'Selecionar produto',
    to: 'Para:',
    cc: 'Com cópia para:',
    bcc: 'Com cópia oculta para:',
    sendBtn: 'Enviar e-mail',
    cancel: 'Cancelar',
    sending: 'Enviando…',
    errSend: 'Não foi possível enviar a cotação',
    emailRequired: 'Insira um e-mail destinatário válido',
    productRequired: 'Selecione pelo menos um produto',
    approve: 'Aprovar cotação',
    edit: 'Editar',
    approveTitle: 'Aprovar cotação',
    selectProduct: 'Selecionar produto',
    selectPlan: 'Selecionar plano',
    payMethod: 'Selecionar forma de pagamento',
    approveBtn: 'Aprovar cotação',
    approving: 'Aprovando…',
    planRequired: 'Selecione um plano',
    errApprove: 'Não foi possível aprovar a cotação',
  },
};

type T = (typeof labels)['es'];

// CodigoPoliza de ListaPolizas -> productType del servicio de PDF / sufijo de las listas
const PRODUCT_SUFFIX: Record<number, string> = {
  1: 'Beyond', 2: 'Privilege', 3: 'Liberty', 4: 'Legacy', 5: 'Essential', 6: 'CriticalCare',
};

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  const { colors } = useTheme();
  return (
    <View style={styles.infoRow}>
      <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>{label}</Text>
      <Text variant="bodyMedium" style={{ fontFamily: 'Inter_600SemiBold', flexShrink: 1, textAlign: 'right', color: colors.onSurface }} numberOfLines={2}>
        {value ?? '—'}
      </Text>
    </View>
  );
}

function EstadoChip({ desc }: { desc?: string }) {
  const color = (desc ?? '').toLowerCase().includes('aprob') || (desc ?? '').toLowerCase().includes('activ')
    ? palette.success
    : (desc ?? '').toLowerCase().includes('cancel') || (desc ?? '').toLowerCase().includes('rechaz') || (desc ?? '').toLowerCase().includes('deneg')
      ? palette.danger
      : palette.indigo[500];
  return (
    <View style={[styles.status, { backgroundColor: color }]}>
      <View style={styles.statusDot} />
      <Text variant="labelMedium" style={{ color: '#FFFFFF' }} numberOfLines={1}>{desc ?? ''}</Text>
    </View>
  );
}

export default function CotizacionDetalleScreen() {
  const router = useRouter();
  const allowed = useRequirePermiso(OPCION.cotizaciones);
  const { canSee, canExecute } = usePermisos();
  const { id } = useLocalSearchParams<{ id: string }>();
  const codigo = Number(id);
  const user = useAuthStore((s) => s.user);
  const lang = useSettingsStore((s) => s.lang);
  const setLang = useSettingsStore((s) => s.setLang);
  const { colors, roundness } = useTheme();
  const { isDesktop } = useResponsive();
  const logout = useLogout();
  const t = labels[lang];

  const { data, isLoading, isError, refetch } = useCotizacion(codigo, canSee(OPCION.cotizaciones));
  const [producto, setProducto] = useState<number | undefined>();
  const [tipoVenta, setTipoVenta] = useState<'01' | '02'>('01');
  const [pdfState, setPdfState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [snack, setSnack] = useState('');

  // ---- Enviar por correo ----
  const [enviarOpen, setEnviarOpen] = useState(false);
  const [prodSel, setProdSel] = useState({ beyond: true, privilege: true, liberty: true, legacy: true });
  const [toMail, setToMail] = useState('');
  const [ccMail, setCcMail] = useState('');
  const [bccMail, setBccMail] = useState('');
  const [formError, setFormError] = useState('');

  const openEnviar = () => {
    setToMail((data?.Correo ?? '').trim());
    setCcMail((user?.DireccionEmail ?? '').trim());
    setFormError('');
    setEnviarOpen(true);
  };

  const enviarMutation = useMutation({
    mutationFn: enviarCotizacion,
    onSuccess: (res) => {
      setSnack(res.message);
      if (res.success) setEnviarOpen(false);
    },
    onError: (e: any) => setSnack(e?.response?.data?.message || t.errSend),
  });

  const doEnviar = () => {
    setFormError('');
    if (!toMail.trim() || !/^\S+@\S+\.\S+$/.test(toMail.trim())) return setFormError(t.emailRequired);
    if (!prodSel.beyond && !prodSel.privilege && !prodSel.liberty && !prodSel.legacy) return setFormError(t.productRequired);
    enviarMutation.mutate({
      codigoCotizacion: codigo,
      ...prodSel,
      productType: productoSel,
      toMail: toMail.trim(),
      ccMail: ccMail.trim() || undefined,
      bccMail: bccMail.trim() || undefined,
      language: lang,
    });
  };

  // ---- Aprobar cotización → emitir solicitud ----
  const [aprobOpen, setAprobOpen] = useState(false);
  const [aprobPoliza, setAprobPoliza] = useState<number>(1);
  const [aprobPlan, setAprobPlan] = useState<number | null>(null);
  const [aprobForma, setAprobForma] = useState<number>(1);
  const [aprobError, setAprobError] = useState('');

  const planesQuery = useQuery({
    queryKey: ['planes-poliza', aprobPoliza],
    queryFn: () => getPlanesPorPoliza(aprobPoliza),
    enabled: aprobOpen,
    staleTime: 1000 * 60 * 30,
  });
  const planes = planesQuery.data ?? [];

  const openAprobar = () => {
    setAprobPoliza(productoSel ?? 1);
    setAprobPlan(null);
    setAprobForma(1);
    setAprobError('');
    setAprobOpen(true);
  };

  const aprobarMutation = useMutation({
    mutationFn: aprobarCotizacion,
    onSuccess: (res) => {
      setAprobOpen(false);
      setSnack(res.message);
      if (res.codigoSolicitud) {
        setTimeout(() => router.push(`/solicitudes/${res.codigoSolicitud}` as any), 800);
      }
    },
    onError: (e: any) => setAprobError(e?.response?.data?.message || t.errApprove),
  });

  const doAprobar = () => {
    if (!aprobPlan) return setAprobError(t.planRequired);
    setAprobError('');
    aprobarMutation.mutate({ codigoCotizacion: codigo, codigoPlan: aprobPlan, codigoFormaPago: aprobForma });
  };

  const productos = useMemo(() => (data?.ListaPolizas ?? []).filter((p) => PRODUCT_SUFFIX[p.CodigoPoliza]), [data]);
  const productoSel = producto ?? productos[0]?.CodigoPoliza;
  const productoNombre = productos.find((p) => p.CodigoPoliza === productoSel)?.DescripcionPoliza ?? '';
  const fileName = `LOYAL - Cotizacion Nro.${codigo} - ${(data?.NombreSolicitante ?? '').trim()}-${productoNombre || productoSel}.pdf`;

  const downloadPdf = async () => {
    if (!codigo || !productoSel || pdfState === 'loading') return;
    setPdfState('loading');
    try {
      await saveCotizacionPdf(codigo, productoSel, tipoVenta, fileName);
      setSnack(t.saved);
    } catch {
      setSnack(t.pdfError);
    } finally {
      setPdfState('idle');
    }
  };

  const infoCard = data && (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
      <View style={styles.cardHeader}>
        <Icon source="account-outline" size={20} color={palette.indigo[500]} />
        <Text variant="titleMedium">{t.applicant}</Text>
      </View>
      <InfoRow label={t.name} value={data.NombreSolicitante} />
      <InfoRow label={t.age} value={data.EdadSolicitante} />
      <InfoRow label={t.gender} value={data.SexoSolicitante === 'M' ? t.male : data.SexoSolicitante === 'F' ? t.female : data.SexoSolicitante} />
      <InfoRow label={t.birthdate} value={data.FechaNacimnientoSolicitante} />
      <InfoRow label={t.email} value={data.Correo?.trim()} />
      <InfoRow label={t.country} value={data.DescripcionPais} />
      <InfoRow label={t.dependents} value={data.NumeroDependientes} />
      <InfoRow label={t.spouseAge} value={data.EdadConyuge || null} />
      <InfoRow label={t.transplant} value={data.TrasplanteOrganos === '1' || data.TrasplanteOrganos === 'true' ? t.yes : t.no} />
      <InfoRow label={t.maternity} value={data.ComplicacionesMaternidad === '1' || data.ComplicacionesMaternidad === 'true' ? t.yes : t.no} />
      <InfoRow label={t.validity} value={data.FechaInicioSolicitada?.slice(0, 10)} />
      <Divider style={{ marginVertical: 10 }} />
      <InfoRow label={t.agent} value={user?.NombreCompletoUsuario} />
      <InfoRow label={t.code} value={codigo} />
      <InfoRow label={t.status} value={data.DescripcionEstadoCotizacion} />
    </View>
  );

  const docCard = (
    <View style={[styles.card, styles.docCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
      <View style={styles.cardHeader}>
        <Icon source="file-pdf-box" size={20} color={palette.danger} />
        <Text variant="titleMedium" style={{ flex: 1 }}>{t.document}</Text>
      </View>

      <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>{t.product}</Text>
      <View style={styles.chipRow}>
        {productos.map((p) => (
          <Chip
            key={p.CodigoPoliza}
            selected={p.CodigoPoliza === productoSel}
            onPress={() => setProducto(p.CodigoPoliza)}
            mode={p.CodigoPoliza === productoSel ? 'flat' : 'outlined'}
            compact
          >
            {p.DescripcionPoliza}
          </Chip>
        ))}
        {productos.length === 0 && <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>{t.noProducts}</Text>}
      </View>

      <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant, marginTop: 10 }}>{t.saleType}</Text>
      <SegmentedButtons
        value={tipoVenta}
        onValueChange={(v) => setTipoVenta(v as '01' | '02')}
        density="small"
        buttons={[
          { value: '01', label: t.newBusiness },
          { value: '02', label: t.renewal },
        ]}
      />

      <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant, marginTop: 12 }}>{t.preview}</Text>

      <PdfPreview
        codigo={codigo}
        producto={productoSel}
        tipoVenta={tipoVenta}
        loadingLabel={t.loadingPdf}
        errorLabel={t.pdfError}
      />

      <Button
        mode="contained"
        icon="download-outline"
        onPress={downloadPdf}
        loading={pdfState === 'loading'}
        disabled={!productoSel}
        style={{ marginTop: 14, alignSelf: 'flex-start' }}
      >
        {pdfState === 'loading' ? t.downloading : Platform.OS === 'web' ? t.download : t.share}
      </Button>
    </View>
  );

  if (!allowed) return null;

  return (
    <AppShell
      title={t.detail}
      userName={user?.NombreCompletoUsuario ?? ''}
      userRole={user?.NombrePerfil}
      lang={lang}
      onLangChange={setLang}
      onHome={() => router.push('/dashboard' as any)}
      onProfile={() => router.push('/perfil' as any)}
      onLogout={() => logout.mutate()}
      onCotizaciones={() => router.push('/cotizaciones' as any)}
      onSolicitudes={() => router.push('/solicitudes' as any)}
      onPolizas={() => router.push('/polizas' as any)}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/cotizaciones' as any))}
    >
      <View style={styles.header}>
        <View style={{ flex: 1, minWidth: 180 }}>
          <Text variant="headlineSmall">{t.quote} #{id}</Text>
          {!!data?.NombreSolicitante && (
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>{data.NombreSolicitante}</Text>
          )}
        </View>
        {!!data && canExecute(OPCION.cotizaciones) && (
          <Button
            mode="contained-tonal"
            icon="pencil-outline"
            compact
            onPress={() => router.push(`/cotizaciones/nueva?id=${codigo}` as any)}
            style={{ borderRadius: roundness - 4 }}
          >
            {t.edit}
          </Button>
        )}
        {!!data && canExecute(OPCION.cotizaciones) && (
          <Button
            mode="contained-tonal"
            icon="check-decagram-outline"
            compact
            onPress={openAprobar}
            style={{ borderRadius: roundness - 4 }}
          >
            {t.approve}
          </Button>
        )}
        {!!data && (
          <Button
            mode="outlined"
            icon="email-outline"
            compact
            onPress={openEnviar}
            style={{ borderRadius: roundness - 4 }}
          >
            {t.send}
          </Button>
        )}
        {!!data && <EstadoChip desc={data.DescripcionEstadoCotizacion} />}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator animating size="large" />
        </View>
      ) : isError || !data ? (
        <View style={styles.centered}>
          <Icon source="cloud-off-outline" size={40} color={colors.onSurfaceVariant} />
          <Text variant="titleMedium" style={{ marginTop: 8 }}>{t.error}</Text>
          <Button mode="contained-tonal" icon="refresh" onPress={() => refetch()} style={{ marginTop: 12 }}>{t.retry}</Button>
        </View>
      ) : (
        <View style={[styles.grid, isDesktop && styles.gridRow]}>
          <View style={[isDesktop && { width: 340 }]}>{infoCard}</View>
          <View style={{ flex: 1 }}>{docCard}</View>
        </View>
      )}

      {/* Enviar cotización por correo */}
      <Portal>
        <Dialog visible={enviarOpen} onDismiss={() => setEnviarOpen(false)} style={[styles.dialog, { borderRadius: roundness + 4, backgroundColor: colors.surface }]}>
          <Dialog.Title>{t.sendTitle}</Dialog.Title>
          <Dialog.Content style={{ gap: 10 }}>
            <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>{t.products}</Text>
            <View style={styles.prodChecks}>
              {(['beyond', 'privilege', 'liberty', 'legacy'] as const).map((k) => (
                <View key={k} style={styles.checkRow}>
                  <Checkbox
                    status={prodSel[k] ? 'checked' : 'unchecked'}
                    onPress={() => setProdSel((p) => ({ ...p, [k]: !p[k] }))}
                  />
                  <Text variant="bodyMedium" style={{ textTransform: 'capitalize' }}>{k}</Text>
                </View>
              ))}
            </View>
            <TextInput
              mode="outlined"
              dense
              label={t.to}
              value={toMail}
              onChangeText={setToMail}
              autoCapitalize="none"
              keyboardType="email-address"
              outlineStyle={{ borderRadius: 10 }}
            />
            <TextInput
              mode="outlined"
              dense
              label={t.cc}
              value={ccMail}
              onChangeText={setCcMail}
              autoCapitalize="none"
              keyboardType="email-address"
              outlineStyle={{ borderRadius: 10 }}
            />
            <TextInput
              mode="outlined"
              dense
              label={t.bcc}
              value={bccMail}
              onChangeText={setBccMail}
              autoCapitalize="none"
              keyboardType="email-address"
              outlineStyle={{ borderRadius: 10 }}
            />
            {!!formError && <Text variant="bodySmall" style={{ color: colors.error }}>{formError}</Text>}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEnviarOpen(false)}>{t.cancel}</Button>
            <Button mode="contained" onPress={doEnviar} loading={enviarMutation.isPending} disabled={enviarMutation.isPending}>
              {enviarMutation.isPending ? t.sending : t.sendBtn}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Aprobar cotización */}
      <Portal>
        <Dialog visible={aprobOpen} onDismiss={() => setAprobOpen(false)} style={[styles.dialog, { borderRadius: roundness + 4, backgroundColor: colors.surface }]}>
          <Dialog.Title>{t.approveTitle}</Dialog.Title>
          <Dialog.Content style={{ gap: 10 }}>
            <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>{t.selectProduct}</Text>
            <View style={styles.chipRow}>
              {[1, 2, 3, 4].map((p) => (
                <Chip
                  key={p}
                  selected={aprobPoliza === p}
                  onPress={() => { setAprobPoliza(p); setAprobPlan(null); }}
                  mode={aprobPoliza === p ? 'flat' : 'outlined'}
                  compact
                >
                  {['Beyond', 'Privilege', 'Liberty', 'Legacy'][p - 1]}
                </Chip>
              ))}
            </View>
            <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>{t.selectPlan}</Text>
            {planesQuery.isLoading ? (
              <ActivityIndicator animating size="small" />
            ) : (
              <ScrollView style={{ maxHeight: 160 }}>
                <View style={styles.chipRow}>
                  {planes.map((pl) => (
                    <Chip
                      key={pl.Codigo}
                      selected={aprobPlan === pl.Codigo}
                      onPress={() => setAprobPlan(pl.Codigo)}
                      mode={aprobPlan === pl.Codigo ? 'flat' : 'outlined'}
                      compact
                    >
                      {pl.Descripcion.trim()}
                    </Chip>
                  ))}
                  {planes.length === 0 && <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>—</Text>}
                </View>
              </ScrollView>
            )}
            <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>{t.payMethod}</Text>
            <SegmentedButtons
              value={String(aprobForma)}
              onValueChange={(v) => setAprobForma(Number(v))}
              density="small"
              buttons={[
                { value: '1', label: t.annual },
                { value: '2', label: t.semiannual },
                { value: '3', label: t.quarterly },
              ]}
            />
            {!!aprobError && <Text variant="bodySmall" style={{ color: colors.error }}>{aprobError}</Text>}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAprobOpen(false)}>{t.cancel}</Button>
            <Button mode="contained" onPress={doAprobar} loading={aprobarMutation.isPending} disabled={aprobarMutation.isPending || !aprobPlan}>
              {aprobarMutation.isPending ? t.approving : t.approveBtn}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={2500} onIconPress={() => setSnack('')}>
        {snack}
      </Snackbar>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  dialog: { maxWidth: 460, alignSelf: 'center', width: '92%' },
  prodChecks: { flexDirection: 'row', flexWrap: 'wrap' },
  checkRow: { flexDirection: 'row', alignItems: 'center', width: '50%' },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  grid: { gap: 14 },
  gridRow: { flexDirection: 'row', alignItems: 'flex-start' },
  card: { borderWidth: 1, padding: 16, gap: 4 },
  docCard: { gap: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
});
