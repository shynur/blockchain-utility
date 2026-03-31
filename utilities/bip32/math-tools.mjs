/*
 * 提供 BIP 32 所需的数学操作.
 * Copyright (C) 2026  谢骐 <shynur@outlook.com>.  All Rights Reserved.
 *
 * SPDX-License-Identifier: MPL-2.0
 */
/*
 * 依赖关系:
 *   本文件不依赖任何第三方库或宿主特定的 API, 仅使用 JavaScript 标准库, 当前目录的 modules, 或 Web API.
 *
 * Quality:
 *   类型注解使用 JSDoc, 可用 tsc 检查.
 */

import {
    CURVE_ORDER as N_SECP256K1_ORDER,
    G as G_SECP256K1,
    Point as Point_secp256k1,
} from './secp256k1.mjs'
import {RIPEMD160} from './RIPEMD-160.mjs'

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
console.assert(
    /^[^0OIl+/]{58}$/.test(BASE58_ALPHABET)
        && [...BASE58_ALPHABET].every((ch, idx, str) => idx==0 || str[idx-1].charCodeAt(0)<ch.charCodeAt(0)),
    'BASE58_ALPHABET must be 58 strictly-ascending chars excluding 0, O, I, l',
)

/**
 * base58 编码
 * @param {Readonly<Uint8Array>} bytes (big-endian)
 * @returns {string}
 */
function base58Encode(bytes) {
    let leadingZeros = 0
    for (const byte of bytes) {
        if (byte)
            break
        ++leadingZeros
    }

    let result = ''
    for (let num = bytes.reduce((acc, byte) => acc * 256n + BigInt(byte), 0n); num > 0n; num /= 58n)
        result = BASE58_ALPHABET[Number(num % 58n)] + result

    return '1'.repeat(leadingZeros) + result
}

/**
 * base58 解码
 * @param {string} base58
 * @returns {Uint8Array} (big-endian)
 * @throws {RangeError} 不是合法的 base58 字符
 */
function base58Decode(base58) {
    let leadingOnes = 0
    for (const ch of base58) {
        if (ch != '1')
            break
        ++leadingOnes
    }

    let num = 0n
    for (const ch of base58) {
        const digit = BASE58_ALPHABET.indexOf(ch)
        if (digit == -1)
            throw new RangeError(`Invalid base58 character: '${ch}'`)
        num = num * 58n + BigInt(digit)
    }

    const hex = num == 0n ? '' : num.toString(16)
    const paddedHex = hex.length % 2 ? '0' + hex : hex
    const dataBytes = new Uint8Array(paddedHex.length / 2)
    for (let i = 0; i < dataBytes.length; ++i)
        dataBytes[i] = parseInt(paddedHex.slice(2 * i, 2 * i + 2), 16)

    const result = cat(new Uint8Array(leadingOnes), dataBytes)

    console.assert(base58Encode(result) == base58, `base58 round-trip failed: ${base58}`)
    return result
}

/**
 * base58check 编码: payload → base58(payload ‖ SHA256(SHA256(payload))[:4])
 * @param {Readonly<Uint8Array>} payload (big-endian)
 * @returns {Promise<string>}
 */
async function base58checkEncode(payload) {
    const checksum = (await SHA256(await SHA256(payload))).slice(0, 4)

    const data = cat(payload, checksum)

    return base58Encode(data)
}

/**
 * base58check 解码: base58 → payload (验证 checksum)
 * @param {string} base58
 * @returns {Promise<Uint8Array>} payload (big-endian)
 * @throws {RangeError} 解码后数据不足 4B (一个 checksum 的长度)
 * @throws {Error} checksum 校验失败
 */
