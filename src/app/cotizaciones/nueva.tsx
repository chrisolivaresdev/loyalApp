import { OPCION } from '@/api/agent';
import { AppShell, Lang } from '@/components/AppShell';
import { DateField } from '@/components/DateField';
import { SelectField, SelectOption } from '@/components/SelectField';
import { useLogout } from '@/hooks/useAuth';
import { usePaises, useSolicitarCotizacion } from '@/hooks/useCotizaciones';
import { useRequirePermiso } from '@/hooks/usePermisos';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { palette } from '@/theme';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Checkbox, Icon, IconButton, Portal, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';

const labels: Record<Lang, { [key: string]: string }> = {
  es: {
    title: 'Registro de cotización',
    quotes: 'Cotizaciones',
    requests: 'Solicitudes',
    home: 'Inicio',
    profile: 'Mi perfil',
    logout: 'Cerrar sesión',
    language: 'Idioma',
    agent: 'Agente',
    validityStart: 'Fecha inicio validez',
    country: 'País',
    holderName: 'Nombre solicitante',
    holderPlaceholder: 'Nombre solicitante…',
    idType: 'Tipo de identidad',
    idDocument: 'Documento de identidad',
    idPlaceholder: '00.000.000',
    birthdate: 'Fecha nacimiento solicitante',
    gender: 'Género solicitante',
    email: 'Correo',
    emailPlaceholder: 'Correo…',
    spouse: 'Cónyuge',
    spouseBirthdate: 'Fecha nacimiento cónyuge',
    spouseGender: 'Género cónyuge',
    dependents: 'Dependientes',
    noDependents: 'Sin dependientes',
    organTransplant: 'Trasplante de órganos',
    maternity: 'Complicaciones de maternidad',
    generate: 'Generar cotización',
    clear: 'Limpiar cotización',
    select: 'Selecciona una opción',
    required: 'Este campo es obligatorio',
    invalidDate: 'Formato esperado: AAAA-MM-DD',
    invalidEmail: 'Correo inválido',
    submitError: 'No se pudo generar la cotización',
    cleared: 'Formulario limpiado',
    male: 'Masculino',
    female: 'Femenino',
    dni: 'Cédula / DNI',
    passport: 'Pasaporte',
    rif: 'RIF',
  },
  en: {
    title: 'Quote registration',
    quotes: 'Quotes',
    requests: 'Requests',
    home: 'Home',
    profile: 'My profile',
    logout: 'Sign out',
    language: 'Language',
    agent: 'Agent',
    validityStart: 'Validity start date',
    country: 'Country',
    holderName: 'Applicant name',
    holderPlaceholder: 'Applicant name…',
    idType: 'ID type',
    idDocument: 'ID document',
    idPlaceholder: '00.000.000',
    birthdate: 'Applicant birthdate',
    gender: 'Applicant gender',
    email: 'Email',
    emailPlaceholder: 'Email…',
    spouse: 'Spouse',
    spouseBirthdate: 'Spouse birthdate',
    spouseGender: 'Spouse gender',
    dependents: 'Dependents',
    noDependents: 'No dependents',
    organTransplant: 'Organ transplant',
    maternity: 'Maternity complications',
    generate: 'Generate quote',
    clear: 'Clear quote',
    select: 'Select an option',
    required: 'This field is required',
    invalidDate: 'Expected format: YYYY-MM-DD',
    invalidEmail: 'Invalid email',
    submitError: 'Could not generate the quote',
    cleared: 'Form cleared',
    male: 'Male',
    female: 'Female',
    dni: 'ID card',
    passport: 'Passport',
    rif: 'RIF',
  },
  pt: {
    title: 'Registro de cotação',
    quotes: 'Cotações',
    requests: 'Solicitações',
    home: 'Início',
    profile: 'Meu perfil',
    logout: 'Sair',
    language: 'Idioma',
    agent: 'Agente',
    validityStart: 'Data de início de vigência',
    country: 'País',
    holderName: 'Nome do solicitante',
    holderPlaceholder: 'Nome do solicitante…',
    idType: 'Tipo de identidade',
    idDocument: 'Documento de identidade',
    idPlaceholder: '00.000.000',
    birthdate: 'Data de nascimento do solicitante',
    gender: 'Gênero do solicitante',
    email: 'E-mail',
    emailPlaceholder: 'E-mail…',
    spouse: 'Cônjuge',
    spouseBirthdate: 'Data de nascimento do cônjuge',
    spouseGender: 'Gênero do cônjuge',
    dependents: 'Dependentes',
    noDependents: 'Sem dependentes',
    organTransplant: 'Transplante de órgãos',
    maternity: 'Complicações de maternidade',
    generate: 'Gerar cotação',
    clear: 'Limpar cotação',
    select: 'Selecione uma opção',
    required: 'Este campo é obrigatório',
    invalidDate: 'Formato esperado: AAAA-MM-DD',
    invalidEmail: 'E-mail inválido',
    submitError: 'Não foi possível gerar a cotação',
    cleared: 'Formulário limpo',
    male: 'Masculino',
    female: 'Feminino',
    dni: 'Identidade / DNI',
    passport: 'Passaporte',
    rif: 'RIF',
  },
};

