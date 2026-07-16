/**
 * Toy Learning With Errors (LWE) Cryptosystem
 * Demonstrates Lattice-Based Cryptography (Post-Quantum)
 * 
 * LWE is secure because finding the secret vector 's' from 'A' and 't = A*s + e'
 * requires solving the Bounded Distance Decoding (BDD) / Shortest Vector Problem (SVP)
 * which quantum computers cannot solve efficiently (unlike integer factoring used in RSA/ECC).
 */

const N = 8;        // Dimension of secret vector s
const Q = 127;      // Modulus (should be prime)
const STD_DEV = 1.5; // Standard deviation for Gaussian error vector noise

// Vector & Matrix helpers
function randomVector(dim: number, max: number = Q): number[] {
  return Array.from({ length: dim }, () => Math.floor(Math.random() * max));
}

function randomMatrix(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () => randomVector(cols));
}

// Generate small error from discrete Gaussian-like distribution
function sampleError(): number {
  // Box-Muller transform for normal distribution, then round & mod
  const u1 = Math.random() || 0.0001;
  const u2 = Math.random() || 0.0001;
  const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
  const error = Math.round(randStdNormal * STD_DEV);
  // Keep it small (e.g. -3 to +3)
  return Math.max(-4, Math.min(4, error));
}

function sampleErrorVector(dim: number): number[] {
  return Array.from({ length: dim }, () => sampleError());
}

// Math mod helper that handles negative numbers
function mod(n: number, m: number = Q): number {
  return ((n % m) + m) % m;
}

// Vector operations
function dotProduct(v1: number[], v2: number[]): number {
  return v1.reduce((sum, val, idx) => sum + val * v2[idx], 0);
}

function matrixVectorMultiply(A: number[][], s: number[]): number[] {
  return A.map(row => dotProduct(row, s));
}

// ----------------------------------------------------
// Public APIs for QPC Simulation
// ----------------------------------------------------

export interface QPCKeyPair {
  secretKey: number[];
  publicKey: {
    A: number[][]; // Random Matrix
    t: number[];   // t = A*s + e
  };
  latticeLogs: string[];
}

export interface QPCEncryptedBit {
  u: number[]; // u = r * A + e1
  v: number;   // v = r * t + e2 + m * (Q/2)
}

export function generateQPCKeyPair(): QPCKeyPair {
  const logs: string[] = [];
  logs.push(`Initializing Lattice Space: Dimension N=${N}, Modulus Q=${Q}`);

  // 1. Generate secret key s (small elements)
  const secretKey = randomVector(N, 5); // Keep secret key small
  logs.push(`Generated Secret Key vector 's': [${secretKey.join(', ')}]`);

  // 2. Generate public random matrix A (M x N)
  const M = 10; // Number of equations
  const A = randomMatrix(M, N);
  logs.push(`Generated public random Matrix 'A' (${M}x${N} lattice dimensions)`);

  // 3. Generate small noise vector e
  const e = sampleErrorVector(M);
  logs.push(`Sampled Gaussian error/noise vector 'e' (Quantum counter-measure): [${e.join(', ')}]`);

  // 4. Compute t = A*s + e (mod Q)
  const As = matrixVectorMultiply(A, secretKey);
  const t = As.map((val, idx) => mod(val + e[idx], Q));
  logs.push(`Computed public vector 't = A*s + e' (mod ${Q}): [${t.join(', ')}]`);

  return {
    secretKey,
    publicKey: { A, t },
    latticeLogs: logs
  };
}

/**
 * Encrypt a single binary bit (0 or 1) using LWE
 */
export function encryptBit(bit: number, publicKey: QPCKeyPair['publicKey']): QPCEncryptedBit {
  const { A, t } = publicKey;
  const M = A.length;

  // 1. Generate a random binary vector r
  const r = Array.from({ length: M }, () => Math.random() > 0.5 ? 1 : 0);

  // 2. Sample small errors e1 (vector of size N) and e2 (scalar)
  const e1 = sampleErrorVector(N);
  const e2 = sampleError();

  // 3. Compute u = r * A + e1 (mod Q)
  const u = Array.from({ length: N }, (_, colIdx) => {
    let sum = 0;
    for (let rowIdx = 0; rowIdx < M; rowIdx++) {
      sum += r[rowIdx] * A[rowIdx][colIdx];
    }
    return mod(sum + e1[colIdx], Q);
  });

  // 4. Compute v = r * t + e2 + bit * floor(Q/2) (mod Q)
  const rt = r.reduce((sum, val, idx) => sum + val * t[idx], 0);
  const halfQ = Math.floor(Q / 2);
  const v = mod(rt + e2 + bit * halfQ, Q);

  return { u, v };
}

/**
 * Decrypt a single single LWE encrypted bit
 */
export function decryptBit(cipher: QPCEncryptedBit, secretKey: number[]): number {
  const { u, v } = cipher;
  
  // Decrypt: dec = v - s * u (mod Q)
  const su = dotProduct(secretKey, u);
  const decVal = mod(v - su, Q);

  // Determine if closer to Q/2 (bit = 1) or 0 (bit = 0)
  const halfQ = Math.floor(Q / 2);
  const diffToOne = Math.min(Math.abs(decVal - halfQ), Math.abs(decVal - halfQ - Q), Math.abs(decVal - halfQ + Q));
  const diffToZero = Math.min(decVal, Q - decVal);

  return diffToOne < diffToZero ? 1 : 0;
}

/**
 * Helper to encrypt a full text string
 */
export function encryptString(text: string, publicKey: QPCKeyPair['publicKey']): QPCEncryptedBit[][] {
  const encryptedPayload: QPCEncryptedBit[][] = [];
  
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const bits: QPCEncryptedBit[] = [];
    
    // Convert char code to 8-bit binary representation and encrypt each bit
    for (let b = 0; b < 8; b++) {
      const bit = (charCode >> b) & 1;
      bits.push(encryptBit(bit, publicKey));
    }
    encryptedPayload.push(bits);
  }
  
  return encryptedPayload;
}

/**
 * Helper to decrypt a full payload
 */
export function decryptString(payload: QPCEncryptedBit[][], secretKey: number[]): string {
  let decryptedText = '';
  
  for (const charBits of payload) {
    let charCode = 0;
    for (let b = 0; b < 8; b++) {
      const decryptedBit = decryptBit(charBits[b], secretKey);
      charCode |= (decryptedBit << b);
    }
    decryptedText += String.fromCharCode(charCode);
  }
  
  return decryptedText;
}
