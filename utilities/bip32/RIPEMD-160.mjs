/**
 * Initial hash values (H0 through H4).
 * These are the same as MD4's initial values.
 * @type {Readonly<Uint32Array>}
 */
const H0 = Uint32Array.of(
  0x67452301,
  0xEFCDAB89,
  0x98BADCFE,
  0x10325476,
  0xC3D2E1F0,
);

/**
 * Additive constants for the LEFT computation line.
 * One constant per round (5 rounds total).
 *
 * - Round 1: 0x00000000  (no constant added)
 * - Round 2: 0x5A827999  (floor(2^30 * sqrt(2)))
 * - Round 3: 0x6ED9EBA1  (floor(2^30 * sqrt(3)))
 * - Round 4: 0x8F1BBCDC  (floor(2^30 * sqrt(5)))
 * - Round 5: 0xA953FD4E  (floor(2^30 * sqrt(7)))
 *
 * @type {Readonly<Uint32Array>}
 */
const KL = Uint32Array.of(
  0x00000000,
  0x5A827999,
  0x6ED9EBA1,
  0x8F1BBCDC,
  0xA953FD4E,
);

/**
 * Additive constants for the RIGHT computation line.
 * One constant per round (5 rounds total).
 *
 * - Round 1: 0x50A28BE6  (cube root of  2, floor(2^30 * cbrt(2)))
 * - Round 2: 0x5C4DD124  (cube root of  3, floor(2^30 * cbrt(3)))
 * - Round 3: 0x6D703EF3  (cube root of  5, floor(2^30 * cbrt(5)))
 * - Round 4: 0x7A6D76E9  (cube root of  7, floor(2^30 * cbrt(7)))
 * - Round 5: 0x00000000
 *
 * @type {Readonly<Uint32Array>}
 */
const KR = Uint32Array.of(
  0x50A28BE6,
  0x5C4DD124,
  0x6D703EF3,
  0x7A6D76E9,
  0x00000000,
);

// ============================================================================
// Section 2: Permutation Tables
// ============================================================================

/**
 * Message word selection for the LEFT line.
 * Determines which of the 16 message words (X[0..15]) is used at each
 * of the 80 steps (5 rounds x 16 steps).
 * @type {Readonly<Uint8Array>}
 */
const RL = Uint8Array.of(
  // Round 1: identity permutation
   0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
  // Round 2
   7,  4, 13,  1, 10,  6, 15,  3, 12,  0,  9,  5,  2, 14, 11,  8,
  // Round 3
   3, 10, 14,  4,  9, 15,  8,  1,  2,  7,  0,  6, 13, 11,  5, 12,
  // Round 4
   1,  9, 11, 10,  0,  8, 12,  4, 13,  3,  7, 15, 14,  5,  6,  2,
  // Round 5
   4,  0,  5,  9,  7, 12,  2, 10, 14,  1,  3,  8, 11,  6, 15, 13,
);

/**
 * Message word selection for the RIGHT line.
 * Same structure as RL but with a different permutation schedule.
 * @type {Readonly<Uint8Array>}
 */
const RR = Uint8Array.of(
  // Round 1
   5, 14,  7,  0,  9,  2, 11,  4, 13,  6, 15,  8,  1, 10,  3, 12,
  // Round 2
   6, 11,  3,  7,  0, 13,  5, 10, 14, 15,  8, 12,  4,  9,  1,  2,
  // Round 3
  15,  5,  1,  3,  7, 14,  6,  9, 11,  8, 12,  2, 10,  0,  4, 13,
  // Round 4
   8,  6,  4,  1,  3, 11, 15,  0,  5, 12,  2, 13,  9,  7, 10, 14,
  // Round 5
  12, 15, 10,  4,  1,  5,  8,  7,  6,  2, 13, 14,  0,  3,  9, 11,
);

/**
 * Left-rotation (shift) amounts for the LEFT line.
 * Each step rotates the intermediate result by the specified number of bits.
 * @type {Readonly<Uint8Array>}
 */
