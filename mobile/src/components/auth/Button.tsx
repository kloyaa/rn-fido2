import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
}

const VARIANTS = {
  primary: { bg: '#2563eb', text: '#ffffff' },
  secondary: { bg: '#e5e7eb', text: '#111827' },
  danger: { bg: '#dc2626', text: '#ffffff' },
};

export function Button({ title, onPress, isLoading = false, disabled = false, variant = 'primary', style }: Props) {
  const colors = VARIANTS[variant];
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.bg, opacity: isDisabled ? 0.6 : 1 }, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {isLoading
        ? <ActivityIndicator color={colors.text} size="small" />
        : <Text style={[styles.text, { color: colors.text }]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  text: { fontSize: 16, fontWeight: '600' },
});
