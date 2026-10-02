import { useLogin } from '@/hooks/useAuth';
import { useResponsive } from '@/hooks/useResponsive';
import { useSettingsStore } from '@/stores/settings';
import { palette } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Icon, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Lang = 'es' | 'en' | 'pt';

const labels: Record<Lang, { [key: string]: string }> = {
  es: {
    brand: 'Portal de Agentes',
    tagline: 'Toda la información de tu cartera, producción y comisiones, organizada para que vendas más y mejor.',
    login: 'Iniciar sesión',
    loginHint: 'Ingresá tus credenciales para acceder a tu panel',
    username: 'Usuario',
    password: 'Contraseña',
    submit: 'Ingresar',
    error: 'Usuario o contraseña incorrectos',
    highlights: 'Seguimiento de producción y comisiones en tiempo real;Cotizaciones, solicitudes y pólizas en un solo lugar;Acceso seguro desde web y dispositivos móviles',
    company: 'Loyal Insurance Group',
    secure: 'Conexión segura · Tus datos están protegidos',
  },
  en: {
    brand: 'Agent Portal',
    tagline: 'All your portfolio, production and commission information, organized to help you sell more and better.',
    login: 'Sign in',
    loginHint: 'Enter your credentials to access your dashboard',
    username: 'Username',
    password: 'Password',
    submit: 'Sign in',
    error: 'Invalid username or password',
    highlights: 'Real-time production and commission tracking;Quotes, applications and policies in one place;Secure access from web and mobile devices',
    company: 'Loyal Insurance Group',
    secure: 'Secure connection · Your data is protected',
  },
  pt: {
    brand: 'Portal do Agente',
    tagline: 'Toda a informação da sua carteira, produção e comissões, organizada para vender mais e melhor.',
    login: 'Entrar',
    loginHint: 'Insira suas credenciais para acessar seu painel',
    username: 'Usuário',
    password: 'Senha',
    submit: 'Entrar',
    error: 'Usuário ou senha incorretos',
    highlights: 'Acompanhamento de produção e comissões em tempo real;Cotações, solicitações e apólices em um só lugar;Acesso seguro pela web e dispositivos móveis',
    company: 'Loyal Insurance Group',
    secure: 'Conexão segura · Seus dados estão protegidos',
  },
};

const highlights = (lang: Lang) =>
  labels[lang].highlights.split(';').map((text, i) => ({
    text,
    icon: ['chart-line', 'file-document-multiple-outline', 'shield-lock-outline'][i],
  }));

