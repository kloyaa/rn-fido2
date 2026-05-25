import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthenticators } from '../../hooks/useAuthenticators';
import { AuthenticatorItem } from './AuthenticatorItem';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';

export function AuthenticatorsList() {
  const { authenticators, isLoading, error, fetchAuthenticators, revokeAuthenticator, clearError } = useAuthenticators();

  useEffect(() => {
    fetchAuthenticators();
  }, [fetchAuthenticators]);

  if (isLoading) return <LoadingSpinner message="Loading authenticators..." size="small" />;

  return (
    <View>
      {error && <ErrorAlert message={error} onDismiss={clearError} />}
      {authenticators.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No biometric authenticators enrolled.</Text>
          <Text style={styles.emptySubtext}>Use "Enable Biometrics" to add one.</Text>
        </View>
      ) : (
        authenticators.map((auth) => (
          <AuthenticatorItem key={auth.id} authenticator={auth} onRevoke={revokeAuthenticator} />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#374151', fontWeight: '500' },
  emptySubtext: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
});
