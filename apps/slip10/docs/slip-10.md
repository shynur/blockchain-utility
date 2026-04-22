# SLIP 10 : Universal private key derivation from master private key

## Abstract

SLIP-10 describes a generalized derivation scheme for private and public key pairs in hierarchical deterministic wallets for the curves secp256k1, NIST P-256, ed25519 and curve25519.

## Motivation

Some Trezor applications, in particular SSH and GPG, need different curve types, e.g., NIST P-256 and ed25519.
For security reasons different private and public key pairs should be used for these curves.
This SLIP describes how to derive a master private/public key for these curves by generalizing the derivation scheme used in [BIP 32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki).

## Body

Trezor generates all keys from a [BIP 39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) mnemonic or from a set of [SLIP 39](https://github.com/satoshilabs/slips/blob/master/slip-0039.md) mnemonic shares and optionally a passphrase.
Each of these standards specifies how to compute a seed from the mnemonic(s) and passphrase.
From this seed Trezor can create several master keys, one for each curve.
It uses a process similar and practically compatible with BIP-32.
For other curves it uses a different salt than BIP-32.
This avoids using the same private key for different elliptic curves with different orders.

### Master key generation

We adapt the master key generation from BIP-32.
To use different private keys for different curves we use different keys for the HMAC hash that generates the master key.
For the NIST P-256 curve the only other difference is the curve domain parameters.
In the algorithm below we denote the group order of the elliptic curve by $n$.
$point(k)$ is the scalar multiplication of the curve generator by the scalar $k$.
The operation ($+$) of two elements on the curve is the group point addition.
For ed25519 and curve25519 the private keys are no longer multipliers for the group generator; instead the hash of the private key is the multiplier.
For this reason, our scheme for ed25519 and curve25519 doesn’t support public key derivation and uses the produced hashes directly as private keys.

For ed25519 public keys we define $ser_P(P)$: serializes the elliptic curve point P = (x,y) on a twisted Edwards curve as a byte sequence:
0x00 || ENC(x, y), where ENC is defined in [RFC 8032](https://datatracker.ietf.org/doc/html/rfc8032).

For curve25519 public keys we define ser<sub>P</sub>(P): serializes the elliptic curve point P = (u,v) on a Montgomery curve as a byte sequence:
0x00 || encodeUCoordinate(u, 255), where encodeUCoordinate is defined in [RFC 7748](https://datatracker.ietf.org/doc/html/rfc7748).

For ed25519 and curve25519 private keys we define ser<sub>256</sub>(p) = p and parse<sub>256</sub>(p) = p, since private keys for these two curves aren’t integers but byte sequences.

To avoid invalid master keys, the algorithm is retried with the intermediate hash as new seed if the key is invalid.

Let S be a seed byte sequence of 128 to 512 bits in length.
This is the same as the seed byte sequence used in BIP-32.
The value of S should be the binary seed obtained from a BIP-39 mnemonic and optional passphrase or it should be the master secret obtained from a set of SLIP-39 mnemonics and optional passphrase.

1. Calculate I = HMAC-SHA512(Key = Curve, Data = S)
2. Split I into two 32-byte sequences, I<sub>L</sub> and I<sub>R</sub>.
3. Use parse<sub>256</sub>(I<sub>L</sub>) as master secret key, and I<sub>R</sub> as master chain code.
4. If curve isn’t ed25519 or curve25519 and I<sub>L</sub> is 0 or ≥ n (invalid key):
    - Set S := I and restart at step 1.

The supported curves are

- Curve = "Bitcoin seed" for the secp256k1 curve (this is compatible with BIP-32).
- Curve = "Nist256p1 seed" for the NIST P-256 curve.
- Curve = "ed25519 seed" for the ed25519 curve.
- Curve = "curve25519 seed" for curve25519.

For ed25519 and curve25519, the last step always succeeds since every 32-byte sequence (even all zero) is a valid private key.

### Child key derivation (CKD) functions

Private and public key derivation for NIST P-256 is identical to the generation for secp256k1 but uses the domain parameters of that curve.
We change BIP-32 to not fail if the resulting key isn’t valid but retry hashing until a valid key is found.
For ed25519 and curve25519 only hardened key generation from private parent key to private child key is supported.

Given a parent extended key and an index i, it’s possible to compute the corresponding child extended key.
The algorithm to do so depends on whether the child is a hardened key or not (or, equivalently, whether i ≥ 2<sup>31</sup>), and whether we’re talking about private or public keys.

#### Private parent key → private child key

Let n denote the order of the curve.

The function CKDpriv((k<sub>par</sub>, c<sub>par</sub>), i) → (k<sub>i</sub>, c<sub>i</sub>) computes a child extended private key from the parent extended private key:

1. Check whether i ≥ 2<sup>31</sup> (whether the child is a hardened key).
    - If so (hardened child): let I = HMAC-SHA512(Key = c<sub>par</sub>, Data = 0x00 || ser<sub>256</sub>(k<sub>par</sub>) || ser<sub>32</sub>(i)).
      (Note: The 0x00 pads the private key to make it 33 bytes long.)
    - If not (normal child):
        - If curve is ed25519 or curve25519: return failure.
        - let I = HMAC-SHA512(Key = c<sub>par</sub>, Data = ser<sub>P</sub>(point(k<sub>par</sub>)) || ser<sub>32</sub>(i)).
2. Split I into two 32-byte sequences, I<sub>L</sub> and I<sub>R</sub>.
3. The returned chain code c<sub>i</sub> is I<sub>R</sub>.
4. If curve is ed25519 or curve25519: The returned child key k<sub>i</sub> is I<sub>L</sub>.
5. If parse<sub>256</sub>(I<sub>L</sub>) ≥ n or parse<sub>256</sub>(I<sub>L</sub>) + k<sub>par</sub> (mod n) = 0 (resulting key is invalid):
    - let I = HMAC-SHA512(Key = c<sub>par</sub>, Data = 0x01 || I<sub>R</sub> || ser<sub>32</sub>(i) and restart at step 2.
6. Otherwise: The returned child key k<sub>i</sub> is parse<sub>256</sub>(I<sub>L</sub>) + k<sub>par</sub> (mod n).

The HMAC-SHA512 function is specified in [RFC 4231](https://datatracker.ietf.org/doc/html/rfc4231).

#### Public parent key → public child key

This function always fails for ed25519 and curve25519 since normal derivation isn’t supported.

The function CKDpub((K<sub>par</sub>, c<sub>par</sub>), i) → (K<sub>i</sub>, c<sub>i</sub>) computes a child extended public key from the parent extended public key.
It’s only defined for non-hardened child keys.

1. Check whether i ≥ 2<sup>31</sup> (whether the child is a hardened key).
    - If so (hardened child): return failure
    - If not (normal child): let I = HMAC-SHA512(Key = c<sub>par</sub>, Data = ser<sub>P</sub>(K<sub>par</sub>) || ser<sub>32</sub>(i)).
2. Split I into two 32-byte sequences, I<sub>L</sub> and I<sub>R</sub>.
3. The returned child key K<sub>i</sub> is point(parse<sub>256</sub>(I<sub>L</sub>)) + K<sub>par</sub>.
4. The returned chain code c<sub>i</sub> is I<sub>R</sub>.
5. If parse<sub>256</sub>(I<sub>L</sub>) ≥ n or K<sub>i</sub> is the point at infinity (the resulting key is invalid):
    - let I = HMAC-SHA512(Key = c<sub>par</sub>, Data = 0x01 || I<sub>R</sub> || ser<sub>32</sub>(i)) and restart at step 2.

## Compatibility with BIP-32

Master key generation in BIP-32 may result in an invalid key, in which case the wallet keys are undefined.
Similarly child key derivation may result in an invalid key, in which case the child key for the given index is undefined and one should proceed with the next index value.
For the secp256k1 curve the probability of this happening is lower than 2<sup>&minus;127</sup>, i.e. practically impossible.
For the NIST P-256 curve, on the other hand, the probability is 2<sup>&minus;32</sup>, i.e. unlikely but possible.
The present specification extends the BIP-32 definition of child key derivation so that the keys for all indices are well defined.
The reason for extending the definition is to avoid problems when dealing with the NIST P-256 curve.
However, the extended definition also applies to the secp256k1 curve.

For the secp256k1 curve the SLIP-10 derivation scheme is identical to BIP-32 with near certainty (probability greater than 1&minus;2<sup>&minus;127</sup> per derivation operation).
Theoretically, if a seed is used in a SLIP-10 wallet to receive assets and the seed is ported to a BIP-32 wallet, then there is an infinitesimal chance that some assets won’t be discovered by the BIP-32 wallet.
Conversely, if a seed is used in a BIP-32 wallet to receive assets and the seed is ported to a SLIP-10 wallet, then all assets will be discovered by the SLIP-10 wallet.

## Test vectors

See <https://github.com/satoshilabs/slips/blob/master/slip-0010.md#test-vectors>.

## Implementation

- [Python implementation to generate test vectors](https://github.com/satoshilabs/slips/blob/master/slip-0010/testvectors.py)

## References

- [BIP-32: Hierarchical Deterministic Wallets](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)
- [BIP-39: Mnemonic code for generating deterministic keys](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [SLIP-39: Shamir’s Secret-Sharing for Mnemonic Codes](https://github.com/satoshilabs/slips/blob/master/slip-0039.md)
- [RFC 8032: Edwards-Curve Digital Signature Algorithm (EdDSA)](https://datatracker.ietf.org/doc/html/rfc8032)
- [RFC 7748: Elliptic Curves for Security](https://datatracker.ietf.org/doc/html/rfc7748)
