import { OPCION } from '@/api/agent';
import { PersonalAgente, PersonalPayload } from '@/api/personal';
import { AppShell, Lang } from '@/components/AppShell';
import { DateField } from '@/components/DateField';
import { Paginator } from '@/components/Paginator';
import { SelectField } from '@/components/SelectField';
import { useLogout } from '@/hooks/useAuth';
import { useClientPagination } from '@/hooks/useClientPagination';
import { usePermisos, useRequirePermiso } from '@/hooks/usePermisos';
import { useActualizarPermiso, useCrearUsuarioPersonal, useGuardarPersonal, usePermisosPersonal, usePersonalAgente, usePersonalDetalle } from '@/hooks/usePersonal';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { palette } from '@/theme';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Checkbox,
  Dialog,
  Icon,
  IconButton,
  Menu,
  Portal,
  Searchbar,
  Snackbar,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';

const labels = {
  es: {
    title: 'Personal',
    subtitle: 'Personal registrado en tu agencia',
    register: 'Registrar personal',
    search: 'Buscar por nombre o tipo…',
    type: 'Tipo de personal',
    name: 'Nombre',
    lastName: 'Apellido paterno',
    secondLastName: 'Apellido materno',
    sex: 'Género',
    male: 'Masculino',
    female: 'Femenino',
    birthdate: 'Fecha de nacimiento',
    email: 'Correo',
    phone: 'Celular',
    user: 'Usuario',
    userCreated: 'Creado',
    showCommissions: 'Desea que el usuario vea las comisiones generadas',
    save: 'Grabar datos personal',
    cancel: 'Cancelar',
    editTitle: 'Editar personal',
    newTitle: 'Ingrese los datos del personal',
    loading: 'Cargando personal…',
    loadingForm: 'Cargando datos…',
    error: 'No pudimos cargar el personal',
    retry: 'Reintentar',
    empty: 'No hay personal registrado',
    emptyHint: 'Registra el primer miembro de tu equipo.',
    emptySearch: 'Sin resultados para esta búsqueda',
    saved: 'Personal guardado correctamente',
    saveError: 'No pudimos guardar el personal',
    required: 'Campo requerido',
    atLeastOneLastName: 'Ingresa al menos un apellido',
    invalidEmail: 'Correo inválido',
    records: 'registros',
    perPage: 'Por página',
    of: 'de',
    results: 'resultados',
    actions: 'Acciones',
    edit: 'Editar',
    editStaff: 'Editar personal',
    manageUser: 'Gestionar usuario',
    option: 'Opción',
    permissions: 'Permisos',
    permissionsTitle: 'Permisos Portal',
    show: 'Mostrar',
    enable: 'Habilitar',
    noUser: 'Este personal aún no tiene usuario',
    createUser: 'Crear usuario',
    userDataTitle: 'Ingrese los datos del usuario',
    username: 'Nombre de usuario',
    password: 'Contraseña',
    saveUser: 'Grabar datos usuario',
    userSaved: 'Usuario registrado correctamente',
    userSaveError: 'No pudimos registrar el usuario',
    requiredField: 'Completa los campos requeridos',
  },
  en: {
    title: 'Staff',
    subtitle: 'Staff registered in your agency',
    register: 'Register staff',
    search: 'Search by name or type…',
    type: 'Staff type',
    name: 'First name',
    lastName: 'Last name',
    secondLastName: 'Second last name',
    sex: 'Gender',
    male: 'Male',
    female: 'Female',
    birthdate: 'Date of birth',
    email: 'Email',
    phone: 'Mobile',
    user: 'User',
    userCreated: 'Created',
    showCommissions: 'Allow this user to see generated commissions',
    save: 'Save staff data',
    cancel: 'Cancel',
    editTitle: 'Edit staff',
    newTitle: 'Enter staff details',
    loading: 'Loading staff…',
    loadingForm: 'Loading data…',
    error: 'We could not load the staff',
    retry: 'Retry',
    empty: 'No staff registered',
    emptyHint: 'Register the first member of your team.',
    emptySearch: 'No results for this search',
    saved: 'Staff saved successfully',
    saveError: 'We could not save the staff',
    required: 'Required field',
    atLeastOneLastName: 'Enter at least one last name',
    invalidEmail: 'Invalid email',
    records: 'records',
    perPage: 'Per page',
    of: 'of',
    results: 'results',
    actions: 'Actions',
    edit: 'Edit',
    editStaff: 'Edit staff',
    manageUser: 'Manage user',
    option: 'Option',
    permissions: 'Permissions',
    permissionsTitle: 'Portal Permissions',
    show: 'Show',
    enable: 'Enable',
    noUser: 'This staff member has no user yet',
    createUser: 'Create user',
    userDataTitle: 'Enter user details',
    username: 'Username',
    password: 'Password',
    saveUser: 'Save user data',
    userSaved: 'User registered successfully',
    userSaveError: 'We could not register the user',
    requiredField: 'Fill in the required fields',
  },
  pt: {
    title: 'Equipe',
    subtitle: 'Equipe registrada na sua agência',
    register: 'Registrar membro',
    search: 'Buscar por nome ou tipo…',
    type: 'Tipo de membro',
    name: 'Nome',
    lastName: 'Sobrenome paterno',
    secondLastName: 'Sobrenome materno',
    sex: 'Gênero',
    male: 'Masculino',
    female: 'Feminino',
    birthdate: 'Data de nascimento',
    email: 'E-mail',
    phone: 'Celular',
    user: 'Usuário',
    userCreated: 'Criado',
    showCommissions: 'Permitir que o usuário veja as comissões geradas',
    save: 'Salvar dados do membro',
    cancel: 'Cancelar',
    editTitle: 'Editar membro',
    newTitle: 'Informe os dados do membro',
    loading: 'Carregando equipe…',
    loadingForm: 'Carregando dados…',
    error: 'Não foi possível carregar a equipe',
    retry: 'Tentar novamente',
    empty: 'Não há membros registrados',
    emptyHint: 'Registre o primeiro membro da sua equipe.',
    emptySearch: 'Sem resultados para esta busca',
    saved: 'Membro salvo com sucesso',
    saveError: 'Não foi possível salvar o membro',
    required: 'Campo obrigatório',
    atLeastOneLastName: 'Informe ao menos um sobrenome',
    invalidEmail: 'E-mail inválido',
    records: 'registros',
    perPage: 'Por página',
    of: 'de',
    results: 'resultados',
    actions: 'Ações',
    edit: 'Editar',
    editStaff: 'Editar membro',
    manageUser: 'Gerenciar usuário',
    option: 'Opção',
    permissions: 'Permissões',
    permissionsTitle: 'Permissões do Portal',
    show: 'Mostrar',
    enable: 'Habilitar',
    noUser: 'Este membro ainda não tem usuário',
    createUser: 'Criar usuário',
    userDataTitle: 'Informe os dados do usuário',
    username: 'Nome de usuário',
    password: 'Senha',
    saveUser: 'Salvar dados do usuário',
    userSaved: 'Usuário registrado com sucesso',
    userSaveError: 'Não foi possível registrar o usuário',
    requiredField: 'Preencha os campos obrigatórios',
  },
} satisfies Record<Lang, Record<string, string>>;