async function base58checkDecode(base58) {
    const data = base58Decode(base58)
    if (data.length < 4)
        throw new RangeError(`base58check: expected at least 4B, got ${data.length}`)

    const payload = data.slice(0, -4)
    const checksum = data.slice(-4)

    const expected = (await SHA256(await SHA256(payload))).slice(0, 4)

    if (!checksum.every((byte, i) => byte == expected[i]))
        throw new Error('base58check checksum mismatch')

    console.assert(await base58checkEncode(payload) == base58, `base58check round-trip failed: ${base58}`)
    return payload
}

/**
 * Concatenate byte sequences.
 * @param {Readonly<Uint8Array>[]} byte_sequences
 * @returns {Uint8Array}
 */
function cat(...byte_sequences) {
    const result = new Uint8Array(byte_sequences.reduce((len, a) => len + a.length, 0))
    let offset = 0
    for (const a of byte_sequences) {
        result.set(a, offset)
        offset += a.length
    }
    return result
}

/**
 * HMAC-SHA512 (RFC 4231).
 * @param {string | Readonly<Uint8Array>} key - 字符串会经 UTF-8 编码为字节
 * @param {Readonly<Uint8Array>} data
 * @returns {Promise<Uint8Array>}
 */
async function HMAC_SHA512(key, data) {
    const rawKey = typeof key == 'string' ? new TextEncoder().encode(key) : key
    const cryptoKey = await crypto.subtle.importKey(
        'raw', rawKey, { name: 'HMAC', hash: 'SHA-512' }, false, ['sign'],
    )
    return new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, data))
}

/**
 * @param {Readonly<Uint8Array>} data
 * @returns {Promise<Uint8Array>}
 */
async function SHA256(data) {
    return new Uint8Array(await crypto.subtle.digest('SHA-256', data))
}

/**
 * RIPEMD160 after SHA256
 * @param {Readonly<Uint8Array>} data
 * @returns {Promise<Uint8Array>} 20B
 */
async function Hash160(data) {
    return RIPEMD160(await SHA256(data))
}

/**
 * Serialize an unsigned integer as a byte sequence, most significant byte first.
 * @param {number | bigint} i - a 32-bit unsigned integer
 * @returns {Uint8Array} 4B
 */
function ser_32(i) {
    i = Number(i)
    console.assert(Number.isInteger(i) && 0 <= i && i < 2 ** 32, `ser_32: expected uint32, got ${i}`)
    return new Uint8Array([i >>> 24, (i >>> 16) & 0xff, (i >>> 8) & 0xff, i & 0xff])
}

/**
 * Serialize an integer as a byte sequence, most significant byte first.
 * @param {bigint} p
 * @returns {Uint8Array} 32B
 */
function ser_256(p) {
    console.assert(0n <= p && p < 2n ** 256n, `ser_256: expected 256-bit unsigned integer, got ${p}`)
    const result = new Uint8Array(32)
    for (let i = 31; i >= 0; --i) {
        result[i] = Number(p & 0xffn)
        p >>= 8n
    }
    return result
}

/**
 * Return the coordinate pair resulting from EC point multiplication
 * (repeated application of the EC group operation) of the secp256k1
 * base point with the integer p (i.e., the operation used to compute
 * a public key from a private key).
 * @param {bigint} p
 * @returns {{x: bigint, y: bigint}}
 */
function point(p) {
    const {x, y} = G_SECP256K1.multiply(p)
    return {x, y}
}

/**
 * Interpret a 4-byte sequence as an unsigned 32-bit integer, most significant byte first.
 * @param {Readonly<Uint8Array>} bytes - 4B
 * @returns {number}
 */
function parse_32(bytes) {
    console.assert(bytes.length == 4, `parse_32: expected 4B, got ${bytes.length}B`)
    return (bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3]) >>> 0
}

/**
 * Interpret a byte sequence as a number, most significant byte first.
 * @param {Readonly<Uint8Array>} p - 32B
 * @returns {bigint} 256-bit
 */
function parse_256(p) {
    console.assert(p.length == 32, `parse_256: expected 32B, got ${p.length}B`)
    return p.reduce((acc, byte) => acc << 8n | BigInt(byte), 0n)
}

