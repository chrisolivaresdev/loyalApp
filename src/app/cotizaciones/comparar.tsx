import { OPCION } from '@/api/agent';
import { CotizacionDetalle, OpcionPlan, PrimaConsulta } from '@/api/cotizaciones';
import { AppShell } from '@/components/AppShell';
import { SelectField, SelectOption } from '@/components/SelectField';
import { useLogout } from '@/hooks/useAuth';
import { useCotizacion } from '@/hooks/useCotizaciones';
import { useRequirePermiso } from '@/hooks/usePermisos';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { palette } from '@/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Button,
    Icon,
    SegmentedButtons,
    Snackbar,
    Text,
    useTheme,
} from 'react-native-paper';

const labels = {
  es: {
    title: 'Comparar planes',
    quote: 'Cotización',
    planA: 'Plan A',
    planB: 'Plan B',
    product: 'Producto',
    plan: 'Plan / opción',
    select: 'Selecciona una opción',
    period: 'Forma de pago',
    annual: 'Anual',
    semiannual: 'Semestral',
    quarterly: 'Trimestral',
    monthly: 'Mensual',
    concept: 'Concepto',
    holder: 'Titular',
    spouse: 'Cónyuge',
    dependent: 'Dependientes',
    transplant: 'Trasplantes de órganos',
    maternity: 'Complicaciones de maternidad',
    adminFee: 'Costo administrativo',
    total: 'Total',
    firstPayment: 'Total 1er pago',
    nextPayment: 'Total 2do pago',
    nextPayments: 'Total 2do, 3ro, 4to pago',
    deducible: 'Deducible',
    deducibleOut: 'Fuera de USA',
    deducibleIn: 'Dentro de USA',
    deducibleOutRes: 'Fuera del país de residencia',
    deducibleInRes: 'Dentro del país de residencia',
    covered: 'Cubierto',
    notCovered: 'No Cubierto',
    notApplicable: 'No aplica',
    cheaper: 'Más económico',
    noPlans: 'Esta cotización no tiene planes con primas para comparar',
    error: 'No pudimos cargar la cotización',
    retry: 'Reintentar',
    pickBoth: 'Selecciona los dos planes para comparar',
  },
  en: {
    title: 'Compare plans',
    quote: 'Quote',
    planA: 'Plan A',
    planB: 'Plan B',
    product: 'Product',
    plan: 'Plan / option',
    select: 'Select an option',
    period: 'Payment method',
    annual: 'Annual',
    semiannual: 'Semiannual',
    quarterly: 'Quarterly',
    monthly: 'Monthly',
    concept: 'Concept',
    holder: 'Holder',
    spouse: 'Spouse',
    dependent: 'Dependents',
    transplant: 'Organ transplants',
    maternity: 'Maternity complications',
    adminFee: 'Administrative fee',
    total: 'Total',
    firstPayment: 'Total 1st payment',
    nextPayment: 'Total 2nd payment',
    nextPayments: 'Total 2nd, 3rd, 4th payment',
    deducible: 'Deductible',
    deducibleOut: 'Outside USA',
    deducibleIn: 'Inside USA',
    deducibleOutRes: 'Outside country of residence',
    deducibleInRes: 'Inside country of residence',
    covered: 'Covered',
    notCovered: 'Not covered',
    notApplicable: 'N/A',
    cheaper: 'Cheaper',
    noPlans: 'This quote has no plans with premiums to compare',
    error: 'We could not load the quote',
    retry: 'Retry',
    pickBoth: 'Select both plans to compare',
  },
  pt: {
    title: 'Comparar planos',
    quote: 'Cotação',
    planA: 'Plano A',
    planB: 'Plano B',
    product: 'Produto',
    plan: 'Plano / opção',
    select: 'Selecione uma opção',
    period: 'Forma de pagamento',
    annual: 'Anual',
    semiannual: 'Semestral',
    quarterly: 'Trimestral',
    monthly: 'Mensal',
    concept: 'Conceito',
    holder: 'Titular',
    spouse: 'Cônjuge',
    dependent: 'Dependentes',
    transplant: 'Transplantes de órgãos',
    maternity: 'Complicações de maternidade',
    adminFee: 'Taxa administrativa',
    total: 'Total',
    firstPayment: 'Total 1º pagamento',
    nextPayment: 'Total 2º pagamento',
    nextPayments: 'Total 2º, 3º, 4º pagamento',
    deducible: 'Dedutível',
    deducibleOut: 'Fora dos EUA',
    deducibleIn: 'Dentro dos EUA',
    deducibleOutRes: 'Fora do país de residência',
    deducibleInRes: 'Dentro do país de residência',
    covered: 'Coberto',
    notCovered: 'Não coberto',
    notApplicable: 'Não se aplica',
    cheaper: 'Mais barato',
    noPlans: 'Esta cotação não tem planos com prêmios para comparar',
    error: 'Não foi possível carregar a cotação',
    retry: 'Tentar novamente',
    pickBoth: 'Selecione os dois planos para comparar',
  },
};

