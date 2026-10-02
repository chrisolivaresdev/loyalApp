import { api } from './client';

export interface SolicitudListItem {
  CodigoSolicitud: number;
  CodigoEstadoSolicitud: string;
  DescripcionEstadoSolicitud: string;
  NumeroPoliza: string;
  NombreTitular: string;
  CodigoPais: number;
  DescripcionPais: string;
  DescripcionPoliza: string;
  DescripcionPlan: string;
  DescripcionFormaPago: string;
  Prima: number;
  NumeroAsegurados: number;
}

export interface ListadoSolicitudesResponse {
  FechaInicio: string;
  FechaFin: string;
  CodigoEstadoSolicitud: string;
  CodigoAgente: number;
  Generada: number;
  Registro: number;
  Evaluacion: number;
  Aprobada: number;
  Denegada: number;
  Anulada: number;
  Pospuesta: number;
  ListadoSolicitudes: SolicitudListItem[];
  Meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export async function getSolicitudes(
  codigoEstado: string,
  page = 1,
  limit = 25,
): Promise<ListadoSolicitudesResponse> {
  const { data } = await api.get<ListadoSolicitudesResponse>(
    `/solicitudes/listado-estado/${codigoEstado}`,
    { params: { page, limit } },
  );
  return data;
}