/**
 * Serializes the coordinate pair P = (x,y) as a byte sequence using SEC1's compressed form:
 *     (0x02 or 0x03) || ser_256(x),
 * where the header byte depends on the parity of the omitted y coordinate.
 * @param {{x: bigint, y: bigint}} P
 * @returns {Uint8Array} 33B
 */
function ser_P(P) {
    return new Point_secp256k1(P.x, P.y).serialize()
}

class XKey {
    /**
     * 32B chain code
     * @type {bigint} */
    c

    /**
     * child number
     * @type {number} 4B */
    i

    /**
     * @type {number} 1B */
    depth

    /**
     * @type {'mainnet' | 'testnet'} */
    version

    /**
     * @type {Readonly<Uint8Array>} 4B */
    parent_fingerprint

    constructor(
        /** @type {bigint} */ chain_code,
        /** @type {{ChildNumber:number, Depth:number, Version:'mainnet'|'testnet', ParentFingerprint:Readonly<Uint8Array>}} */ {
            ChildNumber=0, Depth=0, Version='mainnet', ParentFingerprint=new Uint8Array(4)
        } = {}
    ) {
        console.assert(0n <= chain_code && chain_code < 2n**256n, `XKey: chain_code out of 256-bit range`)
        this.c = chain_code
        Object.defineProperty(this, 'c', {writable: false, configurable: false})

        console.assert(Number.isInteger(ChildNumber) && 0 <= ChildNumber && ChildNumber < 2**32, `XKey: ChildNumber must be uint32, got ${ChildNumber}`)
        this.i = ChildNumber
        Object.defineProperty(this, 'i', {writable: false, configurable: false})

        console.assert(Number.isInteger(Depth) && 0 <= Depth && Depth < 256, `XKey: Depth must be uint8, got ${Depth}`)
        this.depth = Depth
        Object.defineProperty(this, 'depth', {writable: false, configurable: false})

        this.version = Version
        Object.defineProperty(this, 'version', {writable: false, configurable: false})

        console.assert(ParentFingerprint.length == 4, `XKey: ParentFingerprint must be 4B, got ${ParentFingerprint.length}B`)
        this.parent_fingerprint = ParentFingerprint
        Object.defineProperty(this, 'parent_fingerprint', {writable: false, configurable: false})
    }

    /**
     * The first 32 bits of the identifier are called the key fingerprint.
     * @returns {Promise<Uint8Array>} 4B
     */
    async fingerprint() {
        return (await this.identifier()).slice(0, 4)
    }

    /**
     * Cascade CKD constructions to build a tree.
     * @param {string} path - e.g. "/0'/1/2H/3"
     */
    async tree(path) {
        path = path.replace(/\s/g, '')
        if (path == '')
            return this
        console.assert(path[0] == '/' && path[path.length-1] != '/', `tree: invalid path format: "${path}"`)

        const nodes = path.slice(1).split('/')
        const firstNode = nodes[0]
        const firstIsHardened = firstNode.endsWith("'") || firstNode.endsWith('H')
        const firstKey = await this.CKD(parseInt(firstNode) + (firstIsHardened ? 2**31 : 0))

        return firstKey.tree(nodes.slice(1).map(i => `/${i}`).join(''))
    }

