import { constanciaUrl, OPCION } from '@/api/agent';
import { archivoRecursoUrl, RecursoCategoria, RecursoDocumento } from '@/api/recursos';
import { AppShell } from '@/components/AppShell';
import { useLogout } from '@/hooks/useAuth';
import { usePermisos, useRequirePermiso } from '@/hooks/usePermisos';
import { useRecursos } from '@/hooks/useRecursos';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { palette } from '@/theme';
import { abrirArchivoAutenticado } from '@/utils/downloadFile';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Button,
    Icon,
    Searchbar,
    Text,
    TouchableRipple,
    useTheme,
} from 'react-native-paper';

const labels = {
  es: { title: 'Recursos del Agente', subtitle: 'Documentos, planillas y materiales de apoyo', search: 'Buscar documento...', loading: 'Cargando recursos...', error: 'Error al cargar los recursos', retry: 'Reintentar', empty: 'Sin resultados', docs: 'documentos', openDoc: 'Abrir', constancia: 'Constancia de Agente' },
  en: { title: 'Agent Resources', subtitle: 'Documents, forms and support materials', search: 'Search document...', loading: 'Loading resources...', error: 'Error loading resources', retry: 'Retry', empty: 'No results', docs: 'documents', openDoc: 'Open', constancia: 'Agent Certificate' },
  pt: { title: 'Recursos do Agente', subtitle: 'Documentos, formulários e materiais de apoio', search: 'Buscar documento...', loading: 'Carregando recursos...', error: 'Erro ao carregar os recursos', retry: 'Tentar novamente', empty: 'Sem resultados', docs: 'documentos', openDoc: 'Abrir', constancia: 'Constância de Agente' },
};

const extIcon = (archivo = '', url = '') => {
  const ext = (archivo || url).split('?')[0].split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'file-pdf-box';
  if (['xls', 'xlsx', 'xlsm'].includes(ext ?? '')) return 'file-excel-box';
  if (['doc', 'docx'].includes(ext ?? '')) return 'file-word-box';
  return 'file-document-outline';
};

const extColor = (archivo = '', url = '') => {
  const ext = (archivo || url).split('?')[0].split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return '#D32F2F';
  if (['xls', 'xlsx', 'xlsm'].includes(ext ?? '')) return '#2E7D32';
  if (['doc', 'docx'].includes(ext ?? '')) return '#1565C0';
  return palette.indigo[500];
};

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function countDocs(cat: RecursoCategoria): number {
  return (cat.documentos?.length ?? 0) + (cat.subcategorias ?? []).reduce((s, c) => s + countDocs(c), 0);
}

function matchesQuery(cat: RecursoCategoria, q: string): RecursoCategoria | null {
  if (!q) return cat;
  const docs = (cat.documentos ?? []).filter((d) => normalize(d.nombre).includes(q));
  const subs = (cat.subcategorias ?? [])
    .map((c) => matchesQuery(c, q))
    .filter((c): c is RecursoCategoria => c !== null);
  const selfMatch = normalize(cat.nombre).includes(q);
  if (selfMatch || docs.length || subs.length) {
    return { ...cat, documentos: selfMatch ? cat.documentos : docs, subcategorias: selfMatch ? cat.subcategorias : subs };
  }
  return null;
}

