import { useResponsive } from '@/hooks/useResponsive';
import { useSettingsStore } from '@/stores/settings';
import { palette } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Divider,
  Icon,
  IconButton,
  Menu,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type Lang = 'es' | 'en' | 'pt';

export interface MenuLabels {
  profile: string;
  logout: string;
  language: string;
  home: string;
  quotes: string;
  requests: string;
  policies: string;
  menu?: string;
  brand?: string;
}

const MENU_LABELS: Record<Lang, MenuLabels> = {
  es: { profile: 'Mi perfil', logout: 'Cerrar sesión', language: 'Idioma', home: 'Inicio', quotes: 'Cotizaciones', requests: 'Solicitudes', policies: 'Pólizas' },
  en: { profile: 'My profile', logout: 'Log out', language: 'Language', home: 'Home', quotes: 'Quotes', requests: 'Requests', policies: 'Policies' },
  pt: { profile: 'Meu perfil', logout: 'Sair', language: 'Idioma', home: 'Início', quotes: 'Cotações', requests: 'Solicitações', policies: 'Apólices' },
};

interface AppShellProps {
  title: string;
  userName: string;
  userRole?: string;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onHome: () => void;
  onProfile: () => void;
  onLogout: () => void;
  onCotizaciones: () => void;
  onSolicitudes: () => void;
  onPolizas: () => void;
  labels?: Partial<MenuLabels>;
  children: ReactNode;
}

const getInitials = (name: string) =>
  name.trim().split(/\s+/).map((n) => n[0]).join('').slice(0, 2).toUpperCase();

function LangMenu({
  lang,
  onChange,
  color,
  label,
}: {
  lang: Lang;
  onChange: (l: Lang) => void;
  color: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const { colors } = useTheme();
  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchor={
        <TouchableRipple
          onPress={() => setOpen(true)}
          borderless
          style={[styles.langChip, { borderColor: `${color}55` }]}
          accessibilityLabel={label}
        >
          <View style={styles.langInner}>
            <Icon source="web" size={16} color={color} />
            <Text variant="labelLarge" style={{ color }}>
              {lang.toUpperCase()}
            </Text>
            <Icon source="chevron-down" size={16} color={color} />
          </View>
        </TouchableRipple>
      }
      contentStyle={{ backgroundColor: colors.surface }}
    >
      <Menu.Item
        leadingIcon={lang === 'es' ? 'check' : undefined}
        onPress={() => { onChange('es'); setOpen(false); }}
        title="Español"
      />
      <Menu.Item
        leadingIcon={lang === 'en' ? 'check' : undefined}
        onPress={() => { onChange('en'); setOpen(false); }}
        title="English"
      />
      <Menu.Item
        leadingIcon={lang === 'pt' ? 'check' : undefined}
        onPress={() => { onChange('pt'); setOpen(false); }}
        title="Português"
      />
    </Menu>
  );
}

const BRAND_SUBTITLE: Record<Lang, string> = { es: 'Portal de Agentes', en: 'Agent Portal', pt: 'Portal do Agente' };
const MENU_LABEL: Record<Lang, string> = { es: 'Menú', en: 'Menu', pt: 'Menu' };

function translateRole(role: string | undefined, lang: Lang) {
  if (!role) return '';
  const map: Record<string, Record<Lang, string>> = {
    'agente': { es: 'Agente', en: 'Agent', pt: 'Agente' },
    'administrador': { es: 'Administrador', en: 'Administrator', pt: 'Administrador' },
    'supervisor': { es: 'Supervisor', en: 'Supervisor', pt: 'Supervisor' },
    'gerente': { es: 'Gerente', en: 'Manager', pt: 'Gerente' },
    'usuario': { es: 'Usuario', en: 'User', pt: 'Usuário' },
    'vendedor': { es: 'Vendedor', en: 'Seller', pt: 'Vendedor' },
    'asesor': { es: 'Asesor', en: 'Advisor', pt: 'Consultor' },
    'asistente agente': { es: 'Asistente Agente', en: 'Agent Assistant', pt: 'Assistente de Agente' },
    'asistente': { es: 'Asistente', en: 'Assistant', pt: 'Assistente' },
    'agent': { es: 'Agente', en: 'Agent', pt: 'Agente' },
    'administrator': { es: 'Administrador', en: 'Administrator', pt: 'Administrador' },
  };
  const key = role.trim().toLowerCase();
  return map[key]?.[lang] ?? role.trim();
}

