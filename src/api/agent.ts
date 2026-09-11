import { api } from './client';

export interface GetDashboardParams {
  fechaInicio: string;
  fechaFin: string;
  fechaInicioComparado: string;
  fechaFinComparado: string;
}

export interface DashboardResponse {
  NombreAgente: string;
  CodigoInternoAgente: string;
  NombreCompleto: string;
  Cargo: string;
  Direccion: string;
  Celular: string;
  Telefono: string;
  Email: string;
  TotalCotizaciones: number;
  TotalSolicitudesIngresadas: number;
  TotalPolizasActivas: number;
  TotalPrimas: number;
  TotalComisiones: number;
  Objetivo: number;
  PorcentajeObjetivo: number;
  PolizasNuevoNegocio?: number;
  PolizasRenovaciones?: number;
  PolizasCanceladas?: number;
  PrimasNuevoNegocio?: number;
  PrimasRenovaciones?: number;
  PrimasPendientesPago?: number;
  ComisionesNuevoNegocio?: number;
  ComisionesRenovaciones?: number;
  DescripcionCicloComisiones?: string;
  MontoPagadoComisiones?: number;
  FechaUltimaSolicitud?: string | null;
}

export const getDashboard = (codigoAgente: number, params: GetDashboardParams) =>
  api
    .get<DashboardResponse>(`/agents/${codigoAgente}/dashboard`, { params })
    .then((r) => r.data);

export const getDatosBasicos = (codigoAgente: number) =>
  api.get(`/agents/${codigoAgente}/basico`).then((r) => r.data);