// CodigoPoliza -> sufijo de las listas de primas del detalle
const PRODUCT_SUFFIX: Record<number, string> = {
  1: 'Beyond', 2: 'Privilege', 3: 'Liberty', 4: 'Legacy', 5: 'Essential', 6: 'CriticalCare',
};

const PRODUCT_COLORS: Record<number, string> = {
  1: '#326295', 2: '#8dc341', 3: '#30b6b5', 4: '#841a66', 5: '#526A36', 6: '#EAC734',
};

const PERIOD_LIST: Record<number, string> = { 1: 'Anual', 2: 'SemiAnual', 3: 'Trimestral', 4: 'Mensual' };
const ROMANOS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const COSTO_ADMINISTRATIVO = 80;

const fmtUsd = (v?: number | null) =>
  v == null ? '' : '$' + Math.round(v).toLocaleString('en-US');

function primasDe(data: CotizacionDetalle | undefined, poliza: number, periodo: number): PrimaConsulta[] {
  const suffix = PRODUCT_SUFFIX[poliza];
  if (!data || !suffix) return [];
  return (data[`ListaPrimas${PERIOD_LIST[periodo]}${suffix}` as keyof CotizacionDetalle] as PrimaConsulta[] | undefined) ?? [];
}

export default function CompararPlanesScreen() {
  const router = useRouter();
  const allowed = useRequirePermiso(OPCION.cotizaciones);
  const { id } = useLocalSearchParams<{ id: string }>();
  const codigo = Number(id);
  const user = useAuthStore((s) => s.user);
  const lang = useSettingsStore((s) => s.lang);
  const setLang = useSettingsStore((s) => s.setLang);
  const { colors, roundness } = useTheme();
  const { isMobile } = useResponsive();
  const logout = useLogout();
  const t = labels[lang];
  const [snack, setSnack] = useState('');

  const { data, isLoading, isError, refetch } = useCotizacion(codigo);

  // ---- productos con primas en esta cotización ----
  const productos = useMemo(
    () => (data?.ListaPolizas ?? []).filter(
      (p) => PRODUCT_SUFFIX[p.CodigoPoliza] && [1, 2, 3, 4].some((fp) => primasDe(data, p.CodigoPoliza, fp).length > 0),
    ),
    [data],
  );

  const opciones = useMemo(() => data?.ListaOpcionesPlanes ?? [], [data]);

  // Planes (opciones) que efectivamente tienen primas por producto
  const planesPorProducto = useMemo(() => {
    const map = new Map<number, OpcionPlan[]>();
    for (const p of productos) {
      const conPrima = new Set<number>();
      for (const fp of [1, 2, 3, 4]) {
        for (const r of primasDe(data, p.CodigoPoliza, fp)) {
          if (r.CodigoPlan) conPrima.add(r.CodigoPlan);
        }
      }
      const ops = opciones
        .filter((o) => o.CodigoPoliza === p.CodigoPoliza && conPrima.has(o.CodigoPlan))
        .sort((a, b) => a.Orden - b.Orden);
      if (ops.length) map.set(p.CodigoPoliza, ops);
    }
    return map;
  }, [data, productos, opciones]);

  const [polizaA, setPolizaA] = useState('');
  const [planA, setPlanA] = useState('');
  const [polizaB, setPolizaB] = useState('');
  const [planB, setPlanB] = useState('');
  const [periodo, setPeriodo] = useState('1');

  const productOpts: SelectOption[] = useMemo(
    () => productos.map((p) => ({ value: String(p.CodigoPoliza), label: p.DescripcionPoliza.trim() })),
    [productos],
  );

  const planOpts = (poliza: string): SelectOption[] =>
    (planesPorProducto.get(Number(poliza)) ?? []).map((o) => ({
      value: String(o.CodigoPlan),
      label: (o.DescripcionPlan || `Opción ${ROMANOS[o.Orden] ?? o.Orden}`).trim(),
    }));

  const opcionDe = (poliza: string, plan: string): OpcionPlan | undefined =>
    planesPorProducto.get(Number(poliza))?.find((o) => o.CodigoPlan === Number(plan));

  const selA = opcionDe(polizaA, planA);
  const selB = opcionDe(polizaB, planB);
  const prodA = productos.find((p) => p.CodigoPoliza === Number(polizaA));
  const prodB = productos.find((p) => p.CodigoPoliza === Number(polizaB));

  const maternidadSel = data?.ComplicacionesMaternidad === '1' || data?.ComplicacionesMaternidad === 'true';
  const trasplanteSel = data?.TrasplanteOrganos === '1' || data?.TrasplanteOrganos === 'true';

  // Igual que el PDF de cotización: cubiertas por producto y texto Cubierto/No Cubierto
  const cubiertasPorProducto = (poliza: number) =>
    poliza === 1 ? Infinity : poliza === 2 ? 3 : poliza === 3 ? 2 : 1;

  const valorCobertura = (poliza: number, op: OpcionPlan, cob: string, tipo: string): string => {
    const primas = primasDe(data, poliza, Number(periodo));
    const row = primas.find(
      (r) => r.Cobertura === cob && r.CodigoPlan === op.CodigoPlan && (tipo === '' || r.TipoPersona === tipo),
    );
    if ((cob === '4' && !maternidadSel) || (cob === '5' && !trasplanteSel)) {
      let texto = t.covered;
      if (cob === '4' && [3, 4, 5, 6].includes(poliza)) texto = t.notCovered;
      if (cob === '5' && [4, 5, 6].includes(poliza)) texto = t.notCovered;
      return (op.RangoHistorico ?? 99) <= cubiertasPorProducto(poliza) ? texto : t.notCovered;
    }
    return row?.Opcion1?.trim() || t.notApplicable;
  };

  const primaNumerica = (poliza: number, plan: number): number =>
    primasDe(data, poliza, Number(periodo))
      .filter((r) => r.CodigoPlan === plan)
      .reduce((acc, r) => acc + (Number(r.Opcion2) || 0), 0);

  const fp = Number(periodo);
  const rows: { key: string; label: string; a: string; b: string }[] = [];
  if (selA && selB) {
    const def: [string, string, string][] = [
      ['1', '01', t.holder],
      ['1', '02', t.spouse],
      ['3', '', t.dependent],
      ['5', '', t.transplant],
      ['4', '', t.maternity],
    ];
    for (const [cob, tipo, label] of def) {
      rows.push({ key: `${cob}-${tipo}`, label, a: valorCobertura(Number(polizaA), selA, cob, tipo), b: valorCobertura(Number(polizaB), selB, cob, tipo) });
    }
    rows.push({ key: 'CAD', label: t.adminFee, a: fmtUsd(COSTO_ADMINISTRATIVO), b: fmtUsd(COSTO_ADMINISTRATIVO) });
    const totA = primaNumerica(Number(polizaA), selA.CodigoPlan);
    const totB = primaNumerica(Number(polizaB), selB.CodigoPlan);
    rows.push({ key: 'TOT', label: fp === 1 ? t.total : t.firstPayment, a: fmtUsd(totA + COSTO_ADMINISTRATIVO), b: fmtUsd(totB + COSTO_ADMINISTRATIVO) });
    if (fp !== 1) {
      rows.push({ key: 'STO', label: fp === 3 ? t.nextPayments : t.nextPayment, a: fmtUsd(totA), b: fmtUsd(totB) });
    }
  }

  const deducibleLabel = (poliza: number, op?: OpcionPlan) => {
    if (!op) return '';
    const residencia = poliza === 5 || poliza === 6;
    const fuera = residencia ? t.deducibleOutRes : t.deducibleOut;
    const dentro = residencia ? t.deducibleInRes : t.deducibleIn;
    const parts = [`${fuera}: ${fmtUsd(op.DeducibleFuera) || '—'}`];
    if (op.DeducibleDentro != null && op.DeducibleDentro !== op.DeducibleFuera) parts.push(`${dentro}: ${fmtUsd(op.DeducibleDentro)}`);
    return `${t.deducible} · ${parts.join(' · ')}`;
  };

  const nombreA = prodA ? `${prodA.DescripcionPoliza.trim()} · ${selA?.DescripcionPlan?.trim() ?? ''}` : '';
  const nombreB = prodB ? `${prodB.DescripcionPoliza.trim()} · ${selB?.DescripcionPlan?.trim() ?? ''}` : '';

  const planPicker = (
    etiqueta: string,
    poliza: string,
    setPoliza: (v: string) => void,
    plan: string,
    setPlan: (v: string) => void,
    sel: OpcionPlan | undefined,
    color: string,
  ) => (
    <View style={[styles.pickerCard, { borderColor: colors.outlineVariant, borderRadius: roundness, backgroundColor: colors.surface }]}>
      <View style={styles.pickerHeader}>
        <View style={[styles.planDot, { backgroundColor: color }]} />
        <Text variant="titleSmall">{etiqueta}</Text>
      </View>
      <SelectField
        label={t.product}
        value={poliza}
        options={productOpts}
        onChange={(v) => { setPoliza(v); setPlan(''); }}
        placeholder={t.select}
      />
      <SelectField
        label={t.plan}
        value={plan}
        options={planOpts(poliza)}
        onChange={setPlan}
        placeholder={t.select}
        disabled={!poliza}
      />
      {!!sel && (
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>{deducibleLabel(Number(poliza), sel)}</Text>
      )}
    </View>
  );

  if (!allowed) return null;

  return (
    <AppShell
      title={t.title}
      userName={user?.NombreCompletoUsuario ?? ''}
      userRole={user?.NombrePerfil}
      lang={lang}
      onLangChange={setLang}
      onHome={() => router.push('/dashboard' as any)}
      onProfile={() => router.push('/perfil' as any)}
      onLogout={() => logout.mutate()}
      onCotizaciones={() => router.push('/cotizaciones' as any)}
      onSolicitudes={() => router.push('/solicitudes' as any)}
      onPolizas={() => router.push('/polizas' as any)}
      onBack={() => (router.canGoBack() ? router.back() : router.replace(`/cotizaciones/${codigo}` as any))}
    >
      <View style={styles.header}>
        <View style={{ flex: 1, minWidth: 180 }}>
          <Text variant="headlineSmall">{t.title}</Text>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
            {t.quote} #{id}{data?.NombreSolicitante ? ` · ${data.NombreSolicitante}` : ''}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator animating size="large" />
        </View>
      ) : isError || !data ? (
        <View style={styles.centered}>
          <Icon source="cloud-off-outline" size={40} color={colors.onSurfaceVariant} />
          <Text variant="titleMedium" style={{ marginTop: 8 }}>{t.error}</Text>
          <Button mode="contained-tonal" icon="refresh" onPress={() => refetch()} style={{ marginTop: 12 }}>{t.retry}</Button>
        </View>
      ) : productos.length === 0 ? (
        <View style={styles.centered}>
          <Icon source="file-compare" size={40} color={colors.onSurfaceVariant} />
          <Text variant="titleMedium" style={{ marginTop: 8, textAlign: 'center' }}>{t.noPlans}</Text>
        </View>
      ) : (
        <>
          <View style={[styles.pickers, isMobile && styles.pickersMobile]}>
            {planPicker(t.planA, polizaA, setPolizaA, planA, setPlanA, selA, PRODUCT_COLORS[Number(polizaA)] ?? palette.indigo[500])}
            {planPicker(t.planB, polizaB, setPolizaB, planB, setPlanB, selB, PRODUCT_COLORS[Number(polizaB)] ?? palette.indigo[500])}
          </View>

          {selA && selB ? (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderRadius: roundness }]}>
              <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>{t.period}</Text>
              <SegmentedButtons
                value={periodo}
                onValueChange={setPeriodo}
                density="small"
                buttons={[
                  { value: '1', label: t.annual },
                  { value: '2', label: t.semiannual },
                  { value: '3', label: t.quarterly },
                  { value: '4', label: t.monthly },
                ]}
              />

              <View style={[styles.trow, styles.thead, { borderColor: colors.outlineVariant }]}>
                <Text variant="labelMedium" style={[styles.tcellConcept, { color: colors.onSurfaceVariant }]}>{t.concept}</Text>
                <Text variant="labelMedium" style={[styles.tcell, { color: PRODUCT_COLORS[Number(polizaA)] ?? colors.onSurface }]} numberOfLines={2}>{nombreA}</Text>
                <Text variant="labelMedium" style={[styles.tcell, { color: PRODUCT_COLORS[Number(polizaB)] ?? colors.onSurface }]} numberOfLines={2}>{nombreB}</Text>
              </View>
              <ScrollView style={{ maxHeight: 420 }} nestedScrollEnabled>
                {rows.map((r, i) => {
                  const esTotal = r.key === 'TOT' || r.key === 'STO';
                  return (
                    <View
                      key={r.key}
                      style={[
                        styles.trow,
                        { borderColor: colors.outlineVariant },
                        i % 2 === 1 && { backgroundColor: colors.surfaceVariant },
                        esTotal && { backgroundColor: colors.secondaryContainer },
                      ]}
                    >
                      <Text variant="bodyMedium" style={[styles.tcellConcept, esTotal && styles.bold]} numberOfLines={2}>{r.label}</Text>
                      <Text variant="bodyMedium" style={[styles.tcell, esTotal && styles.bold]} numberOfLines={2}>{r.a}</Text>
                      <Text variant="bodyMedium" style={[styles.tcell, esTotal && styles.bold]} numberOfLines={2}>{r.b}</Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.centered}>
              <Icon source="scale-balance" size={40} color={colors.onSurfaceVariant} />
              <Text variant="bodyMedium" style={{ marginTop: 8, color: colors.onSurfaceVariant }}>{t.pickBoth}</Text>
            </View>
          )}
        </>
      )}

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={2500} onIconPress={() => setSnack('')}>
        {snack}
      </Snackbar>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  pickers: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  pickersMobile: { flexDirection: 'column' },
  pickerCard: { flex: 1, borderWidth: 1, padding: 14, gap: 10, width: '100%' },
  pickerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planDot: { width: 10, height: 10, borderRadius: 5 },
  card: { borderWidth: 1, padding: 14, gap: 10, marginTop: 14 },
  trow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 8, paddingHorizontal: 8, gap: 8 },
  thead: { borderBottomWidth: 1 },
  tcellConcept: { flex: 1.4 },
  tcell: { flex: 1, textAlign: 'center' },
  bold: { fontFamily: 'Inter_700Bold' },
});
