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

export function useDashboard() {
  const user = useAuthStore((s) => s.user);
  const codigoAgente =
    user?.CodigoAgente ||
    user?.CodigoPersonalInterno ||
    user?.CodigoUsuario ||
    0;
  const dates = getYearDates();

  return useQuery<DashboardResponse>({
    queryKey: [
      'dashboard',
      codigoAgente,
      dates.fechaInicio,
      dates.fechaFin,
      dates.fechaInicioComparado,
      dates.fechaFinComparado,
    ],
    queryFn: () => getDashboard(codigoAgente, dates),
    enabled: !!user && codigoAgente > 0,
  });
}
