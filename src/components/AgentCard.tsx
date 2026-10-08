import { DashboardResponse } from '@/api/agent';
import { useResponsive } from '@/hooks/useResponsive';
import { palette } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { Avatar, Icon, Text, useTheme } from 'react-native-paper';

interface AgentCardProps {
  data: DashboardResponse;
  t: Record<string, string>;
  /** Foto de perfil (data URL/http) — viene de Usuario.UsuarioImagen */
  avatarUri?: string | null;
}

const getInitials = (name: string) =>
  name.trim().split(/\s+/).map((n) => n[0]).join('').slice(0, 2).toUpperCase();

// Estados de agente en dbSeguros.EstadoAgente: 01 Habilitado, 02 Sin Contrato,
// 03 Inactivo, 04 Bloqueado. Colores claros para leerse sobre el banner navy.
const ESTADO_BADGE: Record<string, { color: string; icon: string }> = {
  '01': { color: palette.success, icon: 'check-decagram' },
  '02': { color: palette.warning, icon: 'file-document-outline' },
  '03': { color: palette.slate[300], icon: 'pause-circle-outline' },
  '04': { color: palette.danger, icon: 'lock-outline' },
};

function ContactItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value?: string | null;
}) {
  const { colors } = useTheme();
  if (!value?.trim()) return null;
  return (
    <View style={styles.contact}>
      <View style={[styles.contactIcon, { backgroundColor: colors.primaryContainer }]}>
        <Icon source={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          variant="labelSmall"
          style={{ color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.6 }}
        >
          {label}
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.onSurface }} numberOfLines={2}>
          {value.trim()}
        </Text>
      </View>
    </View>
  );
}

export function AgentCard({ data, t, avatarUri }: AgentCardProps) {
  const { colors, roundness } = useTheme();
  const { isMobile } = useResponsive();
  const avatarSize = isMobile ? 64 : 80;

  return (
    <View
      style={[
        styles.card,
        { borderRadius: roundness + 4, backgroundColor: colors.surface, borderColor: colors.outlineVariant },
      ]}
    >
      <LinearGradient
        colors={[palette.navy[800], palette.navy[600]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.banner}
      >
        <View style={styles.bannerRow}>
          <View style={{ flex: 1 }}>
            <Text variant="labelMedium" style={{ color: palette.navy[200], letterSpacing: 1 }}>
              {(t.agentCode ?? 'Código').toUpperCase()} · {data.CodigoInternoAgente}
            </Text>
            <Text variant="titleLarge" style={{ color: '#FFFFFF' }} numberOfLines={1}>
              {data.NombreAgente?.trim()}
            </Text>
          </View>
          <View style={styles.badge}>
            {(() => {
              const estado = ESTADO_BADGE[data.CodigoEstadoAgente ?? ''];
              const color = estado?.color ?? palette.success;
              const label =
                data.CodigoEstadoAgente === '01'
                  ? (t.activeAgent ?? 'Agente activo')
                  : data.DescripcionEstadoAgente || (t.activeAgent ?? 'Agente activo');
              return (
                <>
                  <Icon source={estado?.icon ?? 'check-decagram'} size={14} color={color} />
                  <Text variant="labelSmall" style={{ color, fontFamily: 'Inter_600SemiBold' }}>
                    {label}
                  </Text>
                </>
              );
            })()}
          </View>
        </View>
      </LinearGradient>

      <View style={[styles.body, isMobile ? null : styles.bodyWide]}>
        <View style={[styles.identity, isMobile ? null : styles.identityWide]}>
          {avatarUri ? (
            <Avatar.Image size={avatarSize} source={{ uri: avatarUri }} />
          ) : (
            <Avatar.Text
              size={avatarSize}
              label={getInitials(data.NombreCompleto)}
              style={{ backgroundColor: palette.gold[500] }}
              labelStyle={{ color: palette.navy[900], fontFamily: 'Inter_700Bold' }}
            />
          )}
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="titleLarge" numberOfLines={2}>
              {data.NombreCompleto?.trim()}
            </Text>
            {!!data.Cargo && (
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                {data.Cargo}
              </Text>
            )}
          </View>
        </View>

        {!isMobile && <View style={[styles.vDivider, { backgroundColor: colors.outlineVariant }]} />}
        {isMobile && <View style={[styles.hDivider, { backgroundColor: colors.outlineVariant }]} />}

        <View style={[styles.contacts, isMobile ? null : styles.contactsWide]}>
          <ContactItem icon="map-marker-outline" label={t.address} value={data.Direccion} />
          <ContactItem icon="cellphone" label={t.mobile} value={data.Celular} />
          <ContactItem icon="phone-outline" label={t.phone} value={data.Telefono} />
          <ContactItem icon="email-outline" label={t.email} value={data.Email} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', overflow: 'hidden', borderWidth: 1 },
  banner: { paddingHorizontal: 24, paddingVertical: 20 },
  bannerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  body: { padding: 24, gap: 20 },
  bodyWide: { flexDirection: 'row', alignItems: 'flex-start', gap: 28 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  identityWide: { flex: 1, minWidth: 240 },
  vDivider: { width: 1, alignSelf: 'stretch' },
  hDivider: { height: 1 },
  contacts: { gap: 16 },
  contactsWide: { flex: 1.4, flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  contact: { flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 220, flexGrow: 1, flexBasis: '45%' },
  contactIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
