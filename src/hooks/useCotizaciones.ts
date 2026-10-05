import {
    getAseguradasPlan,
    getCotizacion,
    getCotizaciones,
    getPaises,
    getResumenCotizaciones,
    solicitarCotizacion,
    SolicitarCotizacionRequest
} from '@/api/cotizaciones';
import { useAuthStore } from '@/stores/auth';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

function useCodigoAgente() {
  const user = useAuthStore((s) => s.user);
  const codigoAgente =
    user?.CodigoAgente ||
    user?.CodigoPersonalInterno ||
    user?.CodigoUsuario ||
    0;
  return { user, codigoAgente, enabled: !!user && codigoAgente > 0 };
}

export function useCotizaciones(codigoEstadoCotizacion?: string, page = 1, limit = 25, query?: string, permisosOk = true) {
  const { codigoAgente, enabled } = useCodigoAgente();
  return useQuery({
    queryKey: ['cotizaciones', codigoAgente, codigoEstadoCotizacion ?? '', page, limit, query ?? ''],
    queryFn: () => getCotizaciones(codigoEstadoCotizacion, page, limit, query),
    enabled: enabled && permisosOk,
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  });
}

export function useResumenCotizaciones(permisosOk = true) {
  const { codigoAgente, enabled } = useCodigoAgente();
  return useQuery({
    queryKey: ['cotizaciones-resumen', codigoAgente],
    queryFn: getResumenCotizaciones,
    enabled: enabled && permisosOk,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCotizacion(codigoCotizacion?: number, permisosOk = true) {
  const { codigoAgente, enabled } = useCodigoAgente();
  return useQuery({
    queryKey: ['cotizacion', codigoAgente, codigoCotizacion],
    queryFn: () => getCotizacion(codigoCotizacion as number),
    enabled: enabled && permisosOk && !!codigoCotizacion,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAseguradasPlan(page = 1, limit = 25) {
  const { enabled } = useCodigoAgente();
  return useQuery({
    queryKey: ['aseguradas-plan', page, limit],
    queryFn: () => getAseguradasPlan(page, limit),
    enabled,
    staleTime: 1000 * 60 * 10,
  });
}

export function usePaises() {
  const { enabled } = useCodigoAgente();
  return useQuery({
    queryKey: ['paises'],
    queryFn: getPaises,
    enabled,
    staleTime: 1000 * 60 * 30,
  });
}

export function useSolicitarCotizacion() {
  const { codigoAgente } = useCodigoAgente();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<SolicitarCotizacionRequest, 'codigoAgente' | 'codigoCotizacion'> & { codigoCotizacion?: number }) =>
      solicitarCotizacion({ ...dto, codigoCotizacion: dto.codigoCotizacion ?? 0, codigoAgente }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
        queryClient.invalidateQueries({ queryKey: ['cotizacion'] });
      }
    },
  });
}
