import { api } from '@/api/client';
import { useDownloadDialogStore } from '@/stores/downloadDialog';
import { useSettingsStore } from '@/stores/settings';
import { arrayBufferToBase64 } from '@/utils/base64';
import { File, Paths } from 'expo-file-system';
import { StorageAccessFramework, writeAsStringAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Linking, Platform, ToastAndroid } from 'react-native';

type GetData = () => Promise<ArrayBuffer>;

const L = {
  es: { saved: 'Archivo guardado' },
  en: { saved: 'File saved' },
  pt: { saved: 'Arquivo guardado' },
} as const;
const labels = () => L[useSettingsStore.getState().lang] ?? L.es;

const fetchBuffer = (url: string): GetData =>
  async () => (await api.get<ArrayBuffer>(url, { responseType: 'arraybuffer' })).data;

async function escribirCache(data: ArrayBuffer, fileName: string) {
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create({ intermediates: true });
  file.write(new Uint8Array(data));
  return file;
}

async function compartir(getData: GetData, fileName: string, mimeType?: string) {
  // FileSystem.downloadAsync no envía las cookies del login → la API devuelve
  // 401; por eso se baja por axios (que sí tiene la sesión) como arraybuffer.
  const file = await escribirCache(await getData(), fileName);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: fileName });
  }
}

async function guardar(getData: GetData, fileName: string, mimeType?: string) {
  if (Platform.OS !== 'android') {
    // iOS no tiene carpeta Descargas pública: la hoja de compartir incluye "Guardar en Archivos"
    return compartir(getData, fileName, mimeType);
  }
  const data = await getData();
  // SAF: el usuario elige la carpeta (p.ej. Descargas) y el archivo queda guardado
  const perm = await StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!perm.granted) return;
  const destUri = await StorageAccessFramework.createFileAsync(perm.directoryUri, fileName, mimeType ?? 'application/octet-stream');
  await writeAsStringAsync(destUri, arrayBufferToBase64(data), { encoding: 'base64' });
  ToastAndroid.show(labels().saved, ToastAndroid.SHORT);
}

/**
 * Ofrece al usuario elegir entre compartir y guardar el archivo en el teléfono
 * con un diálogo acorde al diseño de la app (DownloadActionDialog).
 * En iOS va directo a la hoja de compartir (incluye "Guardar en Archivos").
 */
export async function elegirAccionArchivo(getData: GetData, fileName: string, mimeType?: string): Promise<void> {
  if (Platform.OS !== 'android') return compartir(getData, fileName, mimeType);
  const dialog = useDownloadDialogStore.getState();
  const action = await dialog.ask(fileName);
  if (action !== 'share' && action !== 'save') return;
  // el diálogo queda abierto con spinner hasta que termine la descarga/escritura
  try {
    await (action === 'share' ? compartir(getData, fileName, mimeType) : guardar(getData, fileName, mimeType));
  } finally {
    useDownloadDialogStore.getState().done();
  }
}

/** Descarga un archivo protegido por sesión: pregunta compartir o guardar. */
export async function descargarArchivoAutenticado(url: string, fileName: string, mimeType?: string): Promise<void> {
  return elegirAccionArchivo(fetchBuffer(url), fileName, mimeType);
}

/** Abre/comparte un archivo protegido; si falla, intenta la URL directa. */
export async function abrirArchivoAutenticado(url: string, fileName = 'documento', mimeType?: string): Promise<void> {
  try {
    await elegirAccionArchivo(fetchBuffer(url), fileName, mimeType);
  } catch {
    await Linking.openURL(url);
  }
}
