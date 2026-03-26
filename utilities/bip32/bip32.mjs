/*
 * 提供 BIP 32 提及的若干实用工具函数.
 * Copyright (C) 2026  谢骐 <shynur@outlook.com>.  All Rights Reserved.
 *
 * SPDX-License-Identifier: MPL-2.0
 */
/*
 * Overview:
 *   TODO
 *
 * 依赖关系:
 *   本文件不依赖任何第三方库或宿主特定的 API, 仅使用 JavaScript 标准库, 当前目录的 modules, 或 Web API.
 *
 * Quality:
 *   类型注解使用 JSDoc, 可用 tsc 检查.
 */

import {

} from './secp256k1.mjs'

/**
 * base58 编码
 * @param {Uint8Array} bytes (big-endian)
 * @returns {string}
 */
function base58Encode(bytes) {
    const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    console.assert(
        /^[^0OIl+/]{58}$/.test(ALPHABET)
            && [...ALPHABET].every((ch, idx, str) => idx==0 || str[idx-1].charCodeAt(0)<ch.charCodeAt(0))
    )

    let leadingZeros = 0
    for (const byte of bytes) {
        if (byte)
            break
        ++leadingZeros
    }

    let result = ''
    for (let num = bytes.reduce((acc, byte) => acc * 256n + BigInt(byte), 0n); num > 0n; num /= 58n)
        result = ALPHABET[Number(num % 58n)] + result

    return '1'.repeat(leadingZeros) + result
}

/**
 * base58 解码
 * @param {string} base58
 * @returns {Uint8Array} (big-endian)
 * @throws {RangeError} 不是合法的 base58 字符
 */
function base58Decode(base58) {
    const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

    let leadingOnes = 0
    for (const ch of base58) {
        if (ch !== '1')
            break
        ++leadingOnes
    }

    let num = 0n
    for (const ch of base58) {
        const digit = ALPHABET.indexOf(ch)
        if (digit == -1)
            throw new RangeError(`Invalid base58 character: '${ch}'`)
        num = num * 58n + BigInt(digit)
    }

    const hex = num == 0n ? '' : num.toString(16)
    const paddedHex = hex.length % 2 ? '0' + hex : hex
    const dataBytes = new Uint8Array(paddedHex.length / 2)
    for (let i = 0; i < dataBytes.length; ++i)
        dataBytes[i] = parseInt(paddedHex.slice(2 * i, 2 * i + 2), 16)

    const result = new Uint8Array(leadingOnes + dataBytes.length)
    result.set(dataBytes, leadingOnes)

    console.assert(base58Encode(result) == base58)
    return result
}

/**
 * base58check 编码: payload → base58(payload ‖ double_sha256(payload)[:4])
 * @param {Uint8Array} payload (big-endian)
 * @returns {Promise<string>}
 */
async function base58check_encode(payload) {
    const sha256 = async (data) => new Uint8Array(await crypto.subtle.digest('SHA-256', data))
    const checksum = (await sha256(await sha256(payload))).slice(0, 4)

    const data = new Uint8Array(payload.length + 4)
    data.set(payload)
    data.set(checksum, payload.length)

    return base58Encode(data)
}
