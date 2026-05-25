import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/theme';
import { TextInput } from '../../components/auth/TextInput';
import { Button } from '../../components/auth/Button';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { SuccessAlert } from '../../components/common/SuccessAlert';
import { PasswordStrengthIndicator } from '../../components/auth/PasswordStrengthIndicator';
import { useRegistration } from '../../hooks/useRegistration';
import { validateEmail, validatePassword, validateUsername } from '../../utils/validation';

export default function RegisterScreen() {
  const scheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = Colors[scheme];
  const router = useRouter();
  const { register, isLoading, error, clearError } = useRegistration();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; username?: string; password?: string }>({});

  function validate(): boolean {
    const errors: typeof fieldErrors = {};
    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;
    if (username) {
      const usernameErr = validateUsername(username);
      if (usernameErr) errors.username = usernameErr;
    }
    const passwordErr = validatePassword(password);
    if (passwordErr) errors.password = passwordErr;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    const ok = await register({ email, password, username: username || undefined });
    if (ok) setSuccess(true);
  }

  if (success) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SuccessAlert message="Account created! You can now sign in." />
        <Button title="Go to Sign In" onPress={() => router.replace('/(auth)/login')} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.text }]}>Create account</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign up to get started</Text>

        {error && <ErrorAlert message={error} onDismiss={clearError} />}

        <TextInput
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          error={fieldErrors.email}
          keyboardType="email-address"
          textContentType="emailAddress"
        />

        <TextInput
          label="Username (optional)"
          placeholder="yourhandle"
          value={username}
          onChangeText={setUsername}
          error={fieldErrors.username}
          textContentType="username"
        />

        <TextInput
          label="Password"
          placeholder="Create a strong password"
          value={password}
          onChangeText={setPassword}
          error={fieldErrors.password}
          secureTextEntry
          textContentType="newPassword"
        />
        <PasswordStrengthIndicator password={password} />

        <Button title="Create account" onPress={handleRegister} isLoading={isLoading} style={styles.button} />

        <View style={styles.footer}>
          <Text style={{ color: colors.textSecondary }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={[styles.linkText, { color: '#2563eb' }]}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 64 },
  scrollContent: { flexGrow: 1, padding: 24, paddingTop: 64 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 15, marginBottom: 32 },
  button: { marginTop: 8 },
  linkText: { fontWeight: '500', fontSize: 15 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
});
