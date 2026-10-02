import { getSolicitudes, ListadoSolicitudesResponse } from '@/api/solicitudes';
import { useAuthStore } from '@/stores/auth';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function useSolicitudes(codigoEstado: string, page = 1, limit = 25) {
  const user = useAuthStore((s) => s.user);
  const codigoAgente =
    user?.CodigoAgente ||
    user?.CodigoPersonalInterno ||
    user?.CodigoUsuario ||
    0;
  return useQuery<ListadoSolicitudesResponse>({
    queryKey: ['solicitudes', codigoAgente, codigoEstado, page, limit],
    queryFn: () => getSolicitudes(codigoEstado, page, limit),
    enabled: !!user && codigoAgente > 0,
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  });
}
