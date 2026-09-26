/**
 * Standard RFC 6238 TOTP (Time-Based One-Time Password) implementation
 * compatible with Google Authenticator, Microsoft Authenticator, Authy, etc.
 * Uses native Web Crypto API for secure HMAC-SHA1 calculation.
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32ToBytes(base32: string): Uint8Array {
  const sanitized = base32.toUpperCase().replace(/[\s-]/g, '').replace(/=+$/, '');
  const bytes: number[] = [];
  let buffer = 0;
  let bitsLeft = 0;

  for (let i = 0; i < sanitized.length; i++) {
    const val = BASE32_ALPHABET.indexOf(sanitized[i]);
    if (val === -1) {
      continue; // Skip unrecognized characters
    }
    buffer = (buffer << 5) | val;
    bitsLeft += 5;

    if (bitsLeft >= 8) {
      bitsLeft -= 8;
      bytes.push((buffer >> bitsLeft) & 0xff);
    }
  }

  return new Uint8Array(bytes);
}

export function bytesToBase32(bytes: Uint8Array): string {
  let result = '';
  let buffer = 0;
  let bitsLeft = 0;

  for (let i = 0; i < bytes.length; i++) {
    buffer = (buffer << 8) | bytes[i];
    bitsLeft += 8;

    while (bitsLeft >= 5) {
      bitsLeft -= 5;
      result += BASE32_ALPHABET[(buffer >> bitsLeft) & 0x1f];
    }
  }

  if (bitsLeft > 0) {
    result += BASE32_ALPHABET[(buffer << (5 - bitsLeft)) & 0x1f];
  }

  return result;
}

export function generateTotpSecret(length: number = 16): string {
  const randomBytes = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < length; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytesToBase32(randomBytes).slice(0, length);
}

/**
 * Computes standard 6-digit TOTP for a given Base32 secret at a given Unix timestamp in seconds.
 */
export async function generateTotpCode(
  secretBase32: string,
  timestampSeconds: number = Math.floor(Date.now() / 1000),
  stepSeconds: number = 30
): Promise<string> {
  const keyBytes = base32ToBytes(secretBase32);
  if (keyBytes.length === 0) {
    throw new Error('Invalid Base32 secret key');
  }

  const timeStep = Math.floor(timestampSeconds / stepSeconds);

  // Convert timeStep to 8-byte big-endian ArrayBuffer
  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);
  // High 4 bytes
  counterView.setUint32(0, Math.floor(timeStep / 0x100000000), false);
  // Low 4 bytes
  counterView.setUint32(4, timeStep & 0xffffffff, false);

  // Import HMAC-SHA1 key
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyBytes.buffer as ArrayBuffer,
    { name: 'HMAC', hash: { name: 'SHA-1' } },
    false,
    ['sign']
  );

  // Sign the 8-byte counter
  const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
  const hmac = new Uint8Array(signature);

  // Dynamic truncation (RFC 4226)
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

/**
 * Validates a user-entered TOTP token against their Google Authenticator app secret.
 * Checks the current time window, plus/minus tolerance windows for clock drift.
 */
export async function verifyTotpToken(
  secretBase32: string,
  userToken: string,
  toleranceSteps: number = 1
): Promise<{ valid: boolean; matchedDelta?: number }> {
  const cleanToken = userToken.replace(/\s+/g, '');
  if (!/^\d{6}$/.test(cleanToken)) {
    return { valid: false };
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const stepSeconds = 30;

  for (let delta = -toleranceSteps; delta <= toleranceSteps; delta++) {
    const testTime = nowSeconds + delta * stepSeconds;
    try {
      const expectedCode = await generateTotpCode(secretBase32, testTime, stepSeconds);
      if (expectedCode === cleanToken) {
        return { valid: true, matchedDelta: delta };
      }
    } catch {
      // Continue checking next window
    }
  }

  return { valid: false };
}

export function buildTotpUri(
  secret: string,
  accountName: string = 'BankAdmin',
  issuer: string = 'Northern Trust'
): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(accountName);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret.replace(/\s+/g, '')}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}
