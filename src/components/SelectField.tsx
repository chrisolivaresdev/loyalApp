import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Menu, Text, TouchableRipple, useTheme } from 'react-native-paper';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  style?: object;
}

export function SelectField({ label, value, options, onChange, placeholder, disabled, error, style }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const { colors, roundness } = useTheme();
  const selected = options.find((o) => o.value === value);
  const borderColor = error ? colors.error : open ? colors.primary : colors.outline;

  return (
    <View style={[styles.wrap, style]}>
      <Text variant="labelLarge" style={[styles.label, { color: colors.onSurface }]}>{label}</Text>
      <Menu
        visible={open}
        onDismiss={() => setOpen(false)}
        anchorPosition="bottom"
        contentStyle={{ backgroundColor: colors.surface, borderRadius: roundness }}
        anchor={
          <TouchableRipple
            onPress={() => !disabled && setOpen(true)}
            borderless
            disabled={disabled}
            style={[
              styles.field,
              {
                borderColor,
                borderRadius: roundness - 4,
                backgroundColor: disabled ? colors.surfaceVariant : colors.surface,
                opacity: disabled ? 0.7 : 1,
              },
            ]}
          >
            <View style={styles.inner}>
              <Text
                variant="bodyMedium"
                numberOfLines={1}
                style={{ flex: 1, color: selected ? colors.onSurface : colors.onSurfaceVariant }}
              >
                {selected?.label ?? placeholder ?? '---------'}
              </Text>
              <Icon source="chevron-down" size={20} color={colors.onSurfaceVariant} />
            </View>
          </TouchableRipple>
        }
      >
        {options.map((o) => (
          <Menu.Item
            key={o.value}
            title={o.label}
            leadingIcon={o.value === value ? 'check' : undefined}
            onPress={() => { onChange(o.value); setOpen(false); }}
          />
        ))}
      </Menu>
      {!!error && (
        <Text variant="bodySmall" style={{ color: colors.error }}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 13 },
  field: { borderWidth: 1, paddingHorizontal: 14, minHeight: 46, justifyContent: 'center' },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