    /**
     * Deserialize a serialized extended key.  See BIP 32.
     * @param {string} base58check - 111-char base58check string
     * @returns {Promise<XPublicKey | XPrivateKey>}
     * @throws {Error} checksum 校验失败, 或 version 无法识别
     */
    static async deserialize(base58check) {
        console.assert(base58check.length == 111, `deserialize: expected 111-char base58check string, got ${base58check.length} chars`)
        const payload = await base58checkDecode(base58check)
        console.assert(payload.length == 78, `deserialize: expected 78B payload, got ${payload.length}B`)

        const version_bytes = parse_32(payload.slice(0, 4))
        const depth = payload[4]
        const parent_fingerprint = payload.slice(5, 9)
        const child_number = parse_32(payload.slice(9, 13))
        const chain_code = parse_256(payload.slice(13, 45))
        const key_data = payload.slice(45, 78)

        const is_public = version_bytes == 0x0488B21E || version_bytes == 0x043587CF
        const is_private = version_bytes == 0x0488ADE4 || version_bytes == 0x04358394
        if (!is_public && !is_private)
            throw new Error(`Unknown version bytes: 0x${version_bytes.toString(16).padStart(8, '0')}`)

        const version = (version_bytes == 0x0488B21E || version_bytes == 0x0488ADE4) ? 'mainnet' : 'testnet'

        const derivation_info = {
            ChildNumber: child_number,
            Depth: depth,
            Version: version,
            ParentFingerprint: parent_fingerprint,
        }

        if (is_public) {
            const K = Point_secp256k1.deserialize(key_data)
            return new XPublicKey(K, chain_code, derivation_info)
        } else {
            console.assert(key_data[0] == 0x00, `deserialize: private key_data must start with 0x00, got 0x${key_data[0].toString(16).padStart(2, '0')}`)
            const k = parse_256(key_data.slice(1))
            return new XPrivateKey(k, chain_code, derivation_info)
        }
    }

    async serialize() {
        const is_pub_key = this instanceof XPublicKey

        const version_bytes = this.version == 'mainnet'
            ? (is_pub_key ? 0x0488B21E : 0x0488ADE4)
            : (is_pub_key ? 0x043587CF : 0x04358394)

        const key_data = this instanceof XPublicKey
            ? ser_P({x: this.K.x, y: this.K.y})
            : cat(new Uint8Array([0x00]), ser_256(this.k))

        const payload = cat(
            ser_32(version_bytes),
            new Uint8Array([this.depth]),
            this.parent_fingerprint,
            ser_32(this.i),
            ser_256(this.c),
            key_data,
        )
        console.assert(payload.length == 78, `serialize: expected 78B payload, got ${payload.length}B`)

        const base58check = await base58checkEncode(payload)
        console.assert(
            base58check.length == 111
                && base58check.startsWith(
                    this.version == 'mainnet'
                        ? (is_pub_key ? 'xpub' : 'xprv')
                        : (is_pub_key ? 'tpub' : 'tprv')
                ),
            `serialize: unexpected base58check output: ${base58check.slice(0, 10)}... (length ${base58check.length})`,
        )
        return base58check
    }
}

/**
 * Extended Public Key (K, c)
 */
class XPublicKey extends XKey {
    /**
     * 32B public key
     * @type {Point_secp256k1} */
    K

    constructor(
        /** @type {Point_secp256k1} */ K, /** @type {bigint} */ c,
        /** @type {{ChildNumber:number, Depth:number, Version:'mainnet'|'testnet', ParentFingerprint:Readonly<Uint8Array>}} */ derivation_info
    ) {
        super(c, derivation_info)
        this.K = K
        Object.defineProperty(this, 'K', {writable: false, configurable: false})
    }

    /**
     * Hash160(ser_P(K)): the key identifier.
     * @returns {Promise<Uint8Array>} 20B
     */
    async identifier() {
        return Hash160(ser_P({x: this.K.x, y: this.K.y}))
    }

