import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Svg, { Circle, Path } from 'react-native-svg';

export interface PieSlice {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  slices: PieSlice[];
  size?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export function PieChart({ slices, size }: PieChartProps) {
  const { colors } = useTheme();
  const [wrapWidth, setWrapWidth] = useState(0);
  // Se adapta al ancho disponible de la tarjeta (máx 220)
  const chartSize = size ?? Math.min(wrapWidth || 190, 220);
  const total = slices.reduce((s, x) => s + Math.max(0, x.value), 0);
  const cx = chartSize / 2;
  const cy = chartSize / 2;
  const r = chartSize / 2 - 2;

  let angle = 0;
  const paths = slices
    .filter((s) => s.value > 0)
    .map((s, i) => {
      const sweep = (s.value / total) * 360;
      const start = angle;
      angle += sweep;
      // Evita cierre completo que dibuja mal el arco cuando es 360
      const end = sweep >= 360 ? start + 359.99 : start + sweep;
      return <Path key={i} d={slicePath(cx, cy, r, start, end)} fill={s.color} />;
    });

  return (
    <View style={styles.wrap} onLayout={(e) => setWrapWidth(e.nativeEvent.layout.width)}>
      <Svg width={chartSize} height={chartSize}>
        {total > 0
          ? paths
          : <Circle cx={cx} cy={cy} r={r} fill={colors.surfaceVariant} />}
      </Svg>
      <View style={styles.legend}>
        {slices.map((s, i) => {
          const pct = total > 0 ? (s.value / total) * 100 : 0;
          return (
            <View key={i} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: s.color }]} />
              <Text variant="bodySmall" style={{ color: colors.onSurface, flex: 1 }} numberOfLines={1}>
                {s.label}
              </Text>
              <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>
                {pct.toFixed(1)}%
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 14 },
  legend: { alignSelf: 'stretch', gap: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
