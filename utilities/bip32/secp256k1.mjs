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
export const CURVE_ORDER = libsecp256k1.Point.CURVE().n

export class Point {
    /** @type {bigint} */ #x
    /** @type {bigint} */ #y

    constructor(/** @type {bigint} */ x, /** @type {bigint} */ y) {
        libsecp256k1.Point.fromAffine({x, y})  // validate point is on curve
        this.#x = x
        this.#y = y
        Object.freeze(this)
    }

    get x() { return this.#x }
    get y() { return this.#y }

    /**
     * @returns {boolean} whether the point at infinity
     */
    atInfinity() {
        return libsecp256k1.Point.fromAffine({x: this.x, y: this.y}).is0()
    }

    /**
     * Serializes the coordinate pair as a byte sequence using SEC1's compressed form:
     *     (0x02 or 0x03) || ser_256(x),
     * where the header byte depends on the parity of the omitted y coordinate.
     * @returns {Uint8Array} 33B SEC1 compressed encoding */
    serialize() {
        const header = this.y % 2n === 0n ? 0x02 : 0x03
        const body = ser_256(this.x)
        const result = new Uint8Array(33)
        result[0] = header
        result.set(body, 1)
        return result

        /**
         * Serialize an integer as a byte sequence, most significant byte first.
         * @returns {Uint8Array} 32B
         */
        function ser_256(/** @type {bigint} */ x) {
            const bytes = new Uint8Array(32)
            for (let i = 31; i >= 0; i--) {
                bytes[i] = Number(x & 0xFFn)
                x >>= 8n
            }
            return bytes
        }
    }

    multiply(/** @type {bigint} */ scalar) {
        const product = libsecp256k1.Point.fromAffine({x: this.x, y: this.y})
              .multiply(scalar)
              .toAffine()
        return new Point(product.x, product.y)
    }

    /**
     * Deserialize a SEC1 compressed encoding back to a Point.
     * @param {Readonly<Uint8Array>} bytes - 33B SEC1 compressed encoding
     * @returns {Point}
     */
    static deserialize(bytes) {
        const {x, y} = libsecp256k1.Point.fromBytes(bytes).toAffine()
        return new Point(x, y)
    }

    static add(/** @type {Point} */ A, /** @type {Point} */ B) {
        const sum = libsecp256k1.Point.fromAffine({x: A.x, y: A.y})
              .add(libsecp256k1.Point.fromAffine({x: B.x, y: B.y}))
              .toAffine()
        return new Point(sum.x, sum.y)
    }
}

/** base point (generator) of the curve */
export const G = function() {
    const {x, y} = libsecp256k1.Point.BASE.toAffine()
    return new Point(x, y)
}()