    /**
     * CKDpub
     * @param {number | bigint} i
     * @returns {Promise<XPublicKey>} */
    async CKD(i) {
        i = Number(i)
        console.assert(Number.isInteger(i) && 0 <= i && i < 2 ** 32, `CKDpub: i must be uint32, got ${i}`)

        if (i >= 2 ** 31)
            throw new RangeError(`CKDpub is only defined for normal child key: i=${i}`)

        const I = await HMAC_SHA512(ser_256(this.c), cat(ser_P({x: this.K.x, y: this.K.y}), ser_32(i)))
        const I_L = I.slice(0, 32)
        const I_R = I.slice(32)

        if (parse_256(I_L) >= N_SECP256K1_ORDER)
            return this.CKD(i + 1)

        const K_i = Point_secp256k1.add(
            function() {
                const {x, y} = point(parse_256(I_L))
                return new Point_secp256k1(x, y);
            }(),
            this.K
        )
        if (K_i.atInfinity())
            return this.CKD(i + 1)

        return new XPublicKey(K_i, parse_256(I_R), {
            ChildNumber: i,
            Depth: this.depth + 1,
            Version: this.version,
            ParentFingerprint: await this.fingerprint(),
        })
    }
}

/**
 * Extended Private Key (k, c)
 */
export class XPrivateKey extends XKey {
    /**
     * 32B private key
     * @type {bigint} */
    k

    constructor(
        /** @type {bigint} */ k, /** @type {bigint} */ c,
        /** @type {{ChildNumber:number, Depth:number, Version:'mainnet'|'testnet', ParentFingerprint:Readonly<Uint8Array>}} */ derivation_info
    ) {
        super(c, derivation_info)
        console.assert(0n <= k && k < 2n ** 256n, `XPrivateKey: k out of 256-bit range`)
        this.k = k
        Object.defineProperty(this, 'k', {writable: false, configurable: false})
    }

    /**
     * BIP 32 master key generation.
     * @param {Readonly<Uint8Array>} seed - 128-512 bits
     * @returns {Promise<XPrivateKey>}
     */
    static async from(seed) {
        const I = await HMAC_SHA512('Bitcoin seed', seed)
        const I_L = I.slice(0, 32)
        const I_R = I.slice(32)

        console.assert(parse_256(I_L) != 0n && parse_256(I_L) < N_SECP256K1_ORDER, 'master key generation: I_L must be non-zero and less than curve order')
        return new XPrivateKey(parse_256(I_L), parse_256(I_R))
    }

    /**
     * Hash160(ser_P(point(k))): the key identifier.
     * @returns {Promise<Uint8Array>} 20B
     */
    async identifier() {
        return Hash160(ser_P(point(this.k)))
    }

    /**
     * N((k, c)) → (K, c)
     * Compute the extended public key corresponding to an extended private key
     * (the “neutered” version, as it removes the ability to sign transactions).
     * @returns {XPublicKey} */
    N() {
        const {x: k_x, y: k_y} = point(this.k)
        return new XPublicKey(new Point_secp256k1(k_x, k_y), this.c, {
            ChildNumber: this.i,
            Depth: this.depth,
            Version: this.version,
            ParentFingerprint: this.parent_fingerprint,
        })
    }

    /**
     * CKDpriv
     * @param {number | bigint} i
     * @returns {Promise<XPrivateKey>} */
    async CKD(i) {
        i = Number(i)
        console.assert(Number.isInteger(i) && 0 <= i && i < 2 ** 32, `CKDpriv: i must be uint32, got ${i}`)

        const data = i >= 2 ** 31
            ? cat(new Uint8Array([0x00]), ser_256(this.k), ser_32(i))
            : cat(ser_P(point(this.k)), ser_32(i))

        const I = await HMAC_SHA512(ser_256(this.c), data)
        const I_L = I.slice(0, 32)
        const I_R = I.slice(32)

        if (parse_256(I_L) >= N_SECP256K1_ORDER)
            return this.CKD(i + 1)

        const k_i = (parse_256(I_L) + this.k) % N_SECP256K1_ORDER
        if (k_i == 0n)
            return this.CKD(i + 1)

        return new XPrivateKey(k_i, parse_256(I_R), {
            ChildNumber: i,
            Depth: this.depth + 1,
            Version: this.version,
            ParentFingerprint: await this.fingerprint(),
        })
    }
}
