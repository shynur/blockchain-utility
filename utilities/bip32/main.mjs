#!/usr/bin/env node

import {XKey, XPrv} from './index.mjs'

const HELP = `
Usage: echo SEED_OR_XPRV_OR_XPUB | ./this-file [ARGUMENTS] [PATH]
Stdin: 根据输入自动判断是 seed, xprv 还是 xpub.  Seed 就是 16 进制文本, 默认表示 m.
Arguments:
  i           输出 index
  depth       输出 depth
  v           输出 version 文本
  xprv        输出 xprv
  xpub        输出 xpub
  K           输出公钥坐标 x
  k           输出私钥整数 k
  c           输出 chain code
  id          输出 identifier
Path: 省略就表示自身; 否则是一个以 '/' 开头的路径.
输出: 按照 ARGUMENTS 的顺序输出, 每个用换行分隔.

Copyright (C) 2026  谢骐 <shynur@outlook.com>.  All Rights Reserved.
`

async function main() {
    const args = process.argv.slice(2)
    if (args.includes('--help') || args.includes('-h')) {
        console.log(HELP)
        return
    }

    const stdin = await new Promise((resolve) => {
        let data = ''
        process.stdin.on('data', chunk => data += chunk)
        process.stdin.on('end', () => resolve(data.trim()))
    })

    if (!stdin) {
        console.error('Error: No input provided')
        process.exit(1)
    }

    let key
    if (stdin.startsWith('xprv') || stdin.startsWith('xpub') || stdin.startsWith('tprv') || stdin.startsWith('tpub')) {
        key = await XKey.deserialize(stdin)
    } else {
        const seed = Uint8Array.from(stdin.match(/.{2}/g).map(b => parseInt(b, 16)))
        key = await XPrv.from(seed)
    }

    const pathIdx = args.findIndex(a => a.startsWith('/'))
    const outputs = pathIdx >= 0 ? args.slice(0, pathIdx) : args
    const path = pathIdx >= 0 ? args.slice(pathIdx).join('') : ''

    if (path) key = await key.tree(path)

    for (const arg of outputs) {
        if (arg === 'i') console.log(key.i)
        else if (arg === 'depth') console.log(key.depth)
        else if (arg === 'v') console.log(key.version)
        else if (arg === 'xprv') console.log(await (key.is_public_key() ? Promise.reject('Cannot derive xprv from xpub') : key.serialize()))
        else if (arg === 'xpub') console.log(await (key.is_public_key() ? key : key.N()).serialize())
        else if (arg === 'K') console.log('0x' + (key.is_public_key() ? key.K.x : key.N().K.x).toString(16))
        else if (arg === 'k') console.log(key.is_public_key() ? '' : '0x' + key.k.toString(16))
        else if (arg === 'c') console.log('0x' + key.c.toString(16))
        else if (arg === 'id') console.log('0x' + Array.from(await key.identifier()).map(b => b.toString(16).padStart(2, '0')).join(''))
    }
}

main().catch(err => {
    console.error(err.message)
    process.exit(1)
})
