import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { Colors } from '../../constants/theme';
import { TextInput } from '../../components/auth/TextInput';
import { Button } from '../../components/auth/Button';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { SuccessAlert } from '../../components/common/SuccessAlert';
import { PasswordStrengthIndicator } from '../../components/auth/PasswordStrengthIndicator';
import { PasswordRequirements } from '../../components/auth/PasswordRequirements';
import { usePasswordChange } from '../../hooks/usePasswordChange';
import { useAuth } from '../../hooks/useAuth';
import { validatePassword } from '../../utils/validation';

export default function ChangePasswordScreen() {
  const scheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = Colors[scheme];
  const router = useRouter();
  const { changePassword, isLoading, error, clearError } = usePasswordChange();
  const { logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});

  function validate(): boolean {
    const errors: typeof fieldErrors = {};
    if (!currentPassword) errors.current = 'Current password is required.';
    const newErr = validatePassword(newPassword);
    if (newErr) errors.new = newErr;
    if (newPassword !== confirm) errors.confirm = 'Passwords do not match.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleChange() {
    if (!validate()) return;
    const ok = await changePassword(currentPassword, newPassword);
    if (ok) setSuccess(true);
  }

  async function handleSuccessDismiss() {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Change Password' }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
          {success ? (
            <View style={styles.successContainer}>
              <SuccessAlert message="Password changed successfully. Please sign in again with your new password." />
              <Button title="Sign in again" onPress={handleSuccessDismiss} />
            </View>
          ) : (
            <>
              {error && <ErrorAlert message={error} onDismiss={clearError} />}
              <PasswordRequirements />

              <TextInput
                label="Current password"
                placeholder="Your current password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                error={fieldErrors.current}
                secureTextEntry
                textContentType="password"
              />

              <TextInput
                label="New password"
                placeholder="Choose a strong password"
                value={newPassword}
                onChangeText={setNewPassword}
                error={fieldErrors.new}
                secureTextEntry
                textContentType="newPassword"
              />
              <PasswordStrengthIndicator password={newPassword} />

              <TextInput
                label="Confirm new password"
                placeholder="Repeat new password"
                value={confirm}
                onChangeText={setConfirm}
                error={fieldErrors.confirm}
                secureTextEntry
                textContentType="newPassword"
              />

              <Button title="Change password" onPress={handleChange} isLoading={isLoading} style={styles.button} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: 24 },
  successContainer: { gap: 12 },
  button: { marginTop: 8 },
});