function BrandPanel({ lang }: { lang: Lang }) {
  const t = labels[lang];
  return (
    <LinearGradient
      colors={[palette.navy[800], palette.navy[950]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.brandPanel}
    >
      <View style={styles.brandTop}>
        <View style={styles.logo}>
          <Icon source="shield-check" size={28} color={palette.navy[900]} />
        </View>
        <Text variant="titleLarge" style={{ color: '#FFFFFF' }}>Loyal</Text>
      </View>
      <View style={{ gap: 12 }}>
        <Text variant="displaySmall" style={{ color: '#FFFFFF' }}>
          {t.brand}
        </Text>
        <Text variant="bodyLarge" style={{ color: palette.navy[200], maxWidth: 420 }}>
          {t.tagline}
        </Text>
        <View style={{ gap: 14, marginTop: 20 }}>
          {highlights(lang).map((h) => (
            <View key={h.text} style={styles.highlight}>
              <View style={styles.highlightIcon}>
                <Icon source={h.icon} size={18} color={palette.gold[300]} />
              </View>
              <Text variant="bodyMedium" style={{ color: palette.navy[100], flex: 1 }}>
                {h.text}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <Text variant="labelSmall" style={{ color: palette.navy[400] }}>
        © {new Date().getFullYear()} Loyal Insurance Group
      </Text>
    </LinearGradient>
  );
}

export default function LoginScreen() {
  const { colors, roundness } = useTheme();
  const { isDesktop } = useResponsive();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const lang = useSettingsStore((s) => s.lang);
  const setLang = useSettingsStore((s) => s.setLang);
  const t = labels[lang];
  const login = useLogin();

  const onSubmit = () => {
    if (username && password) login.mutate({ username, password });
  };

  const form = (
    <View style={styles.formWrap}>
      {!isDesktop && (
        <View style={styles.mobileBrand}>
          <View style={styles.logo}>
            <Icon source="shield-check" size={28} color={palette.navy[900]} />
          </View>
          <Text variant="headlineSmall" style={{ color: '#FFFFFF' }}>{t.brand}</Text>
          <Text variant="bodyMedium" style={{ color: palette.navy[200] }}>{t.company}</Text>
        </View>
      )}

      <View
        style={[
          styles.form,
          { borderRadius: roundness + 10, backgroundColor: colors.surface, borderColor: colors.outlineVariant },
        ]}
      >
        <View style={styles.langRow}>
          <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>{lang.toUpperCase()}</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableRipple onPress={() => setLang('es')} borderless style={{ borderRadius: roundness - 6 }}>
              <View style={[styles.langBtn, lang === 'es' && { backgroundColor: colors.primary }]}>
                <Text variant="labelSmall" style={{ color: lang === 'es' ? colors.onPrimary : colors.onSurface }}>ES</Text>
              </View>
            </TouchableRipple>
            <TouchableRipple onPress={() => setLang('en')} borderless style={{ borderRadius: roundness - 6 }}>
              <View style={[styles.langBtn, lang === 'en' && { backgroundColor: colors.primary }]}>
                <Text variant="labelSmall" style={{ color: lang === 'en' ? colors.onPrimary : colors.onSurface }}>EN</Text>
              </View>
            </TouchableRipple>
            <TouchableRipple onPress={() => setLang('pt')} borderless style={{ borderRadius: roundness - 6 }}>
              <View style={[styles.langBtn, lang === 'pt' && { backgroundColor: colors.primary }]}>
                <Text variant="labelSmall" style={{ color: lang === 'pt' ? colors.onPrimary : colors.onSurface }}>PT</Text>
              </View>
            </TouchableRipple>
          </View>
        </View>
        <View style={{ gap: 4 }}>
          <Text variant="headlineSmall">{t.login}</Text>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
            {t.loginHint}
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          <TextInput
            mode="outlined"
            label={t.username}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoComplete="username"
            left={<TextInput.Icon icon="account-outline" />}
            outlineStyle={{ borderRadius: 12 }}
          />
          <TextInput
            mode="outlined"
            label={t.password}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secure}
            autoComplete="password"
            onSubmitEditing={onSubmit}
            left={<TextInput.Icon icon="lock-outline" />}
            right={<TextInput.Icon icon={secure ? 'eye-outline' : 'eye-off-outline'} onPress={() => setSecure(!secure)} />}
            outlineStyle={{ borderRadius: 12 }}
          />
          {login.isError && (
            <HelperText type="error" visible>
              {t.error}
            </HelperText>
          )}
        </View>

        <Button
          mode="contained"
          onPress={onSubmit}
          loading={login.isPending}
          disabled={login.isPending || !username || !password}
          contentStyle={{ paddingVertical: 8 }}
          style={{ borderRadius: 12 }}
          icon="arrow-right"
        >
          {t.submit}
        </Button>

        <View style={styles.secure}>
          <Icon source="lock-check-outline" size={14} color={colors.onSurfaceVariant} />
          <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
            {t.secure}
          </Text>
        </View>
      </View>
    </View>
  );

  if (isDesktop) {
    return (
      <View style={[styles.desktop, { backgroundColor: colors.background }]}>
        <BrandPanel lang={lang} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.desktopForm}>
          {form}
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <LinearGradient colors={[palette.navy[800], palette.navy[950]]} style={styles.flex}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={[styles.mobileScroll, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          {form}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  desktop: { flex: 1, flexDirection: 'row' },
  desktopForm: { flex: 1, justifyContent: 'center', padding: 48 },
  brandPanel: { flex: 1.1, padding: 56, justifyContent: 'space-between' },
  brandTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 48, height: 48, borderRadius: 14, backgroundColor: palette.gold[500], alignItems: 'center', justifyContent: 'center' },
  highlight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  highlightIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  mobileScroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  mobileBrand: { alignItems: 'center', gap: 6, marginBottom: 28 },
  formWrap: { width: '100%', maxWidth: 440, alignSelf: 'center' },
  form: { padding: 28, gap: 24, borderWidth: 1 },
  secure: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  langRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  langBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
