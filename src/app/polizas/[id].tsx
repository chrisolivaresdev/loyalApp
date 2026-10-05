import { OPCION } from '@/api/agent';
import {
  actualizarAsegurado,
  Asegurado,
  CertificadoDetalle,
  Cuota,
  documentoDescargaUrl,
  documentoGeneradoUrl,
  enviarResumenSms,
  getAseguradoEdicion,
  getTiposPersona,
  registrarNota,
  solicitarPagoLinea,
  subirDocumento
} from '@/api/certificados';
import { getPaises } from '@/api/cotizaciones';
import { AppShell, Lang } from '@/components/AppShell';
import { SelectField } from '@/components/SelectField';
import { useLogout } from '@/hooks/useAuth';
import { useCertificadoDetalle } from '@/hooks/useCertificado';
import { usePermisos, useRequirePermiso } from '@/hooks/usePermisos';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { palette } from '@/theme';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useMemo, useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Chip,
  Dialog,
  Divider,
  Icon,
  IconButton,
  Portal,
  Snackbar,
  Switch,
  Text,
  TextInput,
  Tooltip,
  TouchableRipple,
  useTheme
} from 'react-native-paper';

const labels = {
  es: {
    title: 'Consulta Póliza', loading: 'Cargando póliza…', error: 'No pudimos cargar la póliza', retry: 'Reintentar',
    notes: 'Notas', pay: 'Pagar', upload: 'Subir', sms: 'SMS', docsBtn: 'Documentos Póliza',
    policyData: 'Datos de la Póliza', billingData: 'Datos de Cobranza', insureds: 'Asegurados',
    annualPremium: 'Prima Anualizada', paymentMethod: 'Forma de Pago', effectiveDate: 'Efectividad',
    numInsured: 'Asegurados', transplant: 'Trasplante de Organos', maternity: 'Complicaciones de Maternidad',
    dueDate: 'Vence', premium: 'Prima', paidDate: 'Pagada', status: 'Estado',
    standard: 'Estándar', withRestrictions: 'Con Restricciones', years: 'años', male: 'Masculino', female: 'Femenino',
    coverage: 'Coverage Certificate', cards: 'Tarjetas', policyCert: 'Policy Certificate', receipt: 'Recibo de Pago',
    newNote: 'Registrar Nota de Póliza', notePlaceholder: 'Ingrese nota…', sendSmsNote: 'Enviar nota vía SMS',
    save: 'Registrar Nota', cancel: 'Cancelar', close: 'Cerrar',
    policyDocs: 'Documentos de Póliza', uploadDoc: 'Subir Documento', docType: 'Tipo de Documento',
    pickFile: 'Seleccionar archivo', send: 'Subir', docs: 'documentos', searchDocs: 'Buscar documento…', dropHint: 'PDF, imágenes u otros archivos',
    payConfirm: 'Se generará el enlace de pago en línea. ¿Continuar?', continue: 'Continuar',
    smsConfirm: 'Se enviará el resumen de la póliza por SMS. ¿Continuar?',
    okNote: 'Nota registrada', errNote: 'No se pudo registrar la nota',
    okSms: 'SMS enviado', errSms: 'No se pudo enviar el SMS',
    okUpload: 'Documento cargado', errUpload: 'No se pudo cargar el documento',
    errPay: 'No se pudo generar el enlace de pago', errGeneric: 'Error al abrir el documento',
    agent: 'Agente', saleType: 'Tipo de Venta', waiting: 'Periodo Espera', days: 'días',
    requestDate: 'Fecha Solicitud', approvalDate: 'Fecha Aprobación', endDate: 'Fin Vigencia',
    adminCost: 'Costo Administrativo', dependents: 'Dependientes', paymentInProcess: 'Pago En Proceso',
    cuota: 'Cuota', generateDocs: 'Generar documentos', emptyDocs: 'No hay documentos', emptyPayments: 'Sin pagos registrados',
    editInsured: 'Editar asegurado', relation: 'Relación', firstName: 'Nombre', paternalLast: 'Apellido Paterno',
    maternalLast: 'Apellido Materno', birthDate: 'Fecha Nacimiento', gender: 'Género', email: 'Correo',
    phone: 'Teléfono Casa', mobile: 'Celular', mainAddress: 'Dirección Principal', postalAddress: 'Dirección Postal',
    altAddress: 'Dirección Alternativa', country: 'País', saveChanges: 'Actualizar datos', okEdit: 'Asegurado actualizado',
  },
  en: {
    title: 'Policy Details', loading: 'Loading policy…', error: 'Could not load the policy', retry: 'Retry',
    notes: 'Notes', pay: 'Pay', upload: 'Upload', sms: 'SMS', docsBtn: 'Policy Documents',
    policyData: 'Policy Data', billingData: 'Billing Data', insureds: 'Insured',
    annualPremium: 'Annualized Premium', paymentMethod: 'Payment Method', effectiveDate: 'Effective Date',
    numInsured: 'Insured', transplant: 'Organ Transplant', maternity: 'Maternity Complications',
    dueDate: 'Due', premium: 'Premium', paidDate: 'Paid', status: 'Status',
    standard: 'Standard', withRestrictions: 'With Restrictions', years: 'years old', male: 'Male', female: 'Female',
    coverage: 'Coverage Certificate', cards: 'Cards', policyCert: 'Policy Certificate', receipt: 'Payment Receipt',
    newNote: 'Add Policy Note', notePlaceholder: 'Enter note…', sendSmsNote: 'Send note via SMS',
    save: 'Save Note', cancel: 'Cancel', close: 'Close',
    policyDocs: 'Policy Documents', uploadDoc: 'Upload Document', docType: 'Document Type',
    pickFile: 'Choose file', send: 'Upload', docs: 'documents', searchDocs: 'Search document…', dropHint: 'PDF, images or other files',
    payConfirm: 'An online payment link will be generated. Continue?', continue: 'Continue',
    smsConfirm: 'The policy summary will be sent by SMS. Continue?',
    okNote: 'Note saved', errNote: 'Could not save the note',
    okSms: 'SMS sent', errSms: 'Could not send the SMS',
    okUpload: 'Document uploaded', errUpload: 'Could not upload the document',
    errPay: 'Could not generate the payment link', errGeneric: 'Error opening the document',
    agent: 'Agent', saleType: 'Sale Type', waiting: 'Waiting Period', days: 'days',
    requestDate: 'Request Date', approvalDate: 'Approval Date', endDate: 'End of Validity',
    adminCost: 'Administrative Cost', dependents: 'Dependents', paymentInProcess: 'Payment In Process',
    cuota: 'Installment', generateDocs: 'Generate documents', emptyDocs: 'No documents', emptyPayments: 'No payments recorded',
    editInsured: 'Edit insured', relation: 'Relation', firstName: 'First name', paternalLast: 'Paternal last name',
    maternalLast: 'Maternal last name', birthDate: 'Birth date', gender: 'Gender', email: 'Email',
    phone: 'Home phone', mobile: 'Mobile', mainAddress: 'Main address', postalAddress: 'Postal address',
    altAddress: 'Alternate address', country: 'Country', saveChanges: 'Update data', okEdit: 'Insured updated',
  },
  pt: {
    title: 'Consultar Apólice', loading: 'Carregando apólice…', error: 'Não foi possível carregar a apólice', retry: 'Tentar novamente',
    notes: 'Notas', pay: 'Pagar', upload: 'Enviar', sms: 'SMS', docsBtn: 'Documentos da Apólice',
    policyData: 'Dados da Apólice', billingData: 'Dados de Cobrança', insureds: 'Segurados',
    annualPremium: 'Prêmio Anualizado', paymentMethod: 'Forma de Pagamento', effectiveDate: 'Vigência',
    numInsured: 'Segurados', transplant: 'Transplante de Órgãos', maternity: 'Complicações de Maternidade',
    dueDate: 'Vence', premium: 'Prêmio', paidDate: 'Paga', status: 'Status',
    standard: 'Padrão', withRestrictions: 'Com Restrições', years: 'anos', male: 'Masculino', female: 'Feminino',
    coverage: 'Coverage Certificate', cards: 'Cartões', policyCert: 'Policy Certificate', receipt: 'Recibo de Pagamento',
    newNote: 'Registrar Nota da Apólice', notePlaceholder: 'Digite a nota…', sendSmsNote: 'Enviar nota via SMS',
    save: 'Registrar Nota', cancel: 'Cancelar', close: 'Fechar',
    policyDocs: 'Documentos da Apólice', uploadDoc: 'Enviar Documento', docType: 'Tipo de Documento',
    pickFile: 'Selecionar arquivo', send: 'Enviar', docs: 'documentos', searchDocs: 'Buscar documento…', dropHint: 'PDF, imagens ou outros arquivos',
    payConfirm: 'Será gerado o link de pagamento online. Continuar?', continue: 'Continuar',
    smsConfirm: 'O resumo da apólice será enviado por SMS. Continuar?',
    okNote: 'Nota registrada', errNote: 'Não foi possível registrar a nota',
    okSms: 'SMS enviado', errSms: 'Não foi possível enviar o SMS',
    okUpload: 'Documento enviado', errUpload: 'Não foi possível enviar o documento',
    errPay: 'Não foi possível gerar o link de pagamento', errGeneric: 'Erro ao abrir o documento',
    agent: 'Agente', saleType: 'Tipo de Venda', waiting: 'Período de Espera', days: 'dias',
    requestDate: 'Data Solicitação', approvalDate: 'Data Aprovação', endDate: 'Fim da Vigência',
    adminCost: 'Custo Administrativo', dependents: 'Dependentes', paymentInProcess: 'Pagamento Em Processo',
    cuota: 'Parcela', generateDocs: 'Gerar documentos', emptyDocs: 'Sem documentos', emptyPayments: 'Sem pagamentos registrados',
    editInsured: 'Editar segurado', relation: 'Relação', firstName: 'Nome', paternalLast: 'Sobrenome paterno',
    maternalLast: 'Sobrenome materno', birthDate: 'Data de nascimento', gender: 'Gênero', email: 'E-mail',
    phone: 'Telefone residencial', mobile: 'Celular', mainAddress: 'Endereço principal', postalAddress: 'Endereço postal',
    altAddress: 'Endereço alternativo', country: 'País', saveChanges: 'Atualizar dados', okEdit: 'Segurado atualizado',
  },
};

