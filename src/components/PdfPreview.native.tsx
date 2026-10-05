import { getCotizacionPdfArrayBuffer } from '@/api/cotizaciones';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Icon, Text, useTheme } from 'react-native-paper';
import { WebView } from 'react-native-webview';

interface Props {
  codigo: number;
  producto?: number;
  tipoVenta: string;
  loadingLabel: string;
  errorLabel: string;
}

const PDFJS_VERSION = '3.11.174';
const PDFJS_BASE = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const toBase64 = (buf: ArrayBuffer): string => {
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
};

const buildHtml = (base64: string) => `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="${PDFJS_BASE}/pdf.min.js"></script>
<style>
  html, body { margin: 0; padding: 0; background: #525659; }
  #viewer { padding: 8px 0; }
  canvas { display: block; margin: 0 auto 10px; max-width: 96%; height: auto !important; box-shadow: 0 2px 8px rgba(0,0,0,.4); }
</style></head><body><div id="viewer"></div>
<script>
  pdfjsLib.GlobalWorkerOptions.workerSrc = '${PDFJS_BASE}/pdf.worker.min.js';
  const raw = atob('${base64}');
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  pdfjsLib.getDocument({ data: bytes }).promise.then(async (pdf) => {
    const viewer = document.getElementById('viewer');
    const scale = Math.min(2.5, (window.devicePixelRatio || 1) * 1.4);
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const vp = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = vp.width;
      canvas.height = vp.height;
      viewer.appendChild(canvas);
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
    }
  }).catch((e) => {
    document.body.innerHTML = '<p style="color:#fff;padding:16px;font-family:sans-serif">' + (e && e.message ? e.message : e) + '</p>';
  });
</script></body></html>`;

/** Nativo: renderiza el PDF real con pdf.js dentro de un WebView (igual que web). */
export function PdfPreview({ codigo, producto, tipoVenta, loadingLabel, errorLabel }: Props) {
  const { colors, roundness } = useTheme();
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [webReady, setWebReady] = useState(false);

  useEffect(() => {
    if (!codigo || !producto) return;
    let alive = true;
    setHtml(null);
    setError(false);
    setWebReady(false);
    getCotizacionPdfArrayBuffer(codigo, producto, tipoVenta)
      .then((buf) => { if (alive) setHtml(buildHtml(toBase64(buf))); })
      .catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, [codigo, producto, tipoVenta]);

  return (
    <View style={[styles.frame, { borderColor: colors.outlineVariant, borderRadius: roundness - 4 }]}>
      {(!html || !webReady) && !error && (
        <View style={styles.center}>
          <ActivityIndicator animating />
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginTop: 8 }}>{loadingLabel}</Text>
        </View>
      )}
      {error && (
        <View style={styles.center}>
          <Icon source="file-alert-outline" size={32} color={colors.onSurfaceVariant} />
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginTop: 8 }}>{errorLabel}</Text>
        </View>
      )}
      {!!html && (
        <WebView
          source={{ html }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          onLoad={() => setWebReady(true)}
          onError={() => setError(true)}
          style={styles.webview}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderWidth: 1, height: 560, marginTop: 6, overflow: 'hidden', backgroundColor: '#525659' },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  webview: { flex: 1, backgroundColor: 'transparent' },
});
