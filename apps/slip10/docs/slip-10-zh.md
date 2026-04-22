# SLIP 10 : Universal private key derivation from master private key

## Abstract

> SLIP-10 describes a generalized derivation scheme for private and public key pairs in hierarchical deterministic wallets for the curves secp256k1, NIST P-256, ed25519 and curve25519.

SLIP-10 描述了一种 generalized derivation scheme，用于 hierarchical deterministic wallets 中 curves secp256k1、NIST P-256、ed25519 和 curve25519 的 private and public key pairs。

## Motivation

> Some Trezor applications, in particular SSH and GPG, need different curve types, e.g., NIST P-256 and ed25519.
> For security reasons different private and public key pairs should be used for these curves.
> This SLIP describes how to derive a master private/public key for these curves by generalizing the derivation scheme used in [BIP 32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki).

一些 Trezor applications，尤其是 SSH 和 GPG，需要不同的 curve types，例如 NIST P-256 和 ed25519。出于 security reasons，应为这些 curves 使用不同的 private and public key pairs。本 SLIP 通过 generalizing [BIP 32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki) 中使用的 derivation scheme，描述如何为这些 curves derive master private/public key。

## Body

> Trezor generates all keys from a [BIP 39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) mnemonic or from a set of [SLIP 39](https://github.com/satoshilabs/slips/blob/master/slip-0039.md) mnemonic shares and optionally a passphrase.
> Each of these standards specifies how to compute a seed from the mnemonic(s) and passphrase.
> From this seed Trezor can create several master keys, one for each curve.
> It uses a process similar and practically compatible with BIP-32.
> For other curves it uses a different salt than BIP-32.
> This avoids using the same private key for different elliptic curves with different orders.

Trezor 从 [BIP 39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) mnemonic，或从一组 [SLIP 39](https://github.com/satoshilabs/slips/blob/master/slip-0039.md) mnemonic shares 以及可选的 passphrase 生成所有 keys。这些 standards 都规定了如何从 mnemonic(s) 和 passphrase compute seed。Trezor 可以从这个 seed 创建多个 master keys，每个 curve 一个。它使用与 BIP-32 相似且实际兼容的 process。对于其他 curves，它使用不同于 BIP-32 的 salt。这避免了对具有不同 orders 的不同 elliptic curves 使用同一个 private key。

### Master key generation

> We adapt the master key generation from BIP-32.
> To use different private keys for different curves we use different keys for the HMAC hash that generates the master key.
> For the NIST P-256 curve the only other difference is the curve domain parameters.
> In the algorithm below we denote the group order of the elliptic curve by $n$.
> $`\mathrm{point}(k)`$ is the scalar multiplication of the curve generator by the scalar $k$.
> The operation $+$ of two elements on the curve is the group point addition.
> For ed25519 and curve25519 the private keys are no longer multipliers for the group generator; instead the hash of the private key is the multiplier.
> For this reason, our scheme for ed25519 and curve25519 doesn’t support public key derivation and uses the produced hashes directly as private keys.

我们改编 BIP-32 中的 master key generation。为了给不同 curves 使用不同的 private keys，我们为生成 master key 的 HMAC hash 使用不同的 keys。对于 NIST P-256 curve，唯一其他差异是 curve domain parameters。在下面的 algorithm 中，我们用 $n$ 表示 elliptic curve 的 group order。$`\mathrm{point}(k)`$ 是 curve generator 与 scalar $k$ 的 scalar multiplication。curve 上两个 elements 的 $+$ operation 是 group point addition。对于 ed25519 和 curve25519，private keys 不再是 group generator 的 multipliers；相反，private key 的 hash 才是 multiplier。因此，我们用于 ed25519 和 curve25519 的 scheme 不支持 public key derivation，并直接将产生的 hashes 用作 private keys。

> For ed25519 public keys we define $`\mathrm{ser}_P(P)`$: serializes the elliptic curve point $P = (x, y)$ on a twisted Edwards curve as a byte sequence:
> $`\texttt{0x00} \parallel \mathrm{ENC}(x, y)`$, where $`\mathrm{ENC}`$ is defined in [RFC 8032](https://datatracker.ietf.org/doc/html/rfc8032).

对于 ed25519 public keys，我们定义 $`\mathrm{ser}_P(P)`$：将 twisted Edwards curve 上的 elliptic curve point $P = (x, y)$ serialize 为 byte sequence：$`\texttt{0x00} \parallel \mathrm{ENC}(x, y)`$，其中 $`\mathrm{ENC}`$ 定义于 [RFC 8032](https://datatracker.ietf.org/doc/html/rfc8032)。

> For curve25519 public keys we define $`\mathrm{ser}_P(P)`$: serializes the elliptic curve point $P = (u, v)$ on a Montgomery curve as a byte sequence:
> $`\texttt{0x00} \parallel \mathrm{encodeUCoordinate}(u, 255)`$, where $`\mathrm{encodeUCoordinate}`$ is defined in [RFC 7748](https://datatracker.ietf.org/doc/html/rfc7748).

对于 curve25519 public keys，我们定义 $`\mathrm{ser}_P(P)`$：将 Montgomery curve 上的 elliptic curve point $P = (u, v)$ serialize 为 byte sequence：$`\texttt{0x00} \parallel \mathrm{encodeUCoordinate}(u, 255)`$，其中 $`\mathrm{encodeUCoordinate}`$ 定义于 [RFC 7748](https://datatracker.ietf.org/doc/html/rfc7748)。

> For ed25519 and curve25519 private keys we define $`\mathrm{ser}_{256}(p) = p`$ and $`\mathrm{parse}_{256}(p) = p`$, since private keys for these two curves aren’t integers but byte sequences.

对于 ed25519 和 curve25519 private keys，我们定义 $`\mathrm{ser}_{256}(p) = p`$ 和 $`\mathrm{parse}_{256}(p) = p`$，因为这两个 curves 的 private keys 不是 integers，而是 byte sequences。

> To avoid invalid master keys, the algorithm is retried with the intermediate hash as new seed if the key is invalid.

为避免 invalid master keys，如果 key invalid，则 algorithm 会使用 intermediate hash 作为 new seed 重试。

> Let $S$ be a seed byte sequence of 128 to 512 bits in length.
> This is the same as the seed byte sequence used in BIP-32.
> The value of $S$ should be the binary seed obtained from a BIP-39 mnemonic and optional passphrase or it should be the master secret obtained from a set of SLIP-39 mnemonics and optional passphrase.

令 $S$ 为长度为 128 到 512 bits 的 seed byte sequence。这与 BIP-32 中使用的 seed byte sequence 相同。$S$ 的值应是从 BIP-39 mnemonic 和可选 passphrase 得到的 binary seed，或是从一组 SLIP-39 mnemonics 和可选 passphrase 得到的 master secret。

> 1. Calculate $`I = \mathrm{HMAC-SHA512}(\mathrm{Key} = \mathrm{Curve}, \mathrm{Data} = S)`$.

1. 计算 $`I = \mathrm{HMAC-SHA512}(\mathrm{Key} = \mathrm{Curve}, \mathrm{Data} = S)`$。

> 2. Split $I$ into two 32-byte sequences, $I_L$ and $I_R$.

2. 将 $I$ split 为两个 32-byte sequences：$I_L$ 和 $I_R$。

> 3. Use $`\mathrm{parse}_{256}(I_L)`$ as master secret key, and $I_R$ as master chain code.

3. 使用 $`\mathrm{parse}_{256}(I_L)`$ 作为 master secret key，使用 $I_R$ 作为 master chain code。

> 4. If curve isn’t ed25519 or curve25519 and $I_L$ is $0$ or $\ge n$ (invalid key):
>    - Set $S := I$ and restart at step 1.

4. 如果 curve 不是 ed25519 或 curve25519，并且 $I_L$ 为 $0$ 或 $\ge n$（invalid key）：
   - 设置 $S := I$，并从 step 1 重新开始。

> The supported curves are

supported curves 为

> - Curve = `"Bitcoin seed"` for the secp256k1 curve (this is compatible with BIP-32).

- Curve = `"Bitcoin seed"` 用于 secp256k1 curve（这与 BIP-32 compatible）。

> - Curve = `"Nist256p1 seed"` for the NIST P-256 curve.

- Curve = `"Nist256p1 seed"` 用于 NIST P-256 curve。

> - Curve = `"ed25519 seed"` for the ed25519 curve.

- Curve = `"ed25519 seed"` 用于 ed25519 curve。

> - Curve = `"curve25519 seed"` for curve25519.

- Curve = `"curve25519 seed"` 用于 curve25519。

> For ed25519 and curve25519, the last step always succeeds since every 32-byte sequence (even all zero) is a valid private key.

对于 ed25519 和 curve25519，最后一步总是 succeeds，因为每个 32-byte sequence（即使全为 zero）都是 valid private key。

### Child key derivation (CKD) functions

> Private and public key derivation for NIST P-256 is identical to the generation for secp256k1 but uses the domain parameters of that curve.
> We change BIP-32 to not fail if the resulting key isn’t valid but retry hashing until a valid key is found.
> For ed25519 and curve25519 only hardened key generation from private parent key to private child key is supported.

NIST P-256 的 private and public key derivation 与 secp256k1 的 generation 相同，但使用该 curve 的 domain parameters。我们修改 BIP-32，使其在 resulting key invalid 时不会 fail，而是 retry hashing 直到找到 valid key。对于 ed25519 和 curve25519，仅支持从 private parent key 到 private child key 的 hardened key generation。

> Given a parent extended key and an index $i$, it’s possible to compute the corresponding child extended key.
> The algorithm to do so depends on whether the child is a hardened key or not (or, equivalently, whether $i \ge 2^{31}$), and whether we’re talking about private or public keys.

给定 parent extended key 和 index $i$，可以 compute 对应的 child extended key。执行此操作的 algorithm 取决于 child 是否为 hardened key（或等价地，$i \ge 2^{31}$ 是否成立），以及我们讨论的是 private keys 还是 public keys。

#### Private parent key → private child key

> Let $n$ denote the order of the curve.

令 $n$ 表示 curve 的 order。

> The function $`\mathrm{CKDpriv}((k_{\mathrm{par}}, c_{\mathrm{par}}), i) \to (k_i, c_i)`$ computes a child extended private key from the parent extended private key:

function $`\mathrm{CKDpriv}((k_{\mathrm{par}}, c_{\mathrm{par}}), i) \to (k_i, c_i)`$ 从 parent extended private key compute child extended private key：

> 1. Check whether $i \ge 2^{31}$ (whether the child is a hardened key).
>    - If so (hardened child): let $`I = \mathrm{HMAC-SHA512}(\mathrm{Key} = c_{\mathrm{par}}, \mathrm{Data} = \texttt{0x00} \parallel \mathrm{ser}_{256}(k_{\mathrm{par}}) \parallel \mathrm{ser}_{32}(i))`$.
>      (Note: The $`\texttt{0x00}`$ pads the private key to make it 33 bytes long.)
>    - If not (normal child):
>      - If curve is ed25519 or curve25519: return failure.
>      - let $`I = \mathrm{HMAC-SHA512}(\mathrm{Key} = c_{\mathrm{par}}, \mathrm{Data} = \mathrm{ser}_P(\mathrm{point}(k_{\mathrm{par}})) \parallel \mathrm{ser}_{32}(i))`$.

1. 检查 $i \ge 2^{31}$ 是否成立（child 是否为 hardened key）。
   - 如果成立（hardened child）：令 $`I = \mathrm{HMAC-SHA512}(\mathrm{Key} = c_{\mathrm{par}}, \mathrm{Data} = \texttt{0x00} \parallel \mathrm{ser}_{256}(k_{\mathrm{par}}) \parallel \mathrm{ser}_{32}(i))`$。
     （Note：$`\texttt{0x00}`$ 会 pad private key，使其长度为 33 bytes。）
   - 如果不成立（normal child）：
     - 如果 curve 是 ed25519 或 curve25519：return failure。
     - 令 $`I = \mathrm{HMAC-SHA512}(\mathrm{Key} = c_{\mathrm{par}}, \mathrm{Data} = \mathrm{ser}_P(\mathrm{point}(k_{\mathrm{par}})) \parallel \mathrm{ser}_{32}(i))`$。

> 2. Split $I$ into two 32-byte sequences, $I_L$ and $I_R$.

2. 将 $I$ split 为两个 32-byte sequences：$I_L$ 和 $I_R$。

> 3. The returned chain code $c_i$ is $I_R$.

3. returned chain code $c_i$ 是 $I_R$。

> 4. If curve is ed25519 or curve25519: The returned child key $k_i$ is $I_L$.

4. 如果 curve 是 ed25519 或 curve25519：returned child key $k_i$ 是 $I_L$。

> 5. If $`\mathrm{parse}_{256}(I_L) \ge n`$ or $`\left(\mathrm{parse}_{256}(I_L) + k_{\mathrm{par}}\right) \bmod n = 0`$ (resulting key is invalid):
>    - let $`I = \mathrm{HMAC-SHA512}(\mathrm{Key} = c_{\mathrm{par}}, \mathrm{Data} = \texttt{0x01} \parallel I_R \parallel \mathrm{ser}_{32}(i))`$ and restart at step 2.

5. 如果 $`\mathrm{parse}_{256}(I_L) \ge n`$，或 $`\left(\mathrm{parse}_{256}(I_L) + k_{\mathrm{par}}\right) \bmod n = 0`$（resulting key invalid）：
   - 令 $`I = \mathrm{HMAC-SHA512}(\mathrm{Key} = c_{\mathrm{par}}, \mathrm{Data} = \texttt{0x01} \parallel I_R \parallel \mathrm{ser}_{32}(i))`$，并从 step 2 重新开始。

> 6. Otherwise: The returned child key $k_i$ is $`\left(\mathrm{parse}_{256}(I_L) + k_{\mathrm{par}}\right) \bmod n`$.

6. 否则：returned child key $k_i$ 是 $`\left(\mathrm{parse}_{256}(I_L) + k_{\mathrm{par}}\right) \bmod n`$。

> The HMAC-SHA512 function is specified in [RFC 4231](https://datatracker.ietf.org/doc/html/rfc4231).

HMAC-SHA512 function 在 [RFC 4231](https://datatracker.ietf.org/doc/html/rfc4231) 中 specified。

#### Public parent key → public child key

> This function always fails for ed25519 and curve25519 since normal derivation isn’t supported.

由于不支持 normal derivation，此 function 对 ed25519 和 curve25519 始终 fails。

> The function $`\mathrm{CKDpub}((K_{\mathrm{par}}, c_{\mathrm{par}}), i) \to (K_i, c_i)`$ computes a child extended public key from the parent extended public key.
> It’s only defined for non-hardened child keys.

function $`\mathrm{CKDpub}((K_{\mathrm{par}}, c_{\mathrm{par}}), i) \to (K_i, c_i)`$ 从 parent extended public key compute child extended public key。它仅针对 non-hardened child keys 定义。

> 1. Check whether $i \ge 2^{31}$ (whether the child is a hardened key).
>    - If so (hardened child): return failure
>    - If not (normal child): let $`I = \mathrm{HMAC-SHA512}(\mathrm{Key} = c_{\mathrm{par}}, \mathrm{Data} = \mathrm{ser}_P(K_{\mathrm{par}}) \parallel \mathrm{ser}_{32}(i))`$.

1. 检查 $i \ge 2^{31}$ 是否成立（child 是否为 hardened key）。
   - 如果成立（hardened child）：return failure。
   - 如果不成立（normal child）：令 $`I = \mathrm{HMAC-SHA512}(\mathrm{Key} = c_{\mathrm{par}}, \mathrm{Data} = \mathrm{ser}_P(K_{\mathrm{par}}) \parallel \mathrm{ser}_{32}(i))`$。

> 2. Split $I$ into two 32-byte sequences, $I_L$ and $I_R$.

2. 将 $I$ split 为两个 32-byte sequences：$I_L$ 和 $I_R$。

> 3. The returned child key $K_i$ is $`\mathrm{point}(\mathrm{parse}_{256}(I_L)) + K_{\mathrm{par}}`$.

3. returned child key $K_i$ 是 $`\mathrm{point}(\mathrm{parse}_{256}(I_L)) + K_{\mathrm{par}}`$。

> 4. The returned chain code $c_i$ is $I_R$.

4. returned chain code $c_i$ 是 $I_R$。

> 5. If $`\mathrm{parse}_{256}(I_L) \ge n`$ or $K_i$ is the point at infinity (the resulting key is invalid):
>    - let $`I = \mathrm{HMAC-SHA512}(\mathrm{Key} = c_{\mathrm{par}}, \mathrm{Data} = \texttt{0x01} \parallel I_R \parallel \mathrm{ser}_{32}(i))`$ and restart at step 2.

5. 如果 $`\mathrm{parse}_{256}(I_L) \ge n`$，或 $K_i$ 是 point at infinity（resulting key invalid）：
   - 令 $`I = \mathrm{HMAC-SHA512}(\mathrm{Key} = c_{\mathrm{par}}, \mathrm{Data} = \texttt{0x01} \parallel I_R \parallel \mathrm{ser}_{32}(i))`$，并从 step 2 重新开始。

## Compatibility with BIP-32

> Master key generation in BIP-32 may result in an invalid key, in which case the wallet keys are undefined.
> Similarly child key derivation may result in an invalid key, in which case the child key for the given index is undefined and one should proceed with the next index value.
> For the secp256k1 curve the probability of this happening is lower than $2^{-127}$, i.e. practically impossible.
> For the NIST P-256 curve, on the other hand, the probability is $2^{-32}$, i.e. unlikely but possible.
> The present specification extends the BIP-32 definition of child key derivation so that the keys for all indices are well defined.
> The reason for extending the definition is to avoid problems when dealing with the NIST P-256 curve.
> However, the extended definition also applies to the secp256k1 curve.

BIP-32 中的 master key generation 可能产生 invalid key，在这种情况下 wallet keys 是 undefined。类似地，child key derivation 也可能产生 invalid key，在这种情况下给定 index 的 child key 是 undefined，并且应继续使用下一个 index value。对于 secp256k1 curve，发生这种情况的 probability 低于 $2^{-127}$，也就是 practically impossible。另一方面，对于 NIST P-256 curve，该 probability 是 $2^{-32}$，也就是 unlikely but possible。本 specification 扩展了 BIP-32 对 child key derivation 的 definition，使所有 indices 的 keys 都 well defined。扩展该 definition 的原因是避免处理 NIST P-256 curve 时的问题。不过，extended definition 也适用于 secp256k1 curve。

> For the secp256k1 curve the SLIP-10 derivation scheme is identical to BIP-32 with near certainty (probability greater than $1 - 2^{-127}$ per derivation operation).
> Theoretically, if a seed is used in a SLIP-10 wallet to receive assets and the seed is ported to a BIP-32 wallet, then there is an infinitesimal chance that some assets won’t be discovered by the BIP-32 wallet.
> Conversely, if a seed is used in a BIP-32 wallet to receive assets and the seed is ported to a SLIP-10 wallet, then all assets will be discovered by the SLIP-10 wallet.

对于 secp256k1 curve，SLIP-10 derivation scheme 几乎确定与 BIP-32 identical（每次 derivation operation 的 probability 大于 $1 - 2^{-127}$）。理论上，如果一个 seed 用于 SLIP-10 wallet 接收 assets，并且该 seed 被 ported 到 BIP-32 wallet，那么存在 infinitesimal chance，某些 assets 不会被 BIP-32 wallet discovered。反过来，如果一个 seed 用于 BIP-32 wallet 接收 assets，并且该 seed 被 ported 到 SLIP-10 wallet，那么所有 assets 都会被 SLIP-10 wallet discovered。

## Test vectors

> See <https://github.com/satoshilabs/slips/blob/master/slip-0010.md#test-vectors>.

参见 <https://github.com/satoshilabs/slips/blob/master/slip-0010.md#test-vectors>。

## Implementation

> - [Python implementation to generate test vectors](https://github.com/satoshilabs/slips/blob/master/slip-0010/testvectors.py)

- [Python implementation to generate test vectors](https://github.com/satoshilabs/slips/blob/master/slip-0010/testvectors.py)

## References

> - [BIP-32: Hierarchical Deterministic Wallets](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)

- [BIP-32: Hierarchical Deterministic Wallets](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)

> - [BIP-39: Mnemonic code for generating deterministic keys](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)

- [BIP-39: Mnemonic code for generating deterministic keys](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)

> - [SLIP-39: Shamir’s Secret-Sharing for Mnemonic Codes](https://github.com/satoshilabs/slips/blob/master/slip-0039.md)

- [SLIP-39: Shamir’s Secret-Sharing for Mnemonic Codes](https://github.com/satoshilabs/slips/blob/master/slip-0039.md)

> - [RFC 8032: Edwards-Curve Digital Signature Algorithm (EdDSA)](https://datatracker.ietf.org/doc/html/rfc8032)

- [RFC 8032: Edwards-Curve Digital Signature Algorithm (EdDSA)](https://datatracker.ietf.org/doc/html/rfc8032)

> - [RFC 7748: Elliptic Curves for Security](https://datatracker.ietf.org/doc/html/rfc7748)

- [RFC 7748: Elliptic Curves for Security](https://datatracker.ietf.org/doc/html/rfc7748)
