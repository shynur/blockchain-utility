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
        && [...BASE58_ALPHABET].every((ch, idx, str) => idx==0 || str[idx-1].charCodeAt(0)<ch.charCodeAt(0))
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

    console.assert(base58Encode(result) == base58)
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

    console.assert(await base58checkEncode(payload) == base58)
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
    console.assert(Number.isInteger(i) && 0 <= i && i < 2 ** 32)
    return new Uint8Array([i >>> 24, (i >>> 16) & 0xff, (i >>> 8) & 0xff, i & 0xff])
}

/**
 * Serialize an integer as a byte sequence, most significant byte first.
 * @param {bigint} p
 * @returns {Uint8Array} 32B
 */
function ser_256(p) {
    console.assert(0n <= p && p < 2n ** 256n)
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
 * Interpret a byte sequence as a number, most significant byte first.
 * @param {Readonly<Uint8Array>} p - 32B
 * @returns {bigint} 256-bit
 */
function parse_256(p) {
    console.assert(p.length == 32)
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

/**
 * Extended Public Key (K, c)
 */
class ExtendedPublicKey {
    /**
     * 32B public key
     * @type {Point_secp256k1} */
    #K
    /**
     * 32B chain code
     * @type {Uint8Array} */
    #c

    constructor(/** @type {Point_secp256k1} */ K, /** @type {Uint8Array} */ c) {
        this.#K = K
        this.#c = c
    }

    get K() { return this.#K }
    get c() { return this.#c }
}

/**
 * Extended Private Key (k, c)
 */
class ExtendedPrivateKey {
    /**
     * 32B private key
     * @type {Uint8Array} */
    #k
    /**
     * 32B chain code
     * @type {Uint8Array} */
    #c

    constructor(/** @type {Uint8Array} */ k, /** @type {Uint8Array} */ c) {
        this.#k = k
        this.#c = c
    }

    get k() { return this.#k }
    get c() { return this.#c }
}
