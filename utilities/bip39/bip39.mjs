/*
 * 本 module 提供 BIP 39 提及的若干实用工具函数.
 * Copyright (C) 2026  谢骐 <shynur@outlook.com>.  All Rights Reserved.
 *
 * SPDX-License-Identifier: MPL-2.0
 */
/*
 * 本文件不依赖任何第三方库或宿主特定的 API, 仅使用 JavaScript 标准库与 Web API.
 * 类型注解使用 JSDoc, 可用 tsc 检查.
 */

import WORDLISTS from './wordlists.mjs'

/**
 * 生成指定长度的随机熵.
 * @param {number} ENT - 熵的位数, 属于 {128, 160, 192, 224, 256}
 * @returns {Readonly<Uint8Array>} 随机熵的字节数组
 * @throws {RangeError} ENT 不属于合法值集合
 */
function generateEntropy(ENT) {
    const validENTs = [128, 160, 192, 224, 256]
    if (!validENTs.includes(ENT))
        throw new RangeError(`ENT must be one of ${validENTs}, got ${ENT}`)
    const entropy = new Uint8Array(ENT / 8)
    crypto.getRandomValues(entropy)
    return entropy
}

/**
 * 计算熵的 checksum (SHA-256 的前 ENT/32 位).
 * @param {Readonly<Uint8Array>} entropy
 * @returns {Promise<string>} 表示 checksum 的二进制字符串, 长度为 entropy.length*8/32
 */
async function calculateChecksum(entropy) {
    const CS = entropy.length * 8 / 32
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', /** @type {BufferSource} */ (entropy)))
    return Array.from(hash)
             .map(b => b.toString(2).padStart(8, '0'))
             .join('')
             .slice(0, CS)
}

/**
 * @param {Readonly<Uint8Array>} entropy
 * @returns {Promise<string>} 表示 熵 + checksum 的二进制字符串
 */
async function appendChecksum(entropy) {
    const entropyBits = Array.from(entropy)
                          .map(b => b.toString(2).padStart(8, '0'))
                          .join('')
    const checksum = await calculateChecksum(entropy)
    return entropyBits + checksum
}

/**
 * @param {string} bits11 - 长度为 11 的二进制字符串
 * @param {readonly string[]} wordlist - 2048-word wordlist
 * @returns {string} mnemonic word
 */
function mapToWord(bits11, wordlist) {
    return wordlist[parseInt(bits11, 2)]
}

/**
 * @param {string} entropyWithChecksum - 表示 熵 + checksum 的二进制字符串
 * @param {readonly string[]} wordlist
 * @returns {string} 其 word 按照空格分隔的 mnemonic sentence
 */
function toMnemonicSentence(entropyWithChecksum, wordlist) {
    const words = []
    for (let i = 0; i < entropyWithChecksum.length; i += 11)
        words.push(mapToWord(entropyWithChecksum.slice(i, i + 11), wordlist))
    return words.join(' ')
}

/**
 * 检查单词数量、单词是否在词表中、以及 checksum 是否正确.
 * @param {string} mnemonicSentence - 助记句
 * @param {'en' | 'zh_Hans'} [wordlist_language='en']
 * @returns {Promise<boolean>}
 */
export async function validateMnemonicSentence(mnemonicSentence, wordlist_language = 'en') {
    const words = mnemonicSentence.trim().normalize('NFKD').split(/\s+/)
    const MS = words.length
    if (![12, 15, 18, 21, 24].includes(MS))
        return false
    const indices = []
    for (const word of words) {
        const idx = WORDLISTS[wordlist_language].indexOf(word)
        if (idx === -1)
            return false
        indices.push(idx)
    }
    const bits = indices.map(i => i.toString(2).padStart(11, '0')).join('')
    const ENT = MS * 32 / 3  // e.g., 12 words → 128 bits
    const CS = ENT / 32
    const entropyBits = bits.slice(0, ENT)
    const checksumBits = bits.slice(ENT, ENT + CS)
    const entropy = new Uint8Array(ENT / 8)
    for (let i = 0; i < ENT / 8; i++)
        entropy[i] = parseInt(entropyBits.slice(i * 8, (i + 1) * 8), 2)
    const expectedChecksum = await calculateChecksum(entropy)
    return checksumBits === expectedChecksum
}

/**
 * @param {string} mnemonicSentence - words 按照空白字符分隔的 mnemonic sentence
 * @param {string} [passphrase='']
 * @returns {Promise<Readonly<Uint8Array>>} 512-bit seed
 */
export async function mnemonicSentenceToSeed(mnemonicSentence, passphrase = '') {
    mnemonicSentence = mnemonicSentence.trim().normalize('NFKD').split(/\s+/).join(' ')
    const encoder = new TextEncoder
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(mnemonicSentence),
        'PBKDF2',
        false,
        ['deriveBits']
    )
    const seed = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: encoder.encode('mnemonic' + passphrase.normalize('NFKD')),
            iterations: 2048,
            hash: 'SHA-512',
        },
        keyMaterial,
        512
    )
    return new Uint8Array(seed)
}

/**
 * @param {12 | 15 | 18 | 21 | 24} MS - 助记句的单词数
 * @param {string} [passphrase='']
 * @param {'en' | 'zh_Hans'} [wordlist_language='en']
 * @returns {Promise<Readonly<{MnemonicSentence: string, Seed: Readonly<Uint8Array>}>>}
 */
export async function bip39(MS = 12, passphrase = '', wordlist_language = 'en') {
    const ENT = MS * 32 / 3
    const wordlist = WORDLISTS[wordlist_language]
    if (!wordlist)
        throw new RangeError(
            `Unknown wordlist language: ${wordlist_language}.  Available: ${Object.keys(WORDLISTS).join(', ')}`
        )
    const entropy = generateEntropy(ENT)
    const entropyWithChecksum = await appendChecksum(entropy)
    const MnemonicSentence = toMnemonicSentence(entropyWithChecksum, wordlist)
    if (!await validateMnemonicSentence(MnemonicSentence, wordlist_language))
        throw new Error('Internal error: generated mnemonic sentence failed validation')
    const Seed = await mnemonicSentenceToSeed(MnemonicSentence, passphrase)
    return {MnemonicSentence, Seed}
}
