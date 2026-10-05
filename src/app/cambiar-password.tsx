import { cambiarPassword, validarSolicitudPassword } from '@/api/auth';
import { useSettingsStore } from '@/stores/settings';
import { palette } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, HelperText, Icon, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Lang = 'es' | 'en' | 'pt';

const labels: Record<Lang, { [key: string]: string }> = {
  es: {
    brand: 'Portal de Agentes',
    title: 'Cambiar contraseña',
    checking: 'Validando enlace…',
    notFound: 'La solicitud ingresada no existe en nuestros registros.',
    expired: 'La solicitud de cambio de contraseña ha vencido.',
    password: 'Nueva contraseña',
    confirm: 'Confirmar contraseña',
    submit: 'Cambiar contraseña',
    ok: 'Contraseña actualizada. Ya podés iniciar sesión con tu nueva contraseña.',
    mismatch: 'Las contraseñas no coinciden',
    tooShort: 'La contraseña debe tener al menos 6 caracteres',
    back: 'Ir al login',
    company: 'Loyal Insurance Group',
  },
  en: {
    brand: 'Agent Portal',
    title: 'Change password',
    checking: 'Validating link…',
    notFound: 'The request entered does not exist in our records.',
    expired: 'The password change request has expired.',
    password: 'New password',
    confirm: 'Confirm password',
    submit: 'Change password',
    ok: 'Password updated. You can now sign in with your new password.',
    mismatch: 'Passwords do not match',
    tooShort: 'Password must be at least 6 characters',
    back: 'Go to sign in',
    company: 'Loyal Insurance Group',
  },
  pt: {
    brand: 'Portal do Agente',
    title: 'Trocar senha',
    checking: 'Validando link…',
    notFound: 'A solicitação informada não existe em nossos registros.',
    expired: 'A solicitação de troca de senha expirou.',
    password: 'Nova senha',
    confirm: 'Confirmar senha',
    submit: 'Trocar senha',
    ok: 'Senha atualizada. Você já pode entrar com sua nova senha.',
    mismatch: 'As senhas não coincidem',
    tooShort: 'A senha deve ter pelo menos 6 caracteres',
    back: 'Ir ao login',
    company: 'Loyal Insurance Group',
  },
};

export default function CambiarPasswordScreen() {
  const { colors, roundness } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const lang = useSettingsStore((s) => s.lang);
  const t = labels[lang];
  const params = useLocalSearchParams<{ IDSolicitud?: string }>();
  const idSolicitud = String(params.IDSolicitud ?? '');

  const [estado, setEstado] = useState<'checking' | 'ok' | 'notFound' | 'expired' | 'done'>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [secure, setSecure] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!idSolicitud) { setEstado('notFound'); return; }
    validarSolicitudPassword(idSolicitud)
      .then((r) => setEstado(r.resultado === 0 ? 'ok' : r.resultado === 2 ? 'expired' : 'notFound'))
      .catch(() => setEstado('notFound'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSolicitud]);

  const onSubmit = async () => {
    setError('');
    if (password.length < 6) return setError(t.tooShort);
    if (password !== confirm) return setError(t.mismatch);
    try {
      setBusy(true);
      await cambiarPassword(idSolicitud, password);
      setEstado('done');
    } catch (e: any) {
      setError(e?.response?.data?.message || t.notFound);
    } finally {
      setBusy(false);
    }
  };

  const icono = estado === 'expired' ? 'clock-alert-outline' : estado === 'notFound' ? 'link-variant-off' : estado === 'done' ? 'check-decagram' : 'lock-reset';
  const mensaje = estado === 'expired' ? t.expired : estado === 'notFound' ? t.notFound : estado === 'done' ? t.ok : '';

  return (
    <LinearGradient colors={[palette.navy[800], palette.navy[950]]} style={styles.flex}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formWrap}>
            <View style={styles.mobileBrand}>
              <View style={styles.logo}>
                <Icon source="shield-check" size={28} color={palette.navy[900]} />
              </View>
              <Text variant="headlineSmall" style={{ color: '#FFFFFF' }}>{t.brand}</Text>
              <Text variant="bodyMedium" style={{ color: palette.navy[200] }}>{t.company}</Text>
            </View>

            <View style={[styles.form, { borderRadius: roundness + 10, backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <View style={{ gap: 4 }}>
                <Text variant="headlineSmall">{t.title}</Text>
              </View>

              {estado === 'checking' && (
                <View style={styles.okBox}>
                  <ActivityIndicator animating size="large" />
                  <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>{t.checking}</Text>
                </View>
              )}

              {estado === 'ok' && (
                <>
                  <View style={{ gap: 12 }}>
                    <TextInput
                      mode="outlined"
                      label={t.password}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={secure}
                      left={<TextInput.Icon icon="lock-outline" />}
                      right={<TextInput.Icon icon={secure ? 'eye-outline' : 'eye-off-outline'} onPress={() => setSecure(!secure)} />}
                      outlineStyle={{ borderRadius: 12 }}
                    />
                    <TextInput
                      mode="outlined"
                      label={t.confirm}
                      value={confirm}
                      onChangeText={setConfirm}
                      secureTextEntry={secure}
                      onSubmitEditing={onSubmit}
                      left={<TextInput.Icon icon="lock-check-outline" />}
                      outlineStyle={{ borderRadius: 12 }}
                    />
                    {!!error && <HelperText type="error" visible>{error}</HelperText>}
                  </View>
                  <Button
                    mode="contained"
                    onPress={onSubmit}
                    loading={busy}
                    disabled={busy || !password || !confirm}
                    contentStyle={{ paddingVertical: 8 }}
                    style={{ borderRadius: 12 }}
                    icon="lock-reset"
                  >
                    {t.submit}
                  </Button>
                </>
              )}

              {(estado === 'expired' || estado === 'notFound' || estado === 'done') && (
                <View style={styles.okBox}>
                  <Icon source={icono} size={40} color={estado === 'done' ? palette.success : palette.warning} />
                  <Text variant="bodyMedium" style={{ textAlign: 'center' }}>{mensaje}</Text>
                </View>
              )}

              <TouchableRipple onPress={() => router.replace('/login' as any)} borderless style={{ borderRadius: 8, alignSelf: 'center' }}>
                <Text variant="labelLarge" style={{ color: colors.primary, padding: 6 }}>{t.back}</Text>
              </TouchableRipple>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  formWrap: { width: '100%', maxWidth: 440, alignSelf: 'center' },
  mobileBrand: { alignItems: 'center', gap: 6, marginBottom: 28 },
  logo: { width: 48, height: 48, borderRadius: 14, backgroundColor: palette.gold[500], alignItems: 'center', justifyContent: 'center' },
  form: { padding: 28, gap: 24, borderWidth: 1 },
  okBox: { alignItems: 'center', gap: 12, paddingVertical: 12 },
});