const SL = Uint8Array.of(
  // Round 1
  11, 14, 15, 12,  5,  8,  7,  9, 11, 13, 14, 15,  6,  7,  9,  8,
  // Round 2
   7,  6,  8, 13, 11,  9,  7, 15,  7, 12, 15,  9, 11,  7, 13, 12,
  // Round 3
  11, 13,  6,  7, 14,  9, 13, 15, 14,  8, 13,  6,  5, 12,  7,  5,
  // Round 4
  11, 12, 14, 15, 14, 15,  9,  8,  9, 14,  5,  6,  8,  6,  5, 12,
  // Round 5
   9, 15,  5, 11,  6,  8, 13, 12,  5, 12, 13, 14, 11,  8,  5,  6,
);

/**
 * Left-rotation (shift) amounts for the RIGHT line.
 * @type {Readonly<Uint8Array>}
 */
const SR = Uint8Array.of(
  // Round 1
   8,  9,  9, 11, 13, 15, 15,  5,  7,  7,  8, 11, 14, 14, 12,  6,
  // Round 2
   9, 13, 15,  7, 12,  8,  9, 11,  7,  7, 12,  7,  6, 15, 13, 11,
  // Round 3
   9,  7, 15, 11,  8,  6,  6, 14, 12, 13,  5, 14, 13, 13,  7,  5,
  // Round 4
  15,  5,  8, 11, 14, 14,  6, 14,  6,  9, 12,  9, 12,  5, 15,  8,
  // Round 5
   8,  5, 12,  9, 12,  5, 14,  6,  8, 13,  6,  5, 15, 13, 11, 11,
);

// ============================================================================
// Section 3: Bitwise Helper Functions
// ============================================================================

/**
 * Rotate a 32-bit integer left by `n` bits.
 * Bits shifted out on the left re-enter on the right.
 *
 * @param {number} x - The 32-bit integer to rotate
 * @param {number} n - Number of bit positions to rotate (0-31)
 * @returns {number} The rotated 32-bit integer
 */
function rotl32(x, n) {
  return (x << n) | (x >>> (32 - n));
}

// ============================================================================
// Section 4: Round Boolean Functions
// ============================================================================
//
// RIPEMD-160 uses five distinct boolean functions, one per round.
// Each function takes three 32-bit words and combines them bitwise.
// The left line uses them in order f1..f5 (rounds 1..5).
// The right line uses them in reverse order f5..f1 (rounds 1..5).
// ============================================================================

/**
 * Round 1 boolean function: XOR of all three inputs.
 * Used in left round 1 and right round 5.
 *
 * @param {number} x - First 32-bit word
 * @param {number} y - Second 32-bit word
 * @param {number} z - Third 32-bit word
 * @returns {number} x XOR y XOR z
 */
function f1(x, y, z) {
  return x ^ y ^ z;
}

/**
 * Round 2 boolean function: bitwise multiplexer / selection.
 * If a bit of x is 1, select the corresponding bit from y;
 * otherwise select the corresponding bit from z.
 * Used in left round 2 and right round 4.
 *
 * @param {number} x - Selector word
 * @param {number} y - First data word
 * @param {number} z - Second data word
 * @returns {number} (x AND y) OR (NOT x AND z)
 */
function f2(x, y, z) {
  return (x & y) | (~x & z);
}

/**
 * Round 3 boolean function.
 * Used in left round 3 and right round 3.
 *
 * @param {number} x - First 32-bit word
 * @param {number} y - Second 32-bit word
 * @param {number} z - Third 32-bit word
 * @returns {number} (x OR NOT y) XOR z
 */
function f3(x, y, z) {
  return (x | ~y) ^ z;
}

/**
 * Round 4 boolean function: bitwise multiplexer with swapped roles.
 * If a bit of z is 1, select the corresponding bit from x;
 * otherwise select the corresponding bit from y.
 * Used in left round 4 and right round 2.
 *
 * @param {number} x - First data word
 * @param {number} y - Second data word
 * @param {number} z - Selector word
 * @returns {number} (x AND z) OR (y AND NOT z)
 */
function f4(x, y, z) {
  return (x & z) | (y & ~z);
}

/**
 * Round 5 boolean function.
 * Used in left round 5 and right round 1.
 *
 * @param {number} x - First 32-bit word
 * @param {number} y - Second 32-bit word
 * @param {number} z - Third 32-bit word
 * @returns {number} x XOR (y OR NOT z)
 */
