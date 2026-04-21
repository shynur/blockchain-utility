import { libbip32, libbip39 } from '../deps.mjs'
import { BIP44_LEVELS, COIN_TYPES, HARDENED_OFFSET, WIF_VERSION_BY_COIN_TYPE } from './constants.mjs'
import { bytesToHex, formatChildNumber, serializeCompressedPublicKey, serializeCompressedPublicKeyHex, serializePrivateKeyHex, unhardenIndex } from './utils.mjs'

const EMPTY_REQUESTED_KINDS = { xprv: false, xpub: false, k: false, K: false, A: false }
const SELECTABLE_SEGMENT_BY_DEPTH = [
    "44'",
    form => `${form.coinType}'`,
    form => `${form.account}'`,
    form => `${form.change}`,
    form => formatAddressIndexesPreview(form.addressIndexes),
]

export const BIP44_IMPORT_ERRORS = {
    unknownProtocol: '未知协议类型: 仅支持 BIP 44, 考虑更换钱包 app',
    unknownCoin: '未知币种: 考虑更换钱包 app',
    accountMustBeHardened: '密钥违反 BIP 44: 账户须使用硬化派生',
    unknownChangeChain: '未知的转账链类型: BIP 44 仅允许收款链和找零链',
    addressMustBeNormal: '密钥违反 BIP 44: 地址索引必须使用 normal 派生',
    tooDeep: '密钥违反 BIP 44: 层级太深',
}

/**
 * @typedef {{
 *   id: string,
 *   label: string,
 *   noteParts: Array<{ text: string, highlight: boolean }>,
 *   pathSuffix: string,
 *   requestedKinds: { xprv: boolean, xpub: boolean, k: boolean, K: boolean, A: boolean },
 *   canXprv: boolean,
 *   xprv: string | null,
 *   xpub: string,
 *   k: string | null,
 *   K: string,
 *   A: string | null,
 * }} DerivedNodeOutput
 */

function isKnownCoinType(value) {
    return COIN_TYPES.some(option => option.value === value)
}

function getLevelPath(levelId, form) {
    if (levelId === 'purpose')
        return "/44'"
    if (levelId === 'coin')
        return `/${form.coinType}'`
    if (levelId === 'account')
        return `/${form.account}'`
    if (levelId === 'change')
        return `/${form.change}`
    return null
}

export function formatAddressIndexesPreview(addressIndexes) {
    if (addressIndexes.length === 0)
        return '{address_index}'
    if (addressIndexes.length === 1)
        return String(addressIndexes[0])
    return `{${addressIndexes.join(',')}}`
}

export function canDeriveBitcoinAddress(coinType) {
    return coinType === 0 || coinType === 1
}

function describeBip44Level(depth) {
    if (depth === 0)
        return 'master'

    if (depth === 1)
        return 'purpose'
    if (depth === 2)
        return '币种'
    if (depth === 3)
        return '账户'
    if (depth === 4)
        return '转账链'
    if (depth === 5)
        return '地址索引'

    return `超出 BIP44 范围（第 ${depth} 层）`
}

/**
 * @param {InstanceType<typeof libbip32.XKey>} key
 * @param {string} pathSuffix
 * @param {number} coinType
 */
async function serializeNode(key, pathSuffix, coinType) {
    const canXprv = !key.is_public_key()
    const publicKey = serializeCompressedPublicKey(key)
    const wifVersion = WIF_VERSION_BY_COIN_TYPE.get(coinType)
    return {
        pathSuffix,
        canXprv,
        xprv: canXprv ? await /** @type {InstanceType<typeof libbip32.XPrv>} */ (key).serialize() : null,
        xpub: await (key.is_public_key() ? key : /** @type {InstanceType<typeof libbip32.XPrv>} */ (key).N()).serialize(),
        k: canXprv && wifVersion !== undefined
            ? await libbip32.PrivateKeyToWIF(key.k, wifVersion)
            : serializePrivateKeyHex(key),
        K: serializeCompressedPublicKeyHex(key),
        A: canDeriveBitcoinAddress(coinType) ? await libbip32.AddressOfK(publicKey, coinType === 1 ? 'testnet' : 'mainnet') : null,
    }
}

function hasRequestedKinds(kinds) {
    return kinds.xprv || kinds.xpub || kinds.k || kinds.K || kinds.A
}

function getRequestedKinds(form, levelId) {
    return form.requestedKinds[levelId] ?? EMPTY_REQUESTED_KINDS
}

function getRequestedLevelDepths(form) {
    return BIP44_LEVELS
        .filter(level => hasRequestedKinds(getRequestedKinds(form, level.id)))
        .map(level => level.depth)
}

function plainNotePart(text) {
    return { text: String(text), highlight: false }
}

function highlightedNotePart(text) {
    return { text: String(text), highlight: true }
}

