import { palette } from '@/theme';
import { StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    IconButton,
    Text,
    TouchableRipple,
    useTheme,
} from 'react-native-paper';

export const PAGE_SIZES = [10, 25, 50];

export function pageWindow(page: number, totalPages: number, size = 5): number[] {
  const half = Math.floor(size / 2);
  let start = Math.max(1, page - half);
  const end = Math.min(totalPages, start + size - 1);
  start = Math.max(1, end - size + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export interface PaginatorLabels {
  perPage?: string;
  of?: string;
  results?: string;
  [key: string]: string | undefined;
}

export function Paginator({
  page, totalPages, total, limit, onPage, onLimit, loading, labels, compact, sizes,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPage: (p: number) => void;
  onLimit: (l: number) => void;
  loading?: boolean;
  labels: PaginatorLabels;
  compact?: boolean;
  sizes?: number[];
}) {
  const { colors, roundness } = useTheme();
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);
  const lOf = labels.of ?? 'of';
  const lResults = labels.results ?? 'results';
  const lPerPage = labels.perPage ?? 'Per page';
  return (
    <View style={[styles.paginator, compact && styles.paginatorCompact, { borderTopColor: colors.outlineVariant }]}>
      <View style={styles.paginatorInfo}>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {from}–{to} {lOf} {total} {lResults}
        </Text>
        {loading && <ActivityIndicator animating size={14} />}
      </View>
      <View style={styles.paginatorControls}>
        {!compact && (
          <View style={styles.pageSizes}>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>{lPerPage}</Text>
            {(sizes ?? PAGE_SIZES).map((s) => {
              const active = s === limit;
              return (
                <TouchableRipple key={s} onPress={() => onLimit(s)} borderless style={{ borderRadius: roundness - 6 }}>
                  <View style={[styles.pageBtn, active && { backgroundColor: palette.indigo[500] }]}>
                    <Text variant="labelMedium" style={{ color: active ? '#FFFFFF' : colors.onSurface }}>{s}</Text>
                  </View>
                </TouchableRipple>
              );
            })}
          </View>
        )}
        <View style={styles.pages}>
          <IconButton icon="chevron-double-left" size={18} disabled={page <= 1} onPress={() => onPage(1)} />
          <IconButton icon="chevron-left" size={18} disabled={page <= 1} onPress={() => onPage(page - 1)} />
          {pageWindow(page, totalPages, compact ? 3 : 5).map((p) => {
            const active = p === page;
            return (
              <TouchableRipple key={p} onPress={() => onPage(p)} borderless style={{ borderRadius: roundness - 6 }}>
                <View style={[styles.pageBtn, active && { backgroundColor: palette.indigo[500] }]}>
                  <Text variant="labelMedium" style={{ color: active ? '#FFFFFF' : colors.onSurface }}>{p}</Text>
                </View>
              </TouchableRipple>
            );
          })}
          <IconButton icon="chevron-right" size={18} disabled={page >= totalPages} onPress={() => onPage(page + 1)} />
          <IconButton icon="chevron-double-right" size={18} disabled={page >= totalPages} onPress={() => onPage(totalPages)} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  paginator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1 },
  paginatorCompact: { flexDirection: 'column', alignItems: 'stretch', borderTopWidth: 0 },
  paginatorInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  paginatorControls: { flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  pageSizes: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pages: { flexDirection: 'row', alignItems: 'center', gap: 2, justifyContent: 'center' },
  pageBtn: { minWidth: 32, height: 32, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
});