function f5(x, y, z) {
  return x ^ (y | ~z);
}

/**
 * Array of round functions indexed by round number (0-4).
 * Provides O(1) lookup during the compression loop.
 * @type {ReadonlyArray<(x: number, y: number, z: number) => number>}
 */
const ROUND_FUNCTIONS = [f1, f2, f3, f4, f5];

// ============================================================================
// Section 5: Message Padding
// ============================================================================

/**
 * Pad the input message according to the Merkle-Damgard construction:
 *
 * 1. Append a single '1' bit (0x80 byte).
 * 2. Append '0' bits until the message length is congruent to
 *    448 mod 512 (i.e., 56 mod 64 in bytes).
 * 3. Append the original message length as a 64-bit little-endian integer.
 *
 * The result length is always a multiple of 64 bytes (512 bits).
 *
 * @param {Readonly<Uint8Array>} message - The original message bytes
 * @returns {Readonly<Uint8Array>} The padded message
 */
function padMessage(message) {
  const msgLen = message.length;

  // Calculate padded length:
  // We need space for: message + 1 byte (0x80) + padding zeros + 8 bytes (length)
  // Total must be a multiple of 64.
  const remainder = (msgLen + 1 + 8) % 64;
  const paddingZeros = remainder === 0 ? 0 : 64 - remainder;
  const paddedLen = msgLen + 1 + paddingZeros + 8;

  const padded = new Uint8Array(paddedLen);

  // Copy original message
  padded.set(message);

  // Append the '1' bit (as 0x80 byte, since messages are byte-aligned)
  padded[msgLen] = 0x80;

  // Zero padding is implicit (Uint8Array is initialized to 0)

  // Append original message length in bits as a 64-bit little-endian integer.
  // JavaScript bitwise operators work on 32-bit integers, so we handle
  // the low and high 32 bits of (msgLen * 8) separately.
  const bitLenLow = (msgLen << 3) >>> 0;           // low 32 bits of (msgLen * 8)
  const bitLenHigh = (msgLen >>> 29) >>> 0;         // high 32 bits of (msgLen * 8)
  const lenOffset = paddedLen - 8;

  // Write low 32 bits in little-endian
  padded[lenOffset]     =  bitLenLow        & 0xFF;
  padded[lenOffset + 1] = (bitLenLow >>> 8)  & 0xFF;
  padded[lenOffset + 2] = (bitLenLow >>> 16) & 0xFF;
  padded[lenOffset + 3] = (bitLenLow >>> 24) & 0xFF;

  // Write high 32 bits in little-endian
  padded[lenOffset + 4] =  bitLenHigh        & 0xFF;
  padded[lenOffset + 5] = (bitLenHigh >>> 8)  & 0xFF;
  padded[lenOffset + 6] = (bitLenHigh >>> 16) & 0xFF;
  padded[lenOffset + 7] = (bitLenHigh >>> 24) & 0xFF;

  return padded;
}

// ============================================================================
// Section 6: Block Compression
// ============================================================================

/**
 * Process a single 512-bit (64-byte) message block and update the hash state.
 *
 * The compression function runs two independent parallel lines (left and right),
 * each performing 80 steps grouped into 5 rounds of 16 steps. After both lines
 * complete, their results are combined with the previous hash state.
 *
 * Each step in both lines follows the same structure:
 *   T = rotl32(A + f(B, C, D) + X[r[j]] + K, s[j]) + E
 *   A = E, E = D, D = rotl32(C, 10), C = B, B = T
 *
 * @param {Uint32Array} state - The current 5-word hash state [h0, h1, h2, h3, h4]
 * @param {Readonly<Uint8Array>} block - The 64-byte message block to process
 */
