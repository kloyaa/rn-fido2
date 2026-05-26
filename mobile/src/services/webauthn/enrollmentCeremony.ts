import { Platform } from 'react-native';
import { create } from 'react-native-passkeys';


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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await create(options as any);
  if (!result) {
    const e = new Error('Passkey creation was cancelled.');
    e.name = 'CEREMONY_CANCELLED';
    throw e;
  }
  return result as unknown as RegistrationCredential;
}
