import { api } from '@/api/client';
import { arrayBufferToBase64 } from '@/utils/base64';
import { useQuery } from '@tanstack/react-query';
import { Platform } from 'react-native';

/**
 * Descarga una imagen protegida por sesión y devuelve un URI usable por <Image>.
 * Un <img src> directo al API no envía el Bearer ni la cookie cross-site → 401,
 * por eso se baja con axios (con credentials + refresh) igual que los PDFs.
 * En web devuelve un blob URL; en nativo, un data URI base64.
 */
async function fetchImagen(url: string): Promise<string> {
  const { data, headers } = await api.get<ArrayBuffer>(url, { responseType: 'arraybuffer' });
  const type = String(headers['content-type'] ?? 'image/jpeg');
  if (Platform.OS === 'web') return URL.createObjectURL(new Blob([data], { type }));
  return `data:${type};base64,${arrayBufferToBase64(data)}`;
}

export function useImagenProtegida(url: string | null | undefined) {
  return useQuery({
    queryKey: ['imagen-protegida', url],
    queryFn: () => fetchImagen(url!),
    enabled: !!url,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}
