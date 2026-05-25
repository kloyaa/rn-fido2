import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

interface Props {
  message?: string;
  size?: 'small' | 'large';
}

export function LoadingSpinner({ message, size = 'large' }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color="#2563eb" />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  message: { marginTop: 12, color: '#6b7280', fontSize: 14 },
});
