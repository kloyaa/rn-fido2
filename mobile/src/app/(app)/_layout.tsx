import React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/theme';

export default function AppLayout() {
  const scheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = Colors[scheme];

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
