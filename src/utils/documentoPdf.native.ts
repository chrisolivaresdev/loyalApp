import { getDocumentoPdfArrayBuffer } from '@/api/comisiones';
import { elegirAccionArchivo } from '@/utils/downloadFile.native';

// Nativo: descarga el PDF con sesión y ofrece compartir o guardar en el teléfono
export async function saveDocumentoPdf(codigoDocumento: number, fileName: string): Promise<void> {
  return elegirAccionArchivo(
    () => getDocumentoPdfArrayBuffer(codigoDocumento),
    fileName,
    'application/pdf',
  );
}
