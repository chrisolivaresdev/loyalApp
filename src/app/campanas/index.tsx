import { Campana, imagenUrl } from '@/api/imagenes';
import { AppShell, Lang } from '@/components/AppShell';
import { useLogout } from '@/hooks/useAuth';
import { useCampanas } from '@/hooks/useImagenes';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { palette } from '@/theme';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Chip,
  Icon,
  IconButton,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';

const labels = {
  es: { title: 'Resultados de Campañas', loading: 'Cargando fotos...', error: 'Error al cargar las fotos', retry: 'Reintentar', empty: 'No hay fotos disponibles', photo: 'Foto' },
  en: { title: 'Campaign Results', loading: 'Loading photos...', error: 'Error loading photos', retry: 'Retry', empty: 'No photos available', photo: 'Photo' },
  pt: { title: 'Resultados de Campanhas', loading: 'Carregando fotos...', error: 'Erro ao carregar as fotos', retry: 'Tentar novamente', empty: 'Sem fotos disponíveis', photo: 'Foto' },
};

function Gallery({ campana, t }: { campana: Campana; t: (typeof labels)['es'] }) {
  const { colors, roundness } = useTheme();
  const [index, setIndex] = useState(0);
  const thumbsRef = useRef<ScrollView>(null);
  const total = campana.fotos.length;
  const cur = campana.fotos[Math.min(index, total - 1)];

  const go = (dir: 1 | -1) => {
    const next = (index + dir + total) % total;
    setIndex(next);
    thumbsRef.current?.scrollTo({ x: Math.max(0, next * 84 - 200), animated: true });
  };

  return (
    <View style={styles.gallery}>
      <View style={[styles.viewer, { borderRadius: roundness + 4, borderColor: colors.outlineVariant }]}>
        <Image
          source={{ uri: imagenUrl(`${campana.carpeta}/${cur}`) }}
          style={styles.viewerImg}
          resizeMode="contain"
        />
        <View style={[styles.navBtn, styles.navLeft]}>
          <IconButton icon="chevron-left" size={28} iconColor="#FFFFFF" onPress={() => go(-1)} style={{ margin: 0 }} />
        </View>
        <View style={[styles.navBtn, styles.navRight]}>
          <IconButton icon="chevron-right" size={28} iconColor="#FFFFFF" onPress={() => go(1)} style={{ margin: 0 }} />
        </View>
        <View style={styles.counter}>
          <Text variant="labelMedium" style={{ color: '#FFFFFF' }}>{t.photo} {index + 1} / {total}</Text>
        </View>
      </View>

      <View style={styles.dots}>
        {campana.fotos.map((f, i) => (
          <View
            key={f}
            style={[
              styles.dot,
              { backgroundColor: i === index ? palette.indigo[500] : colors.outlineVariant, width: i === index ? 18 : 7 },
            ]}
          />
        ))}
      </View>

      <ScrollView ref={thumbsRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbs}>
        {campana.fotos.map((f, i) => (
          <TouchableRipple key={f} onPress={() => setIndex(i)} borderless style={{ borderRadius: 10 }}>
            <Image
              source={{ uri: imagenUrl(`${campana.carpeta}/${f}`) }}
              style={[
                styles.thumb,
                { borderColor: i === index ? palette.indigo[500] : colors.outlineVariant },
                i === index && styles.thumbActive,
              ]}
            />
          </TouchableRipple>
        ))}
      </ScrollView>
    </View>
  );
}

export default function CampanasScreen() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError, refetch, isRefetching } = useCampanas();
  const lang = useSettingsStore((s) => s.lang);
  const setLang = useSettingsStore((s) => s.setLang);
  const router = useRouter();
  const logout = useLogout();
  const { colors, roundness } = useTheme();
  const t = labels[lang];
  const [sel, setSel] = useState(0);

  const campana = data?.[Math.min(sel, (data?.length ?? 1) - 1)];

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator animating size="large" />
          <Text style={{ color: colors.onSurfaceVariant, marginTop: 12 }}>{t.loading}</Text>
        </View>
      );
    }
    if (isError) {
      return (
        <View style={styles.centered}>
          <Icon source="cloud-off-outline" size={40} color={colors.onSurfaceVariant} />
          <Text variant="titleMedium" style={{ marginTop: 8 }}>{t.error}</Text>
          <Button mode="contained-tonal" icon="refresh" onPress={() => refetch()} loading={isRefetching} style={{ marginTop: 12 }}>{t.retry}</Button>
        </View>
      );
    }
    if (!campana) {
      return (
        <View style={styles.centered}>
          <Icon source="image-off-outline" size={40} color={colors.onSurfaceVariant} />
          <Text variant="titleMedium" style={{ marginTop: 8 }}>{t.empty}</Text>
        </View>
      );
    }
    return (
      <>
        {(data?.length ?? 0) > 1 && (
          <View style={styles.tabs}>
            {data!.map((c, i) => (
              <Chip key={c.carpeta} selected={i === sel} onPress={() => { setSel(i); }} mode={i === sel ? 'flat' : 'outlined'}>
                {c.nombre}
              </Chip>
            ))}
          </View>
        )}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness + 2 }]}>
          <Text variant="titleMedium" style={styles.cardTitle}>{campana.nombre}</Text>
          <Gallery key={campana.carpeta} campana={campana} t={t} />
        </View>
      </>
    );
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
      {renderBody()}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 4 },
  tabs: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  card: { borderWidth: 1, padding: 16 },
  cardTitle: { marginBottom: 12 },
  gallery: { gap: 12 },
  viewer: { width: '100%', aspectRatio: 16 / 9, maxHeight: 560, backgroundColor: '#0B0B0B', borderWidth: 1, justifyContent: 'center' },
  viewerImg: { flex: 1, width: '100%' },
  navBtn: { position: 'absolute', top: '45%', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 999 },
  navLeft: { left: 8 },
  navRight: { right: 8 },
  counter: { position: 'absolute', bottom: 10, right: 12, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, flexWrap: 'wrap' },
  dot: { height: 7, borderRadius: 4 },
  thumbs: { gap: 8, paddingVertical: 2 },
  thumb: { width: 76, height: 54, borderRadius: 10, borderWidth: 2, backgroundColor: '#0B0B0B' },
  thumbActive: { borderWidth: 2 },
});
