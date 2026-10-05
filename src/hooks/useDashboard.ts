import { DashboardResponse, getDashboard, GetDashboardParams } from '@/api/agent';
import { useAuthStore } from '@/stores/auth';
import { useQuery } from '@tanstack/react-query';

function getYearDates(): GetDashboardParams {
  const now = new Date();
  const year = now.getFullYear();
  const previous = year - 1;
  return {
    fechaInicio: `${year}-01-01`,
    fechaFin: `${year}-12-31`,
    fechaInicioComparado: `${previous}-01-01`,
    fechaFinComparado: `${previous}-12-31`,
  };
}

export function useDashboard(estructura = false) {
  const user = useAuthStore((s) => s.user);
  const codigoAgente =
    user?.CodigoAgente ||
    user?.CodigoPersonalInterno ||
    user?.CodigoUsuario ||
    0;
  const dates = getYearDates();
  const params = estructura ? { ...dates, estructura: '1' } : dates;

  return useQuery<DashboardResponse>({
    queryKey: [
      'dashboard',
      codigoAgente,
      estructura,
      dates.fechaInicio,
      dates.fechaFin,
      dates.fechaInicioComparado,
      dates.fechaFinComparado,
    ],
    queryFn: () => getDashboard(params),
    enabled: !!user && codigoAgente > 0,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
