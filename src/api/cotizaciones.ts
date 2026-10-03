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

export interface CotizacionEstadoResumen {
  codigoEstadoCotizacion: string;
  descripcionEstadoCotizacion: string;
  cantidad: number;
}

export interface ResumenCotizaciones {
  total: number;
  estados: CotizacionEstadoResumen[];
}

export const getResumenCotizaciones = () =>
  api.get<ResumenCotizaciones>('/cotizaciones/resumen').then((r) => r.data);

export const getAseguradasPlan = (page = 1, limit = 25) =>
  api
    .get<PaginatedResponse<AseguradaPlan>>('/cotizaciones/consulta-asegurada-plan', { params: { page, limit } })
    .then((r) => r.data);

export const getCotizacion = (codigoCotizacion: number) =>
  api
    .get<any>(`/cotizaciones/${codigoCotizacion}`)
    .then((r) => unwrapObject<CotizacionDetalle>(r.data, 'CodigoCotizacion'));

export const getCotizacionPdf = (
  codigoCotizacion: number,
  productType: number,
  indicadorTipoVenta: string,
) =>
  api
    .get<Blob>(`/cotizaciones/${codigoCotizacion}/pdf`, {
      params: { productType, indicadorTipoVenta },
      responseType: 'blob',
    })
    .then((r) => r.data);

export const getCotizacionPdfArrayBuffer = (
  codigoCotizacion: number,
  productType: number,
  indicadorTipoVenta: string,
) =>
  api
    .get<ArrayBuffer>(`/cotizaciones/${codigoCotizacion}/pdf`, {
      params: { productType, indicadorTipoVenta },
      responseType: 'arraybuffer',
    })
    .then((r) => r.data);

export interface Pais {
  CodigoPais: number;
  DescripcionPais: string;
}

export const getPaises = () =>
  api
    .get<any>('/cotizaciones/paises')
    .then((r) => unwrapList(r.data) as Pais[]);

export interface SolicitarCotizacionRequest {
  codigoCotizacion: number;
  fechaInicioValidez: string;
  nombreSolicitante: string;
  fechaNacimientoSolicitante: string;
  sexoSolicitante: 'M' | 'F';
  codigoTipoDocumentoIdentidad: string;
  tipoDocumentoIdentidad: string;
  codigoPais: number;
  correo: string;
  indicadorConyuge: boolean;
  fechaNacimientoConyuge?: string;
  sexoConyuge?: 'M' | 'F';
  numeroDependientes: number;
  trasplanteOrganos: boolean;
  complicacionesMaternidad: boolean;
  codigoAgente: number;
}

export interface SolicitarCotizacionResponse {
  success: boolean;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error';
  redirect?: string;
}

export const solicitarCotizacion = (dto: SolicitarCotizacionRequest) =>
  api
    .post<SolicitarCotizacionResponse>('/cotizaciones/solicitar-cotizacion', dto)
    .then((r) => r.data);
