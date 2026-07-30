const STORAGE_KEY = "pmd_biometric";

export interface BiometricData {
  email: string;
  name: string;
}

export function isBiometricSupported(): boolean {
  return typeof window !== "undefined" && 
    !!window.PublicKeyCredential && 
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function";
}

export async function isBiometricAvailable(): Promise<boolean> {
  if (!isBiometricSupported()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function getSavedBiometric(): BiometricData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

export function saveBiometric(data: BiometricData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function removeBiometric() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function authenticateWithBiometric(): Promise<boolean> {
  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [],
        userVerification: "required",
        timeout: 60000,
      },
    });
    return !!assertion;
  } catch (e: any) {
    if (e.name === "NotAllowedError") return false;
    throw e;
  }
}

export async function registerBiometric(email: string, displayName: string): Promise<boolean> {
  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    const userId = new Uint8Array(16);
    crypto.getRandomValues(userId);

    const cred = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: "PMD Ecosystem", id: window.location.hostname },
        user: { id: userId, name: email, displayName },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
        timeout: 60000,
      },
    });
    return !!cred;
  } catch { return false; }
}
