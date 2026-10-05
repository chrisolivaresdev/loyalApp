import { actualizarImagenPerfil, getImagenPerfil, OPCION } from '@/api/agent';
import { AppShell, Lang } from '@/components/AppShell';
import { SelectField } from '@/components/SelectField';
import { useLogout } from '@/hooks/useAuth';
import { useRequirePermiso } from '@/hooks/usePermisos';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { palette } from '@/theme';
import { avatarImageUri } from '@/utils/avatar';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, HelperText, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const labels: Record<Lang, { [key: string]: string }> = {
  es: {
    profile: 'Mi perfil',
    subtitle: 'Gestioná tu información de agente',
    name: 'Nombre completo',
    agentCode: 'Código de agente',
    role: 'Rol',
    email: 'Correo electrónico',
    phone: 'Teléfono',
    country: 'País',
    image: 'JPG, PNG o WebP — máx. 2 MB',
    changeImage: 'Cambiar imagen',
    save: 'Guardar cambios',
    saved: 'Perfil actualizado',
    required: 'Requerido',
    back: 'Volver',
    personalInfo: 'Información personal',
    account: 'Cuenta',
  },
  en: {
    profile: 'My profile',
    subtitle: 'Manage your agent information',
    name: 'Full name',
    agentCode: 'Agent code',
    role: 'Role',
    email: 'Email',
    phone: 'Phone',
    country: 'Country',
    image: 'JPG, PNG or WebP — max. 2 MB',
    changeImage: 'Change image',
    save: 'Save changes',
    saved: 'Profile updated',
    required: 'Required',
    back: 'Back',
    personalInfo: 'Personal information',
    account: 'Account',
  },
  pt: {
    profile: 'Meu perfil',
    subtitle: 'Gerencie suas informações de agente',
    name: 'Nome completo',
    agentCode: 'Código do agente',
    role: 'Função',
    email: 'E-mail',
    phone: 'Telefone',
    country: 'País',
    image: 'JPG, PNG ou WebP — máx. 2 MB',
    changeImage: 'Alterar imagem',
    save: 'Salvar alterações',
    saved: 'Perfil atualizado',
    required: 'Obrigatório',
    back: 'Voltar',
    personalInfo: 'Informações pessoais',
    account: 'Conta',
  },
};

const getInitials = (name: string) =>
  name.trim().split(/\s+/).filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase();

// Web no tiene expo-image-manipulator → redimensionar con canvas (API máx. 2 MB)
const resizeImageWeb = (uri: string, size: number): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, size / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('canvas'));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => reject(new Error('image'));
    img.src = uri;
  });

const COUNTRIES: Record<Lang, { value: string; label: string }[]> = {
  es: [
    { value: 'US', label: 'Estados Unidos' },
    { value: 'VE', label: 'Venezuela' },
    { value: 'CO', label: 'Colombia' },
    { value: 'MX', label: 'México' },
    { value: 'AR', label: 'Argentina' },
    { value: 'CL', label: 'Chile' },
    { value: 'PE', label: 'Perú' },
    { value: 'DO', label: 'República Dominicana' },
    { value: 'PA', label: 'Panamá' },
    { value: 'CR', label: 'Costa Rica' },
    { value: 'GT', label: 'Guatemala' },
    { value: 'EC', label: 'Ecuador' },
    { value: 'BO', label: 'Bolivia' },
    { value: 'PY', label: 'Paraguay' },
    { value: 'UY', label: 'Uruguay' },
  ],
  en: [
    { value: 'US', label: 'United States' },
    { value: 'VE', label: 'Venezuela' },
    { value: 'CO', label: 'Colombia' },
    { value: 'MX', label: 'Mexico' },
    { value: 'AR', label: 'Argentina' },
    { value: 'CL', label: 'Chile' },
    { value: 'PE', label: 'Peru' },
    { value: 'DO', label: 'Dominican Republic' },
    { value: 'PA', label: 'Panama' },
    { value: 'CR', label: 'Costa Rica' },
    { value: 'GT', label: 'Guatemala' },
    { value: 'EC', label: 'Ecuador' },
    { value: 'BO', label: 'Bolivia' },
    { value: 'PY', label: 'Paraguay' },
    { value: 'UY', label: 'Uruguay' },
  ],
  pt: [
    { value: 'US', label: 'Estados Unidos' },
    { value: 'VE', label: 'Venezuela' },
    { value: 'CO', label: 'Colômbia' },
    { value: 'MX', label: 'México' },
    { value: 'AR', label: 'Argentina' },
    { value: 'CL', label: 'Chile' },
    { value: 'PE', label: 'Peru' },
    { value: 'DO', label: 'República Dominicana' },
    { value: 'PA', label: 'Panamá' },
    { value: 'CR', label: 'Costa Rica' },
    { value: 'GT', label: 'Guatemala' },
    { value: 'EC', label: 'Equador' },
    { value: 'BO', label: 'Bolívia' },
    { value: 'PY', label: 'Paraguai' },
    { value: 'UY', label: 'Uruguai' },
  ],
};

