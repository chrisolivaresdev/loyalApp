import { getCotizacionPdf } from '@/api/cotizaciones';

// Web: descarga el PDF como blob y lo guarda con <a download>
export async function saveCotizacionPdf(
  codigoCotizacion: number,
  productType: number,
  indicadorTipoVenta: string,
  fileName: string,
): Promise<void> {
  const blob = await getCotizacionPdf(codigoCotizacion, productType, indicadorTipoVenta);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
