#!/usr/bin/env node

import {

} from './index.mjs'

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
