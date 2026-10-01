import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput, useTheme } from 'react-native-paper';

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (dateString: string) => void;
  placeholder?: string;
  error?: string;
  style?: object;
  minDate?: string;
  maxDate?: string;
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
}: DateFieldProps) {
  const { colors, roundness } = useTheme();
  const [show, setShow] = useState(false);
  const [text, setText] = useState(value);

  const onChangeNative = (event: DateTimePickerEvent, selected?: Date) => {
    setShow(false);
    if (event.type === 'set' && selected) {
      onChange(toString(selected));
    }
  };

  const onTextChange = (v: string) => {
    setText(v);
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      onChange(v);
    }
  };

  const isWeb = Platform.OS === 'web';

  const picker = show ? (
    <DateTimePicker
      value={toDate(value) || new Date()}
      mode="date"
      display="default"
      onChange={onChangeNative}
      minimumDate={minDate ? toDate(minDate) : undefined}
      maximumDate={maxDate ? toDate(maxDate) : undefined}
    />
  ) : null;

  return (
    <View style={[styles.wrap, style]}>
      <Text variant="labelLarge" style={[styles.label, { color: colors.onSurface }]}>{label}</Text>
      <TouchableOpacity
        activeOpacity={isWeb ? 1 : 0.7}
        onPress={() => !isWeb && setShow(true)}
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
          value={value || text}
          onChangeText={onTextChange}
          placeholder={placeholder || 'AAAA-MM-DD'}
          error={!!error}
          editable={isWeb}
          pointerEvents={isWeb ? 'auto' : 'none'}
          autoCapitalize="none"
          outlineStyle={{ borderRadius: roundness - 4, borderWidth: 0, borderColor: 'transparent' }}
          style={{ backgroundColor: 'transparent', flex: 1, fontSize: 14 }}
          right={<TextInput.Icon icon="calendar-month-outline" color={colors.onSurfaceVariant} onPress={() => setShow(true)} />}
        />
      </TouchableOpacity>
      {!!error && <Text variant="bodySmall" style={{ color: colors.error }}>{error}</Text>}
      {picker}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, flex: 1 },
  label: { fontSize: 13 },
  field: { borderWidth: 1, minHeight: 46, justifyContent: 'center' },
});
