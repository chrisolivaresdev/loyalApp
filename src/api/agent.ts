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
  TotalPrimasPagadas: number;
  TotalComisiones: number;
  Objetivo: number;
  PorcentajeObjetivo: number;
  PolizasNuevoNegocio?: number;
  PolizasRenovaciones?: number;
  PolizasCanceladas?: number;
  PrimasNuevoNegocio?: number;
  PrimasRenovaciones?: number;
  PrimasPendientesPago?: number;
  PrimasComisionablesPeriodoGracias?: number;
  PrimasCanceladas?: number;
  ComisionesNuevoNegocio?: number;
  ComisionesRenovaciones?: number;
  DescripcionCicloComisiones?: string;
  MontoPagadoComisiones?: number;
  FechaUltimaSolicitud?: string | null;
}

export const getDashboard = (params: GetDashboardParams) =>
  api
    .get<DashboardResponse>('/agentes/dashboard', { params })
    .then((r) => r.data);

export const getDatosBasicos = () =>
  api.get('/agentes/basico').then((r) => r.data);

export interface GetChartParams {
  fechaInicio: string;
  fechaFin: string;
}

export interface ProductoComparador {
  descripcionPoliza: string;
  polizas: number;
  primas: number;
  comisiones: number;
  totalPolizas: number;
  totalPrimas: number;
  totalComisiones: number;
}

export interface VentasPeriodo {
  periodo: string;
  polizas: number;
  primas: number;
  acumulado: number;
  objetivo: number;
  individual: number;
  doble: number;
  master: number;
}

export interface PaisMapa {
  descripcionPais: string;
  polizasTotales: number;
  polizas: number;
  nuevoNegocio: string;
  renovaciones: string;
  latitud: number;
  longitud: number;
}

export const getGraficoProductos = (params: GetChartParams) =>
  api
    .get<ProductoComparador[]>('/agentes/grafico-productos-comparador', { params })
    .then((r) => r.data);

export const getGraficoVentas = (params: GetChartParams) =>
  api
    .get<VentasPeriodo[]>('/agentes/grafico-ventas', { params })
    .then((r) => r.data);

export const getGraficoPaises = (params: GetChartParams) =>
  api
    .get<PaisMapa[]>('/agentes/grafico-paises-mapa', { params })
    .then((r) => r.data);