function compressBlock(state, block) {
  // ---- Parse the 64-byte block into 16 little-endian 32-bit words ----
  const X = new Uint32Array(16);
  for (let i = 0; i < 16; i++) {
    const off = i * 4;
    X[i] = block[off]
         | (block[off + 1] << 8)
         | (block[off + 2] << 16)
         | (block[off + 3] << 24);
  }

  // ---- Initialize working variables for both lines ----

  // Left line registers
  let al = state[0];
  let bl = state[1];
  let cl = state[2];
  let dl = state[3];
  let el = state[4];

  // Right line registers (start from the same state)
  let ar = state[0];
  let br = state[1];
  let cr = state[2];
  let dr = state[3];
  let er = state[4];

  // ---- Execute 80 steps (5 rounds x 16 steps) for both lines ----
  for (let j = 0; j < 80; j++) {
    // Determine the current round index (0-4)
    const round = (j >>> 4);  // equivalent to Math.floor(j / 16)

    // --- Left line step ---
    // The left line uses boolean functions in order: f1, f2, f3, f4, f5
    const fLeft = ROUND_FUNCTIONS[round];
    let tl = (al + fLeft(bl, cl, dl)) | 0;   // A + f(B, C, D)
    tl = (tl + X[RL[j]]) | 0;                // + message word
    tl = (tl + KL[round]) | 0;               // + round constant
    tl = (rotl32(tl, SL[j]) + el) | 0;       // rotate, then + E

    // Rotate registers for the left line
    al = el;
    el = dl;
    dl = rotl32(cl, 10);
    cl = bl;
    bl = tl;

    // --- Right line step ---
    // The right line uses boolean functions in REVERSE order: f5, f4, f3, f2, f1
    const fRight = ROUND_FUNCTIONS[4 - round];
    let tr = (ar + fRight(br, cr, dr)) | 0;   // A + f(B, C, D)
    tr = (tr + X[RR[j]]) | 0;                 // + message word
    tr = (tr + KR[round]) | 0;                // + round constant
    tr = (rotl32(tr, SR[j]) + er) | 0;        // rotate, then + E

    // Rotate registers for the right line
    ar = er;
    er = dr;
    dr = rotl32(cr, 10);
    cr = br;
    br = tr;
  }

  // ---- Combine results ----
  // The final addition combines the previous state with results from both lines.
  // Note the "cyclic shift" in how state words map to left/right registers:
  //   new h0 = old h1 + cl + dr
  //   new h1 = old h2 + dl + er
  //   new h2 = old h3 + el + ar
  //   new h3 = old h4 + al + br
  //   new h4 = old h0 + bl + cr
  const t = (state[1] + cl + dr) | 0;
  state[1] = (state[2] + dl + er) | 0;
  state[2] = (state[3] + el + ar) | 0;
  state[3] = (state[4] + al + br) | 0;
  state[4] = (state[0] + bl + cr) | 0;
  state[0] = t;
}

// ============================================================================
// Section 7: Main Hash Function
// ============================================================================

/**
 * Compute the RIPEMD-160 hash of the given message.
 *
 * @param {Readonly<Uint8Array>} message - The input message to hash
 * @returns {Uint8Array} The 20-byte (160-bit) hash digest
 *
 * @example
 * // Hash an empty string
 * const digest = RIPEMD160(new Uint8Array([]));
 * // digest = 9c1185a5c5e9fc54612808977ee8f548b2258d31
 *
 * @example
 * // Hash the ASCII string "abc"
 * const msg = new TextEncoder().encode("abc");
 * const digest = RIPEMD160(msg);
 * // digest = 8eb208f7e05d987a9b044a8e98c6b087f15a0bfc
 */
export function RIPEMD160(message) {
  // Step 1: Pad the message to a multiple of 512 bits (64 bytes)
  const padded = padMessage(message);

  // Step 2: Initialize hash state with standard initial values
  const state = new Uint32Array(H0);

  // Step 3: Process each 512-bit block sequentially
  const blockCount = padded.length / 64;
  for (let i = 0; i < blockCount; i++) {
    const block = padded.subarray(i * 64, (i + 1) * 64);
    compressBlock(state, block);
  }

  // Step 4: Serialize the final state as a 20-byte little-endian digest
  const digest = new Uint8Array(20);
  for (let i = 0; i < 5; i++) {
    const word = state[i];
    const off = i * 4;
    digest[off]     =  word        & 0xFF;
    digest[off + 1] = (word >>> 8)  & 0xFF;
    digest[off + 2] = (word >>> 16) & 0xFF;
    digest[off + 3] = (word >>> 24) & 0xFF;
  }

  return digest;
}
