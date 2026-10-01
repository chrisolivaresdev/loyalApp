import { api } from './client';

export interface Cotizacion {
  CodigoCotizacion: number;
  FechaCotizacion: string;
  CodigoEstadoCotizacion: string;
  DescripcionEstadoCotizacion: string;
  NombreCompleto: string;
  FechaNacimientoTitular: string;
  EdadTitular: number;
  FechaNacimientoConyuge: string;
  EdadConyuge: string;
  CorreoElectronico: string;
  Telefono: string;
  Dependientes: number;
  Maternidad: string;
  Trasplante: string;
  SexoTitular: string;
  SexoConyuge: string;
  FechaHoraCotizacion: string;
  DescripcionPais: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export type AseguradaPlan = Record<string, unknown>;

export interface PrimaConsulta {
  Cobertura: string;
  TipoPersona: string;
  FormaPago: string;
  Opcion1: string;
  Opcion2: string;
}

export interface VariableGlobal {
  Item: string;
  Valor: string;
  UtlimaModificacion: string;
  UsuarioModificador: string;
}

export interface CotizacionDetalle {
  CodigoCotizacion: number;
  FechaInicioSolicitada: string;
  CodigoEstadoCotizacion: string;
  DescripcionEstadoCotizacion: string;
  NombreSolicitante: string;
  FechaNacimnientoSolicitante: string;
  EdadSolicitante: number;
  SexoSolicitante: string;
  Correo: string;
  DescripcionPais: string;
  ComplicacionesMaternidad: string;
  TrasplanteOrganos: string;
  NumeroDependientes: number;
  FechaNacimnientoConyuge: string;
  EdadConyuge: number;
  SexoConyuge: string;
  VariablesLista: VariableGlobal[];
  ListaPrimasAnualBeyond: PrimaConsulta[];
  ListaPrimasSemiAnualBeyond: PrimaConsulta[];
  ListaPrimasTrimestralBeyond: PrimaConsulta[];
  ListaPrimasMensualBeyond: PrimaConsulta[];
  ListaPrimasAnualPrivilege: PrimaConsulta[];
  ListaPrimasSemiAnualPrivilege: PrimaConsulta[];
  ListaPrimasTrimestralPrivilege: PrimaConsulta[];
  ListaPrimasMensualPrivilege: PrimaConsulta[];
  ListaPrimasAnualLiberty: PrimaConsulta[];
  ListaPrimasSemiAnualLiberty: PrimaConsulta[];
  ListaPrimasTrimestralLiberty: PrimaConsulta[];
  ListaPrimasMensualLiberty: PrimaConsulta[];
  ListaPrimasAnualLegacy: PrimaConsulta[];
  ListaPrimasSemiAnualLegacy: PrimaConsulta[];
  ListaPrimasTrimestralLegacy: PrimaConsulta[];
  ListaPrimasMensualLegacy: PrimaConsulta[];
  ListaPrimasAnualEssential: PrimaConsulta[];
  ListaPrimasSemiAnualEssential: PrimaConsulta[];
  ListaPrimasTrimestralEssential: PrimaConsulta[];
  ListaPrimasMensualEssential: PrimaConsulta[];
  ListaPolizas: { CodigoPoliza: number; DescripcionPoliza: string }[];
}

function unwrapList(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.cotizaciones)) return payload.cotizaciones;
  return [];
}

function unwrapObject<T>(payload: any, key: keyof T): T {
  if (payload && typeof payload === 'object' && key in payload) return payload as T;
  if (payload?.data && typeof payload.data === 'object') return payload.data as T;
  return {} as T;
}

export const getCotizaciones = (codigoEstadoCotizacion?: string, page = 1, limit = 25, query?: string) =>
  api
    .get<any>('/cotizaciones', {
      params: { page, limit, ...(codigoEstadoCotizacion ? { codigoEstadoCotizacion } : {}), ...(query ? { nombreCliente: query } : {}) },
    })
    .then((r): PaginatedResponse<Cotizacion> => {
      const data = unwrapList(r.data) as Cotizacion[];
      const meta: PaginationMeta = r.data?.meta ?? {
        total: data.length,
        page,
        limit,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
      return { data, meta };
    });

export const getAseguradasPlan = (page = 1, limit = 25) =>
  api
    .get<PaginatedResponse<AseguradaPlan>>('/cotizaciones/consulta-asegurada-plan', { params: { page, limit } })
    .then((r) => r.data);

export const getCotizacion = (codigoCotizacion: number) =>
  api
    .get<any>(`/cotizaciones/${codigoCotizacion}`)
    .then((r) => unwrapObject<CotizacionDetalle>(r.data, 'CodigoCotizacion'));
