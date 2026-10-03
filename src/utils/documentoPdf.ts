import { getDocumentoPdf } from '@/api/comisiones';

// Web: descarga el PDF como blob y lo guarda con <a download>
export async function saveDocumentoPdf(codigoDocumento: number, fileName: string): Promise<void> {
  const blob = await getDocumentoPdf(codigoDocumento);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
