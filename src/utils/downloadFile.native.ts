import { api } from '@/api/client';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Descarga un archivo protegido por sesión en nativo.
 * FileSystem.downloadAsync no envía las cookies del login → la API devuelve 401
 * y el archivo quedaba vacío. Por eso se baja por axios (que sí tiene la cookie)
 * como arraybuffer y se escribe a cache antes de compartir.
 */
export async function descargarArchivoAutenticado(url: string, fileName: string, mimeType?: string): Promise<void> {
  const { data } = await api.get<ArrayBuffer>(url, { responseType: 'arraybuffer' });
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create({ intermediates: true });
  file.write(new Uint8Array(data));
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: fileName });
  }
}