type T = (typeof labels)['es'];

const DATE_LOCALES: Record<Lang, string> = { es: 'es-ES', en: 'en-US', pt: 'pt-BR' };
const fmtDate = (iso: string, lang: Lang) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(DATE_LOCALES[lang]);
};

const initials = (p: PersonalAgente) =>
  `${p.nombre.trim()[0] ?? ''}${p.apellidoPaterno.trim()[0] ?? ''}`.toUpperCase() || '·';

interface FormState {
  codigoPersonalEmpresa: number;
  codigoTipoPersonalEmpresa: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  sexo: string;
  fechaNacimiento: string;
  indicadorComisiones: boolean;
  codigoCorreo: number;
  correo: string;
  codigoCelular: number;
  celular: string;
}

const emptyForm = (): FormState => ({
  codigoPersonalEmpresa: 0,
  codigoTipoPersonalEmpresa: '01',
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  sexo: 'M',
  fechaNacimiento: '',
  indicadorComisiones: false,
  codigoCorreo: 0,
  correo: '',
  codigoCelular: 0,
  celular: '',
});

function PersonalFormDialog({ codigo, visible, onDismiss, t, lang, codigoUsuario }: {
  codigo: number | null;
  visible: boolean;
  onDismiss: () => void;
  t: T;
  lang: Lang;
  codigoUsuario: number;
}) {
  const { colors, roundness } = useTheme();
  const isEdit = (codigo ?? 0) > 0;
  const { data: detalle, isFetching } = usePersonalDetalle(visible ? codigo : null);
  const guardar = useGuardarPersonal();

  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [snack, setSnack] = useState('');

  useEffect(() => {
    if (!visible) return;
    if (!isEdit) {
      setForm(emptyForm());
      return;
    }
    if (detalle) {
      setForm({
        codigoPersonalEmpresa: codigo ?? 0,
        codigoTipoPersonalEmpresa: detalle.codigoTipoPersonalEmpresa || '01',
        nombre: detalle.nombre?.trim() ?? '',
        apellidoPaterno: detalle.apellidoPaterno?.trim() ?? '',
        apellidoMaterno: detalle.apellidoMaterno?.trim() ?? '',
        sexo: detalle.sexo || 'M',
        fechaNacimiento: detalle.fechaNacimiento ? String(detalle.fechaNacimiento).slice(0, 10) : '',
        indicadorComisiones: detalle.indicadorComisiones === '1',
        codigoCorreo: detalle.codigoCorreo ?? 0,
        correo: detalle.correo?.trim() ?? '',
        codigoCelular: detalle.codigoCelular ?? 0,
        celular: detalle.celular?.trim() ?? '',
      });
    }
  }, [visible, isEdit, detalle, codigo]);

  useEffect(() => { if (!visible) setErrors({}); }, [visible]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const tipos = detalle?.tipoPersonalEmpresa ?? [];

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.nombre.trim()) e.nombre = t.required;
    if (!form.apellidoPaterno.trim() && !form.apellidoMaterno.trim()) {
      e.apellidoPaterno = t.atLeastOneLastName;
      e.apellidoMaterno = ' ';
    }
    if (form.correo.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) e.correo = t.invalidEmail;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    const payload: PersonalPayload = {
      codigoPersonalEmpresa: form.codigoPersonalEmpresa,
      codigoTipoPersonalEmpresa: form.codigoTipoPersonalEmpresa,
      nombre: form.nombre.trim(),
      apellidoPaterno: form.apellidoPaterno.trim(),
      apellidoMaterno: form.apellidoMaterno.trim(),
      sexo: form.sexo,
      fechaNacimiento: form.fechaNacimiento,
      indicadorComisiones: form.indicadorComisiones ? '1' : '0',
      codigoCorreo: form.codigoCorreo,
      correo: form.correo.trim(),
      codigoCelular: form.codigoCelular,
      celular: form.celular.trim(),
      codigoUsuario,
    };
    guardar.mutate(payload, {
      onSuccess: () => { setSnack(t.saved); onDismiss(); },
      onError: () => setSnack(t.saveError),
    });
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={[styles.dialog, { backgroundColor: colors.surface, borderRadius: roundness + 8 }]}
      >
        <Dialog.Title style={{ paddingBottom: 4 }}>
          {isEdit ? t.editTitle : t.newTitle}
        </Dialog.Title>
        <Dialog.ScrollArea style={{ paddingHorizontal: 0, borderTopWidth: 0, borderBottomWidth: 0 }}>
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            {isEdit && isFetching && !detalle ? (
              <View style={styles.centered}><ActivityIndicator animating /><Text variant="bodySmall" style={{ marginTop: 8, color: colors.onSurfaceVariant }}>{t.loadingForm}</Text></View>
            ) : (
              <>
                <SelectField
                  label={t.type}
                  value={form.codigoTipoPersonalEmpresa}
                  options={tipos.map((tp) => ({ value: tp.codigo, label: tp.descripcion }))}
                  onChange={(v) => set('codigoTipoPersonalEmpresa', v)}
                />
                <View style={styles.formRow}>
                  <TextInput
                    mode="outlined" dense label={t.name} value={form.nombre}
                    onChangeText={(v) => set('nombre', v)} error={!!errors.nombre}
                    style={styles.formField} outlineStyle={{ borderRadius: roundness - 4 }}
                  />
                </View>
                {!!errors.nombre && <Text variant="bodySmall" style={{ color: colors.error }}>{errors.nombre}</Text>}
                <View style={styles.formRow}>
                  <TextInput
                    mode="outlined" dense label={t.lastName} value={form.apellidoPaterno}
                    onChangeText={(v) => set('apellidoPaterno', v)} error={!!errors.apellidoPaterno}
                    style={styles.formField} outlineStyle={{ borderRadius: roundness - 4 }}
                  />
                  <TextInput
                    mode="outlined" dense label={t.secondLastName} value={form.apellidoMaterno}
                    onChangeText={(v) => set('apellidoMaterno', v)} error={!!errors.apellidoMaterno}
                    style={styles.formField} outlineStyle={{ borderRadius: roundness - 4 }}
                  />
                </View>
                {!!errors.apellidoPaterno && <Text variant="bodySmall" style={{ color: colors.error }}>{errors.apellidoPaterno}</Text>}
                <View style={styles.formRow}>
                  <DateField
                    label={t.birthdate}
                    value={form.fechaNacimiento}
                    onChange={(v) => set('fechaNacimiento', v)}
                    locale={lang}
                    maxDate={new Date().toISOString().slice(0, 10)}
                    error={errors.fechaNacimiento}
                    style={styles.formField}
                  />
                  <SelectField
                    label={t.sex}
                    value={form.sexo}
                    options={[{ value: 'M', label: t.male }, { value: 'F', label: t.female }]}
                    onChange={(v) => set('sexo', v)}
                    style={styles.formField}
                  />
                </View>
                <View style={styles.formRow}>
                  <TextInput
                    mode="outlined" dense label={t.email} value={form.correo}
                    onChangeText={(v) => set('correo', v)} error={!!errors.correo}
                    keyboardType="email-address" autoCapitalize="none"
                    style={styles.formField} outlineStyle={{ borderRadius: roundness - 4 }}
                  />
                  <TextInput
                    mode="outlined" dense label={t.phone} value={form.celular}
                    onChangeText={(v) => set('celular', v)}
                    keyboardType="phone-pad"
                    style={styles.formField} outlineStyle={{ borderRadius: roundness - 4 }}
                  />
                </View>
                {!!errors.correo && <Text variant="bodySmall" style={{ color: colors.error }}>{errors.correo}</Text>}
                <View style={styles.checkRow}>
                  <Checkbox
                    status={form.indicadorComisiones ? 'checked' : 'unchecked'}
                    onPress={() => set('indicadorComisiones', !form.indicadorComisiones)}
                  />
                  <Text variant="bodyMedium" style={{ flex: 1 }} onPress={() => set('indicadorComisiones', !form.indicadorComisiones)}>
                    {t.showCommissions}
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions style={{ paddingHorizontal: 24, paddingBottom: 20, gap: 8 }}>
          <Button mode="text" onPress={onDismiss} disabled={guardar.isPending}>{t.cancel}</Button>
          <Button
            mode="contained"
            icon="content-save-outline"
            onPress={submit}
            loading={guardar.isPending}
            disabled={guardar.isPending || (isEdit && isFetching && !detalle)}
            style={{ borderRadius: roundness - 4 }}
          >
            {t.save}
          </Button>
        </Dialog.Actions>
      </Dialog>
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>{snack}</Snackbar>
    </Portal>
  );
}

function PersonalActionsMenu({ personal, onEdit, onUser, onPermisos, t }: {
  personal: PersonalAgente;
  onEdit: () => void;
  onUser: () => void;
  onPermisos: () => void;
  t: T;
}) {
  const [open, setOpen] = useState(false);
  const { colors } = useTheme();
  const hasUser = (personal.codigoUsuario ?? 0) > 0;

  const pick = (fn: () => void) => () => { setOpen(false); fn(); };

  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchorPosition="bottom"
      contentStyle={{ backgroundColor: colors.surface }}
      anchor={
        <IconButton
          icon="dots-vertical"
          size={20}
          onPress={() => setOpen(true)}
          accessibilityLabel={t.actions}
        />
      }
    >
      <Menu.Item
        leadingIcon="account-edit-outline"
        title={t.editStaff}
        onPress={pick(onEdit)}
      />
      <Menu.Item
        leadingIcon="account-key-outline"
        title={hasUser ? t.manageUser : t.createUser}
        onPress={pick(onUser)}
      />
      <Menu.Item
        leadingIcon="format-list-checks"
        title={t.permissions}
        onPress={pick(onPermisos)}
        disabled={!hasUser}
      />
      {!hasUser && (
        <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant, paddingHorizontal: 16, paddingBottom: 8 }}>
          {t.noUser}
        </Text>
      )}
    </Menu>
  );
}