const today = () => new Date().toISOString().slice(0, 10);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyForm = {
  fechaInicio: today(),
  pais: '',
  nombre: '',
  tipoId: '',
  documento: '',
  nacimiento: '',
  genero: '',
  correo: '',
  conyuge: false,
  nacimientoConyuge: '',
  generoConyuge: '',
  dependientes: '0',
  trasplante: false,
  maternidad: false,
};

type Form = typeof emptyForm;
type Errors = Partial<Record<keyof Form, string>>;

function Field({
  label, value, onChange, placeholder, error, keyboardType, icon, style,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  icon?: string;
  style?: object;
}) {
  const { colors, roundness } = useTheme();
  return (
    <View style={[styles.field, style]}>
      <Text variant="labelLarge" style={[styles.label, { color: colors.onSurface }]}>{label}</Text>
      <TextInput
        mode="outlined"
        dense
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={keyboardType}
        error={!!error}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        outlineStyle={{ borderRadius: roundness - 4, borderColor: error ? colors.error : colors.outline }}
        style={{ backgroundColor: colors.surface, fontSize: 14 }}
        right={icon ? <TextInput.Icon icon={icon} color={colors.onSurfaceVariant} /> : undefined}
      />
      {!!error && <Text variant="bodySmall" style={{ color: colors.error }}>{error}</Text>}
    </View>
  );
}

function CheckField({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.check}>
      <Checkbox.Android status={checked ? 'checked' : 'unchecked'} onPress={onToggle} color={palette.indigo[500]} />
      <Text variant="bodyMedium" onPress={onToggle} style={{ color: colors.onSurface }}>{label}</Text>
    </View>
  );
}

