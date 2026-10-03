import { getMisPermisos, PermisoUsuario } from '@/api/agent';
import { useAuthStore } from '@/stores/auth';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';

/**
 * Permisos del portal del usuario autenticado.
 * - Si el usuario no tiene filas de permisos configuradas → acceso completo
 *   (igual que el backend: usuarios sin perfil de permisos no se restringen).
 * - Si tiene filas → una opción es visible/ejecutable solo con permisoVer /
 *   permisoEjecucion = '1' (opción ausente = denegada, como en el Portal).
 */
export function usePermisos() {
  const user = useAuthStore((s) => s.user);
  const query = useQuery<PermisoUsuario[]>({
    queryKey: ['mis-permisos', user?.CodigoUsuario ?? 0],
    queryFn: getMisPermisos,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const map = useMemo(() => {
    const m = new Map<number, PermisoUsuario>();
    for (const p of query.data ?? []) m.set(p.codigoOpcion, p);
    return m;
  }, [query.data]);

  // `ready` = la consulta de permisos terminó (éxito o error).
  const ready = query.isSuccess || query.isError;
  const configured = (query.data ?? []).length > 0;

  // Mientras NO está listo → nada visible/ejecutable (evita mostrar un módulo
  // y luego quitarlo). Si falló la consulta o no hay configuración → acceso total.
  const canSee = (codigoOpcion: number) => {
    if (!ready) return false;
    if (query.isError || !configured) return true;
    const p = map.get(codigoOpcion);
    return p?.permisoVer === '1' || p?.permisoEjecucion === '1';
  };

  const canExecute = (codigoOpcion: number) => {
    if (!ready) return false;
    if (query.isError || !configured) return true;
    return map.get(codigoOpcion)?.permisoEjecucion === '1';
  };

  return { ...query, canSee, canExecute, configured, ready };
}

/**
 * Bloqueo de pantalla: si el usuario no tiene el permiso indicado para la
 * opción, redirige al dashboard (o a `fallback`). Devuelve `allowed`.
 */
export function useRequirePermiso(
  codigoOpcion: number,
  mode: 'ver' | 'ejec' = 'ver',
  fallback = '/dashboard',
) {
  const router = useRouter();
  const { canSee, canExecute, ready } = usePermisos();
  const allowed = mode === 'ejec' ? canExecute(codigoOpcion) : canSee(codigoOpcion);

  useEffect(() => {
    if (ready && !allowed) {
      router.replace(fallback as any);
    }
  }, [ready, allowed, fallback]);

  // false mientras carga → la pantalla no renderiza nada hasta saber el permiso
  return allowed;
}
