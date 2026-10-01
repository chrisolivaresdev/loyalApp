import { getGraficoPaises, getGraficoProductos, getGraficoVentas, GetChartParams } from '@/api/agent';
import { useAuthStore } from '@/stores/auth';
import { useQuery } from '@tanstack/react-query';

function getYearDates(): GetChartParams {
  const now = new Date();
  const year = now.getFullYear();
  return {
    fechaInicio: `${year}-01-01`,
    fechaFin: `${year}-12-31`,
  };
}

export function useCharts() {
  const user = useAuthStore((s) => s.user);
  const codigoAgente =
    user?.CodigoAgente ||
    user?.CodigoPersonalInterno ||
    user?.CodigoUsuario ||
    0;
  const dates = getYearDates();

  const productos = useQuery({
    queryKey: ['grafico-productos', codigoAgente, dates.fechaInicio, dates.fechaFin],
    queryFn: () => getGraficoProductos(dates),
    enabled: !!user && codigoAgente > 0,
    staleTime: 1000 * 60 * 5,
  });

  const ventas = useQuery({
    queryKey: ['grafico-ventas', codigoAgente, dates.fechaInicio, dates.fechaFin],
    queryFn: () => getGraficoVentas(dates),
    enabled: !!user && codigoAgente > 0,
    staleTime: 1000 * 60 * 5,
  });

  const paises = useQuery({
    queryKey: ['grafico-paises', codigoAgente, dates.fechaInicio, dates.fechaFin],
    queryFn: () => getGraficoPaises(dates),
    enabled: !!user && codigoAgente > 0,
    staleTime: 1000 * 60 * 5,
  });

  return { productos, ventas, paises };
}
