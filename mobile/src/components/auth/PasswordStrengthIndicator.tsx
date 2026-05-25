import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { checkPasswordStrength } from '../../utils/validation';

interface Props {
  password: string;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];
const LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];

export function PasswordStrengthIndicator({ password }: Props) {
  if (!password) return null;
  const { score, missing } = checkPasswordStrength(password);

  return (
    <View style={styles.wrapper}>
      <View style={styles.bars}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[styles.bar, { backgroundColor: i < score ? COLORS[score - 1] : '#e5e7eb' }]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: COLORS[score - 1] ?? '#6b7280' }]}>
        {score > 0 ? LABELS[score - 1] : ''}
      </Text>
      {missing.length > 0 && (
        <View style={styles.requirements}>
          {missing.map((req) => (
            <Text key={req} style={styles.requirementItem}>• {req}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 8 },
  bars: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  label: { fontSize: 12, fontWeight: '500' },
  requirements: { marginTop: 6 },
  requirementItem: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
});
