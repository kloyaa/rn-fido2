import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { Colors } from '../../constants/theme';
import { DeviceNameInput } from '../../components/auth/DeviceNameInput';
import { Button } from '../../components/auth/Button';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { SuccessAlert } from '../../components/common/SuccessAlert';
import { useEnrollment } from '../../hooks/useEnrollment';

export default function BiometricEnrollmentScreen() {
  const scheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = Colors[scheme];
  const router = useRouter();
  const { enroll, isLoading, error, clearError } = useEnrollment();

  const [deviceName, setDeviceName] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleEnroll() {
    const ok = await enroll(deviceName.trim() || undefined);
    if (ok) setSuccess(true);
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Enable Biometrics' }} />
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}>
        {success ? (
          <View style={styles.successContainer}>
            <SuccessAlert message="Biometric authenticator enrolled successfully. You can now sign in with biometrics." />
            <Button title="Back to Settings" onPress={() => router.back()} />
          </View>
        ) : (
          <>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Register your device as a biometric authenticator. You'll be prompted to authenticate
              using your device's biometrics (Face ID, Touch ID, or fingerprint).
            </Text>

            {error && <ErrorAlert message={error} onDismiss={clearError} />}

            <DeviceNameInput
              value={deviceName}
              onChangeText={setDeviceName}
            />

            <Button
              title={isLoading ? 'Starting enrollment...' : 'Enable biometrics'}
              onPress={handleEnroll}
              isLoading={isLoading}
              style={styles.button}
            />
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: 24 },
  description: { fontSize: 15, lineHeight: 22, marginBottom: 28 },
  successContainer: { gap: 12 },
  button: { marginTop: 8 },
});
