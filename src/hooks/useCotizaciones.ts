import { getAseguradasPlan, getCotizacion, getCotizaciones } from '@/api/cotizaciones';
import { useAuthStore } from '@/stores/auth';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

function useCodigoAgente() {
  const user = useAuthStore((s) => s.user);
  const codigoAgente =
    user?.CodigoAgente ||
    user?.CodigoPersonalInterno ||
    user?.CodigoUsuario ||
    0;
  return { user, codigoAgente, enabled: !!user && codigoAgente > 0 };
}

export function useCotizaciones(codigoEstadoCotizacion?: string, page = 1, limit = 25, query?: string) {
  const { codigoAgente, enabled } = useCodigoAgente();
  return useQuery({
    queryKey: ['cotizaciones', codigoAgente, codigoEstadoCotizacion ?? '', page, limit, query ?? ''],
    queryFn: () => getCotizaciones(codigoEstadoCotizacion, page, limit, query),
    enabled,
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  });
}

export function useCotizacion(codigoCotizacion?: number) {
  const { codigoAgente, enabled } = useCodigoAgente();
  return useQuery({
    queryKey: ['cotizacion', codigoAgente, codigoCotizacion],
    queryFn: () => getCotizacion(codigoCotizacion as number),
    enabled: enabled && !!codigoCotizacion,
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
