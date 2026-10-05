/**
 * Normaliza UsuarioImagen a un URI usable por <Image>/Avatar.Image.
 * El backend puede devolver: data URL, URL http(s), base64 crudo, o un
 * Buffer serializado ({ type: 'Buffer', data: number[] }) desde el login.
 */
export function avatarImageUri(value: unknown): string | null {
  if (!value) return null;

  if (typeof value === 'string') {
    const s = value.trim();
    if (s.startsWith('data:') || s.startsWith('http')) return s;
    if (s.length > 200 && /^[A-Za-z0-9+/=\s]+$/.test(s)) {
      return `data:image/jpeg;base64,${s.replace(/\s/g, '')}`;
    }
    return null;
  }

  const v = value as { type?: string; data?: number[] };
  if (v.type === 'Buffer' && Array.isArray(v.data) && v.data.length > 100) {
    const bytes = Uint8Array.from(v.data);
    let bin = '';
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    }
    return `data:image/jpeg;base64,${btoa(bin)}`;
  }

  return null;
}
