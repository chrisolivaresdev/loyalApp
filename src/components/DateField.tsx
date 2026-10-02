import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput, useTheme } from 'react-native-paper';
import { DatePickerModal, en, es, pt, registerTranslation } from 'react-native-paper-dates';

registerTranslation('es', es);
registerTranslation('en', en);
registerTranslation('pt', pt);

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (dateString: string) => void;
  placeholder?: string;
  error?: string;
  style?: object;
  minDate?: string;
  maxDate?: string;
  locale?: 'es' | 'en' | 'pt';
}

function toDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  if (y && m && d) return new Date(y, m - 1, d);
  return new Date();
}

function toString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function DateField({
  label,
  value,
  onChange,
  placeholder,
  error,
  style,
  minDate,
  maxDate,
  locale = 'es',
}: DateFieldProps) {
  const { colors, roundness } = useTheme();
  const [show, setShow] = useState(false);

  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(value) ? toDate(value) : undefined;

  return (
    <View style={[styles.wrap, style]}>
      <Text variant="labelLarge" style={[styles.label, { color: colors.onSurface }]}>{label}</Text>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setShow(true)}
        style={[
          styles.field,
          {
            borderColor: error ? colors.error : colors.outline,
            borderRadius: roundness - 4,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <TextInput
          mode="outlined"
          dense
          value={value}
          placeholder={placeholder || 'AAAA-MM-DD'}
          error={!!error}
          editable={false}
          pointerEvents="none"
          autoCapitalize="none"
          outlineStyle={{ borderRadius: roundness - 4, borderWidth: 0, borderColor: 'transparent' }}
          style={{ backgroundColor: 'transparent', flex: 1, fontSize: 14 }}
          right={<TextInput.Icon icon="calendar-month-outline" color={colors.onSurfaceVariant} />}
        />
      </TouchableOpacity>
      {!!error && <Text variant="bodySmall" style={{ color: colors.error }}>{error}</Text>}
      <DatePickerModal
        locale={locale}
        mode="single"
        visible={show}
        date={validDate}
        onDismiss={() => setShow(false)}
        onConfirm={({ date }) => {
          setShow(false);
          if (date) onChange(toString(date));
        }}
        validRange={{
          startDate: minDate ? toDate(minDate) : undefined,
          endDate: maxDate ? toDate(maxDate) : undefined,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, flex: 1 },
  label: { fontSize: 13 },
  field: { borderWidth: 1, minHeight: 46, justifyContent: 'center' },
});
