import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/auth/Button';

export default function HomeScreen() {
  const scheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = Colors[scheme];
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Home',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/(app)/settings')} style={{ marginRight: 8 }}>
              <Text style={{ color: '#2563eb', fontSize: 15 }}>Settings</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.greeting, { color: colors.text }]}>
          Welcome{user?.username ? `, ${user.username}` : ''}!
        </Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>

        <View style={styles.actions}>
          <Button
            title="Go to Settings"
            onPress={() => router.push('/(app)/settings')}
            variant="secondary"
            style={styles.actionBtn}
          />
          <Button
            title="Sign out"
            onPress={logout}
            variant="danger"
            style={styles.actionBtn}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 40 },
  greeting: { fontSize: 26, fontWeight: '700', marginBottom: 4 },
  email: { fontSize: 15, marginBottom: 40 },
  actions: { gap: 12 },
  actionBtn: { marginBottom: 0 },
});