type T = (typeof labels)['es'];

const DATE_LOCALES: Record<Lang, string> = { es: 'es-ES', en: 'en-US', pt: 'pt-BR' };
const fmtDate = (v: string | undefined, lang: Lang) => {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString(DATE_LOCALES[lang]);
};
const fmtMoney = (n: number) => `$${(Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const estadoColor = (desc?: string) => {
  const d = (desc ?? '').toLowerCase();
  if (d.includes('activ') || d.includes('aprob')) return palette.success;
  if (d.includes('gracia') || d.includes('pendiente') || d.includes('renov') || d.includes('evalu')) return palette.warning;
  if (d.includes('cancel') || d.includes('anulad') || d.includes('declin') || d.includes('laps')) return palette.danger;
  return palette.slate[500];
};

async function openProtectedUrl(url: string, nombre: string) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank');
    return;
  }
  const safe = nombre.replace(/[^\w.\-]+/g, '_');
  const { uri } = await FileSystem.downloadAsync(url, `${FileSystem.cacheDirectory}${safe}`);
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { dialogTitle: nombre });
  else await Linking.openURL(uri);
}

const initials = (nombre = '') =>
  nombre.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';

function InfoRow({ icon, label, value }: { icon: string; label: string; value?: string | number }) {
  const { colors } = useTheme();
  if (value === undefined || value === null || value === '') return null;
  return (
    <View style={styles.infoRow}>
      <Icon source={icon} size={16} color={colors.onSurfaceVariant} />
      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, width: 140 }}>{label}</Text>
      <Text variant="bodyMedium" style={{ flex: 1 }} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function CuotaRow({ cuota, codigoCertificado, t, lang, busy, onDoc }: {
  cuota: Cuota; codigoCertificado: number; t: T; lang: Lang; busy: string;
  onDoc: (tipo: 'coverage' | 'cards' | 'policy' | 'recibo', cuota: Cuota, key: string) => void;
}) {
  const { colors, roundness } = useTheme();
  const pendiente = String(cuota.DescripcionEstadoCuota ?? '').toLowerCase() === 'pendiente';
  const pagada = !!cuota.FechaPago;
  const c = estadoColor(pagada ? 'pagada' : cuota.DescripcionEstadoCuota);
  const docs = [
    { key: 'coverage' as const, icon: 'shield-check-outline', color: '#16A34A', label: t.coverage },
    { key: 'cards' as const, icon: 'card-account-details-outline', color: '#0891B2', label: t.cards },
    { key: 'policy' as const, icon: 'file-certificate-outline', color: palette.indigo[500], label: t.policyCert },
    { key: 'recibo' as const, icon: 'receipt-text-outline', color: palette.warning, label: t.receipt },
  ];
  return (
    <View style={[styles.cuotaRow, { borderColor: colors.outlineVariant, borderRadius: roundness - 2 }]}>
      <View style={[styles.cuotaNum, { backgroundColor: c }]}>
        <Text variant="labelMedium" style={{ color: '#FFF' }}>#{cuota.NumeroCuota}</Text>
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Text variant="titleSmall">{fmtMoney(cuota.ValorCuota)}</Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {t.dueDate}: {fmtDate(cuota.FechaCobro, lang)}{pagada ? ` · ${t.paidDate}: ${fmtDate(cuota.FechaPago, lang)}` : ''}
        </Text>
        <View style={[styles.miniChip, { backgroundColor: c, alignSelf: 'flex-start' }]}>
          <Text variant="labelSmall" style={{ color: '#FFF' }}>{cuota.DescripcionEstadoCuota}</Text>
        </View>
      </View>
      <View style={styles.cuotaActions}>
        {docs.map((d) => {
          const key = `doc-${cuota.CodigoCronogramaPagos}-${d.key}`;
          return (
            <Tooltip key={d.key} title={d.label}>
              <IconButton
                icon={busy === key ? 'loading' : d.icon}
                iconColor={d.color}
                size={20}
                style={{ margin: 0 }}
                disabled={pendiente || !!busy}
                onPress={() => onDoc(d.key, cuota, key)}
              />
            </Tooltip>
          );
        })}
      </View>
    </View>
  );
}

export default function PolizaDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const codigoCertificado = Number(id);
  const user = useAuthStore((s) => s.user);
  const allowed = useRequirePermiso(OPCION.consultarPoliza);
  const { canSee, canExecute } = usePermisos();
  const { data, isLoading, isError, refetch, isRefetching } = useCertificadoDetalle(
    allowed ? codigoCertificado : undefined,
    canSee(OPCION.consultarPoliza),
  );
  const lang = useSettingsStore((s) => s.lang);
  const setLang = useSettingsStore((s) => s.setLang);
  const router = useRouter();
  const logout = useLogout();
  const { colors, roundness } = useTheme();
  const { isDesktop } = useResponsive();
  const t = labels[lang];

  const [editPersona, setEditPersona] = useState<number | null>(null);
  const [notaOpen, setNotaOpen] = useState(false);
  const [nota, setNota] = useState('');
  const [notaSms, setNotaSms] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [tipoDoc, setTipoDoc] = useState('');
  const [file, setFile] = useState<{ uri: string; name: string; type?: string; file?: File } | null>(null);
  const [busy, setBusy] = useState<string>('');
  const [confirm, setConfirm] = useState<'pay' | 'sms' | ''>('');
  const [snack, setSnack] = useState('');

  const cert = data?.certificado;

  const openUrl = async (url: string, nombre: string, key: string) => {
    try {
      setBusy(key);
      await openProtectedUrl(url, nombre);
    } catch {
      setSnack(t.errGeneric);
    } finally {
      setBusy('');
    }
  };

  const doPay = async () => {
    try {
      setBusy('pay');
      const { url } = await solicitarPagoLinea(codigoCertificado);
      if (url) {
        if (Platform.OS === 'web') window.open(url, '_blank');
        else await Linking.openURL(url);
      } else {
        setSnack(t.errPay);
      }
    } catch {
      setSnack(t.errPay);
    } finally {
      setBusy('');
    }
  };

  const doSms = async () => {
    try {
      setBusy('sms');
      await enviarResumenSms(codigoCertificado, data?.asegurados[0]?.Celular);
      setSnack(t.okSms);
    } catch {
      setSnack(t.errSms);
    } finally {
      setBusy('');
    }
  };

  const doNota = async () => {
    try {
      setBusy('nota');
      await registrarNota(codigoCertificado, nota.trim(), notaSms);
      setSnack(t.okNote);
      setNotaOpen(false);
      setNota('');
      setNotaSms(false);
    } catch {
      setSnack(t.errNote);
    } finally {
      setBusy('');
    }
  };

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.length) return;
    const a = res.assets[0] as any;
    setFile({ uri: a.uri, name: a.name ?? 'documento', type: a.mimeType, file: a.file });
  };

  const doUpload = async () => {
    if (!file || !tipoDoc) return;
    try {
      setBusy('upload');
      await subirDocumento(codigoCertificado, Number(tipoDoc), file);
      setSnack(t.okUpload);
      setUploadOpen(false);
      setFile(null);
      setTipoDoc('');
      refetch();
    } catch {
      setSnack(t.errUpload);
    } finally {
      setBusy('');
    }
  };

  const [docSearch, setDocSearch] = useState('');

  const gruposDocumentos = useMemo(() => {
    const q = docSearch.trim().toLowerCase();
    const grupos: Record<string, { nombre: string; docs: CertificadoDetalle['documentos'] }> = {};
    (data?.documentos ?? [])
      .filter((d) => !q || `${d.NombreDocumento} ${d.DescripcionTipoDocumento}`.toLowerCase().includes(q))
      .forEach((d) => {
        const k = d.DescripcionClasificacionTipoDocumento || 'Otros';
        if (!grupos[k]) grupos[k] = { nombre: k, docs: [] };
        grupos[k].docs.push(d);
      });
    return Object.values(grupos);
  }, [data, docSearch]);

  const renderAsegurado = (a: Asegurado) => {
    const aceptado = String(a.CodigoEstadoPersonaSolicitud) === '02';
    const restricciones = [
      ...(a.enmiendas ?? []).map((x) => x.TextoEnmienda),
      ...(a.deducibles ?? []).map((x) => x.TextoCambioDeducible),
      ...(a.exclusiones ?? []).map((x) => x.TextoExclusion),
    ].filter(Boolean);
    const conRestricciones = aceptado && String(a.IndicadorRestricciones) === '1';
    return (
      <View key={a.CodigoPersonaSolicitud} style={[styles.asegCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness + 2 }]}>
        <View style={styles.asegHeader}>
          <View style={[styles.avatar, { backgroundColor: palette.indigo[500] }]}>
            <Text variant="labelLarge" style={{ color: '#FFF' }}>{initials(a.NombreCompleto)}</Text>
          </View>
          <View style={{ flex: 1, gap: 1 }}>
            <Text variant="titleMedium" numberOfLines={1}>{a.NombreCompleto}</Text>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>
              {a.DescripcionTipoPersonaCotizacion}{a.DescripcionVinculo ? ` · ${a.DescripcionVinculo}` : ''}
            </Text>
          </View>
          <View style={[styles.miniChip, { backgroundColor: estadoColor(a.DescripcionEstadoPersonaSolicitud) }]}>
            <Text variant="labelSmall" style={{ color: '#FFF' }}>{a.DescripcionEstadoPersonaSolicitud}</Text>
          </View>
          {canExecute(OPCION.consultarPoliza) && (
            <IconButton icon="pencil-outline" size={18} onPress={() => setEditPersona(a.CodigoPersona)} style={{ margin: 0 }} />
          )}
        </View>

        <Divider style={{ marginVertical: 10 }} />

        <View style={[styles.asegGrid, !isDesktop && { flexDirection: 'column' }]}>
          <View style={{ flex: 1, gap: 6 }}>
            <InfoRow icon="cake-variant-outline" label={fmtDate(a.FechaNacimiento, lang)} value={`${a.Edad} ${t.years} · ${a.Sexo === 'M' ? t.male : a.Sexo === 'F' ? t.female : a.Sexo}`} />
            {!!a.Correo && <InfoRow icon="email-outline" label="" value={a.Correo} />}
            {!!a.Celular && <InfoRow icon="cellphone" label="" value={a.Celular} />}
            {!!a.DireccionPrincipal && <InfoRow icon="map-marker-outline" label="" value={`${a.DireccionPrincipal} ${a.DescripcionPaisPrincipal ?? ''}`} />}
            {!!a.FechaInicioVigencia && <InfoRow icon="calendar-outline" label={t.effectiveDate} value={fmtDate(a.FechaInicioVigencia, lang)} />}
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon source={conRestricciones ? 'shield-alert-outline' : 'shield-check-outline'} size={16} color={conRestricciones ? palette.warning : palette.success} />
              <Text variant="bodyMedium" style={{ fontFamily: 'Inter_600SemiBold' }}>
                {aceptado ? (conRestricciones ? t.withRestrictions : t.standard) : a.DescripcionEstadoPersonaSolicitud}
              </Text>
            </View>
            {restricciones.length > 0 && (
              <View style={[styles.restriccionesBox, { borderColor: palette.warning, borderRadius: roundness - 4 }]}>
                {restricciones.map((r, i) => (
                  <Text key={i} variant="bodySmall" style={{ color: palette.warning, paddingVertical: 2 }}>{r}</Text>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator animating size="large" />
          <Text style={{ color: colors.onSurfaceVariant, marginTop: 12 }}>{t.loading}</Text>
        </View>
      );
    }
    if (isError || !cert) {
      return (
        <View style={styles.centered}>
          <Icon source="cloud-off-outline" size={40} color={colors.onSurfaceVariant} />
          <Text variant="titleMedium" style={{ marginTop: 8 }}>{t.error}</Text>
          <Button mode="contained-tonal" icon="refresh" onPress={() => refetch()} loading={isRefetching} style={{ marginTop: 12 }}>{t.retry}</Button>
        </View>
      );
    }

    const acciones = [
      { key: 'notas', opcion: OPCION.botonNotas, icon: 'note-outline', label: t.notes, onPress: () => setNotaOpen(true) },
      { key: 'pagar', opcion: OPCION.botonPagar, icon: 'credit-card-outline', label: t.pay, onPress: () => setConfirm('pay') },
      { key: 'subir', opcion: OPCION.botonArchivo, icon: 'upload-outline', label: t.upload, onPress: () => setUploadOpen(true) },
      { key: 'sms', opcion: OPCION.botonSMS, icon: 'message-text-outline', label: t.sms, onPress: () => setConfirm('sms') },
    ].filter((a) => canSee(a.opcion));

    const pagoEnProceso = !!data.descripcionEstadoCuota;

    return (
      <>
        {/* Hero banner */}
        <View style={[styles.banner, { backgroundColor: cert.ColorPrincipal || palette.indigo[600], borderRadius: roundness + 2 }]}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="bodySmall" style={{ color: 'rgba(255,255,255,0.75)', letterSpacing: 1 }}>
              {cert.NumeroPoliza}
            </Text>
            <Text variant="titleLarge" style={{ color: '#FFF', fontFamily: 'Inter_600SemiBold' }} numberOfLines={2}>
              {data.asegurados[0]?.NombreCompleto ?? ''}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
              <View style={[styles.bannerChip, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text variant="labelMedium" style={{ color: '#FFF' }}>{cert.DescripcionPoliza}</Text>
              </View>
              <View style={[styles.bannerChip, { backgroundColor: estadoColor(cert.DescripcionEstadoCertificado) }]}>
                <Text variant="labelMedium" style={{ color: '#FFF' }}>
                  {cert.DescripcionEstadoCertificado}{data.descripcionEstadoCuota}
                </Text>
              </View>
            </View>
          </View>
          <Icon source="shield-check" size={52} color="rgba(255,255,255,0.25)" />
        </View>

        {/* Acciones */}
        {acciones.length > 0 && (
          <View style={styles.actions}>
            {acciones.map((a) => (
              <Button
                key={a.key}
                mode="contained-tonal"
                icon={a.icon}
                onPress={a.onPress}
                disabled={!canExecute(a.opcion) || !!busy}
                compact
                style={{ borderRadius: roundness - 2 }}
              >
                {a.label}
              </Button>
            ))}
          </View>
        )}

        {/* Datos póliza + cobranza */}
        <View style={[styles.twoCol, !isDesktop && { flexDirection: 'column' }]}>
          <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness + 2 }]}>
            <View style={styles.panelHeader}>
              <Icon source="file-document-outline" size={18} color={palette.indigo[500]} />
              <Text variant="titleMedium" style={{ fontFamily: 'Inter_600SemiBold' }}>{t.policyData}</Text>
            </View>
            <Divider style={{ marginVertical: 10 }} />

            <View style={[styles.primaBox, { backgroundColor: palette.indigo[50], borderRadius: roundness - 2 }]}>
              <Text variant="labelSmall" style={{ color: palette.indigo[600] }}>{t.annualPremium.toUpperCase()}</Text>
              <Text variant="headlineSmall" style={{ color: palette.indigo[700], fontFamily: 'Inter_700Bold' }}>
                {fmtMoney(cert.PrimaComisionable)}
              </Text>
            </View>

            <View style={{ gap: 2, marginTop: 8 }}>
              <InfoRow icon="earth" label={t.agent} value={`${cert.CodigoAgente} - ${cert.NombreAgente}`} />
              <InfoRow icon="text-box-outline" label="" value={cert.DescripcionPlanesConsulta} />
              <InfoRow icon="map-marker-outline" label="" value={cert.DescripcionPais} />
              <InfoRow icon="cash-register" label={t.paymentMethod} value={cert.DescripcionFormaPago} />
              <InfoRow icon="calendar-check-outline" label={t.effectiveDate} value={fmtDate(cert.FechaInicioVigencia, lang)} />
              <InfoRow icon="calendar-remove-outline" label={t.endDate} value={fmtDate(cert.FechaFinVigencia, lang)} />
              <InfoRow icon="account-multiple-outline" label={t.numInsured} value={cert.NumeroAsegurados} />
              <InfoRow icon="account-child-outline" label={t.dependents} value={cert.NumeroDependientes} />
              <InfoRow icon="tag-outline" label={t.saleType} value={cert.DescripcionTipoVenta} />
              {!!cert.PeriodoEspera && <InfoRow icon="timer-outline" label={t.waiting} value={`${cert.PeriodoEspera} ${t.days}`} />}
              <InfoRow icon="calendar-outline" label={t.requestDate} value={fmtDate(cert.FechaSolicitud, lang)} />
              {!!cert.FechaAprobacion && <InfoRow icon="check-decagram-outline" label={t.approvalDate} value={fmtDate(cert.FechaAprobacion, lang)} />}
              {!!cert.CostoAdministrativo && <InfoRow icon="cash-outline" label={t.adminCost} value={fmtMoney(cert.CostoAdministrativo)} />}
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {cert.IndicadorTrasplante === '1' && <Chip compact icon="hospital-box-outline">{t.transplant}</Chip>}
              {cert.IndicadorMaternidad === '1' && <Chip compact icon="baby-face-outline">{t.maternity}</Chip>}
              {pagoEnProceso && <Chip compact icon="clock-alert-outline" style={{ backgroundColor: '#FEF3C7' }}>{t.paymentInProcess}</Chip>}
            </View>

            <Button mode="outlined" icon="folder-open-outline" onPress={() => setDocsOpen(true)} compact style={{ alignSelf: 'flex-start', marginTop: 10, borderRadius: roundness - 4 }}>
              {t.docsBtn} ({data.documentos.length})
            </Button>
          </View>

          <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness + 2 }]}>
            <View style={styles.panelHeader}>
              <Icon source="cash-multiple" size={18} color={palette.indigo[500]} />
              <Text variant="titleMedium" style={{ fontFamily: 'Inter_600SemiBold' }}>{t.billingData}</Text>
            </View>
            <Divider style={{ marginVertical: 10 }} />
            {data.pagos.length === 0 ? (
              <View style={styles.emptySection}>
                <Icon source="receipt-text-remove-outline" size={28} color={colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>{t.emptyPayments}</Text>
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                {data.pagos.map((c) => (
                  <CuotaRow
                    key={c.CodigoCronogramaPagos}
                    cuota={c}
                    codigoCertificado={codigoCertificado}
                    t={t}
                    lang={lang}
                    busy={busy}
                    onDoc={(tipo, cuota, key) => openUrl(documentoGeneradoUrl(codigoCertificado, tipo, cuota.CodigoCronogramaPagos), `${tipo}-${codigoCertificado}.pdf`, key)}
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Asegurados */}
        <View style={styles.panelHeader}>
          <Icon source="account-group-outline" size={18} color={palette.indigo[500]} />
          <Text variant="titleMedium" style={{ fontFamily: 'Inter_600SemiBold' }}>{t.insureds} ({data.asegurados.length})</Text>
        </View>
        <View style={{ gap: 10 }}>{data.asegurados.map(renderAsegurado)}</View>
      </>
    );
  };

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
      onComisiones={() => router.push('/comisiones' as any)}
      onAgentes={() => router.push('/agentes' as any)}
      onPersonal={() => router.push('/personal' as any)}
    >
      <View style={styles.headerRow}>
        <IconButton icon="arrow-left" size={22} onPress={() => router.back()} style={{ margin: 0 }} />
        <Text variant="headlineSmall" style={{ flex: 1 }}>{t.title}</Text>
      </View>

      {renderBody()}

      <EditarAseguradoDialog
        visible={editPersona !== null}
        codigoCertificado={codigoCertificado}
        codigoPersona={editPersona ?? 0}
        t={t}
        onDismiss={() => setEditPersona(null)}
        onSaved={() => { setEditPersona(null); refetch(); setSnack(t.okEdit); }}
        onError={(m) => setSnack(m)}
      />

      <Portal>
        {/* Diálogo: nota */}
        <Dialog visible={notaOpen} onDismiss={() => setNotaOpen(false)} style={styles.dialog}>
          <Dialog.Title>
            <View style={styles.dialogTitle}>
              <View style={[styles.dialogIcon, { backgroundColor: palette.indigo[50] }]}>
                <Icon source="note-edit-outline" size={20} color={palette.indigo[500]} />
              </View>
              <Text variant="titleMedium" style={{ flex: 1 }}>{t.newNote}</Text>
            </View>
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              multiline
              numberOfLines={6}
              value={nota}
              onChangeText={setNota}
              placeholder={t.notePlaceholder}
              right={<TextInput.Affix text={`${nota.length}`} />}
              style={{ backgroundColor: colors.background }}
            />
            <View style={[styles.switchRow, { borderColor: colors.outlineVariant, borderRadius: roundness - 2 }]}>
              <Icon source="message-text-outline" size={18} color={colors.onSurfaceVariant} />
              <Text variant="bodyMedium" style={{ flex: 1 }}>{t.sendSmsNote}</Text>
              <Switch value={notaSms} onValueChange={setNotaSms} />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNotaOpen(false)}>{t.cancel}</Button>
            <Button mode="contained" icon="send-outline" onPress={doNota} loading={busy === 'nota'} disabled={!nota.trim() || !!busy}>{t.save}</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Diálogo: documentos */}
        <Dialog visible={docsOpen} onDismiss={() => setDocsOpen(false)} style={styles.dialog}>
          <Dialog.Title>
            <View style={styles.dialogTitle}>
              <View style={[styles.dialogIcon, { backgroundColor: palette.indigo[50] }]}>
                <Icon source="folder-open-outline" size={20} color={palette.indigo[500]} />
              </View>
              <Text variant="titleMedium" style={{ flex: 1 }}>{t.policyDocs}</Text>
              <View style={[styles.miniChip, { backgroundColor: palette.indigo[50] }]}>
                <Text variant="labelSmall" style={{ color: palette.indigo[600] }}>{data?.documentos.length ?? 0}</Text>
              </View>
            </View>
          </Dialog.Title>
          <Dialog.Content style={{ paddingHorizontal: 12, paddingBottom: 4 }}>
            <TextInput
              mode="outlined"
              dense
              placeholder={t.searchDocs}
              value={docSearch}
              onChangeText={setDocSearch}
              left={<TextInput.Icon icon="magnify" />}
              right={docSearch ? <TextInput.Icon icon="close" onPress={() => setDocSearch('')} /> : undefined}
              style={{ backgroundColor: colors.background }}
            />
          </Dialog.Content>
          <Dialog.ScrollArea style={{ maxHeight: 440 }}>
            <ScrollView>
              <View style={{ padding: 12, gap: 4 }}>
                {gruposDocumentos.length === 0 && (
                  <View style={styles.emptySection}>
                    <Icon source="folder-open-outline" size={28} color={colors.onSurfaceVariant} />
                    <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>{t.emptyDocs}</Text>
                  </View>
                )}
                {gruposDocumentos.map((g) => (
                  <View key={g.nombre} style={{ marginBottom: 8 }}>
                    <View style={[styles.docGroupHeader, { backgroundColor: colors.surfaceVariant }]}>
                      <Text variant="labelMedium">{g.nombre}</Text>
                      <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>{g.docs.length} {t.docs}</Text>
                    </View>
                    {g.docs.map((d) => (
                      <TouchableRipple key={d.CodigoDocumento} onPress={() => openUrl(documentoDescargaUrl(d.CodigoDocumento), d.NombreDocumento, `dd-${d.CodigoDocumento}`)} borderless style={{ borderRadius: 8 }}>
                        <View style={styles.docRow}>
                          <View style={[styles.docIcon, { backgroundColor: '#FEF2F2' }]}>
                            <Icon source="file-pdf-box" size={18} color={palette.danger} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text variant="bodyMedium" style={{ color: palette.indigo[600] }} numberOfLines={2}>{d.NombreDocumento}</Text>
                            {!!d.DescripcionTipoDocumento && (
                              <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>{d.DescripcionTipoDocumento}</Text>
                            )}
                          </View>
                          {busy === `dd-${d.CodigoDocumento}` ? <ActivityIndicator size={16} /> : <Icon source="download-outline" size={16} color={colors.onSurfaceVariant} />}
                        </View>
                      </TouchableRipple>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDocsOpen(false)}>{t.close}</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Diálogo: subir documento */}
        <Dialog visible={uploadOpen} onDismiss={() => setUploadOpen(false)} style={styles.dialog}>
          <Dialog.Title>
            <View style={styles.dialogTitle}>
              <View style={[styles.dialogIcon, { backgroundColor: palette.indigo[50] }]}>
                <Icon source="upload-outline" size={20} color={palette.indigo[500]} />
              </View>
              <Text variant="titleMedium" style={{ flex: 1 }}>{t.uploadDoc}</Text>
            </View>
          </Dialog.Title>
          <Dialog.Content style={{ gap: 12 }}>
            <SelectField
              label={t.docType}
              value={tipoDoc}
              options={(data?.tiposDocumento ?? []).map((d) => ({ value: String(d.CodigoTipoDocumento), label: d.DescripcionTipoDocumento }))}
              onChange={setTipoDoc}
              placeholder={t.docType}
            />
            {file ? (
              <View style={[styles.fileCard, { borderColor: palette.indigo[300], backgroundColor: palette.indigo[50], borderRadius: roundness - 2 }]}>
                <Icon source="file-check-outline" size={22} color={palette.indigo[600]} />
                <Text variant="bodyMedium" style={{ flex: 1 }} numberOfLines={1}>{file.name}</Text>
                <IconButton icon="close" size={16} onPress={() => setFile(null)} style={{ margin: 0 }} />
              </View>
            ) : (
              <TouchableRipple onPress={pickFile} borderless style={{ borderRadius: roundness - 2 }}>
                <View style={[styles.dropzone, { borderColor: colors.outline }]}>
                  <Icon source="cloud-upload-outline" size={28} color={palette.indigo[400]} />
                  <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>{t.pickFile}</Text>
                  <Text variant="labelSmall" style={{ color: colors.outline }}>{t.dropHint}</Text>
                </View>
              </TouchableRipple>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setUploadOpen(false)}>{t.cancel}</Button>
            <Button mode="contained" icon="upload-outline" onPress={doUpload} loading={busy === 'upload'} disabled={!file || !tipoDoc || !!busy}>{t.send}</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Diálogos de confirmación */}
        <Dialog visible={confirm !== ''} onDismiss={() => setConfirm('')} style={styles.dialog}>
          <Dialog.Title>
            <View style={styles.dialogTitle}>
              <View style={[styles.dialogIcon, { backgroundColor: palette.indigo[50] }]}>
                <Icon source={confirm === 'pay' ? 'credit-card-outline' : 'message-text-outline'} size={20} color={palette.indigo[500]} />
              </View>
              <Text variant="titleMedium" style={{ flex: 1 }}>{confirm === 'pay' ? t.pay : t.sms}</Text>
            </View>
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
              {confirm === 'pay' ? t.payConfirm : t.smsConfirm}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirm('')}>{t.cancel}</Button>
            <Button mode="contained" icon={confirm === 'pay' ? 'open-in-new' : 'send-outline'} onPress={() => { const c = confirm; setConfirm(''); (c === 'pay' ? doPay : doSms)(); }} loading={!!busy}>
              {t.continue}
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3500}>
          {snack}
        </Snackbar>
      </Portal>
    </AppShell>
  );
}

/** Edición de asegurado — equivale a Certificados/RegistroPersona del portal. */
function EditarAseguradoDialog({ visible, codigoCertificado, codigoPersona, t, onDismiss, onSaved, onError }: {
  visible: boolean; codigoCertificado: number; codigoPersona: number; t: T;
  onDismiss: () => void; onSaved: () => void; onError: (m: string) => void;
}) {
  const { colors, roundness } = useTheme();
  const [form, setForm] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const aseguradoQ = useQuery({
    queryKey: ['asegurado-ed', codigoCertificado, codigoPersona],
    queryFn: () => getAseguradoEdicion(codigoCertificado, codigoPersona),
    enabled: visible && codigoPersona > 0,
  });
  const tiposQ = useQuery({ queryKey: ['tipos-persona'], queryFn: getTiposPersona, enabled: visible, staleTime: 1000 * 60 * 30 });
  const paisesQ = useQuery({ queryKey: ['paises'], queryFn: getPaises, enabled: visible, staleTime: 1000 * 60 * 30 });
  const paises = paisesQ.data ?? [];
  const opcPais = paises.map((p) => ({ value: String(p.CodigoPais), label: p.DescripcionPais.trim() }));

  useEffect(() => {
    const a = aseguradoQ.data;
    if (!a) return;
    setForm({
      codigoTipoRelacion: String(a.CodigoTipoPersonaCertificado ?? '').trim(),
      nombre: a.Nombre ?? '', apellidoPaterno: a.ApellidoPaterno ?? '', apellidoMaterno: a.ApellidoMaterno ?? '',
      fechaNacimiento: a.FechaNacimiento ? String(a.FechaNacimiento).slice(0, 10) : '', sexo: a.Sexo ?? '',
      correo: a.Correo ?? '', telefono: a.Telefono ?? '', celular: a.Celular ?? '',
      direccionPrincipal: a.DireccionPrincipal ?? '', codigoPaisPrincipal: String(a.CodigoPaisPrincipal ?? ''),
      direccionPostal: a.DireccionPostal ?? '', codigoPaisPostal: String(a.CodigoPaisPostal ?? ''),
      direccionAlternativa: a.DireccionAlternativa ?? '', codigoPaisAlternativa: String(a.CodigoPaisAlternativa ?? ''),
    });
  }, [aseguradoQ.data]);

  const saveMutation = useMutation({
    mutationFn: () => actualizarAsegurado(codigoCertificado, codigoPersona, form),
    onSuccess: onSaved,
    onError: (e: any) => onError(e?.response?.data?.message || t.errGeneric),
  });

  const input = (k: string, label: string, opts: Record<string, unknown> = {}) => (
    <TextInput
      key={k} mode="outlined" dense label={label}
      value={form[k] ?? ''} onChangeText={(v) => set(k, v)}
      style={{ backgroundColor: colors.background }} {...opts}
    />
  );

  const chipRow = (k: string, opciones: { v: string; l: string }[]) => (
    <View style={styles.chipWrap}>
      {opciones.map((o) => (
        <Chip key={o.v} selected={form[k] === o.v} onPress={() => set(k, o.v)} mode={form[k] === o.v ? 'flat' : 'outlined'} compact>
          {o.l}
        </Chip>
      ))}
    </View>
  );

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>
          <View style={styles.dialogTitle}>
            <View style={[styles.dialogIcon, { backgroundColor: palette.indigo[50] }]}>
              <Icon source="account-edit-outline" size={20} color={palette.indigo[500]} />
            </View>
            <Text variant="titleMedium" style={{ flex: 1 }}>{t.editInsured}</Text>
          </View>
        </Dialog.Title>
        {aseguradoQ.isLoading ? (
          <Dialog.Content><ActivityIndicator animating /></Dialog.Content>
        ) : (
          <>
            <Dialog.ScrollArea style={{ maxHeight: 460 }}>
              <ScrollView>
                <View style={{ padding: 12, gap: 10 }}>
                  <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>{t.relation}</Text>
                  {chipRow('codigoTipoRelacion', (tiposQ.data ?? []).map((x) => ({ v: String(x.CodigoTipoPersonaCotizacion).trim(), l: x.DescripcionTipoPersonaCotizacion.trim() })))}
                  {input('nombre', t.firstName)}
                  {input('apellidoPaterno', t.paternalLast)}
                  {input('apellidoMaterno', t.maternalLast)}
                  {input('fechaNacimiento', `${t.birthDate} (YYYY-MM-DD)`, { placeholder: '1990-01-31' })}
                  <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>{t.gender}</Text>
                  {chipRow('sexo', [{ v: 'M', l: t.male }, { v: 'F', l: t.female }])}
                  {input('correo', t.email, { keyboardType: 'email-address', autoCapitalize: 'none' })}
                  {input('celular', t.mobile, { keyboardType: 'phone-pad' })}
                  {input('telefono', t.phone, { keyboardType: 'phone-pad' })}
                  {input('direccionPrincipal', t.mainAddress, { multiline: true })}
                  <SelectField label={t.country} value={form.codigoPaisPrincipal} options={opcPais} onChange={(v) => set('codigoPaisPrincipal', v)} placeholder={t.country} />
                  {input('direccionPostal', t.postalAddress, { multiline: true })}
                  <SelectField label={t.country} value={form.codigoPaisPostal} options={opcPais} onChange={(v) => set('codigoPaisPostal', v)} placeholder={t.country} />
                  {input('direccionAlternativa', t.altAddress, { multiline: true })}
                  <SelectField label={t.country} value={form.codigoPaisAlternativa} options={opcPais} onChange={(v) => set('codigoPaisAlternativa', v)} placeholder={t.country} />
                </View>
              </ScrollView>
            </Dialog.ScrollArea>
            <Dialog.Actions>
              <Button onPress={onDismiss}>{t.cancel}</Button>
              <Button mode="contained" icon="content-save-outline" onPress={() => saveMutation.mutate()} loading={saveMutation.isPending} disabled={saveMutation.isPending}>
                {t.saveChanges}
              </Button>
            </Dialog.Actions>
          </>
        )}
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64, gap: 4 },
  emptySection: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 6 },
  banner: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  bannerChip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  twoCol: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  panel: { flex: 1, borderWidth: 1, padding: 16, minWidth: 0 },
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  primaBox: { padding: 12, gap: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 },
  cuotaRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, padding: 10, gap: 10 },
  cuotaNum: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cuotaActions: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  miniChip: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  asegCard: { borderWidth: 1, padding: 14 },
  asegHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  asegGrid: { flexDirection: 'row', gap: 12 },
  restriccionesBox: { borderWidth: 1, borderLeftWidth: 3, paddingHorizontal: 10, paddingVertical: 6 },
  dialog: { borderRadius: 16, alignSelf: 'center' as const, width: 520, maxWidth: '94%' as const },
  dialogTitle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dialogIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, marginTop: 12 },
  docIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  fileCard: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },
  dropzone: { borderWidth: 1.5, borderStyle: 'dashed' as const, alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 4 },
  docGroupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, marginBottom: 4 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 6 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
