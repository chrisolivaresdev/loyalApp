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

/** URL de exportación del listado de solicitudes (respeta el estado activo). */
export const reporteSolicitudesUrl = (formato: 'excel' | 'pdf', estado?: string) =>
  `${api.defaults.baseURL}/solicitudes/reporte/${formato}?estado=${estado || '99'}`;

// ---------------- Detalle de solicitud (portal: ConsultaSolicitud) ----------------

export interface DocumentoSolicitud {
  CodigoDocumento: number;
  CodigoClasificacionTipoDocumento: number;
  DescripcionClasificacionTipoDocumento: string;
  CodigoTipoDocumento: number;
  DescripcionTipoDocumento: string;
  NombreDocumento: string;
}

export interface DocumentoPendiente {
  CodigoPersonaSolicitud: number;
  NombreCompleto: string;
  DescripcionTipoPersonaCotizacion: string;
  CodigoTipoDocumento: number;
  DescripcionTipoDocumento: string;
  CodigoDocumento: number;
  IndicadorVacunado: string;
  IndicadorMayorEdad: string;
  CodigoTipoPersonaCertificado: string;
}

export interface TipoDocumentoOption {
  CodigoTipoDocumento: number;
  DescripcionTipoDocumento: string;
}

export interface DetalleSolicitudResponse {
  solicitud: Record<string, any>;
  documentos: DocumentoSolicitud[];
  pendientes: DocumentoPendiente[];
  tiposDocumento: TipoDocumentoOption[];
}

export const getSolicitudDetalle = (codigoSolicitud: number) =>
  api.get<DetalleSolicitudResponse>(`/solicitudes/${codigoSolicitud}`).then((r) => r.data);

export interface ArchivoInput {
  uri: string;
  name: string;
  type?: string;
  file?: File;
}

const appendArchivo = (form: FormData, archivo: ArchivoInput) => {
  if (archivo.file) {
    form.append('archivo', archivo.file, archivo.name);
  } else {
    form.append('archivo', { uri: archivo.uri, name: archivo.name, type: archivo.type ?? 'application/octet-stream' } as any);
  }
};

const postForm = (url: string, form: FormData) =>
  api.post(url, form, { headers: { 'Content-Type': 'multipart/form-data' }, transformRequest: (d) => d })
    .then((r) => r.data);

export const subirDocumentoSolicitud = (codigoSolicitud: number, codigoTipoDocumento: number, archivo: ArchivoInput) => {
  const form = new FormData();
  form.append('codigoTipoDocumento', String(codigoTipoDocumento));
  appendArchivo(form, archivo);
  return postForm(`/solicitudes/${codigoSolicitud}/documentos`, form);
};

export const subirDocumentoPendiente = (codigoPersonaSolicitud: number, codigoTipoDocumento: number, archivo: ArchivoInput) => {
  const form = new FormData();
  form.append('codigoTipoDocumento', String(codigoTipoDocumento));
  appendArchivo(form, archivo);
  return postForm(`/solicitudes/personas/${codigoPersonaSolicitud}/documentos`, form);
};

export const toggleVacunado = (codigoPersonaSolicitud: number) =>
  api.post(`/solicitudes/personas/${codigoPersonaSolicitud}/vacunado`).then((r) => r.data);

export const toggleMayorEdad = (codigoPersonaSolicitud: number) =>
  api.post(`/solicitudes/personas/${codigoPersonaSolicitud}/mayor-edad`).then((r) => r.data);
