const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** ArrayBuffer → base64 (sin dependencia de btoa, que no siempre existe en Hermes). */
export function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : undefined;
    const c = i + 2 < bytes.length ? bytes[i + 2] : undefined;
    out += B64[a >> 2]
      + B64[((a & 3) << 4) | ((b ?? 0) >> 4)]
      + (b === undefined ? '=' : B64[((b & 15) << 2) | ((c ?? 0) >> 6)])
      + (c === undefined ? '=' : B64[c & 63]);
  }
  return out;
}
