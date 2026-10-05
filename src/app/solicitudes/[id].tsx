import { OPCION } from '@/api/agent';
import { api } from '@/api/client';
import {
    ArchivoInput,
    DetalleSolicitudResponse,
    DocumentoPendiente,
    subirDocumentoPendiente,
    subirDocumentoSolicitud,
    toggleMayorEdad,
    toggleVacunado,
} from '@/api/solicitudes';
import { AppShell, Lang } from '@/components/AppShell';
import { useLogout } from '@/hooks/useAuth';
import { usePermisos, useRequirePermiso } from '@/hooks/usePermisos';
import { useResponsive } from '@/hooks/useResponsive';
import { useSolicitudDetalle } from '@/hooks/useSolicitudes';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { palette } from '@/theme';
import { descargarArchivoAutenticado } from '@/utils/downloadFile';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Banner,
    Button,
    Checkbox,
    Dialog,
    Divider,
    Icon,
    IconButton,
    Portal,
    Searchbar,
    Snackbar,
    Text,
    TouchableRipple,
    useTheme,
} from 'react-native-paper';

type T = { [key: string]: string };

const labels: Record<Lang, T> = {
  es: {
    title: 'Detalle de solicitud',
    case: 'Caso',
    requested: 'Solicitado el',
    startRequested: 'Inicio solicitado',
    effective: 'Efectiva desde',
    product: 'Producto',
    plan: 'Plan',
    country: 'País',
    transplant: 'Trasplante de órganos',
    maternity: 'Complicaciones de maternidad',
    yes: 'Sí',
    no: 'No',
    holder: 'Titular',
    born: 'Nacimiento',
    age: 'años',
    mobile: 'Celular',
    phone: 'Teléfono',
    email: 'Correo',
    address: 'Dirección',
    postal: 'Dirección postal',
    pendingTitle: 'Documentos pendientes',
    pendingHint: 'Aún está pendiente subir los siguientes documentos para iniciar la evaluación',
    docsDone: 'Los documentos principales ya fueron cargados. Si posee documentos adicionales, use «Cargar documentos» para que su solicitud se envíe al departamento médico.',
    notVaccinated: 'No está vacunado',
    ofAge: '¿Es mayor de 19 años?',
    loadDoc: 'Cargar',
    loaded: 'Cargado',
    documents: 'Documentos',
    addDocs: 'Cargar documentos',
    policyDocs: 'Documentos de póliza',
    personalDocs: 'Información personal',
    uploadTitle: 'Subir archivo a la solicitud',
    docType: 'Tipo de documento',
    pickFile: 'Seleccionar archivo',
    send: 'Subir',
    cancel: 'Cancelar',
    searchDocs: 'Buscar documento…',
    emptyDocs: 'Sin documentos',
    loading: 'Cargando solicitud…',
    error: 'No pudimos cargar la solicitud',
    retry: 'Reintentar',
    okUpload: 'Documento cargado correctamente',
    errUpload: 'No se pudo cargar el documento',
    okFlag: 'Indicador actualizado',
    errFlag: 'No se pudo actualizar el indicador',
    back: 'Solicitudes',
  },
  en: {
    title: 'Application detail',
    case: 'Case',
    requested: 'Requested on',
    startRequested: 'Requested start',
    effective: 'Effective since',
    product: 'Product',
    plan: 'Plan',
    country: 'Country',
    transplant: 'Organ transplant',
    maternity: 'Maternity complications',
    yes: 'Yes',
    no: 'No',
    holder: 'Policyholder',
    born: 'Birthdate',
    age: 'years old',
    mobile: 'Mobile',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    postal: 'Mailing address',
    pendingTitle: 'Pending documents',
    pendingHint: 'The following documents are still required to start the evaluation',
    docsDone: 'The main documents were already uploaded. If you have additional documents, use "Upload documents" so your application goes to medical review.',
    notVaccinated: 'Not vaccinated',
    ofAge: 'Is over 19 years old?',
    loadDoc: 'Upload',
    loaded: 'Uploaded',
    documents: 'Documents',
    addDocs: 'Upload documents',
    policyDocs: 'Policy documents',
    personalDocs: 'Personal information',
    uploadTitle: 'Upload file to the application',
    docType: 'Document type',
    pickFile: 'Choose file',
    send: 'Upload',
    cancel: 'Cancel',
    searchDocs: 'Search document…',
    emptyDocs: 'No documents',
    loading: 'Loading application…',
    error: "We couldn't load the application",
    retry: 'Retry',
    okUpload: 'Document uploaded successfully',
    errUpload: 'Could not upload the document',
    okFlag: 'Indicator updated',
    errFlag: 'Could not update the indicator',
    back: 'Applications',
  },
  pt: {
    title: 'Detalhe da solicitação',
    case: 'Caso',
    requested: 'Solicitada em',
    startRequested: 'Início solicitado',
    effective: 'Efetiva desde',
    product: 'Produto',
    plan: 'Plano',
    country: 'País',
    transplant: 'Transplante de órgãos',
    maternity: 'Complicações de maternidade',
    yes: 'Sim',
    no: 'Não',
    holder: 'Titular',
    born: 'Nascimento',
    age: 'anos',
    mobile: 'Celular',
    phone: 'Telefone',
    email: 'E-mail',
    address: 'Endereço',
    postal: 'Endereço postal',
    pendingTitle: 'Documentos pendentes',
    pendingHint: 'Ainda faltam os seguintes documentos para iniciar a avaliação',
    docsDone: 'Os documentos principais já foram carregados. Se tiver documentos adicionais, use "Carregar documentos" para que sua solicitação vá à avaliação médica.',
    notVaccinated: 'Não está vacinado',
    ofAge: 'É maior de 19 anos?',
    loadDoc: 'Carregar',
    loaded: 'Carregado',
    documents: 'Documentos',
    addDocs: 'Carregar documentos',
    policyDocs: 'Documentos da apólice',
    personalDocs: 'Informações pessoais',
    uploadTitle: 'Carregar arquivo para a solicitação',
    docType: 'Tipo de documento',
    pickFile: 'Selecionar arquivo',
    send: 'Carregar',
    cancel: 'Cancelar',
    searchDocs: 'Buscar documento…',
    emptyDocs: 'Sem documentos',
    loading: 'Carregando solicitação…',
    error: 'Não foi possível carregar a solicitação',
    retry: 'Tentar novamente',
    okUpload: 'Documento carregado com sucesso',
    errUpload: 'Não foi possível carregar o documento',
    okFlag: 'Indicador atualizado',
    errFlag: 'Não foi possível atualizar o indicador',
    back: 'Solicitações',
  },
};