export default function RecursosScreen() {
  const user = useAuthStore((s) => s.user);
  const allowed = useRequirePermiso(OPCION.recursosAgente);
  const { canSee, canExecute } = usePermisos();
  const canOpen = canExecute(OPCION.recursosAgente);
  const { data, isLoading, isError, refetch, isRefetching } = useRecursos(canSee(OPCION.recursosAgente));
  const lang = useSettingsStore((s) => s.lang);
  const setLang = useSettingsStore((s) => s.setLang);
  const router = useRouter();
  const logout = useLogout();
  const { colors, roundness } = useTheme();
  const { isDesktop } = useResponsive();
  const t = labels[lang];
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [opening, setOpening] = useState('');

  const openDoc = async (doc: RecursoDocumento) => {
    if (!canOpen) return;
    const url = doc.url ?? (doc.archivo ? archivoRecursoUrl(doc.archivo) : '');
    if (!url) return;
    const key = doc.nombre;
    try {
      setOpening(key);
      if (doc.url) {
        // URL externa (no requiere sesión)
        if (Platform.OS === 'web') window.open(doc.url, '_blank');
        else await Linking.openURL(doc.url);
      } else {
        // Archivo del backend: requiere la cookie de sesión (window.open da 401)
        const fileName = doc.archivo!.split('/').pop() ?? 'documento';
        await abrirArchivoAutenticado(url, fileName);
      }
    } catch {
      // silencioso: el usuario puede reintentar
    } finally {
      setOpening('');
    }
  };

  /** Descarga la constancia del agente (portal: Home/DownloadConstancia). */
  const openConstancia = async () => {
    if (!canOpen || opening === t.constancia) return;
    setOpening(t.constancia);
    try {
      const url = constanciaUrl();
      await abrirArchivoAutenticado(url, 'constancia-agente.pdf', 'application/pdf');
    } catch { /* silencioso */ } finally {
      setOpening('');
    }
  };

  const renderDoc = (doc: RecursoDocumento, depth: number, key: string) => (
    <TouchableRipple key={key} onPress={canOpen ? () => openDoc(doc) : undefined} disabled={!canOpen} borderless>
      <View style={[styles.docRow, { paddingLeft: depth * 18 + 16, borderBottomColor: colors.outlineVariant }]}>
        <Icon source={extIcon(doc.archivo, doc.url)} size={20} color={extColor(doc.archivo, doc.url)} />
        <Text variant="bodyMedium" style={{ flex: 1, color: canOpen ? palette.indigo[600] : colors.onSurfaceVariant }} numberOfLines={2}>
          {doc.nombre}
        </Text>
        {opening === doc.nombre
          ? <ActivityIndicator size={16} />
          : canOpen && <Icon source={doc.url ? 'open-in-new' : 'download-outline'} size={16} color={colors.onSurfaceVariant} />}
      </View>
    </TouchableRipple>
  );

  const renderCategory = (cat: RecursoCategoria, depth: number, path: string) => {
    const isOpen = search.trim().length > 0 || !!expanded[path];
    const docs = countDocs(cat);
    return (
      <View key={path}>
        <TouchableRipple onPress={() => setExpanded((e) => ({ ...e, [path]: !e[path] }))} borderless>
          <View style={[styles.catRow, { paddingLeft: depth * 18 + 14 }]}>
            <Icon source="folder-outline" size={20} color={palette.gold[600] ?? '#C9A227'} />
            <Text variant="labelLarge" style={{ flex: 1, fontFamily: 'Inter_600SemiBold' }}>{cat.nombre}</Text>
            <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>{docs} {t.docs}</Text>
            <Icon source={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.onSurfaceVariant} />
          </View>
        </TouchableRipple>
        {isOpen && (
          <View>
            {(cat.documentos ?? []).map((d, i) => renderDoc(d, depth + 1, `${path}-d${i}`))}
            {(cat.subcategorias ?? []).map((c, i) => renderCategory(c, depth + 1, `${path}-s${i}`))}
          </View>
        )}
      </View>
    );
  };

  const q = normalize(search.trim());
  const filtered = (data ?? [])
    .map((c) => matchesQuery(c, q))
    .filter((c): c is RecursoCategoria => c !== null);

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
    if (filtered.length === 0) {
      return (
        <View style={styles.centered}>
          <Icon source="folder-search-outline" size={40} color={colors.onSurfaceVariant} />
          <Text variant="titleMedium" style={{ marginTop: 8 }}>{t.empty}</Text>
        </View>
      );
    }
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness + 2 }]}>
        {filtered.map((c, i) => renderCategory(c, 0, `c${i}`))}
      </View>
    );
  };

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
      onComisiones={() => router.push('/comisiones' as any)}
      onAgentes={() => router.push('/agentes' as any)}
      onPersonal={() => router.push('/personal' as any)}
      onBack={() => (router.canGoBack() ? router.back() : router.push('/dashboard' as any))}
    >
      <View style={styles.header}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="headlineSmall">{t.title}</Text>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>{t.subtitle}</Text>
        </View>
      </View>

      {canOpen && (
        <TouchableRipple onPress={openConstancia} borderless>
          <View style={[styles.constanciaRow, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness + 2 }]}>
            <View style={[styles.constanciaIcon, { backgroundColor: palette.indigo[50], borderRadius: roundness - 2 }]}>
              <Icon source="file-certificate-outline" size={20} color={palette.indigo[500]} />
            </View>
            <Text variant="bodyMedium" style={{ flex: 1, fontFamily: 'Inter_600SemiBold', color: palette.indigo[600] }}>{t.constancia}</Text>
            {opening === t.constancia ? <ActivityIndicator size={16} /> : <Icon source="download-outline" size={18} color={colors.onSurfaceVariant} />}
          </View>
        </TouchableRipple>
      )}

      <Searchbar
        placeholder={t.search}
        value={search}
        onChangeText={setSearch}
        style={[styles.search, { backgroundColor: colors.surface, borderRadius: roundness - 4 }]}
        inputStyle={{ fontSize: 14, minHeight: 0 }}
        elevation={0}
      />

      {renderBody()}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  search: { borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 4 },
  card: { borderWidth: 1, overflow: 'hidden' },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingRight: 14 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingRight: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  constanciaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderWidth: 1 },
  constanciaIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
