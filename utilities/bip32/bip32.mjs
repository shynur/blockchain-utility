/*
 * 提供 BIP 32 提及的钱包所需的高级 API.
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
    ExtendedPrivateKey,
    ExtendedPublicKey,
} from './math-tools.mjs'

export const XPrv = ExtendedPrivateKey
export const XPub = ExtendedPublicKey