function coinAccountNoteParts(coin, account, highlightAccount) {
    return [
        plainNotePart(`${coin.localName} `),
        highlightAccount ? highlightedNotePart(account) : plainNotePart(account),
        plainNotePart(' 号账户'),
    ]
}

function changeChainName(change) {
    return change === 0 ? '收款' : '找零'
}

function describeOutputNoteParts(levelId, form, addressIndex = null) {
    const coin = COIN_TYPES.find(option => option.value === form.coinType)

    if (levelId === 'purpose')
        return [
            plainNotePart('BIP '),
            highlightedNotePart('44'),
        ]

    if (levelId === 'coin')
        return [
            highlightedNotePart(coin.symbol),
            plainNotePart(` - ${coin.localName} (${coin.name})`),
        ]

    if (levelId === 'account')
        return coinAccountNoteParts(coin, form.account, true)

    if (levelId === 'change') {
        const chainName = changeChainName(form.change)
        return [
            ...coinAccountNoteParts(coin, form.account, false),
            plainNotePart('的'),
            highlightedNotePart(chainName),
            plainNotePart('链'),
        ]
    }

    if (levelId === 'address') {
        const chainName = changeChainName(form.change)
        return [
            ...coinAccountNoteParts(coin, form.account, false),
            plainNotePart('的第 '),
            highlightedNotePart(addressIndex ?? ''),
            plainNotePart(` 个${chainName}地址`),
        ]
    }

    return []
}

/**
 * @param {{
 *   importMode: 'mnemonic' | 'xkey',
 *   mnemonicSentence?: string,
 *   passphrase?: string,
 *   xkeyText?: string,
 * }} source
 */
export async function resolveRootSource(source) {
    if (source.importMode === 'mnemonic') {
        const mnemonicSentence = source.mnemonicSentence ?? ''
        const passphrase = source.passphrase ?? ''
        const isValid = await libbip39.validateMnemonicSentence(mnemonicSentence, 'en')
        if (!isValid)
            throw new Error('助记词校验失败: 请检查单词拼写、词数和 checksum')
        const seed = await libbip39.mnemonicSentenceToSeed(mnemonicSentence, passphrase)
        const root = await libbip32.XPrv.from(seed)
        return { kind: 'mnemonic', root }
    }

    const xkeyText = source.xkeyText ?? ''
    const root = await libbip32.XKey.deserialize(xkeyText)
    return { kind: 'xkey', root }
}

/**
 * @param {InstanceType<typeof libbip32.XKey>} root
 * @returns {{ ok: boolean, error: string }}
 */
export function validateBip44Import(root) {
    const depth = root.depth
    if (depth > 5) {
        return {
            ok: false,
            error: BIP44_IMPORT_ERRORS.tooDeep,
        }
    }

    if (depth === 0)
        return { ok: true, error: '' }

    const childNumber = root.i
    const isHardened = childNumber >= HARDENED_OFFSET
    const indexValue = unhardenIndex(childNumber)

    if (depth === 1) {
        return isHardened && indexValue === 44
            ? { ok: true, error: '' }
            : { ok: false, error: BIP44_IMPORT_ERRORS.unknownProtocol }
    }

    if (depth === 2) {
        return isHardened && isKnownCoinType(indexValue)
            ? { ok: true, error: '' }
            : { ok: false, error: BIP44_IMPORT_ERRORS.unknownCoin }
    }

    if (depth === 3) {
        return isHardened
            ? { ok: true, error: '' }
            : { ok: false, error: BIP44_IMPORT_ERRORS.accountMustBeHardened }
    }

    if (depth === 4) {
        if (isHardened) {
            return {
                ok: false,
                error: BIP44_IMPORT_ERRORS.unknownChangeChain,
            }
        }

        return indexValue === 0 || indexValue === 1
            ? { ok: true, error: '' }
            : { ok: false, error: BIP44_IMPORT_ERRORS.unknownChangeChain }
    }

    return !isHardened
        ? { ok: true, error: '' }
        : { ok: false, error: BIP44_IMPORT_ERRORS.addressMustBeNormal }
}

/**
 * @param {InstanceType<typeof libbip32.XKey>} root
 * @param {{
 *   coinType: number,
 *   account: number,
 *   change: 0 | 1,
 *   addressIndexes: number[],
 *   requestedKinds: Record<string, { xprv: boolean, xpub: boolean, k: boolean, K: boolean, A: boolean }>,
 * }} form
 * @returns {Promise<DerivedNodeOutput[]>}
 */
