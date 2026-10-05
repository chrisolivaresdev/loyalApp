import { enviarCorreo } from '@/api/correo';
import { AppShell } from '@/components/AppShell';
import { useLogout } from '@/hooks/useAuth';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { palette } from '@/theme';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    HelperText,
    Icon,
    Snackbar,
    Text,
    TextInput,
    useTheme,
} from 'react-native-paper';

const labels = {
  es: {
    title: 'Envío de Correo',
    to: 'Para', cc: 'Con Copia', subject: 'Asunto', body: 'Texto del Correo',
    send: 'Enviar Correo', sending: 'Enviando…',
    toRequired: 'Ingresá un correo destinatario válido',
    subjectRequired: 'El asunto es requerido',
    ok: 'Correo enviado correctamente', err: 'No se pudo enviar el correo',
  },
  en: {
    title: 'Send Email',
    to: 'To', cc: 'Cc', subject: 'Subject', body: 'Email body',
    send: 'Send Email', sending: 'Sending…',
    toRequired: 'Enter a valid recipient email',
    subjectRequired: 'Subject is required',
    ok: 'Email sent successfully', err: 'Could not send the email',
  },
  pt: {
    title: 'Envio de E-mail',
    to: 'Para', cc: 'Com Cópia', subject: 'Assunto', body: 'Texto do E-mail',
    send: 'Enviar E-mail', sending: 'Enviando…',
    toRequired: 'Insira um e-mail destinatário válido',
    subjectRequired: 'O assunto é obrigatório',
    ok: 'E-mail enviado com sucesso', err: 'Não foi possível enviar o e-mail',
  },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CorreoScreen() {
  const user = useAuthStore((s) => s.user);
  const lang = useSettingsStore((s) => s.lang);
  const setLang = useSettingsStore((s) => s.setLang);
  const router = useRouter();
  const logout = useLogout();
  const { isDesktop } = useResponsive();
  const { colors, roundness } = useTheme();
  const t = labels[lang];

  const [para, setPara] = useState('');
  const [copia, setCopia] = useState('');
  const [asunto, setAsunto] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [formError, setFormError] = useState('');
  const [snack, setSnack] = useState('');

  const sendMutation = useMutation({
    mutationFn: enviarCorreo,
    onSuccess: (r) => {
      setSnack(r.enviado ? t.ok : (r.message || t.err));
      if (r.enviado) { setPara(''); setCopia(''); setAsunto(''); setCuerpo(''); }
    },
    onError: (e: any) => setSnack(e?.response?.data?.message || t.err),
  });

  const send = () => {
    if (!EMAIL_RE.test(para.trim())) return setFormError(t.toRequired);
    if (!asunto.trim()) return setFormError(t.subjectRequired);
    setFormError('');
    sendMutation.mutate({ para: para.trim(), copia: copia.trim() || undefined, asunto: asunto.trim(), cuerpo });
  };

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
      <ScrollView contentContainerStyle={[styles.scroll, !isDesktop && { paddingHorizontal: 0 }]}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness + 2 }]}>
          <View style={styles.titleRow}>
            <View style={[styles.iconBox, { backgroundColor: palette.indigo[50], borderRadius: roundness - 2 }]}>
              <Icon source="email-send-outline" size={20} color={palette.indigo[500]} />
            </View>
            <Text variant="titleMedium">{t.title}</Text>
          </View>

          <TextInput mode="outlined" dense label={t.to} value={para} onChangeText={setPara} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
          <TextInput mode="outlined" dense label={t.cc} value={copia} onChangeText={setCopia} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
          <TextInput mode="outlined" dense label={t.subject} value={asunto} onChangeText={setAsunto} style={styles.input} />
          <TextInput mode="outlined" label={t.body} value={cuerpo} onChangeText={setCuerpo} multiline numberOfLines={8} style={styles.input} />

          {!!formError && <HelperText type="error" visible>{formError}</HelperText>}

          <Button mode="contained" icon="send-outline" onPress={send} loading={sendMutation.isPending} disabled={sendMutation.isPending} style={{ borderRadius: roundness - 4, marginTop: 8 }}>
            {sendMutation.isPending ? t.sending : t.send}
          </Button>
        </View>
      </ScrollView>
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000} onIconPress={() => setSnack('')}>
        {snack}
      </Snackbar>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 8, maxWidth: 720, width: '100%', alignSelf: 'center' },
  card: { borderWidth: 1, padding: 20, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  iconBox: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  input: { backgroundColor: 'transparent' },
});
