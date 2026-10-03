import { api } from './client';

export interface CertificadoDetalle {
  certificado: {
    CodigoSolicitud: number;
    CodigoCertificado: number;
    CodigoCotizacion: number;
    NumeroPoliza: string;
    CodigoEstadoCertificado: string;
    DescripcionEstadoCertificado: string;
    CodigoEstadoSolicitud: string;
    DescripcionEstadoSolicitud: string;
    FechaSolicitud: string;
    FechaAprobacion?: string;
    FechaInicioVigencia: string;
    FechaFinVigencia: string;
    CodigoPlan: number;
    DescripcionPlan: string;
    DescripcionPlanesConsulta: string;
    CodigoPoliza: number;
    DescripcionPoliza: string;
    CodigoProducto: number;
    DescripcionProducto: string;
    ColorPrincipal: string;
    NumeroAsegurados: number;
    DescripcionPais: string;
    DescripcionFormaPago: string;
    NumeroDependientes: number;
    IndicadorTrasplante: string;
    IndicadorMaternidad: string;
    CodigoAgente: number;
    NombreAgente: string;
    Prima: number;
    PrimaComisionable: number;
    CostoAdministrativo: number;
    DescripcionTipoVenta: string;
    PeriodoEspera: number;
  };
  asegurados: Asegurado[];
  documentos: DocumentoSolicitud[];
  pagos: Cuota[];
  tiposDocumento: TipoDocumento[];
  descripcionEstadoCuota: string;
}

export interface Asegurado {
  CodigoPersonaSolicitud: number;
  CodigoPersona: number;
  CodigoCertificado: number;
  NombreCompleto: string;
  DescripcionTipoPersonaCotizacion: string;
  DescripcionEstadoPersonaSolicitud: string;
  CodigoEstadoPersonaSolicitud: string;
  FechaNacimiento: string;
  Edad: number;
  Sexo: string;
  Correo: string;
  Celular: string;
  Telefono: string;
  DireccionPrincipal: string;
  DescripcionPaisPrincipal: string;
  DireccionPostal: string;
  DescripcionPaisPostal: string;
  DireccionAlternativa: string;
  DescripcionPaisAlternativa: string;
  DescripcionVinculo: string;
  Talla: number;
  Peso: number;
  Imc: number;
  IndicadorRestricciones: string;
  FechaInicioVigencia?: string;
  FechaFinVigencia?: string;
  enmiendas: { CodigoEnmienda: number; TextoEnmienda: string }[];
  deducibles: { CodigoCambioDeducible: number; TextoCambioDeducible: string }[];
  exclusiones: { CodigoExclusion: number; TextoExclusion: string }[];
}

export interface DocumentoSolicitud {
  CodigoDocumento: number;
  NombreDocumento: string;
  DescripcionClasificacionTipoDocumento: string;
  Origen: string;
  CodigoTipoDocumento: string;
  DescripcionTipoDocumento: string;
  FechaRegistro: string;
}

export interface Cuota {
  CodigoCronogramaPagos: number;
  NumeroCuota: number;
  ValorCuota: number;
  ValorPrima: number;
  ValorIntereses: number;
  ValorSaldoCuota: number;
  CostoAdministrativo: number;
  FechaCobro: string;
  FechaPago?: string;
  FechaVencimiento: string;
  CodigoEstadoCuota: string;
  DescripcionEstadoCuota: string;
  CodigoDocumentoPago?: string;
}

export interface TipoDocumento {
  CodigoTipoDocumento: number;
  DescripcionTipoDocumento: string;
}

export const getCertificadoDetalle = async (codigoCertificado: number): Promise<CertificadoDetalle> => {
  const { data } = await api.get<CertificadoDetalle>(`/certificados/${codigoCertificado}`);
  return data;
};

export const registrarNota = async (codigoCertificado: number, nota: string, indicadorSMS: boolean) => {
  const { data } = await api.post(`/certificados/${codigoCertificado}/notas`, { nota, indicadorSMS });
  return data;
};

export const enviarResumenSms = async (codigoCertificado: number, celular?: string) => {
  const { data } = await api.post(`/certificados/${codigoCertificado}/sms`, celular ? { celular } : {});
  return data;
};

export const solicitarPagoLinea = async (codigoCertificado: number): Promise<{ url: string | null }> => {
  const { data } = await api.post(`/certificados/${codigoCertificado}/pago-linea`);
  return data;
};

export const subirDocumento = async (codigoCertificado: number, codigoTipoDocumento: number, archivo: { uri: string; name: string; type?: string; file?: File }) => {
  const form = new FormData();
  form.append('codigoTipoDocumento', String(codigoTipoDocumento));
  if (archivo.file) {
    form.append('archivo', archivo.file, archivo.name);
  } else {
    // React Native: URI de expo-document-picker
    form.append('archivo', { uri: archivo.uri, name: archivo.name, type: archivo.type ?? 'application/octet-stream' } as any);
  }
  const { data } = await api.post(`/certificados/${codigoCertificado}/documentos`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    transformRequest: (d) => d,
  });
  return data;
};

/** URL para generar coverage/cards/policy/recibo (GET — el navegador/sistema la abre). */
export const documentoGeneradoUrl = (codigoCertificado: number, tipo: 'coverage' | 'cards' | 'policy' | 'recibo', cuota: number) =>
  `${api.defaults.baseURL}/certificados/${codigoCertificado}/documento?tipo=${tipo}&cuota=${cuota}`;

/** URL de descarga de un documento existente (módulo documentos). */
export const documentoDescargaUrl = (codigoDocumento: number) =>
  `${api.defaults.baseURL}/documentos/descargar/${codigoDocumento}`;

/** URLs de exportación del listado de pólizas (respeta filtros). */
export const reportePolizasUrl = (formato: 'excel' | 'pdf', filtros: Record<string, string | undefined>) => {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([k, v]) => { if (v) params.set(k, v); });
  const qs = params.toString();
  return `${api.defaults.baseURL}/polizas/reporte/${formato}${qs ? `?${qs}` : ''}`;
};
