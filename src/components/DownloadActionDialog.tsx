import { useDownloadDialogStore } from '@/stores/downloadDialog';
import { useSettingsStore } from '@/stores/settings';
import { View } from 'react-native';
import { ActivityIndicator, Button, Dialog, List, Portal, Text, useTheme } from 'react-native-paper';

const L = {
  es: { title: 'Descargar archivo', share: 'Compartir', shareHint: 'Enviar o abrir con otra app', save: 'Guardar en el teléfono', saveHint: 'Elegir carpeta de destino', cancel: 'Cancelar', processing: 'Descargando, espera un momento…' },
  en: { title: 'Download file', share: 'Share', shareHint: 'Send or open with another app', save: 'Save to phone', saveHint: 'Choose destination folder', cancel: 'Cancel', processing: 'Downloading, please wait…' },
  pt: { title: 'Baixar arquivo', share: 'Partilhar', shareHint: 'Enviar ou abrir com outro app', save: 'Guardar no telemóvel', saveHint: 'Escolher pasta de destino', cancel: 'Cancelar', processing: 'Baixando, aguarde…' },
} as const;

/** Diálogo con el diseño de la app para elegir qué hacer con un archivo descargado. */
export function DownloadActionDialog() {
  const { colors, roundness } = useTheme();
  const fileName = useDownloadDialogStore((s) => s.fileName);
  const busy = useDownloadDialogStore((s) => s.busy);
  const answer = useDownloadDialogStore((s) => s.answer);
  const t = L[useSettingsStore((s) => s.lang)] ?? L.es;

  return (
    <Portal>
      <Dialog
        visible={fileName !== null}
        onDismiss={() => answer(null)}
        dismissable={!busy}
        style={{ borderRadius: roundness }}
      >
        <Dialog.Title>{t.title}</Dialog.Title>
        <Dialog.Content>
          {!!fileName && (
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }} numberOfLines={2}>
              {fileName}
            </Text>
          )}
          {busy ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}>
              <ActivityIndicator animating size={22} />
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, flex: 1 }}>
                {t.processing}
              </Text>
            </View>
          ) : (
            <>
              <List.Item
                title={t.share}
                description={t.shareHint}
                left={(p) => <List.Icon {...p} icon="share-variant-outline" />}
                onPress={() => answer('share')}
              />
              <List.Item
                title={t.save}
                description={t.saveHint}
                left={(p) => <List.Icon {...p} icon="download-outline" />}
                onPress={() => answer('save')}
              />
            </>
          )}
        </Dialog.Content>
        {!busy && (
          <Dialog.Actions>
            <Button onPress={() => answer(null)}>{t.cancel}</Button>
          </Dialog.Actions>
        )}
      </Dialog>
    </Portal>
  );
}
