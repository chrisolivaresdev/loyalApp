/** Fallback web: el navegador envía las cookies de sesión solo. */
export async function descargarArchivoAutenticado(url: string, _fileName?: string, _mimeType?: string): Promise<void> {
  window.open(url, '_blank');
}
