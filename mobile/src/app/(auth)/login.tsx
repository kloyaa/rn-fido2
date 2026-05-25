import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/theme';
import { TextInput } from '../../components/auth/TextInput';
import { Button } from '../../components/auth/Button';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { useLogin } from '../../hooks/useLogin';
import { validateIdentifier, validatePassword } from '../../utils/validation';

export default function LoginScreen() {
  const scheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = Colors[scheme];
  const router = useRouter();
  const { login, isLoading, error, clearError } = useLogin();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});

  function validate(): boolean {
    const errors: typeof fieldErrors = {};
    const idErr = validateIdentifier(identifier);
    if (idErr) errors.identifier = idErr;
    if (!password) errors.password = 'Password is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    const success = await login({ identifier, password });
    if (success) router.replace('/(app)');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.text }]}>Sign in</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Enter your email or username to continue</Text>

        {error && <ErrorAlert message={error} onDismiss={clearError} />}

        <TextInput
          label="Email or username"
          placeholder="you@example.com or username"
          value={identifier}
          onChangeText={setIdentifier}
          error={fieldErrors.identifier}
          keyboardType="email-address"
          textContentType="emailAddress"
        />

        <TextInput
          label="Password"
          placeholder="Your password"
          value={password}
          onChangeText={setPassword}
          error={fieldErrors.password}
          secureTextEntry
          textContentType="password"
        />

        <Button title="Sign in" onPress={handleLogin} isLoading={isLoading} style={styles.button} />

        <TouchableOpacity style={styles.biometricLink} onPress={() => router.push('/(auth)/biometric-login')}>
          <Text style={[styles.linkText, { color: '#2563eb' }]}>Sign in with biometrics</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={{ color: colors.textSecondary }}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={[styles.linkText, { color: '#2563eb' }]}>Create account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, paddingTop: 64 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 15, marginBottom: 32 },
  button: { marginTop: 8 },
  biometricLink: { alignItems: 'center', marginTop: 16 },
  linkText: { fontWeight: '500', fontSize: 15 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
});
