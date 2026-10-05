import { getImagenPerfil } from '@/api/agent';
import { useAuthStore } from '@/stores/auth';
import { avatarImageUri } from '@/utils/avatar';
import { useQuery } from '@tanstack/react-query';

export const IMAGEN_PERFIL_KEY = 'imagen-perfil';

/**
 * Foto de perfil del usuario (Usuario.UsuarioImagen):
 * 1) la que ya venga en el login/usuario (data URL, base64 o Buffer serializado)
 * 2) si no, la pide al API GET /agentes/perfil/imagen
 * Devuelve un URI listo para Avatar.Image / Image.
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