function Brand({ compact = false, light = true, lang = 'es' }: { compact?: boolean; light?: boolean; lang?: Lang }) {
  const fg = light ? '#FFFFFF' : palette.indigo[800];
  return (
    <View style={styles.brand}>
      <View style={[styles.logo, { backgroundColor: palette.gold[500] }]}>
        <Icon source="shield-check" size={22} color={palette.indigo[900]} />
      </View>
      {!compact && (
        <View>
          <Text variant="titleMedium" style={{ color: fg, lineHeight: 20 }}>
            Loyal
          </Text>
          <Text variant="labelSmall" style={{ color: fg, opacity: 0.7 }}>
            {BRAND_SUBTITLE[lang]}
          </Text>
        </View>
      )}
    </View>
  );
}

type ResolvedShellProps = Omit<AppShellProps, 'labels'> & { labels: MenuLabels };

export function AppShell(props: AppShellProps) {
  const { isDesktop } = useResponsive();
  const merged: ResolvedShellProps = { ...props, labels: { ...MENU_LABELS[props.lang], ...props.labels } };
  return isDesktop ? <DesktopShell {...merged} /> : <MobileShell {...merged} />;
}

function DesktopShell({
  title, userName, userRole, lang, onLangChange, onHome, onProfile, onLogout, onCotizaciones, onSolicitudes, onPolizas, labels, children,
}: ResolvedShellProps) {
  const activeLang = useSettingsStore((s) => s.lang);
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[palette.indigo[800], palette.indigo[950]]}
        style={styles.sidebar}
      >
        <Brand lang={activeLang} />
        <View style={styles.nav}>
          <TouchableRipple onPress={onHome} style={styles.navItem} borderless>
            <View style={styles.navInner}>
              <Icon source="view-dashboard-outline" size={20} color={palette.indigo[200]} />
              <Text variant="labelLarge" style={{ color: palette.indigo[200] }}>
                {labels.home}
              </Text>
            </View>
          </TouchableRipple>
          <TouchableRipple onPress={onCotizaciones} style={styles.navItem} borderless>
            <View style={styles.navInner}>
              <Icon source="file-document-edit-outline" size={20} color={palette.indigo[200]} />
              <Text variant="labelLarge" style={{ color: palette.indigo[200] }}>
                {labels.quotes}
              </Text>
            </View>
          </TouchableRipple>
          <TouchableRipple onPress={onSolicitudes} style={styles.navItem} borderless>
            <View style={styles.navInner}>
              <Icon source="clipboard-list-outline" size={20} color={palette.indigo[200]} />
              <Text variant="labelLarge" style={{ color: palette.indigo[200] }}>
                {labels.requests}
              </Text>
            </View>
          </TouchableRipple>
          <TouchableRipple onPress={onPolizas} style={styles.navItem} borderless>
            <View style={styles.navInner}>
              <Icon source="shield-check-outline" size={20} color={palette.indigo[200]} />
              <Text variant="labelLarge" style={{ color: palette.indigo[200] }}>
                {labels.policies}
              </Text>
            </View>
          </TouchableRipple>
        </View>
        <View style={styles.sidebarFooter}>
          <Divider style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
          <TouchableRipple onPress={onProfile} borderless style={styles.userBlock}>
            <View style={styles.userRow}>
              <Avatar.Text
                size={36}
                label={getInitials(userName)}
                style={{ backgroundColor: palette.gold[500] }}
                labelStyle={{ color: palette.indigo[900], fontFamily: 'Inter_600SemiBold' }}
              />
              <View style={{ flex: 1 }}>
                <Text variant="labelLarge" style={{ color: '#FFFFFF' }} numberOfLines={1}>
                  {userName.trim()}
                </Text>
                {!!userRole && (
                  <Text variant="labelSmall" style={{ color: palette.indigo[300] }} numberOfLines={1}>
                    {translateRole(userRole, activeLang)}
                  </Text>
                )}
              </View>
            </View>
          </TouchableRipple>
          <TouchableRipple onPress={onLogout} style={styles.navItem} borderless>
            <View style={styles.navInner}>
              <Icon source="logout" size={20} color={palette.indigo[200]} />
              <Text variant="labelLarge" style={{ color: palette.indigo[200] }}>
                {labels.logout}
              </Text>
            </View>
          </TouchableRipple>
        </View>
      </LinearGradient>

      <View style={styles.flex}>
        <View style={[styles.topbar, { borderBottomColor: colors.outlineVariant, backgroundColor: colors.surface }]}>
          <Text variant="titleLarge">{title}</Text>
          <LangMenu lang={lang} onChange={onLangChange} color={colors.onSurface} label={labels.language} />
        </View>
        <ScrollView contentContainerStyle={styles.desktopContent}>
          <View style={styles.maxWidth}>{children}</View>
        </ScrollView>
      </View>
    </View>
  );
}

