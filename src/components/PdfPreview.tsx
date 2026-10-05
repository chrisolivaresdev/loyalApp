import { getCotizacionPdf } from '@/api/cotizaciones';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Icon, Text, useTheme } from 'react-native-paper';

interface Props {
  codigo: number;
  producto?: number;
  tipoVenta: string;
  loadingLabel: string;
  errorLabel: string;
}

/** Web: descarga el PDF autenticado y lo muestra real en un iframe (objectURL). */
export function PdfPreview({ codigo, producto, tipoVenta, loadingLabel, errorLabel }: Props) {
  const { colors, roundness } = useTheme();
  const [url, setUrl] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');

  useEffect(() => {
    if (!codigo || !producto) return;
    let revoke: string | undefined;
    let alive = true;
    setState('loading');
    setUrl(null);
    getCotizacionPdf(codigo, producto, tipoVenta)
      .then((blob) => {
        if (!alive) return;
        const u = URL.createObjectURL(blob);
        revoke = u;
        setUrl(u);
        setState('idle');
      })
      .catch(() => { if (alive) setState('error'); });
    return () => { alive = false; if (revoke) URL.revokeObjectURL(revoke); };
  }, [codigo, producto, tipoVenta]);

  return (
    <View style={[styles.frame, { borderColor: colors.outlineVariant, borderRadius: roundness - 4 }]}>
      {state === 'loading' && (
        <View style={styles.center}>
          <ActivityIndicator animating />
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginTop: 8 }}>{loadingLabel}</Text>
        </View>
      )}
      {state === 'error' && (
        <View style={styles.center}>
          <Icon source="file-alert-outline" size={32} color={colors.onSurfaceVariant} />
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginTop: 8 }}>{errorLabel}</Text>
        </View>
      )}
      {!!url && (
        <iframe src={`${url}#toolbar=0&navpanes=0&scrollbar=0`} title="Cotizacion PDF" style={{ width: '100%', height: '100%', border: 'none' }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderWidth: 1, height: 640, marginTop: 6, overflow: 'hidden', backgroundColor: '#525659' },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
});
