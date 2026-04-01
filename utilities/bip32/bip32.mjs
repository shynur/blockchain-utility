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

import * as bip32math from './math-tools.mjs'

class ExtendedKey {
    /**
     * 32B chain code
     * @type {bigint} */
    c

    /**
     * child number
     * @type {number} 4B */
    i

    /**
     * @type {number} 1B */
    depth

    /**
     * @type {'mainnet' | 'testnet'} */
    version

    /**
     * @type {Readonly<Uint8Array>} 4B */
    parent_fingerprint

    constructor(
        /** @type {bigint} */ chain_code,
        /** @type {{ChildNumber:number, Depth:number, Version:'mainnet'|'testnet', ParentFingerprint:Readonly<Uint8Array>}} */ {
            ChildNumber=0, Depth=0, Version='mainnet', ParentFingerprint=new Uint8Array(4)
        } = {}
    ) {
        console.assert(0n <= chain_code && chain_code < 2n**256n, `ExtendedKey: chain_code out of 256-bit range`)
        this.c = chain_code
        Object.defineProperty(this, 'c', {writable: false, configurable: false})

        console.assert(Number.isInteger(ChildNumber) && 0 <= ChildNumber && ChildNumber < 2**32, `ExtendedKey: ChildNumber must be uint32, got ${ChildNumber}`)
        this.i = ChildNumber
        Object.defineProperty(this, 'i', {writable: false, configurable: false})

        console.assert(Number.isInteger(Depth) && 0 <= Depth && Depth < 256, `ExtendedKey: Depth must be uint8, got ${Depth}`)
        this.depth = Depth
        Object.defineProperty(this, 'depth', {writable: false, configurable: false})

        this.version = Version
        Object.defineProperty(this, 'version', {writable: false, configurable: false})

        console.assert(ParentFingerprint.length == 4, `ExtendedKey: ParentFingerprint must be 4B, got ${ParentFingerprint.length}B`)
        this.parent_fingerprint = ParentFingerprint
        Object.defineProperty(this, 'parent_fingerprint', {writable: false, configurable: false})
    }

    /**
     * The first 32 bits of the identifier are called the key fingerprint.
     * @returns {Promise<Uint8Array>} 4B
     */
    async fingerprint() {
        return (await this.identifier()).slice(0, 4)
    }

    /**
     * @returns {Promise<Uint8Array>} 20B
     */
    identifier() {throw new Error('identifier() must be implemented by subclasses')}

    /**
     * @param {number | bigint} i
     * @returns {Promise<ExtendedKey>} */
    CKD(i) {throw new Error('CKD() must be implemented by subclasses')}

    /**
     * Cascade CKD constructions to build a tree.
     * @param {string} path - e.g. "/0'/1/2H/3"
     */
    async tree(path) {
        path = path.toLowerCase().replace(/\s/g, '')
        if (path == '')
            return this
        console.assert(path[0] == '/' && path[path.length-1] != '/', `tree: invalid path format: "${path}"`)

        const nodes = path.slice(1).split('/')
        const firstNode = nodes[0]
        const firstIsHardened = firstNode.endsWith("'") || firstNode.endsWith('h')
        const firstKey = await this.CKD(parseInt(firstNode) + (firstIsHardened ? 2**31 : 0))

        return firstKey.tree(nodes.slice(1).map(i => `/${i}`).join(''))
    }

