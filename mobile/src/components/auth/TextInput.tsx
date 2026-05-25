import React from 'react';
import { View, TextInput as RNTextInput, Text, TextInputProps, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/theme';

interface Props extends TextInputProps {
  label: string;
  error?: string | null;
}

export function TextInput({ label, error, style, ...props }: Props) {
  const scheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = Colors[scheme];

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <RNTextInput
        style={[
          styles.input,
          { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: error ? '#ef4444' : 'transparent' },
          style,
        ]}
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 6 },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1.5,
  },
  error: { color: '#ef4444', fontSize: 12, marginTop: 4 },
});
