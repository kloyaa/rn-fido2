import { Platform } from 'react-native';
import { get } from 'react-native-passkeys';

export interface AssertionCredential {
  id: string;
  rawId: string;
  type: 'public-key';
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle?: string | null;
  };
  clientExtensionResults?: Record<string, unknown>;
}

export async function performAuthenticationCeremony(
  options: Record<string, unknown>,
): Promise<AssertionCredential> {
  if (Platform.OS === 'web') {
    const credential = await (navigator.credentials as CredentialsContainer).get({
      publicKey: options as unknown as PublicKeyCredentialRequestOptions,
    }) as PublicKeyCredential;

    const response = credential.response as AuthenticatorAssertionResponse;

    return {
      id: credential.id,
      rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
      type: 'public-key',
      response: {
        clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(response.clientDataJSON))),
        authenticatorData: btoa(String.fromCharCode(...new Uint8Array(response.authenticatorData))),
        signature: btoa(String.fromCharCode(...new Uint8Array(response.signature))),
        userHandle: response.userHandle
          ? btoa(String.fromCharCode(...new Uint8Array(response.userHandle)))
          : null,
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await get(options as any);
  if (!result) {
    const e = new Error('Passkey authentication was cancelled.');
    e.name = 'CEREMONY_CANCELLED';
    throw e;
  }
  return result as unknown as AssertionCredential;
}