    /**
     * Deserialize a serialized extended key.  See BIP 32.
     * @param {string} base58check - 111-char base58check string
     * @returns {Promise<ExtendedKey>}
     * @throws {RangeError} 序列化格式不合法 (长度, version bytes, key data, 结构一致性)
     * @throws {Error} base58check checksum 校验失败
     */
    static async deserialize(base58check) {
        if (base58check.length != 111)
            throw new RangeError(`deserialize: expected 111-char base58check string, got ${base58check.length} chars`)
        const payload = await bip32math.base58checkDecode(base58check)
        if (payload.length != 78)
            throw new RangeError(`deserialize: expected 78B payload, got ${payload.length}B`)

        const version_bytes = bip32math.parse_32(payload.slice(0, 4))
        const depth = payload[4]
        const parent_fingerprint = payload.slice(5, 9)
        const child_number = bip32math.parse_32(payload.slice(9, 13))
        const chain_code = bip32math.parse_256(payload.slice(13, 45))
        const key_data = payload.slice(45, 78)

        const is_public = version_bytes == 0x0488B21E || version_bytes == 0x043587CF
        const is_private = version_bytes == 0x0488ADE4 || version_bytes == 0x04358394
        if (!is_public && !is_private)
            throw new RangeError(`Unknown version bytes: 0x${version_bytes.toString(16).padStart(8, '0')}`)

        const version = (version_bytes == 0x0488B21E || version_bytes == 0x0488ADE4) ? 'mainnet' : 'testnet'

        const derivation_info = {
            ChildNumber: child_number,
            Depth: depth,
            Version: version,
            ParentFingerprint: parent_fingerprint,
        }

        if (depth == 0) {
            if (!parent_fingerprint.every(b => b == 0))
                throw new RangeError('deserialize: zero depth with non-zero parent fingerprint')
            if (child_number != 0)
                throw new RangeError('deserialize: zero depth with non-zero index')
        }

        if (is_public) {
            const K = bip32math.Point_secp256k1.deserialize(key_data)
            return new ExtendedPublicKey(K, chain_code, derivation_info)
        } else {
            if (key_data[0] != 0x00)
                throw new RangeError(`deserialize: private key_data must start with 0x00, got 0x${key_data[0].toString(16).padStart(2, '0')}`)
            const k = bip32math.parse_256(key_data.slice(1))
            if (k == 0n || k >= bip32math.N_SECP256K1_ORDER)
                throw new RangeError(`deserialize: private key must be in 1..n-1`)
            return new ExtendedPrivateKey(k, chain_code, derivation_info)
        }
    }

    /**
     * @returns {boolean}
     */
    is_public_key() {throw new Error('is_public_key() must be implemented by subclasses')}

    async serialize() {
        const version_bytes = this.version == 'mainnet'
            ? (this.is_public_key() ? 0x0488B21E : 0x0488ADE4)
            : (this.is_public_key() ? 0x043587CF : 0x04358394)

        const key_data = this.is_public_key()
            ? bip32math.ser_P({x: this.K.x, y: this.K.y})
            : bip32math.cat(new Uint8Array([0x00]), bip32math.ser_256(this.k))

        const payload = bip32math.cat(
            bip32math.ser_32(version_bytes),
            new Uint8Array([this.depth]),
            this.parent_fingerprint,
            bip32math.ser_32(this.i),
            bip32math.ser_256(this.c),
            key_data,
        )
        console.assert(payload.length == 78, `serialize: expected 78B payload, got ${payload.length}B`)

        const base58check = await bip32math.base58checkEncode(payload)
        console.assert(
            base58check.length == 111
                && base58check.startsWith(
                    this.version == 'mainnet'
                        ? (this.is_public_key() ? 'xpub' : 'xprv')
                        : (this.is_public_key() ? 'tpub' : 'tprv')
                ),
            `serialize: unexpected base58check output: ${base58check.slice(0, 10)}... (length ${base58check.length})`,
        )
        return base58check
    }
}

/**
 * Extended Public Key (K, c)
 */
class ExtendedPublicKey extends ExtendedKey {
    /**
     * 32B public key
     * @type {bip32math.Point_secp256k1} */
    K

    constructor(
        /** @type {bip32math.Point_secp256k1} */ K, /** @type {bigint} */ c,
        /** @type {{ChildNumber:number, Depth:number, Version:'mainnet'|'testnet', ParentFingerprint:Readonly<Uint8Array>}} */ derivation_info
    ) {
        super(c, derivation_info)
        this.K = K
        Object.defineProperty(this, 'K', {writable: false, configurable: false})
    }

    is_public_key() { return true }

    /**
     * Hash160(ser_P(K)): the key identifier.
     * @returns {Promise<Uint8Array>} 20B
     */
    async identifier() {
        return bip32math.Hash160(bip32math.ser_P({x: this.K.x, y: this.K.y}))
    }

    /**
     * CKDpub
     * @param {number | bigint} i
     * @returns {Promise<ExtendedPublicKey>} */
    async CKD(i) {
        i = Number(i)
        console.assert(Number.isInteger(i) && 0 <= i && i < 2 ** 32, `CKDpub: i must be uint32, got ${i}`)

        if (i >= 2 ** 31)
            throw new RangeError(`CKDpub is only defined for normal child key: i=${i}`)

        const I = await bip32math.HMAC_SHA512(
            bip32math.ser_256(this.c),
            bip32math.cat(bip32math.ser_P({x: this.K.x, y: this.K.y}), bip32math.ser_32(i))
        )
        const I_L = I.slice(0, 32)
        const I_R = I.slice(32)

        if (bip32math.parse_256(I_L) >= bip32math.N_SECP256K1_ORDER)
            return this.CKD(i + 1)

        const K_i = bip32math.Point_secp256k1.add(
            function() {
                const {x, y} = bip32math.point(bip32math.parse_256(I_L))
                return new bip32math.Point_secp256k1(x, y);
            }(),
            this.K
        )
        if (K_i.atInfinity())
            return this.CKD(i + 1)

        return new ExtendedPublicKey(K_i, bip32math.parse_256(I_R), {
            ChildNumber: i,
            Depth: this.depth + 1,
            Version: this.version,
            ParentFingerprint: await this.fingerprint(),
        })
    }
}