function MobileNavMenu({
  onHome,
  onCotizaciones,
  onSolicitudes,
  onPolizas,
  onProfile,
  onLogout,
  labels,
  lang,
}: {
  onHome: () => void;
  onCotizaciones: () => void;
  onSolicitudes: () => void;
  onPolizas: () => void;
  onProfile: () => void;
  onLogout: () => void;
  labels: MenuLabels;
  lang: Lang;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchor={
        <IconButton
          icon="menu"
          iconColor="#FFFFFF"
          onPress={() => setOpen(true)}
          accessibilityLabel={labels.menu ?? MENU_LABEL[lang]}
        />
      }
      contentStyle={{ backgroundColor: 'white' }}
      anchorPosition="bottom"
    >
      <Menu.Item leadingIcon="view-dashboard-outline" onPress={() => { onHome(); setOpen(false); }} title={labels.home} />
      <Menu.Item leadingIcon="file-document-edit-outline" onPress={() => { onCotizaciones(); setOpen(false); }} title={labels.quotes} />
      <Menu.Item leadingIcon="clipboard-list-outline" onPress={() => { onSolicitudes(); setOpen(false); }} title={labels.requests} />
      <Menu.Item leadingIcon="shield-check-outline" onPress={() => { onPolizas(); setOpen(false); }} title={labels.policies} />
      <Menu.Item leadingIcon="logout" onPress={() => { onLogout(); setOpen(false); }} title={labels.logout} />
    </Menu>
  );
}

function MobileShell({
  title, userName, lang, onLangChange, onHome, onProfile, onLogout, onCotizaciones, onSolicitudes, onPolizas, labels, children,
}: ResolvedShellProps) {
  const activeLang = useSettingsStore((s) => s.lang);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[palette.indigo[800], palette.indigo[600]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.mobileHeader, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.mobileTopRow}>
          <Brand compact lang={activeLang} />
          <View style={styles.mobileActions}>
            <MobileNavMenu onHome={onHome} onCotizaciones={onCotizaciones} onSolicitudes={onSolicitudes} onPolizas={onPolizas} onProfile={onProfile} onLogout={onLogout} labels={labels} lang={lang} />
            <LangMenu lang={lang} onChange={onLangChange} color="#FFFFFF" label={labels.language} />
            <IconButton icon="account-circle-outline" iconColor="#FFFFFF" onPress={onProfile} accessibilityLabel={labels.profile} />
          </View>
        </View>
        <Text variant="labelMedium" style={{ color: palette.indigo[200], marginTop: 8 }}>
          {title}
        </Text>
        <Text variant="headlineSmall" style={{ color: '#FFFFFF' }} numberOfLines={1}>
          {userName.trim()}
        </Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={[styles.mobileContent, { paddingBottom: insets.bottom + 24 }]}>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flex: 1, flexDirection: 'row' },
  sidebar: { width: 264, paddingHorizontal: 16, paddingVertical: 24, justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  nav: { marginTop: 32, gap: 4, flex: 1 },
  navItem: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  navItemActive: { backgroundColor: 'rgba(255,255,255,0.12)' },
  navInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sidebarFooter: { gap: 8 },
  userBlock: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 10 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topbar: {
    height: 64,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  desktopContent: { padding: 32 },
  maxWidth: { width: '100%', maxWidth: 1200, alignSelf: 'center', gap: 24 },
  mobileHeader: { paddingHorizontal: 20, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  mobileTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mobileActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mobileContent: { padding: 16, gap: 20, marginTop: -12 },
  langChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  langInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
