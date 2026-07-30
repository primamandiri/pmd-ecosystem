const STORAGE_KEY = "pmd_biometric";

export interface BiometricData {
  email: string;
  token: string;
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
  // Coba WebAuthn (fingerprint/face ID)
  try {
    if (!window.PublicKeyCredential) return true; // fallback: langsung lanjut
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    const cred = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [],
        userVerification: "required",
        timeout: 30000,
      },
    });
    return !!cred;
  } catch {
    // Kalau WebAuthn gagal (ga support/cancel), tetap lanjut
    return true;
  }
}

export async function registerBiometric(): Promise<boolean> {
  try {
    if (!window.PublicKeyCredential) return true;
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    const userId = new Uint8Array(16);
    crypto.getRandomValues(userId);
    const cred = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: "PMD Ecosystem", id: window.location.hostname },
        user: { id: userId, name: "user", displayName: "User" },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
        timeout: 30000,
      },
    });
    return !!cred;
  } catch {
    return false;
  }
}
