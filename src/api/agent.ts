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

// --- Módulo Agentes (organización + perfil) ---

export interface AgentePerfilItem {
  nivel: 1 | 2 | 3;
  codigoAgente: number;
  codigoDependencia: number;
  nombreAgente: string;
  codigoTipoAgente: string;
  descripcionTipoAgente: string;
  codigoEstadoAgente: string;
  estadoAgente: string;
  comisionAgente: number;
  comisionRenovacion: number;
  cantidadAgentes: number;
  polizas: number;
  primas: number;
  objetivo: number;
  polizasAgentes: number;
  primasAgentes: number;
  primas30: number;
  primas60: number;
  primas90: number;
  primasAgentes30: number;
  primasAgentes60: number;
  primasAgentes90: number;
}

export interface ListaAgentesResponse {
  totalAgentes: number;
  totalActivos: number;
  porcentajeActivos: number;
  totalInactivos: number;
  porcentajeInactivos: number;
  listaAgentesPerfil: AgentePerfilItem[];
}

export const getListaAgentes = () =>
  api.get<ListaAgentesResponse>('/agentes/listado-agentes').then((r) => r.data);

export interface AgenteDetalle {
  codigoAgente: number;
  codigoPersona: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;
  nombreAgente: string;
  sexo: string;
  fechaNacimiento: string | null;
  edad: number;
  codigoAgenteDependencia: number;
  nombreAgenteDependencia: string;
  codigoTipoAgente: number;
  descripcionTipoAgente: string;
  codigoPais: number;
  descripcionPais: string;
  correo: string;
  celular: string;
  telefono: string;
  telefonoCasa: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  direccionOficina: string;
  ciudadOficina: string;
  provinciaOficina: string;
  codigoPostalOficina: string;
  descripcionPaisOficina: string;
  direccionPostal: string;
  ciudadPostal: string;
  provinciaPostal: string;
  codigoPostalPostal: string;
  descripcionPaisPostal: string;
  codigoUsuario: number;
  agenciaMaster: string;
  descripcionBanco: string;
  nombreTitularCuenta: string;
  numeroCuentaDeposito: string;
  codigoRouting: string;
  tipoCuentaDeposito: string;
}

export interface AgenteNavegacion {
  codigoAgente: number;
  nombreAgente: string;
}

export interface CarteraAgente {
  codigoAgente: number;
  nombreAgente: string;
  activas: number;
  pendientePago: number;
  periodoGracia: number;
  cancelado: number;
  total: number;
  cantidadActivas: number;
  cantidadPendientePago: number;
  cantidadPeriodoGracia: number;
  cantidadCanceladas: number;
}

export interface CuadroPrimas {
  monto: number;
  cantidad: number;
}

export interface PrimasResumen {
  activas: CuadroPrimas;
  pendientePago: CuadroPrimas;
  periodoGracia: CuadroPrimas;
  total: CuadroPrimas;
  canceladas: CuadroPrimas;
}

export interface ComisionNuevoNegocio {
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

export interface PerfilAgente {
  indicadorIndividual: boolean;
  datosAgente: AgenteDetalle;
  navegacion: AgenteNavegacion[];
  cartera: CarteraAgente[];
  primasPropias: PrimasResumen;
  primasAgentes: PrimasResumen;
  totalPrimas: number;
  comisionesNuevoNegocio: ComisionNuevoNegocio[];
}

export const getPerfilAgente = (codigoAgente: number, individual = true) =>
  api
    .get<PerfilAgente>(`/agentes/${codigoAgente}/perfil`, { params: { individual: individual ? '1' : '0' } })
    .then((r) => r.data);

// --- Permisos de portal del usuario autenticado ---

export interface PermisoUsuario {
  codigoOpcion: number;
  nombreOpcion: string;
  nivel: number;
  codigoUsuario: number;
  permisoVer: string;
  permisoEjecucion: string;
}

/** Códigos de opción del portal (mismos del Portal legado). */
export const OPCION = {
  comisiones: 40,
  cotizaciones: 41,
  solicitudes: 42,
  cartera: 43,
  primas: 44,
  listaCartera: 45,
  consultarPoliza: 46,
  botonNotas: 47,
  botonPagar: 48,
  botonArchivo: 49,
  botonSMS: 50,
  recursosAgente: 51,
  perfil: 52,
  personal: 53,
  agentes: 54,
} as const;

export const getMisPermisos = () =>
  api.get<PermisoUsuario[]>('/agentes/permisos').then((r) => r.data);