export async function deriveBip44(root, form) {
    const outputs = []
    const baseSegments = []

    let current = root
    const originalDepth = root.depth
    const deepestRequestedDepth = Math.max(originalDepth, ...getRequestedLevelDepths(form))

    if (originalDepth >= 1 && originalDepth <= 5) {
        const selfLevel = BIP44_LEVELS[originalDepth - 1]
        const requestedKinds = getRequestedKinds(form, selfLevel.id)
        if (hasRequestedKinds(requestedKinds)) {
            outputs.push({
                id: selfLevel.id === 'address' ? `address-${root.i}` : selfLevel.id,
                label: selfLevel.label,
                noteParts: selfLevel.id === 'address'
                    ? describeOutputNoteParts('address', form, root.i)
                    : describeOutputNoteParts(selfLevel.id, form),
                requestedKinds,
                ...(await serializeNode(root, '', form.coinType)),
            })
        }
    }

    for (const level of BIP44_LEVELS) {
        if (originalDepth >= level.depth) {
            if (level.depth === 5)
                break
            continue
        }

        if (level.depth > deepestRequestedDepth)
            break

        const path = getLevelPath(level.id, form)
        if (!path)
            break

        current = await current.tree(path)
        baseSegments.push(path)
        const requestedKinds = getRequestedKinds(form, level.id)
        if (hasRequestedKinds(requestedKinds)) {
            outputs.push({
                id: level.id,
                label: level.label,
                noteParts: describeOutputNoteParts(level.id, form),
                requestedKinds,
                ...(await serializeNode(current, baseSegments.join(''), form.coinType)),
            })
        }
    }

    if (current.depth === 4) {
        const requestedKinds = getRequestedKinds(form, 'address')
        if (hasRequestedKinds(requestedKinds)) {
            for (const index of form.addressIndexes) {
                const child = await current.tree(`/${index}`)
                outputs.push({
                    id: `address-${index}`,
                    label: `${index}`,
                    noteParts: describeOutputNoteParts('address', form, index),
                    requestedKinds,
                    ...(await serializeNode(child, [...baseSegments, `/${index}`].join(''), form.coinType)),
                })
            }
        }
    }

    return outputs
}

/**
 * @param {InstanceType<typeof libbip32.XKey>} root
 * @param {{
 *   coinType: number,
 *   account: number,
 *   change: 0 | 1,
 *   addressIndexes: number[],
 * }} form
 */
function resolveSegment(index, form) {
    const segment = SELECTABLE_SEGMENT_BY_DEPTH[index]
    return typeof segment === 'function' ? segment(form) : segment
}

// Segments 0..depth-1 reflect the imported xkey's known prefix; the segment
// at depth-1 is the xkey's own child number, others are marked as uncertain.
function buildFixedSegments(root, form) {
    return Array.from({ length: Math.min(root.depth, 5) }, (_, index) =>
        index + 1 === root.depth
            ? formatChildNumber(root.i)
            : `~${resolveSegment(index, form)}~`,
    )
}

/**
 * @param {InstanceType<typeof libbip32.XKey>} root
 * @returns {{ insideN: string[], outsideN: string[] } | null}
 *   `null` when depth is 0 (master public key).
 *   Segments use the same `~value~` convention as {@link getPathPreview}
 *   for intermediate (uncertain) values.
 */
export function getXpubPathSegments(root, form) {
    if (root.depth === 0) return null

    const LAST_HARDENED_DEPTH = 3
    const nDepth = Math.min(root.depth, LAST_HARDENED_DEPTH)
    const segments = buildFixedSegments(root, form)
    const start = Math.min(root.depth, SELECTABLE_SEGMENT_BY_DEPTH.length)
    const derivableSegments = root.depth >= LAST_HARDENED_DEPTH
        ? SELECTABLE_SEGMENT_BY_DEPTH
            .slice(start)
            .map((_, offset) => resolveSegment(start + offset, form))
        : []

    return {
        insideN: segments.slice(0, nDepth),
        outsideN: [...segments.slice(nDepth), ...derivableSegments],
    }
}

export function getPathPreview(root, form) {
    const fixedSegments = buildFixedSegments(root, form)
    const start = Math.min(root.depth, SELECTABLE_SEGMENT_BY_DEPTH.length)
    const selectableSegments = SELECTABLE_SEGMENT_BY_DEPTH
        .slice(start)
        .map((_, offset) => resolveSegment(start + offset, form))

    return ['m', ...fixedSegments, ...selectableSegments].join('/')
}

/**
 * @param {InstanceType<typeof libbip32.XKey>} key
 */
export async function describeRootKey(key) {
    const identifier = await key.identifier()
    const depth = key.depth
    return {
        depth,
        level: depth === 0 && key.is_public_key() ? 'Master' : describeBip44Level(depth),
        index: depth > 0 ? formatChildNumber(key.i) : null,
        isHardened: depth > 0 ? key.i >= HARDENED_OFFSET : false,
        indexValue: depth > 0 ? unhardenIndex(key.i) : null,
        parentFingerprint: depth > 0 ? bytesToHex(key.parent_fingerprint) : null,
        identifierHex: bytesToHex(identifier),
    }
}
