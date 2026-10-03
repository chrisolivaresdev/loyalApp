import { getPolizasActivas, PolizasFiltros, PolizasResponse } from '@/api/polizas';
import { useAuthStore } from '@/stores/auth';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function usePolizasActivas(filtros: PolizasFiltros = {}, page = 1, limit = 25, permisosOk = true) {
  const user = useAuthStore((s) => s.user);
  const codigoAgente =
    user?.CodigoAgente ||
    user?.CodigoPersonalInterno ||
    user?.CodigoUsuario ||
    0;
  return useQuery<PolizasResponse>({
    queryKey: ['polizas-activas', codigoAgente, filtros, page, limit],
    queryFn: () => getPolizasActivas(filtros, page, limit),
    enabled: !!user && codigoAgente > 0 && permisosOk,
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  });
}