export default function NuevaCotizacionScreen() {
  const user = useAuthStore((s) => s.user);
  const allowed = useRequirePermiso(OPCION.cotizaciones, 'ejec', '/cotizaciones');
  const logout = useLogout();
  const router = useRouter();
  const { colors, roundness } = useTheme();
  const { isMobile } = useResponsive();
  const lang = useSettingsStore((s) => s.lang);
  const setLang = useSettingsStore((s) => s.setLang);
  const t = labels[lang];

  const [form, setForm] = useState<Form>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [snack, setSnack] = useState<string | null>(null);

  const solicitar = useSolicitarCotizacion();
  const { data: paises } = usePaises();

  const agente = user?.NombreCompletoUsuario?.trim() ?? '';

  const countries = useMemo<SelectOption[]>(
    () => (paises ?? []).map((p) => ({ value: String(p.CodigoPais), label: p.DescripcionPais })),
    [paises],
  );

  const idTypes = useMemo<SelectOption[]>(() => [
    { value: '01', label: t.rif },
    { value: '02', label: t.passport },
    { value: '03', label: t.dni },
  ], [t]);

  const genders = useMemo<SelectOption[]>(() => [
    { value: 'M', label: t.male },
    { value: 'F', label: t.female },
  ], [t]);

  const dependents = useMemo<SelectOption[]>(() => [
    { value: '0', label: t.noDependents },
    ...Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
  ], [t]);

  const update = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (!DATE_RE.test(form.fechaInicio)) e.fechaInicio = t.invalidDate;
    if (!form.pais) e.pais = t.required;
    if (!form.nombre.trim()) e.nombre = t.required;
    if (!form.tipoId) e.tipoId = t.required;
    if (!form.documento.trim()) e.documento = t.required;
    if (!DATE_RE.test(form.nacimiento)) e.nacimiento = t.invalidDate;
    if (!form.genero) e.genero = t.required;
    if (!EMAIL_RE.test(form.correo)) e.correo = t.invalidEmail;
    if (form.conyuge) {
      if (!DATE_RE.test(form.nacimientoConyuge)) e.nacimientoConyuge = t.invalidDate;
      if (!form.generoConyuge) e.generoConyuge = t.required;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onGenerate = () => {
    if (!validate() || solicitar.isPending) return;
    solicitar.mutate(
      {
        fechaInicioValidez: form.fechaInicio,
        nombreSolicitante: form.nombre.trim(),
        fechaNacimientoSolicitante: form.nacimiento,
        sexoSolicitante: form.genero as 'M' | 'F',
        codigoTipoDocumentoIdentidad: form.tipoId,
        tipoDocumentoIdentidad: form.documento.trim(),
        codigoPais: Number(form.pais),
        correo: form.correo.trim(),
        indicadorConyuge: form.conyuge,
        ...(form.conyuge
          ? { fechaNacimientoConyuge: form.nacimientoConyuge, sexoConyuge: form.generoConyuge as 'M' | 'F' }
          : {}),
        numeroDependientes: Number(form.dependientes) || 0,
        trasplanteOrganos: form.trasplante,
        complicacionesMaternidad: form.maternidad,
      },
      {
        onSuccess: (res) => {
          setSnack(res.message);
          if (res.success) {
            const codigo = Number(res.redirect?.split('/').filter(Boolean).pop());
            setTimeout(() => {
              router.replace(
                (Number.isFinite(codigo) && codigo > 0
                  ? `/cotizaciones?detalle=${codigo}`
                  : '/cotizaciones') as any,
              );
            }, 900);
          }
        },
        onError: (error: any) => {
          const msg = error?.response?.data?.message;
          setSnack(Array.isArray(msg) ? msg.join('\n') : msg ?? t.submitError);
        },
      },
    );
  };

  const onClear = () => {
    setForm({ ...emptyForm, fechaInicio: today() });
    setErrors({});
    setSnack(t.cleared);
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/cotizaciones' as any));

  if (!allowed) return null;

  return (
    <>
      <AppShell
        title={t.quotes}
        userName={agente}
        userRole={user?.NombrePerfil}
        lang={lang}
        onLangChange={setLang}
        onProfile={() => router.push('/perfil' as any)}
        onLogout={() => logout.mutate()}
        onHome={() => router.push('/dashboard' as any)}
        onCotizaciones={goBack}
        onSolicitudes={() => router.push('/solicitudes' as any)}
        onPolizas={() => router.push('/polizas' as any)}
      >
        <View style={styles.titleRow}>
          <IconButton icon="arrow-left" onPress={goBack} size={22} />
          <Text variant="titleMedium" style={styles.titleText}>{t.title.toUpperCase()}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
          <View style={styles.field}>
            <Text variant="labelLarge" style={[styles.label, { color: colors.onSurface }]}>{t.agent}</Text>
            <View style={[styles.readonly, { borderColor: colors.outline, backgroundColor: colors.surfaceVariant, borderRadius: roundness - 4 }]}>
              <Icon source="account-tie-outline" size={18} color={colors.onSurfaceVariant} />
              <Text variant="bodyMedium" style={{ flex: 1 }} numberOfLines={1}>{t.agent} {agente}</Text>
            </View>
          </View>

          <View style={[styles.row, isMobile && styles.rowMobile]}>
            <DateField
              label={t.validityStart}
              value={form.fechaInicio}
              onChange={(v) => update('fechaInicio', v)}
              minDate={today()}
              error={errors.fechaInicio}
              locale={lang}
              style={styles.half}
            />
            <SelectField
              label={t.country}
              value={form.pais}
              options={countries}
              onChange={(v) => update('pais', v)}
              placeholder={t.select}
              error={errors.pais}
              style={styles.half}
            />
          </View>

          <Field
            label={t.holderName}
            value={form.nombre}
            onChange={(v) => update('nombre', v)}
            placeholder={t.holderPlaceholder}
            error={errors.nombre}
          />

          <View style={[styles.row, isMobile && styles.rowMobile]}>
            <SelectField
              label={t.idType}
              value={form.tipoId}
              options={idTypes}
              onChange={(v) => update('tipoId', v)}
              placeholder={t.select}
              error={errors.tipoId}
              style={styles.half}
            />
            <Field
              label={t.idDocument}
              value={form.documento}
              onChange={(v) => update('documento', v)}
              placeholder={t.idPlaceholder}
              error={errors.documento}
              style={styles.half}
            />
          </View>

          <View style={[styles.row, isMobile && styles.rowMobile]}>
            <DateField
              label={t.birthdate}
              value={form.nacimiento}
              onChange={(v) => update('nacimiento', v)}
              maxDate={today()}
              error={errors.nacimiento}
              locale={lang}
              style={styles.half}
            />
            <SelectField
              label={t.gender}
              value={form.genero}
              options={genders}
              onChange={(v) => update('genero', v)}
              placeholder={t.select}
              error={errors.genero}
              style={styles.half}
            />
          </View>

          <Field
            label={t.email}
            value={form.correo}
            onChange={(v) => update('correo', v)}
            placeholder={t.emailPlaceholder}
            keyboardType="email-address"
            error={errors.correo}
          />

          <CheckField label={t.spouse} checked={form.conyuge} onToggle={() => update('conyuge', !form.conyuge)} />

          {form.conyuge && (
            <View style={[styles.row, isMobile && styles.rowMobile, styles.spouseBlock, { backgroundColor: colors.background, borderRadius: roundness - 4 }]}>
              <DateField
                label={t.spouseBirthdate}
                value={form.nacimientoConyuge}
                onChange={(v) => update('nacimientoConyuge', v)}
                maxDate={today()}
                error={errors.nacimientoConyuge}
                locale={lang}
                style={styles.half}
              />
              <SelectField
                label={t.spouseGender}
                value={form.generoConyuge}
                options={genders}
                onChange={(v) => update('generoConyuge', v)}
                placeholder={t.select}
                error={errors.generoConyuge}
                style={styles.half}
              />
            </View>
          )}

          <View style={[styles.row, isMobile && styles.rowMobile, { alignItems: 'flex-end' }]}>
            <SelectField
              label={t.dependents}
              value={form.dependientes}
              options={dependents}
              onChange={(v) => update('dependientes', v)}
              style={styles.half}
            />
            <View style={[styles.half, styles.checkGroup]}>
              <CheckField label={t.organTransplant} checked={form.trasplante} onToggle={() => update('trasplante', !form.trasplante)} />
              <CheckField label={t.maternity} checked={form.maternidad} onToggle={() => update('maternidad', !form.maternidad)} />
            </View>
          </View>

          <View style={[styles.actions, isMobile && styles.rowMobile]}>
            <Button
              mode="contained"
              icon="tag-outline"
              onPress={onGenerate}
              loading={solicitar.isPending}
              disabled={solicitar.isPending}
              buttonColor={palette.indigo[500]}
              textColor="#FFFFFF"
              style={[styles.action, { borderRadius: roundness - 6 }]}
              contentStyle={styles.actionContent}
            >
              {t.generate}
            </Button>
            <Button
              mode="outlined"
              icon="broom"
              onPress={onClear}
              textColor={palette.indigo[600]}
              style={[styles.action, { borderRadius: roundness - 6, borderColor: palette.indigo[500] }]}
              contentStyle={styles.actionContent}
            >
              {t.clear}
            </Button>
          </View>
        </View>
      </AppShell>

      <Portal>
        <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={3500}>
          {snack}
        </Snackbar>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  titleText: { letterSpacing: 0.6, fontFamily: 'Inter_700Bold' },
  card: { width: '100%', maxWidth: 820, alignSelf: 'center', padding: 24, gap: 18, borderWidth: 1 },
  field: { gap: 6, flex: 1 },
  label: { fontSize: 13 },
  readonly: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, paddingHorizontal: 14, minHeight: 46 },
  row: { flexDirection: 'row', gap: 16 },
  rowMobile: { flexDirection: 'column' },
  half: { flex: 1 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  checkGroup: { gap: 2, justifyContent: 'flex-end' },
  spouseBlock: { padding: 12 },
  actions: { flexDirection: 'row', justifyContent: 'space-evenly', gap: 16, marginTop: 8 },
  action: { minWidth: 200 },
  actionContent: { height: 42 },
});
