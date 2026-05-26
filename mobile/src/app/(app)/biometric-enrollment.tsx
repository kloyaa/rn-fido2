import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
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
  const { enroll, isLoading, error, errorCode, clearError } = useEnrollment();

  const [deviceName, setDeviceName] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleEnroll() {
    const ok = await enroll(deviceName.trim() || undefined);
    if (ok) setSuccess(true);
  }

  const isPlatformNotSupported = errorCode === 'PLATFORM_NOT_SUPPORTED';

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

            {isPlatformNotSupported ? (
              <View style={[styles.callout, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
                <Text style={[styles.calloutTitle, { color: colors.text }]}>Biometrics not available</Text>
                <Text style={[styles.calloutBody, { color: colors.textSecondary }]}>
                  Make sure Face ID, Touch ID, or a fingerprint is set up in your device settings before enabling this feature.
                </Text>
                <Button
                  title="Open Device Settings"
                  onPress={() => { clearError(); Linking.openSettings(); }}
                  style={styles.calloutButton}
                />
                <Button
                  title="Try Again"
                  onPress={() => { clearError(); handleEnroll(); }}
                  isLoading={isLoading}
                  style={styles.calloutButton}
                />
              </View>
            ) : (
              error && <ErrorAlert message={error} onDismiss={clearError} />
            )}

            {!isPlatformNotSupported && (
              <>
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
  callout: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 8, marginBottom: 16 },
  calloutTitle: { fontSize: 16, fontWeight: '600' },
  calloutBody: { fontSize: 14, lineHeight: 20 },
  calloutButton: { marginTop: 4 },
});