function PermisosDialog({ codigoUsuario, nombre, visible, onDismiss, t }: {
  codigoUsuario: number | null;
  nombre: string;
  visible: boolean;
  onDismiss: () => void;
  t: T;
}) {
  const { colors, roundness } = useTheme();
  const { data, isLoading, isError, refetch } = usePermisosPersonal(visible ? codigoUsuario : null);
  const actualizar = useActualizarPermiso();

  const toggle = (codigoOpcion: number, tipoPermiso: '1' | '2') => {
    if (!codigoUsuario) return;
    actualizar.mutate({ codigoOpcion, codigoUsuario, tipoPermiso });
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={[styles.dialog, { backgroundColor: colors.surface, borderRadius: roundness + 8 }]}
      >
        <Dialog.Title style={{ paddingBottom: 4 }}>{t.permissionsTitle}</Dialog.Title>
        {!!nombre && (
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, paddingHorizontal: 24, marginBottom: 8 }}>
            {nombre}
          </Text>
        )}
        <Dialog.ScrollArea style={{ paddingHorizontal: 0, borderTopWidth: 0, borderBottomWidth: 0 }}>
          {isLoading ? (
            <View style={styles.centered}><ActivityIndicator animating /></View>
          ) : isError ? (
            <View style={styles.centered}>
              <Icon source="cloud-off-outline" size={32} color={colors.onSurfaceVariant} />
              <Text variant="titleSmall" style={{ marginTop: 8 }}>{t.error}</Text>
              <Button mode="contained-tonal" icon="refresh" onPress={() => refetch()} style={{ marginTop: 12 }} compact>{t.retry}</Button>
            </View>
          ) : !data?.length ? (
            <View style={styles.centered}>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>{t.noUser}</Text>
            </View>
          ) : (
            <ScrollView>
              <View style={[styles.permHead, { backgroundColor: palette.indigo[500] }]}>
                <Text variant="labelMedium" style={[styles.permCheckCol, { color: '#FFF', textAlign: 'center' }]}>{t.show}</Text>
                <Text variant="labelMedium" style={[styles.permCheckCol, { color: '#FFF', textAlign: 'center' }]}>{t.enable}</Text>
                <Text variant="labelMedium" style={{ color: '#FFF', flex: 1 }}>{t.option}</Text>
              </View>
              {data.map((p) => (
                <View key={p.codigoOpcion} style={[styles.permRow, { borderBottomColor: colors.outlineVariant }]}>
                  <View style={styles.permCheckCol}>
                    <Checkbox
                      status={p.permisoVer === '1' ? 'checked' : 'unchecked'}
                      onPress={() => toggle(p.codigoOpcion, '1')}
                      disabled={actualizar.isPending}
                    />
                  </View>
                  <View style={styles.permCheckCol}>
                    <Checkbox
                      status={p.permisoEjecucion === '1' ? 'checked' : 'unchecked'}
                      onPress={() => toggle(p.codigoOpcion, '2')}
                      disabled={actualizar.isPending}
                    />
                  </View>
                  <Text
                    variant="bodyMedium"
                    style={{ flex: 1, paddingLeft: (p.nivel - 1) * 16, fontFamily: p.nivel === 1 ? 'Inter_600SemiBold' : undefined }}
                  >
                    {p.nombreOpcion}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </Dialog.ScrollArea>
        <Dialog.Actions style={{ paddingHorizontal: 24, paddingBottom: 20 }}>
          <Button mode="contained-tonal" onPress={onDismiss}>{t.cancel}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

function UsuarioDialog({ personal, visible, onDismiss, t }: {
  personal: PersonalAgente | null;
  visible: boolean;
  onDismiss: () => void;
  t: T;
}) {
  const { colors, roundness } = useTheme();
  const crear = useCrearUsuarioPersonal();
  const [form, setForm] = useState({ nombre: '', apellidoPaterno: '', apellidoMaterno: '', nombreUsuario: '', direccionEmail: '', passwordTexto: '' });
  const [snack, setSnack] = useState('');

  useEffect(() => {
    if (visible && personal) {
      setForm({
        nombre: personal.nombre?.trim() ?? '',
        apellidoPaterno: personal.apellidoPaterno?.trim() ?? '',
        apellidoMaterno: personal.apellidoMaterno?.trim() ?? '',
        nombreUsuario: '',
        direccionEmail: '',
        passwordTexto: '',
      });
    }
  }, [visible, personal]);

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const isEdit = (personal?.codigoUsuario ?? 0) > 0;

  const submit = () => {
    if (!personal) return;
    if (!form.nombre.trim() || (!form.apellidoPaterno.trim() && !form.apellidoMaterno.trim())
      || !form.nombreUsuario.trim() || !form.direccionEmail.trim()) {
      setSnack(t.requiredField);
      return;
    }
    if (!isEdit && form.passwordTexto.length < 6) {
      setSnack(t.requiredField);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.direccionEmail.trim())) {
      setSnack(t.invalidEmail);
      return;
    }
    crear.mutate({
      codigoUsuario: personal.codigoUsuario ?? 0,
      codigoPersonalEmpresa: personal.codigoPersonalEmpresa,
      nombre: form.nombre.trim(),
      apellidoPaterno: form.apellidoPaterno.trim(),
      apellidoMaterno: form.apellidoMaterno.trim(),
      nombreUsuario: form.nombreUsuario.trim(),
      direccionEmail: form.direccionEmail.trim(),
      passwordTexto: form.passwordTexto,
    }, {
      onSuccess: () => { setSnack(t.userSaved); onDismiss(); },
      onError: () => setSnack(t.userSaveError),
    });
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={[styles.dialog, { backgroundColor: colors.surface, borderRadius: roundness + 8 }]}
      >
        <Dialog.Title style={{ paddingBottom: 4 }}>{t.userDataTitle}</Dialog.Title>
        <Dialog.ScrollArea style={{ paddingHorizontal: 0, borderTopWidth: 0, borderBottomWidth: 0 }}>
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <View style={styles.formRow}>
              <TextInput mode="outlined" dense label={t.name} value={form.nombre} onChangeText={(v) => set('nombre', v)} style={styles.formField} outlineStyle={{ borderRadius: roundness - 4 }} />
              <TextInput mode="outlined" dense label={t.lastName} value={form.apellidoPaterno} onChangeText={(v) => set('apellidoPaterno', v)} style={styles.formField} outlineStyle={{ borderRadius: roundness - 4 }} />
            </View>
            <TextInput mode="outlined" dense label={t.secondLastName} value={form.apellidoMaterno} onChangeText={(v) => set('apellidoMaterno', v)} outlineStyle={{ borderRadius: roundness - 4 }} />
            <TextInput mode="outlined" dense label={t.email} value={form.direccionEmail} onChangeText={(v) => set('direccionEmail', v)} keyboardType="email-address" autoCapitalize="none" outlineStyle={{ borderRadius: roundness - 4 }} />
            <TextInput mode="outlined" dense label={t.username} value={form.nombreUsuario} onChangeText={(v) => set('nombreUsuario', v)} autoCapitalize="none" outlineStyle={{ borderRadius: roundness - 4 }} />
            {!isEdit && (
              <TextInput mode="outlined" dense label={t.password} value={form.passwordTexto} onChangeText={(v) => set('passwordTexto', v)} secureTextEntry autoCapitalize="none" outlineStyle={{ borderRadius: roundness - 4 }} />
            )}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions style={{ paddingHorizontal: 24, paddingBottom: 20, gap: 8 }}>
          <Button mode="text" onPress={onDismiss} disabled={crear.isPending}>{t.cancel}</Button>
          <Button mode="contained" icon="account-key-outline" onPress={submit} loading={crear.isPending} disabled={crear.isPending} style={{ borderRadius: roundness - 4 }}>
            {t.saveUser}
          </Button>
        </Dialog.Actions>
      </Dialog>
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>{snack}</Snackbar>
    </Portal>
  );
}

export default function PersonalScreen() {
  const user = useAuthStore((s) => s.user);
  const allowed = useRequirePermiso(OPCION.personal);
  const lang = useSettingsStore((s) => s.lang);
  const setLang = useSettingsStore((s) => s.setLang);
  const router = useRouter();
  const logout = useLogout();
  const { colors, roundness } = useTheme();
  const { isDesktop } = useResponsive();
  const t = labels[lang];

  const [search, setSearch] = useState('');
  const [editCodigo, setEditCodigo] = useState<number | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [permPersonal, setPermPersonal] = useState<PersonalAgente | null>(null);
  const [userPersonal, setUserPersonal] = useState<PersonalAgente | null>(null);

  const { canSee, canExecute } = usePermisos();
  const canEdit = canExecute(OPCION.personal);
  const { data, isLoading, isError, refetch, isRefetching } = usePersonalAgente(canSee(OPCION.personal));

  const rows = useMemo(() => {
    const list = data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) =>
      `${p.nombre} ${p.apellidoPaterno} ${p.apellidoMaterno} ${p.descripcionTipoPersonalEmpresa}`.toLowerCase().includes(q),
    );
  }, [data, search]);

  const { page, limit, totalPages, pageItems, goPage, changeLimit } = useClientPagination(rows);

  const openNew = () => { setEditCodigo(0); setFormVisible(true); };
  const openEdit = (p: PersonalAgente) => { setEditCodigo(p.codigoPersonalEmpresa); setFormVisible(true); };

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
      onPersonal={() => {}}
    >
      <View style={styles.header}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="headlineSmall">{t.title}</Text>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>{t.subtitle}</Text>
        </View>
        {canEdit && (
          <Button mode="contained" icon="account-plus-outline" onPress={openNew} style={{ borderRadius: roundness - 4 }}>
            {t.register}
          </Button>
        )}
      </View>

      <Searchbar
        placeholder={t.search}
        value={search}
        onChangeText={setSearch}
        style={[styles.search, { backgroundColor: colors.surface, borderRadius: roundness - 4 }]}
        inputStyle={{ fontSize: 14, minHeight: 0 }}
        elevation={0}
      />

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
            <Icon source="account-group-outline" size={32} color={palette.indigo[500]} />
          </View>
          <Text variant="titleMedium" style={{ marginTop: 12 }}>{search ? t.emptySearch : t.empty}</Text>
          {!search && <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, marginTop: 4 }}>{t.emptyHint}</Text>}
          {!search && canEdit && (
            <Button mode="contained" icon="account-plus-outline" onPress={openNew} style={{ marginTop: 12 }}>{t.register}</Button>
          )}
        </View>
      ) : isDesktop ? (
        <View style={[styles.table, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
          <View style={[styles.tr, styles.th, { borderBottomColor: colors.outlineVariant, backgroundColor: colors.background }]}>
            <Text variant="labelMedium" style={[styles.colType, { color: colors.onSurfaceVariant }]}>{t.type}</Text>
            <Text variant="labelMedium" style={[styles.colName, { color: colors.onSurfaceVariant }]}>{t.name}</Text>
            <Text variant="labelMedium" style={[styles.colSex, { color: colors.onSurfaceVariant }]}>{t.sex}</Text>
            <Text variant="labelMedium" style={[styles.colDate, { color: colors.onSurfaceVariant }]}>{t.birthdate}</Text>
            <Text variant="labelMedium" style={[styles.colUser, { color: colors.onSurfaceVariant }]}>{t.user}</Text>
            {canEdit && <Text variant="labelMedium" style={[styles.colActions, { color: colors.onSurfaceVariant }]}>{t.actions}</Text>}
          </View>
          {pageItems.map((p) => (
            <View key={p.codigoPersonalEmpresa} style={[styles.tr, { borderBottomColor: colors.outlineVariant }]}>
              <View style={[styles.colType, styles.cellRow]}>
                <View style={[styles.typeBadge, { backgroundColor: palette.indigo[50] }]}>
                  <Text variant="labelMedium" style={{ color: palette.indigo[600] }} numberOfLines={1}>
                    {p.descripcionTipoPersonalEmpresa}
                  </Text>
                </View>
              </View>
              <View style={[styles.colName, styles.cellRow]}>
                <Avatar.Text size={30} label={initials(p)} style={{ backgroundColor: palette.indigo[100] }} labelStyle={{ color: palette.indigo[700], fontSize: 11, fontFamily: 'Inter_600SemiBold' }} />
                <Text variant="bodyMedium" style={{ fontFamily: 'Inter_600SemiBold' }} numberOfLines={1}>
                  {[p.nombre, p.apellidoPaterno, p.apellidoMaterno].map((s) => s.trim()).filter(Boolean).join(' ')}
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.colSex}>{p.sexo}</Text>
              <Text variant="bodyMedium" style={styles.colDate}>{fmtDate(p.fechaNacimiento, lang)}</Text>
              <View style={styles.colUser}>
                {p.codigoUsuario ? (
                  <View style={[styles.userBadge, { backgroundColor: `${palette.success}1A` }]}>
                    <Icon source="check-circle-outline" size={13} color={palette.success} />
                    <Text variant="labelMedium" style={{ color: palette.success }}>{t.userCreated}</Text>
                  </View>
                ) : (
                  <Text variant="bodySmall" style={{ color: colors.outline }}>—</Text>
                )}
              </View>
              {canEdit && (
                <View style={styles.colActions}>
                  <PersonalActionsMenu
                    personal={p}
                    onEdit={() => openEdit(p)}
                    onUser={() => setUserPersonal(p)}
                    onPermisos={() => setPermPersonal(p)}
                    t={t}
                  />
                </View>
              )}
            </View>
          ))}
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
          {pageItems.map((p) => (
            <View key={p.codigoPersonalEmpresa} style={[styles.mCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness + 2 }]}>
              <View style={styles.mCardTop}>
                <Avatar.Text size={38} label={initials(p)} style={{ backgroundColor: palette.indigo[100] }} labelStyle={{ color: palette.indigo[700], fontFamily: 'Inter_600SemiBold' }} />
                <View style={{ flex: 1 }}>
                  <Text variant="titleSmall" numberOfLines={1}>
                    {[p.nombre, p.apellidoPaterno, p.apellidoMaterno].map((s) => s.trim()).filter(Boolean).join(' ')}
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>
                    {p.descripcionTipoPersonalEmpresa}
                  </Text>
                </View>
                {!!p.codigoUsuario && (
                  <View style={[styles.userBadge, { backgroundColor: `${palette.success}1A` }]}>
                    <Icon source="check-circle-outline" size={13} color={palette.success} />
                    <Text variant="labelMedium" style={{ color: palette.success }}>{t.userCreated}</Text>
                  </View>
                )}
                {canEdit && (
                  <PersonalActionsMenu
                    personal={p}
                    onEdit={() => openEdit(p)}
                    onUser={() => setUserPersonal(p)}
                    onPermisos={() => setPermPersonal(p)}
                    t={t}
                  />
                )}
              </View>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                {t.sex}: {p.sexo} · {t.birthdate}: {fmtDate(p.fechaNacimiento, lang)}
              </Text>
            </View>
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

      <PersonalFormDialog
        codigo={editCodigo}
        visible={formVisible}
        onDismiss={() => setFormVisible(false)}
        t={t}
        lang={lang}
        codigoUsuario={user?.CodigoUsuario ?? 0}
      />
      <PermisosDialog
        codigoUsuario={permPersonal?.codigoUsuario ?? null}
        nombre={permPersonal ? [permPersonal.nombre, permPersonal.apellidoPaterno, permPersonal.apellidoMaterno].map((s) => s.trim()).filter(Boolean).join(' ') : ''}
        visible={!!permPersonal}
        onDismiss={() => setPermPersonal(null)}
        t={t}
      />
      <UsuarioDialog
        personal={userPersonal}
        visible={!!userPersonal}
        onDismiss={() => setUserPersonal(null)}
        t={t}
      />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  search: { borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  table: { borderWidth: 1, overflow: 'hidden' },
  tr: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  th: { paddingVertical: 10 },
  colType: { flex: 1.2 },
  colName: { flex: 2.4 },
  colSex: { width: 44 },
  colDate: { width: 110 },
  colUser: { width: 100 },
  colActions: { width: 110, alignItems: 'flex-end' },
  cellRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  userBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, alignSelf: 'flex-start' },
  tableFooter: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 0 },
  mPaginator: { borderWidth: 1, overflow: 'hidden' },
  mCard: { borderWidth: 1, padding: 14, gap: 8 },
  mCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dialog: { maxWidth: 640, width: '100%', alignSelf: 'center', maxHeight: '92%' },
  form: { gap: 14, paddingHorizontal: 24, paddingBottom: 8 },
  formRow: { flexDirection: 'row', gap: 12 },
  formField: { flex: 1 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  permHead: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 },
  permRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 2, borderBottomWidth: 1 },
  permCheckCol: { width: 72, alignItems: 'center' },
});
