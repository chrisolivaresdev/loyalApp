import { actualizarPermiso, actualizarPersonal, crearPersonal, CrearUsuarioPayload, crearUsuarioPersonal, getPermisosPersonal, getPersonalAgente, getPersonalDetalle, PermisoPersonal, PersonalAgente, PersonalDetalle, PersonalPayload } from '@/api/personal';
import { useAuthStore } from '@/stores/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function usePersonalAgente(permisosOk = true) {
  const user = useAuthStore((s) => s.user);
  const codigoAgente = user?.CodigoAgente || user?.CodigoPersonalInterno || user?.CodigoUsuario || 0;
  return useQuery<PersonalAgente[]>({
    queryKey: ['personal-agente', codigoAgente],
    queryFn: getPersonalAgente,
    enabled: !!user && codigoAgente > 0 && permisosOk,
    staleTime: 1000 * 60 * 2,
  });
}

export function usePersonalDetalle(codigoPersonal: number | null) {
  const user = useAuthStore((s) => s.user);
  return useQuery<PersonalDetalle>({
    queryKey: ['personal-detalle', codigoPersonal],
    queryFn: () => getPersonalDetalle(codigoPersonal ?? 0),
    enabled: !!user && codigoPersonal !== null,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGuardarPersonal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PersonalPayload) =>
      payload.codigoPersonalEmpresa > 0 ? actualizarPersonal(payload) : crearPersonal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-agente'] });
      queryClient.invalidateQueries({ queryKey: ['personal-detalle'] });
    },
  });
}

export function usePermisosPersonal(codigoUsuario: number | null) {
  const user = useAuthStore((s) => s.user);
  return useQuery<PermisoPersonal[]>({
    queryKey: ['permisos-personal', codigoUsuario],
    queryFn: () => getPermisosPersonal(codigoUsuario ?? 0),
    enabled: !!user && !!codigoUsuario && codigoUsuario > 0,
    staleTime: 0,
  });
}

export function useActualizarPermiso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ codigoOpcion, codigoUsuario, tipoPermiso }: { codigoOpcion: number; codigoUsuario: number; tipoPermiso: '1' | '2' }) =>
      actualizarPermiso(codigoOpcion, codigoUsuario, tipoPermiso),
    onSuccess: (_d, v) => {
      queryClient.invalidateQueries({ queryKey: ['permisos-personal', v.codigoUsuario] });
    },
  });
}

export function useCrearUsuarioPersonal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearUsuarioPayload) => crearUsuarioPersonal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-agente'] });
    },
  });
}
