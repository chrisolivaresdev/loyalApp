import { api } from './client';

export interface PolizaActiva {
  codigoCertificado: string;
  numeroPoliza: string;
  descripcionTipoVenta: string;
  nombreCompleto: string;
  numeroAsegurados: number;
  descripcionPoliza: string;
  descripcionPais: string;
  descripcionEstadoCertificado: string;
  fechaInicioVigencia: string;
  descripcionFormaPago: string;
  prima: number;
  descripcionPlan: string;
}

export interface PolizasFiltros {
  poliza?: string;
  estado?: string;
  tipoVenta?: string;
  titular?: string;
  descripcionPoliza?: string;
}

export interface PolizasResponse {
  data: PolizaActiva[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export async function getPolizasActivas(
  filtros: PolizasFiltros = {},
  page = 1,
  limit = 25,
): Promise<PolizasResponse> {
  const { data } = await api.get<PolizasResponse>('/polizas/polizas-activas-paginado', {
    params: {
      ...filtros,
      page,
      limit,
    },
  });
  return data;
}
