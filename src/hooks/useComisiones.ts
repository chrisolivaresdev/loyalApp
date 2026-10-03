import { ComisionAgente, ComisionesDashboard, getComisionesAgente, getComisionesDashboard, getUltimoEstadoCuenta, TipoVentaComision, UltimoEstadoCuenta } from '@/api/comisiones';
import { useAuthStore } from '@/stores/auth';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function useComisionesAgente(codigoTipoVenta: TipoVentaComision, permisosOk = true) {
  const user = useAuthStore((s) => s.user);
  return useQuery<ComisionAgente[]>({
    queryKey: ['comisiones-agente', user?.CodigoAgente, codigoTipoVenta],
    queryFn: () => getComisionesAgente(codigoTipoVenta),
    enabled: !!user && permisosOk,
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });
}

export function useComisionesDashboard(permisosOk = true) {
  const user = useAuthStore((s) => s.user);
  return useQuery<ComisionesDashboard>({
    queryKey: ['comisiones-dashboard', user?.CodigoAgente],
    queryFn: getComisionesDashboard,
    enabled: !!user && permisosOk,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUltimoEstadoCuenta(permisosOk = true) {
  const user = useAuthStore((s) => s.user);
  return useQuery<UltimoEstadoCuenta>({
    queryKey: ['ultimo-estado-cuenta', user?.CodigoAgente],
    queryFn: getUltimoEstadoCuenta,
    enabled: !!user && permisosOk,
    staleTime: 1000 * 60 * 5,
  });
}
