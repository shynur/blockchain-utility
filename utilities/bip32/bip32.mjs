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
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function base58Encode(bytes) {
    const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

    let leadingZeros = 0
    for (let i = 0; i < bytes.length && bytes[i] == 0; ++i)
        ++leadingZeros

    let num = 0n
    for (const byte of bytes)
        num = num * 256n + BigInt(byte)

    let result = ''
    while (num > 0n) {
        result = ALPHABET[Number(num % 58n)] + result
        num /= 58n
    }

    return '1'.repeat(leadingZeros) + result
}
