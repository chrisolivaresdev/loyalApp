import { getDocumentoPdfArrayBuffer } from '@/api/comisiones';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Nativo: guarda el PDF en cache y abre el diálogo de compartir/ver
export async function saveDocumentoPdf(codigoDocumento: number, fileName: string): Promise<void> {
  const buf = await getDocumentoPdfArrayBuffer(codigoDocumento);
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create({ intermediates: true });
  file.write(new Uint8Array(buf));
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', dialogTitle: fileName });
  }
}
