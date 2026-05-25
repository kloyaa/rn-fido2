import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ConfirmationDialog } from '../common/ConfirmationDialog';
import type { AuthenticatorItem as AuthenticatorData } from '../../services/api/authApi';

interface Props {
  authenticator: AuthenticatorData;
  onRevoke: (id: string) => Promise<boolean>;
}

export function AuthenticatorItem({ authenticator, onRevoke }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);

  const enrolledDate = new Date(authenticator.enrolledAt).toLocaleDateString();
  const lastUsed = authenticator.lastUsedAt
    ? new Date(authenticator.lastUsedAt).toLocaleDateString()
    : 'Never';

  return (
    <>
      <View style={styles.container}>
        <View style={styles.info}>
          <Text style={styles.name}>{authenticator.deviceName ?? 'Unnamed device'}</Text>
          <Text style={styles.meta}>Enrolled: {enrolledDate} · Last used: {lastUsed}</Text>
        </View>
        <TouchableOpacity style={styles.revokeBtn} onPress={() => setShowConfirm(true)}>
          <Text style={styles.revokeText}>Remove</Text>
        </TouchableOpacity>
      </View>

      <ConfirmationDialog
        visible={showConfirm}
        title="Remove authenticator?"
        message={`Are you sure you want to remove "${authenticator.deviceName ?? 'this device'}"? You won't be able to use biometric login on it anymore.`}
        confirmLabel="Remove"
        onConfirm={async () => {
          setShowConfirm(false);
          await onRevoke(authenticator.id);
        }}
        onCancel={() => setShowConfirm(false)}
        destructive
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  revokeBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  revokeText: { color: '#dc2626', fontWeight: '500', fontSize: 14 },
});
