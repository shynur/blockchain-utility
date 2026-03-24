#!/usr/bin/env node

import { bip39, validateMnemonicSentence, mnemonicSentenceToSeed } from './index.mjs'
import { createInterface } from 'node:readline'

const HELP = `
Options:
  -g
    生成 mnemonic sentence 与 seed.
    交互式询问: 词数 (default: 12), passphrase (default: '').
    一行一项, 因此也可直接用 pipe 实现自动化.  Pipe 提前关闭则使用默认值.
  -s
    根据 mnemonic sentence 和 passphrase 生成 seed, 该步骤包含校验.
    交互式询问: mnemonic sentence, passphrase (default: '').
    一行一项, 因此也可直接用 pipe 实现自动化.  Pipe 提前关闭则使用默认值.
  -l <LANG>
    指定 wordlist 使用的语言 (default: en).

Copyright (C) 2026  谢骐 <shynur@outlook.com>.  All Rights Reserved.
`.trim()

const toHex = /** @param {Uint8Array} bytes */ bytes =>
    Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')

let mode = null, lang = 'en'
const args = process.argv.slice(2)
for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
        case '-g': mode = 'generate'; break
        case '-s': mode = 'seed'; break
        case '-l': lang = args[++i]; break
        default: console.error(HELP); process.exit(1)
    }
}
if (!mode) { console.log(HELP); process.exit(0) }

const rl = createInterface({ input: process.stdin })
let rlClosed = false
rl.on('close', () => { rlClosed = true })

function ask(/** @type {string} */ prompt, fallback = '') {
    if (rlClosed) return Promise.resolve(fallback)
    if (process.stdin.isTTY) process.stderr.write(prompt)
    return new Promise(resolve => {
        let done = false
        const onLine = (/** @type {string} */ line) => {
            if (!done) { done = true; rl.removeListener('close', onClose); resolve(line.trim() || fallback) }
        }
        const onClose = () => {
            if (!done) { done = true; rl.removeListener('line', onLine); rlClosed = true; resolve(fallback) }
        }
        rl.once('line', onLine)
        rl.once('close', onClose)
    })
}

if (mode === 'generate') {
    const msStr = await ask('Word count (12/15/18/21/24) [12]: ', '12')
    const MS = parseInt(msStr)
    if (![12, 15, 18, 21, 24].includes(MS)) {
        console.error(`Invalid word count: ${msStr}`)
        process.exit(1)
    }
    const passphrase = await ask('Passphrase []: ')
    rl.close()
    const { MnemonicSentence, Seed } = await bip39(MS, passphrase, lang)
    console.log(MnemonicSentence)
    console.log(toHex(Seed))
} else {  // -s
    const mnemonic = await ask('Mnemonic sentence: ')
    if (!mnemonic) {
        console.error('Mnemonic sentence is required.')
        process.exit(1)
    }
    const passphrase = await ask('Passphrase []: ')
    rl.close()
    if (!await validateMnemonicSentence(mnemonic, lang)) {
        console.error('Invalid mnemonic sentence.')
        process.exit(1)
    }
    const seed = await mnemonicSentenceToSeed(mnemonic, passphrase)
    console.log(toHex(seed))
}
