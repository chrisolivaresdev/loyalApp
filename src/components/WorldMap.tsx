import { geoEquirectangular, geoPath } from 'd3-geo';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Svg, { Circle, Path } from 'react-native-svg';
import { feature } from 'topojson-client';

// Mapa mundial simplificado (world-atlas 110m, ~100KB) — proyección equirectangular
// como el mapa del portal. Los puntos se posicionan por latitud/longitud.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const worldTopo = require('world-atlas/countries-110m.json');

export interface MapMarker {
  latitud: number;
  longitud: number;
  label?: string;
  value?: number;
}

interface WorldMapProps {
  markers: MapMarker[];
  height?: number;
}

const WORLD = feature(worldTopo as any, (worldTopo as any).objects.countries) as any;

export function WorldMap({ markers, height = 260 }: WorldMapProps) {
  const { colors } = useTheme();
  const width = height * 2; // equirectangular ≈ 2:1

  const { paths, projection } = useMemo(() => {
    const proj = geoEquirectangular().fitExtent([[2, 2], [width - 2, height - 2]], WORLD);
    const pathFn = geoPath(proj);
    const paths: string[] = (WORLD.features as any[]).map((f) => pathFn(f) as string).filter(Boolean);
    return { paths, projection: proj };
  }, [width, height]);

  const points = markers
    .filter((m) => Number.isFinite(m.latitud) && Number.isFinite(m.longitud))
    .map((m) => ({ m, xy: projection([m.longitud, m.latitud]) as [number, number] | null }))
    .filter((p) => !!p.xy);

  const maxVal = Math.max(...markers.map((m) => m.value ?? 0), 1);

  return (
    <View style={styles.wrap}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {paths.map((d, i) => (
          <Path key={i} d={d} fill={colors.outlineVariant} stroke="#FFFFFF" strokeWidth={0.5} />
        ))}
        {points.map((p, i) => {
          const r = 3 + ((p.m.value ?? 0) / maxVal) * 5;
          const [x, y] = p.xy!;
          return (
            <Circle
              key={i}
              cx={x}
              cy={y}
              r={Math.min(r, 8)}
              fill="#3B82F6"
              stroke="#FFFFFF"
              strokeWidth={1}
            />
          );
        })}
      </Svg>
      {markers.length > 0 && (
        <View style={styles.legend}>
          {markers.slice(0, 6).map((m, i) => (
            <View key={i} style={styles.legendItem}>
              <View style={styles.dot} />
              <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.onSurfaceVariant }}>
                {m.label}
                {m.value ? ` · ${m.value}` : ''}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6' },
});
