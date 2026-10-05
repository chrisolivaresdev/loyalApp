import { getCotizacionPdfArrayBuffer } from '@/api/cotizaciones';
import { elegirAccionArchivo } from '@/utils/downloadFile.native';

// Nativo: descarga el PDF con sesión y ofrece compartir o guardar en el teléfono
export async function saveCotizacionPdf(
  codigoCotizacion: number,
  productType: number,
  indicadorTipoVenta: string,
  fileName: string,
): Promise<void> {
  return elegirAccionArchivo(
    () => getCotizacionPdfArrayBuffer(codigoCotizacion, productType, indicadorTipoVenta),
    fileName,
    'application/pdf',
  );
}
