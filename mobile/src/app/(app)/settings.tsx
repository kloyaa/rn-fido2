import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { AuthenticatorsList } from '../../components/settings/AuthenticatorsList';

export default function SettingsScreen() {
  const scheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = Colors[scheme];
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <Section title="Authentication" colors={colors}>
          <SettingRow
            label="Enable biometrics"
            onPress={() => router.push('/(app)/biometric-enrollment')}
            colors={colors}
          />
          <SettingRow
            label="Change password"
            onPress={() => router.push('/(app)/change-password')}
            colors={colors}
          />
        </Section>

        <Section title="Enrolled authenticators" colors={colors}>
          <AuthenticatorsList />
        </Section>

        <Section title="Account" colors={colors}>
          <SettingRow label="Sign out" onPress={logout} colors={colors} destructive />
        </Section>
      </ScrollView>
    </>
  );
}

function Section({ title, children, colors }: { title: string; children: React.ReactNode; colors: typeof Colors.light | typeof Colors.dark }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title.toUpperCase()}</Text>
      <View style={[styles.sectionContent, { backgroundColor: colors.backgroundElement }]}>
        {children}
      </View>
    </View>
  );
}

function SettingRow({ label, onPress, colors, destructive = false }: {
  label: string;
  onPress: () => void;
  colors: typeof Colors.light | typeof Colors.dark;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.rowLabel, { color: destructive ? '#dc2626' : colors.text }]}>{label}</Text>
      {!destructive && <Text style={{ color: colors.textSecondary }}>›</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { marginTop: 32, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 },
  sectionContent: { borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  rowLabel: { fontSize: 16 },
});