const fmtDate = (v: any, lang: Lang) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  const locales: Record<Lang, string> = { es: 'es-ES', en: 'en-US', pt: 'pt-BR' };
  return d.toLocaleDateString(locales[lang], { day: '2-digit', month: '2-digit', year: 'numeric' });
};

function InfoRow({ icon, label, value }: { icon: string; label: string; value?: string | number | null }) {
  const { colors } = useTheme();
  return (
    <View style={styles.infoRow}>
      <Icon source={icon} size={16} color={colors.primary} />
      <Text variant="labelSmall" style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>{label}</Text>
      <Text variant="bodyMedium" style={{ flex: 1, flexShrink: 1 }} numberOfLines={2}>
        {value ?? '—'}
      </Text>
    </View>
  );
}

export default function SolicitudDetalleScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const codigoSolicitud = Number(params.id);
  const user = useAuthStore((s) => s.user);
  const allowed = useRequirePermiso(OPCION.solicitudes);
  const { canSee, canExecute } = usePermisos();
  const { data, isLoading, isError, refetch, isRefetching } = useSolicitudDetalle(codigoSolicitud, canSee(OPCION.solicitudes));
  const logout = useLogout();
  const router = useRouter();
  const { colors, roundness } = useTheme();
  const { isDesktop } = useResponsive();
  const lang = useSettingsStore((s) => s.lang);
  const setLang = useSettingsStore((s) => s.setLang);
  const t = labels[lang];
  const qc = useQueryClient();

  const [snack, setSnack] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [tipoDoc, setTipoDoc] = useState('');
  const [file, setFile] = useState<ArchivoInput | null>(null);
  const [docSearch, setDocSearch] = useState('');

  const s = data?.solicitud as Record<string, any> | undefined;
  const puedeEjecutar = canExecute(OPCION.solicitudes);

  const pendientesPorPersona = useMemo(() => {
    const map = new Map<number, DocumentoPendiente[]>();
    (data?.pendientes ?? []).forEach((p) => {
      if (!map.has(p.CodigoPersonaSolicitud)) map.set(p.CodigoPersonaSolicitud, []);
      map.get(p.CodigoPersonaSolicitud)!.push(p);
    });
    return [...map.values()];
  }, [data]);

  const hayPendientes = (data?.pendientes ?? []).some((p) => p.DescripcionTipoDocumento && p.CodigoDocumento === 0);

  const docsAgrupados = useMemo(() => {
    const q = docSearch.trim().toLowerCase();
    const filtrados = (data?.documentos ?? []).filter(
      (d) => !q || `${d.NombreDocumento} ${d.DescripcionTipoDocumento}`.toLowerCase().includes(q),
    );
    return {
      poliza: filtrados.filter((d) => d.CodigoClasificacionTipoDocumento === 3),
      personales: filtrados.filter((d) => d.CodigoClasificacionTipoDocumento !== 3),
    };
  }, [data, docSearch]);

  const pickFile = async (cb: (f: ArchivoInput) => void) => {
    const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.length) return;
    const a = res.assets[0] as any;
    cb({ uri: a.uri, name: a.name ?? 'documento', type: a.mimeType, file: a.file });
  };

  const uploadMutation = useMutation({
    mutationFn: async ({ pendiente, file: f, tipo }: { pendiente?: DocumentoPendiente; file: ArchivoInput; tipo: number }) => {
      if (pendiente) {
        await subirDocumentoPendiente(pendiente.CodigoPersonaSolicitud, tipo, f);
      } else {
        await subirDocumentoSolicitud(codigoSolicitud, tipo, f);
      }
    },
    onSuccess: () => {
      setSnack(t.okUpload);
      setUploadOpen(false);
      setFile(null);
      setTipoDoc('');
      qc.invalidateQueries({ queryKey: ['solicitud-detalle', codigoSolicitud] });
      refetch();
    },
    onError: () => setSnack(t.errUpload),
  });

  const flagMutation = useMutation({
    mutationFn: (p: { codigoPersona: number; tipo: 'vacunado' | 'mayorEdad' }) =>
      p.tipo === 'vacunado' ? toggleVacunado(p.codigoPersona) : toggleMayorEdad(p.codigoPersona),
    onSuccess: () => {
      setSnack(t.okFlag);
      qc.invalidateQueries({ queryKey: ['solicitud-detalle', codigoSolicitud] });
      refetch();
    },
    onError: () => setSnack(t.errFlag),
  });

  const descargarDoc = async (codigoDocumento: number, nombre: string) => {
    const url = `${api.defaults.baseURL}/documentos/descargar/${codigoDocumento}`;
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
      return;
    }
    const safe = nombre.replace(/[^\w.\-]+/g, '_') || `doc-${codigoDocumento}`;
    await descargarArchivoAutenticado(url, safe);
  };

  if (!allowed) return null;

  const estadoTexto = String(s?.DescripcionEstadoSolicitud ?? '');
  const estadoCodigo = String(s?.CodigoEstadoSolicitud ?? '');
  const enProceso = ['01', '02', '03'].includes(estadoCodigo);

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
    >
      <View style={styles.header}>
        <TouchableRipple onPress={() => router.push('/solicitudes' as any)} borderless style={{ borderRadius: roundness - 4 }}>
          <View style={styles.backBtn}>
            <Icon source="arrow-left" size={18} color={colors.onSurfaceVariant} />
            <Text variant="labelLarge" style={{ color: colors.onSurfaceVariant }}>{t.back}</Text>
          </View>
        </TouchableRipple>
        <Text variant="headlineSmall" style={{ flex: 1 }}>{s?.NombreCompleto ?? t.title}</Text>
      </View>

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator animating size="large" />
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>{t.loading}</Text>
        </View>
      )}
      {isError && !isLoading && (
        <View style={styles.center}>
          <Icon source="cloud-off-outline" size={28} color={colors.onSurfaceVariant} />
          <Text variant="titleMedium">{t.error}</Text>
          <Button mode="contained" onPress={() => refetch()} loading={isRefetching} style={{ borderRadius: roundness - 4 }}>
            {t.retry}
          </Button>
        </View>
      )}

      {s && (
        <>
          {/* Documentos pendientes */}
          {s.IndicadorSolicitud === '1' && hayPendientes && (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: palette.warning, borderRadius: roundness }]}>
              <Banner visible icon="file-alert-outline" style={{ marginBottom: 8, borderRadius: roundness - 4 }}>
                {t.pendingHint}
              </Banner>
              {pendientesPorPersona.map((personaDocs) => {
                const p0 = personaDocs[0];
                return (
                  <View key={p0.CodigoPersonaSolicitud} style={[styles.personaBlock, { borderColor: colors.outlineVariant, borderRadius: roundness - 4 }]}>
                    <View style={styles.personaHead}>
                      <Text variant="titleSmall" style={{ flex: 1 }}>
                        {p0.DescripcionTipoPersonaCotizacion} — {p0.NombreCompleto?.trim()}
                      </Text>
                      <View style={styles.flagRow}>
                        <View style={styles.flag}>
                          <Checkbox
                            status={p0.IndicadorVacunado === '1' ? 'checked' : 'unchecked'}
                            onPress={() => puedeEjecutar && flagMutation.mutate({ codigoPersona: p0.CodigoPersonaSolicitud, tipo: 'vacunado' })}
                            disabled={!puedeEjecutar}
                          />
                          <Text variant="bodySmall">{t.notVaccinated}</Text>
                        </View>
                        {p0.CodigoTipoPersonaCertificado === '03' && (
                          <View style={styles.flag}>
                            <Checkbox
                              status={p0.IndicadorMayorEdad === '1' ? 'checked' : 'unchecked'}
                              onPress={() => puedeEjecutar && flagMutation.mutate({ codigoPersona: p0.CodigoPersonaSolicitud, tipo: 'mayorEdad' })}
                              disabled={!puedeEjecutar}
                            />
                            <Text variant="bodySmall">{t.ofAge}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {personaDocs
                      .filter((d) => d.DescripcionTipoDocumento)
                      .map((d) => (
                        <View key={`${d.CodigoTipoDocumento}-${d.CodigoPersonaSolicitud}`} style={styles.pendienteRow}>
                          {d.CodigoDocumento === 0 ? (
                            <>
                              <Text variant="bodyMedium" style={{ flex: 1 }}>{d.DescripcionTipoDocumento.trim()}</Text>
                              <Button
                                mode="contained-tonal"
                                icon="upload-outline"
                                compact
                                disabled={!puedeEjecutar || uploadMutation.isPending}
                                onPress={() =>
                                  pickFile((f) => uploadMutation.mutate({ pendiente: d, file: f, tipo: d.CodigoTipoDocumento }))
                                }
                                style={{ borderRadius: roundness - 4 }}
                              >
                                {t.loadDoc}
                              </Button>
                            </>
                          ) : (
                            <View style={styles.docOk}>
                              <Icon source="check-decagram" size={18} color={palette.success} />
                              <Text variant="bodyMedium" style={{ flex: 1 }}>
                                {d.DescripcionTipoDocumento.trim()} — {d.NombreCompleto?.trim()}
                              </Text>
                            </View>
                          )}
                        </View>
                      ))}
                  </View>
                );
              })}
            </View>
          )}

          {s.IndicadorSolicitud !== '1' && enProceso && (
            <View style={[styles.notice, { backgroundColor: palette.success + '14', borderColor: palette.success, borderRadius: roundness - 4 }]}>
              <Icon source="check-circle-outline" size={18} color={palette.success} />
              <Text variant="bodySmall" style={{ flex: 1 }}>{t.docsDone}</Text>
            </View>
          )}

          <View style={isDesktop ? styles.cols : undefined}>
            {/* Caso */}
            <View style={[styles.card, styles.colCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
              <View style={[styles.cardHead, { backgroundColor: palette.navy[700], borderTopLeftRadius: roundness - 1, borderTopRightRadius: roundness - 1 }]}>
                <Icon source="file-sign" size={16} color="#fff" />
                <Text variant="titleSmall" style={{ color: '#fff', flex: 1 }}>
                  {t.case} N° {s.NumeroPoliza} ({estadoTexto})
                </Text>
              </View>
              <View style={styles.cardBody}>
                <InfoRow icon="calendar-plus" label={t.requested} value={fmtDate(s.FechaSolicitud, lang)} />
                <InfoRow icon="calendar-start" label={t.startRequested} value={fmtDate(s.FechaInicioSolicitada, lang)} />
                <InfoRow icon="calendar-check" label={t.effective} value={fmtDate(s.FechaEfectividad, lang)} />
                <Divider style={{ marginVertical: 6 }} />
                <InfoRow icon="shield-star-outline" label={t.product} value={s.DescripcionPoliza} />
                <InfoRow icon="format-list-bulleted-type" label={t.plan} value={s.DescripcionPlan} />
                <InfoRow icon="map-marker-outline" label={t.country} value={s.DescripcionPais} />
                <InfoRow icon="heart-pulse" label={t.transplant} value={s.IndicadorTrasplante === '1' ? t.yes : t.no} />
                <InfoRow icon="baby-carriage" label={t.maternity} value={s.IndicadorMaternidad === '1' ? t.yes : t.no} />
              </View>
            </View>

            {/* Titular */}
            <View style={[styles.card, styles.colCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
              <View style={[styles.cardHead, { backgroundColor: palette.navy[700], borderTopLeftRadius: roundness - 1, borderTopRightRadius: roundness - 1 }]}>
                <Icon source="account" size={16} color="#fff" />
                <Text variant="titleSmall" style={{ color: '#fff', flex: 1 }}>{s.NombreCompleto}</Text>
              </View>
              <View style={styles.cardBody}>
                <InfoRow
                  icon="cake-variant"
                  label={t.born}
                  value={`${fmtDate(s.FechaNacimiento, lang)} (${s.Edad} ${t.age})`}
                />
                <InfoRow icon="cellphone" label={t.mobile} value={s.Celular} />
                <InfoRow icon="phone" label={t.phone} value={s.Telefono} />
                <InfoRow icon="email" label={t.email} value={s.Correo} />
                <InfoRow icon="home" label={t.address} value={s.Direccion} />
                <InfoRow icon="mailbox-outline" label={t.postal} value={s.DireccionPostal} />
              </View>
            </View>
          </View>

          {/* Documentos */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
            <View style={styles.docsHead}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon source="folder-multiple" size={18} color={colors.primary} />
                <Text variant="titleMedium">{t.documents}</Text>
              </View>
              {puedeEjecutar && (
                <Button mode="contained" icon="plus" compact onPress={() => setUploadOpen(true)} style={{ borderRadius: roundness - 4 }}>
                  {t.addDocs}
                </Button>
              )}
            </View>
            <Searchbar
              placeholder={t.searchDocs}
              value={docSearch}
              onChangeText={setDocSearch}
              style={[styles.search, { backgroundColor: colors.background, borderRadius: roundness - 4 }]}
              inputStyle={{ fontSize: 13, minHeight: 0 }}
              elevation={0}
            />
            <DocGroup
              title={t.policyDocs}
              icon="shield-check-outline"
              docs={docsAgrupados.poliza}
              onPress={descargarDoc}
              emptyLabel={t.emptyDocs}
            />
            <DocGroup
              title={t.personalDocs}
              icon="folder-account-outline"
              docs={docsAgrupados.personales}
              onPress={descargarDoc}
              emptyLabel={t.emptyDocs}
            />
          </View>
        </>
      )}

      {/* Subir documento */}
      <Portal>
        <Dialog visible={uploadOpen} onDismiss={() => setUploadOpen(false)} style={[styles.dialog, { borderRadius: roundness + 4, backgroundColor: colors.surface }]}>
          <Dialog.Title>{t.uploadTitle}</Dialog.Title>
          <Dialog.Content style={{ gap: 10 }}>
            <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>{t.docType}</Text>
            <ScrollView style={{ maxHeight: 180 }} showsVerticalScrollIndicator>
              {(data?.tiposDocumento ?? []).map((td) => {
                const active = String(td.CodigoTipoDocumento) === tipoDoc;
                return (
                  <TouchableRipple
                    key={td.CodigoTipoDocumento}
                    onPress={() => setTipoDoc(String(td.CodigoTipoDocumento))}
                    borderless
                    style={{ borderRadius: roundness - 6 }}
                  >
                    <View style={[styles.tipoRow, active && { backgroundColor: palette.indigo[50] }]}>
                      <Icon source={active ? 'radiobox-marked' : 'radiobox-blank'} size={18} color={active ? palette.indigo[600] : colors.onSurfaceVariant} />
                      <Text variant="bodyMedium" style={{ flex: 1 }} numberOfLines={1}>{td.DescripcionTipoDocumento}</Text>
                    </View>
                  </TouchableRipple>
                );
              })}
            </ScrollView>
            <TouchableRipple onPress={() => pickFile(setFile)} borderless style={{ borderRadius: roundness - 4 }}>
              <View style={[styles.dropzone, { borderColor: colors.outline, borderRadius: roundness - 4, backgroundColor: colors.background }]}>
                <Icon source={file ? 'file-check-outline' : 'upload-outline'} size={22} color={file ? palette.success : colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={{ color: file ? palette.success : colors.onSurfaceVariant }} numberOfLines={1}>
                  {file ? file.name : t.pickFile}
                </Text>
              </View>
            </TouchableRipple>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setUploadOpen(false)}>{t.cancel}</Button>
            <Button
              mode="contained"
              disabled={!file || !tipoDoc || uploadMutation.isPending}
              loading={uploadMutation.isPending}
              onPress={() => file && tipoDoc && uploadMutation.mutate({ file, tipo: Number(tipoDoc) })}
            >
              {t.send}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={2500}>
        {snack}
      </Snackbar>
    </AppShell>
  );
}

function DocGroup({ title, icon, docs, onPress, emptyLabel }: {
  title: string;
  icon: string;
  docs: DetalleSolicitudResponse['documentos'];
  onPress: (codigoDocumento: number, nombre: string) => void;
  emptyLabel: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ marginTop: 8 }}>
      <View style={styles.groupHead}>
        <Icon source={icon} size={16} color={palette.warning} />
        <Text variant="labelLarge">{title}</Text>
        <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>({docs.length})</Text>
      </View>
      {docs.length === 0 && (
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, paddingVertical: 4, paddingLeft: 26 }}>
          {emptyLabel}
        </Text>
      )}
      {docs.map((d) => (
        <TouchableRipple key={d.CodigoDocumento} onPress={() => onPress(d.CodigoDocumento, d.NombreDocumento)} borderless>
          <View style={styles.docRow}>
            <Icon source="file-eye-outline" size={16} color={palette.warning} />
            <Text variant="bodySmall" style={{ flex: 1 }} numberOfLines={1}>
              ({d.DescripcionTipoDocumento.trim()}) — {d.NombreDocumento}
            </Text>
            <IconButton icon="download-outline" size={16} onPress={() => onPress(d.CodigoDocumento, d.NombreDocumento)} />
          </View>
        </TouchableRipple>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 4 },
  center: { alignItems: 'center', gap: 12, paddingVertical: 48 },
  card: { borderWidth: 1, overflow: 'hidden', marginBottom: 12 },
  cols: { flexDirection: 'row', gap: 12 },
  colCard: { flex: 1 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10 },
  cardBody: { paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 3 },
  infoLabel: { width: 110, textTransform: 'uppercase', letterSpacing: 0.4 },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderWidth: 1, padding: 10, marginBottom: 12 },
  personaBlock: { borderWidth: 1, padding: 10, gap: 8, marginBottom: 8 },
  personaHead: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  flagRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  flag: { flexDirection: 'row', alignItems: 'center' },
  pendienteRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  docOk: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  docsHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, paddingBottom: 4 },
  search: { marginHorizontal: 12, marginBottom: 4 },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 4 },
  tipoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, paddingHorizontal: 8 },
  dropzone: { borderWidth: 1, borderStyle: 'dashed', padding: 16, alignItems: 'center', gap: 8 },
  dialog: { maxWidth: 480, alignSelf: 'center', width: '92%' },
});
