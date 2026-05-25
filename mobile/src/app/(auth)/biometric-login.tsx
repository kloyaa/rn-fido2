import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/theme';
import { TextInput } from '../../components/auth/TextInput';
import { Button } from '../../components/auth/Button';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { useAuthenticationCeremony } from '../../hooks/useAuthenticationCeremony';

export default function BiometricLoginScreen() {
  const scheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = Colors[scheme];
  const router = useRouter();
  const { authenticate, isLoading, error, clearError } = useAuthenticationCeremony();

  const [username, setUsername] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  async function handleAuthenticate() {
    if (!username.trim()) {
      setFieldError('Email or username is required.');
      return;
    }
    setFieldError(null);
    const success = await authenticate(username.trim());
    if (success) router.replace('/(app)');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Biometric sign in</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter your email or username, then authenticate with your device biometrics
        </Text>

        {error && <ErrorAlert message={error} onDismiss={clearError} />}

        <TextInput
          label="Email or username"
          placeholder="you@example.com or username"
          value={username}
          onChangeText={setUsername}
          error={fieldError}
          keyboardType="email-address"
        />

        <Button
          title={isLoading ? 'Authenticating...' : 'Authenticate with biometrics'}
          onPress={handleAuthenticate}
          isLoading={isLoading}
          style={styles.button}
        />

        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={[styles.linkText, { color: '#2563eb' }]}>Back to password sign in</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 64 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 15, marginBottom: 32, lineHeight: 22 },
  button: { marginTop: 8 },
  backLink: { alignItems: 'center', marginTop: 20 },
  linkText: { fontWeight: '500', fontSize: 15 },
});
