import { getImagenAgente, getImagenPerfil } from '@/api/agent';
import { useAuthStore } from '@/stores/auth';
import { avatarImageUri } from '@/utils/avatar';
import { useQuery } from '@tanstack/react-query';

export const IMAGEN_PERFIL_KEY = 'imagen-perfil';
export const IMAGEN_AGENTE_KEY = 'imagen-agente';

/**
 * Foto del USUARIO logueado (Usuario.UsuarioImagen) — menú, perfil, diálogo.
 * 1) la que venga en el login (data URL, base64 o Buffer serializado)
 * 2) si no, la pide al API GET /agentes/perfil/imagen
 */
export function useAvatarImagen(): string | null {
  const user = useAuthStore((s) => s.user);
  const local = avatarImageUri(user?.UsuarioImagen);
  const { data } = useQuery({
    queryKey: [IMAGEN_PERFIL_KEY],
    queryFn: () => getImagenPerfil().then((r) => r.imagen),
    enabled: !!user && !local,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
  return local ?? avatarImageUri(data) ?? null;
}

/**
 * Foto del AGENTE (Agentes.ImagenAgente) — la tarjeta del dashboard,
 * igual que en el portal viejo.
 */
export function useImagenAgente(): string | null {
  const user = useAuthStore((s) => s.user);
  const { data } = useQuery({
    queryKey: [IMAGEN_AGENTE_KEY],
    queryFn: () => getImagenAgente().then((r) => r.imagen),
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
  return avatarImageUri(data);
}
