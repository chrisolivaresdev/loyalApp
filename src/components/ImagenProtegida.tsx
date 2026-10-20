import { useImagenProtegida } from '@/hooks/useImagenProtegida';
import { Image, ImageProps, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Icon, useTheme } from 'react-native-paper';

interface Props extends Omit<ImageProps, 'source'> {
  /** URL del API protegida por sesión. */
  url: string;
  /** Tamaño del spinner/ícono de estado. */
  indicatorSize?: number;
}

/** <Image> para recursos del API que requieren sesión (ver useImagenProtegida). */
export function ImagenProtegida({ url, style, indicatorSize = 24, ...rest }: Props) {
  const { colors } = useTheme();
  const { data, isLoading, isError } = useImagenProtegida(url);

  if (!data) {
    return (
      <View style={[style, styles.center]}>
        {isLoading ? (
          <ActivityIndicator animating size={indicatorSize} color={colors.outline} />
        ) : isError ? (
          <Icon source="image-broken-variant" size={indicatorSize} color={colors.outline} />
        ) : null}
      </View>
    );
  }
  return <Image {...rest} source={{ uri: data }} style={style} />;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
