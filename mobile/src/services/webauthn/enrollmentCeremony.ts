import { Platform } from 'react-native';

// React Native does not have native WebAuthn/FIDO2 support via the browser API.
// On mobile, FIDO2 ceremonies are mediated through the platform credential manager.
// This module provides a thin wrapper that calls the platform API.
// For full production support, integrate a library such as `react-native-passkeys`
// or use the Expo passkeys API when available for your target SDK.

export interface RegistrationCredential {
  id: string;
  rawId: string;
  type: 'public-key';
  response: {
    clientDataJSON: string;
    attestationObject: string;
  };
  clientExtensionResults?: Record<string, unknown>;
}

export async function performEnrollmentCeremony(
  options: Record<string, unknown>,
): Promise<RegistrationCredential> {
  if (Platform.OS === 'web') {
    // Web: use navigator.credentials.create
    const credential = await (navigator.credentials as CredentialsContainer).create({
      publicKey: options as unknown as PublicKeyCredentialCreationOptions,
    }) as PublicKeyCredential;

    const response = credential.response as AuthenticatorAttestationResponse;
    return {
      id: credential.id,
      rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
      type: 'public-key',
      response: {
        clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(response.clientDataJSON))),
        attestationObject: btoa(String.fromCharCode(...new Uint8Array(response.attestationObject))),
      },
    };
  }

  // Native: placeholder — integrate platform-specific FIDO2 SDK here
  throw new Error('FIDO2 enrollment is not yet supported on this platform. Use the web version or integrate a native FIDO2 SDK.');
}
