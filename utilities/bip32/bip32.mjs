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