export default function PerfilScreen() {
  const router = useRouter();
  const allowed = useRequirePermiso(OPCION.perfil);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useLogout();
  const { colors, roundness } = useTheme();
  const { isDesktop } = useResponsive();
  const insets = useSafeAreaInsets();
  const lang = useSettingsStore((s) => s.lang);
  const setLang = useSettingsStore((s) => s.setLang);
  const t = labels[lang];

  const [email, setEmail] = useState(user?.DireccionEmail ?? '');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [imageUrl, setImageUrl] = useState(() => avatarImageUri(user?.UsuarioImagen) ?? '');
  const [snack, setSnack] = useState(false);
  const [imgError, setImgError] = useState('');

  useEffect(() => {
    if (user) {
      setEmail(user.DireccionEmail ?? '');
      setImageUrl(avatarImageUri(user.UsuarioImagen) ?? '');
    }
  }, [user]);

  // Carga la foto almacenada en la BD si aún no está en el perfil
  useQuery({
    queryKey: ['imagen-perfil'],
    enabled: !imageUrl,
    queryFn: () =>
      getImagenPerfil().then((r) => {
        if (r.imagen) setImageUrl(r.imagen);
        return r.imagen;
      }),
  });

  const uploadImg = useMutation({
    mutationFn: actualizarImagenPerfil,
    onSuccess: (_r, dataUri) => {
      setImageUrl(dataUri);
      if (user) setUser({ ...user, UsuarioImagen: dataUri });
      setSnack(true);
    },
    onError: (e: any) => setImgError(e?.response?.data?.message || 'Error'),
  });

  const pickImage = async () => {
    try {
      setImgError('');
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: Platform.OS !== 'web', // recorte cuadrado nativo
        aspect: [1, 1],
        quality: 0.9,
        base64: true,
      });
      const asset = res.assets?.[0];
      if (res.canceled || !asset?.uri) return;

      // Comprimir antes de subir: las fotos del teléfono superan el límite del API (2 MB)
      const dataUri = Platform.OS === 'web'
        ? await resizeImageWeb(asset.uri, 480)
        : `data:image/jpeg;base64,${(
            await ImageManipulator.manipulateAsync(
              asset.uri,
              [{ resize: { width: 480 } }],
              { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG, base64: true },
            )
          ).base64}`;
      uploadImg.mutate(dataUri);
    } catch (e: any) {
      setImgError(e?.message || 'Error');
    }
  };

  const onSave = () => {
    if (!user) return;
    setUser({
      ...user,
      DireccionEmail: email,
    });
    setSnack(true);
  };

  const isValidEmail = email.includes('@') && email.includes('.');

  const avatar = useMemo(() => {
    if (imageUrl) {
      return <Image source={{ uri: imageUrl }} style={styles.image} />;
    }
    return (
      <Avatar.Text
        size={120}
        label={getInitials(user?.NombreCompletoUsuario ?? 'A')}
        style={{ backgroundColor: palette.indigo[500] }}
        labelStyle={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 40 }}
      />
    );
  }, [imageUrl, user, roundness]);

  if (!allowed) return null;

  return (
    <AppShell
      title={t.profile}
      userName={user?.NombreCompletoUsuario ?? ''}
      userRole={user?.NombrePerfil}
      lang={lang}
      onLangChange={setLang}
      onProfile={() => {}}
      onHome={() => router.push('/dashboard' as any)}
      onCotizaciones={() => router.push('/cotizaciones' as any)}
      onSolicitudes={() => router.push('/solicitudes' as any)}
      onPolizas={() => router.push('/polizas' as any)}
      onLogout={() => logout.mutate()}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="headlineSmall">{t.profile}</Text>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>{t.subtitle}</Text>
            </View>
          </View>

          <View style={[styles.avatarWrap, { marginBottom: 24 }]}>
            {avatar}
            <Button
              mode="contained"
              icon="camera"
              onPress={pickImage}
              style={{ marginTop: 16, borderRadius: roundness - 4 }}
              loading={uploadImg.isPending}
              disabled={uploadImg.isPending}
            >
              {t.changeImage}
            </Button>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginTop: 8 }}>
              {t.image}
            </Text>
            {!!imgError && (
              <HelperText type="error" visible>{imgError}</HelperText>
            )}
          </View>

          <Card style={[styles.card, { borderRadius: roundness, backgroundColor: colors.surface }]}>
            <Card.Title title={t.personalInfo} />
            <Card.Content style={{ gap: 14 }}>
              <View style={styles.field}>
                <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>{t.name}</Text>
                <Text variant="bodyLarge">{user?.NombreCompletoUsuario ?? '—'}</Text>
              </View>
              <View style={styles.field}>
                <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>{t.agentCode}</Text>
                <Text variant="bodyLarge">{user?.CodigoAgente ?? user?.CodigoPersonalInterno ?? '—'}</Text>
              </View>
              <View style={styles.field}>
                <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>{t.role}</Text>
                <Text variant="bodyLarge">{user?.NombrePerfil ?? '—'}</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.card, { borderRadius: roundness, backgroundColor: colors.surface }]}>
            <Card.Title title={t.account} />
            <Card.Content style={{ gap: 14 }}>
              <TextInput
                mode="outlined"
                label={t.email}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                outlineStyle={{ borderRadius: roundness - 4 }}
              />
              {!!email && !isValidEmail && (
                <HelperText type="error" visible>
                  {t.required}
                </HelperText>
              )}
              <TextInput
                mode="outlined"
                label={t.phone}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                outlineStyle={{ borderRadius: roundness - 4 }}
              />
              <SelectField
                label={t.country}
                value={country}
                onChange={setCountry}
                options={COUNTRIES[lang]}
                placeholder={t.country}
              />
            </Card.Content>
          </Card>

          <View style={styles.actions}>
            <Button
              mode="contained"
              icon="content-save"
              onPress={onSave}
              disabled={!isValidEmail}
              style={{ borderRadius: roundness - 4 }}
            >
              {t.save}
            </Button>
            <Button
              mode="outlined"
              onPress={() => router.push('/dashboard' as any)}
              style={{ borderRadius: roundness - 4 }}
            >
              {t.back}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snack}
        onDismiss={() => setSnack(false)}
        duration={3000}
        style={{ backgroundColor: palette.success }}
      >
        {t.saved}
      </Snackbar>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 20, maxWidth: 760, alignSelf: 'center', width: '100%' },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 },
  avatarWrap: { alignItems: 'center', gap: 4 },
  image: { width: 120, height: 120, borderRadius: 60 },
  card: { padding: 8, borderWidth: 1, borderColor: 'transparent' },
  field: { gap: 2 },
  actions: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
});
