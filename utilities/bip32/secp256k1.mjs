/*
 * 提供 BIP 32 所需的 secp256k1 相关 API.
 * Copyright (C) 2026  谢骐 <shynur@outlook.com>.  All Rights Reserved.
 *
 * SPDX-License-Identifier: MPL-2.0
 */
/*
 * Overview:
 *   本 module 遵循论文 SEC 2 v2 <https://www.secg.org/sec2-v2.pdf> 的命名约定, 提供同名的 API.
 *   具体实现方式是对现成的实现进行封装, 但 API 应与现成的实现完全解耦 (i.e., 即使更换依赖的实现也不影响 API).
 *
 * 依赖关系:
 *   不依赖任何第三方库或宿主特定的 API, 仅使用 JavaScript 标准库, noble/secp256k1, 或 Web API.
 *
 * Quality:
 *   类型注解使用 JSDoc, 可用 tsc 检查.
 */

import * as libsecp256k1 from './noble-secp256k1.mjs'

/** @type {bigint} order of the curve */
export const n = libsecp256k1.Point.CURVE().n

export class Point {
    /** @type {bigint} */ #x
    /** @type {bigint} */ #y

    /**
     * @param {bigint} x
     * @param {bigint} y
     */
    constructor(x, y) {
        this.#x = x
        this.#y = y
        Object.freeze(this)
    }

    get x() { return this.#x }
    get y() { return this.#y }

    /**
     * @param {Point} A
     * @param {Point} B
     */
    static Add(A, B) {
        const sum = libsecp256k1.Point.fromAffine({ x: A.x, y: A.y })
              .add(libsecp256k1.Point.fromAffine({ x: B.x, y: B.y }))
              .toAffine()
        return new Point(sum.x, sum.y)
    }
}

/** base point (generator) of the curve */
const G = function() {
    const { x, y } = libsecp256k1.Point.BASE.toAffine()
    return new Point(x, y)
}()
