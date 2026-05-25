import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const REQUIREMENTS = [
  'At least 12 characters',
  'One uppercase letter',
  'One lowercase letter',
  'One number',
  'One special character (!@#$%^&*)',
];

export function PasswordRequirements() {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Password requirements:</Text>
      {REQUIREMENTS.map((req) => (
        <Text key={req} style={styles.item}>• {req}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: '#f3f4f6', borderRadius: 8, padding: 12, marginBottom: 12 },
  title: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  item: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
});
