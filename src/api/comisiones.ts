import { api } from './client';

export type TipoVentaComision = '01' | '02';

export interface ComisionAgente {
  codigoAgente: number;
  codigoAgenteComision: number;
  nombreCompleto: string;
  nombreAgente: string;
  codigoPoliza: string;
  descripcionPoliza: string;
  codigoTipoVenta: string;
  descripcionTipoVenta: string;
  porcentajeComision: number;
}

export interface UltimoEstadoCuenta {
  DescripcionCicloComisiones: string;
  MontoPagadoComisiones: number;
  CodigoEstadoCuenta: number;
}

export interface DetalleComision {
  codigoCicloComisiones: number;
  fechaInicio: string;
  fechaFin: string;
  numeroPoliza: string;
  nombreCompleto: string;
  descripcionTipoVenta: string;
  primaComisionable: number;
  porcentajeComision: number;
  valorComision: number;
  codigoAgenteGenera: number;
  nombreAgenteGenera: string;
  codigoEstadoCuenta: number;
  descripcionFormaPago: string;
}

export interface ComisionesDashboard {
  listaComisiones: DetalleComision[];
  totalComisiones: number;
  totalComisionesNuevosNegocios: number;
  totalComisionesRenovaciones: number;
  totalComisionesPropias: number;
  totalComisionesAgentes: number;
  totalComisiones30: number;
  totalComisiones60: number;
  totalComisiones90: number;
}

export const getComisionesAgente = (codigoTipoVenta: TipoVentaComision) =>
  api
    .get<ComisionAgente[]>('/agentes/comisiones-agentes', { params: { codigoTipoVenta } })
    .then((r) => r.data);

export const getUltimoEstadoCuenta = () =>
  api.get<UltimoEstadoCuenta>('/agentes/ultimo-estado-cuenta').then((r) => r.data);

export const getComisionesDashboard = () =>
  api.get<ComisionesDashboard>('/agentes/dashboard-comisiones').then((r) => r.data);

export const getDocumentoPdf = (codigoDocumento: number) =>
  api
    .get<Blob>(`/documentos/descargar/${codigoDocumento}`, { responseType: 'blob' })
    .then((r) => r.data);

export const getDocumentoPdfArrayBuffer = (codigoDocumento: number) =>
  api
    .get<ArrayBuffer>(`/documentos/descargar/${codigoDocumento}`, { responseType: 'arraybuffer' })
    .then((r) => r.data);
