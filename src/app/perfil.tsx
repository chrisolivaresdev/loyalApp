import { AppShell, Lang } from '@/components/AppShell';
import { SelectField } from '@/components/SelectField';
import { useLogout } from '@/hooks/useAuth';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { palette } from '@/theme';
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
    image: 'URL de imagen',
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
    image: 'Image URL',
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
    image: 'URL da imagem',
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
  const [imageUrl, setImageUrl] = useState(user?.UsuarioImagen ?? '');
  const [snack, setSnack] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.DireccionEmail ?? '');
      setImageUrl(user.UsuarioImagen ?? '');
    }
  }, [user]);

  const onSave = () => {
    if (!user) return;
    setUser({
      ...user,
      DireccionEmail: email,
      UsuarioImagen: imageUrl,
    });
    setSnack(true);
  };

  const isValidEmail = email.includes('@') && email.includes('.');

  const avatar = useMemo(() => {
    if (imageUrl.trim().startsWith('http')) {
      return <Image source={{ uri: imageUrl }} style={[styles.image, { borderRadius: roundness }]} />;
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
              onPress={() => {}}
              style={{ marginTop: 16, borderRadius: roundness - 4 }}
              disabled
            >
              {t.changeImage}
            </Button>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginTop: 8 }}>
              {t.image}
            </Text>
            <TextInput
              mode="outlined"
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="https://..."
              style={{ width: '100%', maxWidth: 360, marginTop: 8 }}
              autoCapitalize="none"
              outlineStyle={{ borderRadius: roundness - 4 }}
            />
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
  image: { width: 120, height: 120 },
  card: { padding: 8, borderWidth: 1, borderColor: 'transparent' },
  field: { gap: 2 },
  actions: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
});
