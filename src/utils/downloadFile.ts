import { api } from '@/api/client';

/**
 * Descarga un archivo protegido por sesión en web.
 * window.open(url) no usa axios: si la cookie de acceso expiró no hay
 * refresh y el API responde 401. Por eso se baja con axios (con credentials
 * e interceptor de refresh) como blob y se dispara la descarga local.
 */
export async function descargarArchivoAutenticado(url: string, fileName = 'descarga', mimeType?: string): Promise<void> {
  const { data } = await api.get<Blob>(url, { responseType: 'blob' });
  const blob = data instanceof Blob ? data : new Blob([data as BlobPart], { type: mimeType });
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
}

/**
 * Abre un archivo protegido por sesión en una pestaña nueva (web).
 * Mismo motivo: window.open directo al API no refresca la sesión → 401.
 * Si el navegador bloquea el popup, cae a descarga del blob.
 */
export async function abrirArchivoAutenticado(url: string, fileName = 'documento', mimeType?: string): Promise<void> {
  const { data } = await api.get<Blob>(url, { responseType: 'blob' });
  const blob = data instanceof Blob ? data : new Blob([data as BlobPart], { type: mimeType });
  const blobUrl = URL.createObjectURL(blob);
  const win = window.open(blobUrl, '_blank', 'noopener');
  if (!win) {
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}
