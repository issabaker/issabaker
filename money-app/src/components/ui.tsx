import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { IconName } from '../lib/categories';
import { colors, radius, space } from '../lib/theme';

export function Screen({ children, scroll = true, hasHeader = false }: { children: ReactNode; scroll?: boolean; hasHeader?: boolean }) {
  return (
    <SafeAreaView style={styles.screen} edges={hasHeader ? ['left', 'right'] : ['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.screenContent} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.screenContent, { flex: 1 }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function H1({ children }: { children: ReactNode }) {
  return <Text style={styles.h1}>{children}</Text>;
}

export function H2({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.h2Row}>
      <Text style={styles.h2}>{children}</Text>
      {right}
    </View>
  );
}

export function Muted({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.muted, style]}>{children}</Text>;
}

export function Button({
  title,
  onPress,
  icon,
  variant = 'primary',
  disabled,
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'soft' | 'danger' | 'ghost';
  disabled?: boolean;
}) {
  const bg = { primary: colors.primary, soft: colors.primarySoft, danger: '#fdeaea', ghost: 'transparent' }[variant];
  const fg = { primary: '#fff', soft: colors.primary, danger: colors.danger, ghost: colors.primary }[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 }]}
    >
      {icon && <Ionicons name={icon} size={18} color={fg} />}
      <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

export function ProgressBar({ value, color = colors.saved, height = 10 }: { value: number; color?: string; height?: number }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View style={{ width: `${pct * 100}%`, height, borderRadius: height / 2, backgroundColor: color }} />
    </View>
  );
}

export function Chip({ label, selected, onPress, icon }: { label: string; selected: boolean; onPress: () => void; icon?: IconName }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {icon && <Ionicons name={icon} size={16} color={selected ? '#fff' : colors.textSecondary} />}
      <Text style={[styles.chipText, selected && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={styles.segment}>
      {options.map((o) => (
        <Pressable
          key={o.value}
          onPress={() => onChange(o.value)}
          accessibilityRole="button"
          accessibilityState={{ selected: o.value === value }}
          style={[styles.segmentItem, o.value === value && styles.segmentItemActive]}
        >
          <Text style={[styles.segmentText, o.value === value && { color: colors.text }]}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ marginBottom: space(3) }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.muted} {...props} style={[styles.input, props.style]} />
    </View>
  );
}

export function IconBubble({ icon, color, size = 40 }: { icon: IconName; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: `${color}1f`, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={size * 0.5} color={color} />
    </View>
  );
}

export function Empty({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={40} color={colors.muted} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Muted style={{ textAlign: 'center' }}>{body}</Muted>
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  screenContent: { padding: space(4), paddingBottom: space(10), gap: space(4) },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: space(4),
    shadowColor: '#1c2433',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  h1: { fontSize: 26, fontWeight: '800', color: colors.text },
  h2Row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space(2) },
  h2: { fontSize: 17, fontWeight: '700', color: colors.text },
  muted: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space(2),
    paddingVertical: space(3),
    paddingHorizontal: space(4),
    borderRadius: radius.md,
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
  track: { backgroundColor: colors.border, overflow: 'hidden', width: '100%' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  segment: { flexDirection: 'row', backgroundColor: colors.border, borderRadius: radius.md, padding: 3 },
  segmentItem: { flex: 1, paddingVertical: 8, borderRadius: radius.md - 3, alignItems: 'center' },
  segmentItemActive: { backgroundColor: colors.card },
  segmentText: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  label: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space(3),
    paddingVertical: space(3),
    fontSize: 16,
    color: colors.text,
  },
  empty: { alignItems: 'center', padding: space(6), gap: space(2) },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
});
