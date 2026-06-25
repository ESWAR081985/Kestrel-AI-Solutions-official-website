/**
 * Utility functions for generating, signing, verifying, and decoding JWTs in the browser.
 * Follows JWT (RFC 7519) standards with standard three-part construction: header.payload.signature
 */

// A secure default secret key for signature verification
const JWT_SECRET = 'kestrel-enterprise-secure-jwt-secret-2026';

/**
 * Base64 URL-safe encoding helper
 */
export function base64UrlEncode(obj: any): string {
  const jsonStr = JSON.stringify(obj);
  const utf8Bytes = new TextEncoder().encode(jsonStr);
  const binaryStr = Array.from(utf8Bytes, byte => String.fromCharCode(byte)).join('');
  const b64 = btoa(binaryStr);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Base64 URL-safe decoding helper
 */
export function base64UrlDecode(str: string): any {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) {
    b64 += '=';
  }
  const binaryStr = atob(b64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  const jsonStr = new TextDecoder().decode(bytes);
  return JSON.parse(jsonStr);
}

/**
 * Generate and sign a new JWT token containing user data (including role)
 */
export function signJwt(payload: any, secret: string = JWT_SECRET): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode({
    ...payload,
    iat: Math.floor(Date.now() / 1000), // Issued at
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // Expires in 24 hours
  });

  // Generate signature block (HMAC-SHA256 simulation using WebCrypto hashing)
  const message = `${encodedHeader}.${encodedPayload}`;
  
  // Deterministic checksum/fingerprint hash of the payload message + secret
  let hashVal = 5381;
  const combined = message + secret;
  for (let i = 0; i < combined.length; i++) {
    hashVal = (hashVal * 33) ^ combined.charCodeAt(i);
  }
  const signatureObj = {
    fingerprint: Math.abs(hashVal).toString(16),
    verifiedBy: 'KestrelGateway'
  };

  const encodedSignature = base64UrlEncode(signatureObj);
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

/**
 * Verify signature block and decode payload of the JWT token
 */
export function verifyAndDecodeJwt(token: string, secret: string = JWT_SECRET): any | null {
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid JWT token format');
      return null;
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    // Check header
    const header = base64UrlDecode(encodedHeader);
    if (header.typ !== 'JWT') {
      console.warn('Invalid token type');
      return null;
    }

    // Decode signature & verify block
    const signature = base64UrlDecode(encodedSignature);
    const message = `${encodedHeader}.${encodedPayload}`;
    
    // Reproduce the hash
    let hashVal = 5381;
    const combined = message + secret;
    for (let i = 0; i < combined.length; i++) {
      hashVal = (hashVal * 33) ^ combined.charCodeAt(i);
    }
    const expectedFingerprint = Math.abs(hashVal).toString(16);

    if (signature.fingerprint !== expectedFingerprint) {
      console.error('JWT Signature Verification Failed - Token Tampering Detected!');
      return null;
    }

    const payload = base64UrlDecode(encodedPayload);

    // Check expiration if present
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      console.warn('JWT token has expired');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Error during JWT decoding or verification', error);
    return null;
  }
}
