import { solicitarCambioPassword } from '@/api/auth';
import { useSettingsStore } from '@/stores/settings';
import { palette } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Icon, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Lang = 'es' | 'en' | 'pt';

const labels: Record<Lang, { [key: string]: string }> = {
  es: {
    brand: 'Portal de Agentes',
    title: 'Recuperar contraseña',
    hint: 'Ingresá tu usuario y el correo registrado. Te enviaremos un enlace para cambiar tu contraseña.',
    username: 'Usuario',
    email: 'Correo registrado',
    submit: 'Enviar enlace',
    ok: 'Tu solicitud fue procesada. Revisá tu correo para las instrucciones de cambio de contraseña.',
    error: 'El usuario y correo ingresados no se encuentran en nuestros registros.',
    back: 'Volver al login',
    company: 'Loyal Insurance Group',
  },
  en: {
    brand: 'Agent Portal',
    title: 'Recover password',
    hint: 'Enter your username and registered email. We will send you a link to change your password.',
    username: 'Username',
    email: 'Registered email',
    submit: 'Send link',
    ok: 'Your request was processed. Check your email for password reset instructions.',
    error: 'The username and email entered are not in our records.',
    back: 'Back to sign in',
    company: 'Loyal Insurance Group',
  },
  pt: {
    brand: 'Portal do Agente',
    title: 'Recuperar senha',
    hint: 'Insira seu usuário e o e-mail registrado. Enviaremos um link para trocar sua senha.',
    username: 'Usuário',
    email: 'E-mail registrado',
    submit: 'Enviar link',
    ok: 'Sua solicitação foi processada. Verifique seu e-mail para as instruções de troca de senha.',
    error: 'O usuário e o e-mail informados não estão em nossos registros.',
    back: 'Voltar ao login',
    company: 'Loyal Insurance Group',
  },
};

export default function RecuperarScreen() {
  const { colors, roundness } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const lang = useSettingsStore((s) => s.lang);
  const t = labels[lang];

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    try {
      setBusy(true);
      setError('');
      const res = await solicitarCambioPassword(username, email);
      if (res.resultado === 0) setOk(true);
      else setError(res.message || t.error);
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  };

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
                <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>{t.hint}</Text>
              </View>

              {ok ? (
                <View style={styles.okBox}>
                  <Icon source="email-check-outline" size={40} color={palette.success} />
                  <Text variant="bodyMedium" style={{ textAlign: 'center' }}>{t.ok}</Text>
                </View>
              ) : (
                <>
                  <View style={{ gap: 12 }}>
                    <TextInput
                      mode="outlined"
                      label={t.username}
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                      left={<TextInput.Icon icon="account-outline" />}
                      outlineStyle={{ borderRadius: 12 }}
                    />
                    <TextInput
                      mode="outlined"
                      label={t.email}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      onSubmitEditing={onSubmit}
                      left={<TextInput.Icon icon="email-outline" />}
                      outlineStyle={{ borderRadius: 12 }}
                    />
                    {!!error && <HelperText type="error" visible>{error}</HelperText>}
                  </View>
                  <Button
                    mode="contained"
                    onPress={onSubmit}
                    loading={busy}
                    disabled={busy || !username.trim() || !email.trim()}
                    contentStyle={{ paddingVertical: 8 }}
                    style={{ borderRadius: 12 }}
                    icon="email-send-outline"
                  >
                    {t.submit}
                  </Button>
                </>
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