/**
 * Extended Private Key (k, c)
 */
class ExtendedPrivateKey extends ExtendedKey {
    /**
     * 32B private key
     * @type {bigint} */
    k

    constructor(
        /** @type {bigint} */ k, /** @type {bigint} */ c,
        /** @type {{ChildNumber:number, Depth:number, Version:'mainnet'|'testnet', ParentFingerprint:Readonly<Uint8Array>}} */ derivation_info
    ) {
        super(c, derivation_info)
        console.assert(0n <= k && k < 2n ** 256n, `ExtendedPrivateKey: k out of 256-bit range`)
        this.k = k
        Object.defineProperty(this, 'k', {writable: false, configurable: false})
    }

    /**
     * BIP 32 master key generation.
     * @param {Readonly<Uint8Array>} seed - 128-512 bits
     * @returns {Promise<ExtendedPrivateKey>}
     * @throws {RangeError} 不合法的 seed 长度
     */
    static async from(seed) {
        if (seed.length < 16 || 64 < seed.length)
            throw new RangeError(`master key generation: seed must be 16..64 bytes (128..512 bits), got ${seed.length} bytes`)
        const I = await bip32math.HMAC_SHA512('Bitcoin seed', seed)
        const I_L = I.slice(0, 32)
        const I_R = I.slice(32)

        console.assert(
            bip32math.parse_256(I_L) != 0n && bip32math.parse_256(I_L) < bip32math.N_SECP256K1_ORDER,
            'master key generation: I_L must be non-zero and less than curve order'
        )
        return new ExtendedPrivateKey(bip32math.parse_256(I_L), bip32math.parse_256(I_R))
    }

    /**
     * Hash160(ser_P(point(k))): the key identifier.
     * @returns {Promise<Uint8Array>} 20B
     */
    async identifier() {
        return bip32math.Hash160(bip32math.ser_P(bip32math.point(this.k)))
    }

    /**
     * N((k, c)) → (K, c)
     * Compute the extended public key corresponding to an extended private key
     * (the “neutered” version, as it removes the ability to sign transactions).
     * @returns {ExtendedPublicKey} */
    N() {
        const {x: k_x, y: k_y} = bip32math.point(this.k)
        return new ExtendedPublicKey(new bip32math.Point_secp256k1(k_x, k_y), this.c, {
            ChildNumber: this.i,
            Depth: this.depth,
            Version: this.version,
            ParentFingerprint: this.parent_fingerprint,
        })
    }

    /**
     * CKDpriv
     * @param {number | bigint} i
     * @returns {Promise<ExtendedPrivateKey>} */
    async CKD(i) {
        i = Number(i)
        console.assert(Number.isInteger(i) && 0 <= i && i < 2 ** 32, `CKDpriv: i must be uint32, got ${i}`)

        const data = i >= 2 ** 31
            ? bip32math.cat(new Uint8Array([0x00]), bip32math.ser_256(this.k), bip32math.ser_32(i))
            : bip32math.cat(bip32math.ser_P(bip32math.point(this.k)), bip32math.ser_32(i))

        const I = await bip32math.HMAC_SHA512(bip32math.ser_256(this.c), data)
        const I_L = I.slice(0, 32)
        const I_R = I.slice(32)

        if (bip32math.parse_256(I_L) >= bip32math.N_SECP256K1_ORDER)
            return this.CKD(i + 1)

        const k_i = (bip32math.parse_256(I_L) + this.k) % bip32math.N_SECP256K1_ORDER
        if (k_i == 0n)
            return this.CKD(i + 1)

        return new ExtendedPrivateKey(k_i, bip32math.parse_256(I_R), {
            ChildNumber: i,
            Depth: this.depth + 1,
            Version: this.version,
            ParentFingerprint: await this.fingerprint(),
        })
    }
}

export {
    ExtendedKey as XKey,
    ExtendedPrivateKey as XPrv,
    ExtendedPublicKey as XPub,
}
