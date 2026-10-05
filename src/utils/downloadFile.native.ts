import { api } from '@/api/client';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Linking } from 'react-native';

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

/**
 * "Abre" un archivo protegido en nativo: descarga con sesión y lo comparte;
 * si falla, intenta abrir la URL directa como último recurso.
 */
export async function abrirArchivoAutenticado(url: string, fileName = 'documento', mimeType?: string): Promise<void> {
  try {
    await descargarArchivoAutenticado(url, fileName, mimeType);
  } catch {
    await Linking.openURL(url);
  }
}
