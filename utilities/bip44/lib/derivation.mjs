import { libbip32, libbip39 } from '../deps.mjs'
import { BIP44_LEVELS, COIN_TYPES, HARDENED_OFFSET } from './constants.mjs'
import { bytesToHex, formatChildNumber, serializeCompressedPublicKey, serializeCompressedPublicKeyHex, serializePrivateKeyHex } from './utils.mjs'

const EMPTY_REQUESTED_KINDS = { xprv: false, xpub: false, k: false, K: false, A: false }
const SELECTABLE_SEGMENT_BY_DEPTH = [
    "44'",
    form => `${form.coinType}'`,
    form => `${form.account}'`,
    form => `${form.change}`,
    form => formatAddressIndexesPreview(form.addressIndexes),
]

/**
 * @typedef {{
 *   id: string,
 *   label: string,
 *   noteParts: Array<{ text: string, highlight: boolean }>,
 *   absolutePath: string,
 *   requestedKinds: { xprv: boolean, xpub: boolean, k: boolean, K: boolean, A: boolean },
 *   canXprv: boolean,
 *   xprv: string | null,
 *   xpub: string,
 *   k: string | null,
 *   K: string,
 *   A: string | null,
 * }} DerivedNodeOutput
 */

export function getCoinTypeOption(value) {
    return COIN_TYPES.find(option => option.value === value) ?? {
        value,
        symbol: `#${value}`,
        localName: '自定义币种',
        name: 'Custom',
    }
}

function makeAbsolutePathLabel(baseSegments, extraSegments = []) {
    return ['m', ...baseSegments, ...extraSegments].join('')
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
 * @param {string} absolutePath
 * @param {number} coinType
 */
async function serializeNode(key, absolutePath, coinType) {
    const canXprv = !key.is_public_key()
    const publicKey = serializeCompressedPublicKey(key)
    return {
        absolutePath,
        canXprv,
        xprv: canXprv ? await /** @type {InstanceType<typeof libbip32.XPrv>} */ (key).serialize() : null,
        xpub: await (key.is_public_key() ? key : /** @type {InstanceType<typeof libbip32.XPrv>} */ (key).N()).serialize(),
        k: serializePrivateKeyHex(key),
        K: serializeCompressedPublicKeyHex(key),
        A: canDeriveBitcoinAddress(coinType) ? await libbip32.AddressOfK(publicKey, coinType === 1 ? 'testnet' : 'mainnet') : null,
    }
}

function resolveAbsolutePath(root, fallbackAbsolutePath, labels) {
    if (root.depth === 0 || !labels.referencePath)
        return fallbackAbsolutePath

    const normalized = labels.referencePath.trim()
    if (!normalized)
        return fallbackAbsolutePath
    if (fallbackAbsolutePath === 'm(?)')
        return normalized

    const suffix = fallbackAbsolutePath.startsWith('m') ? fallbackAbsolutePath.slice(1) : fallbackAbsolutePath
    if (!suffix)
        return normalized
    return `${normalized}${suffix}`
}

function hasRequestedKinds(kinds) {
    return kinds.xprv || kinds.xpub || kinds.k || kinds.K || kinds.A
}

function getRequestedKinds(form, levelId) {
    return form.requestedKinds[levelId] ?? EMPTY_REQUESTED_KINDS
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
    const coin = getCoinTypeOption(form.coinType)

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
 * @param {{
 *   coinType: number,
 *   account: number,
 *   change: 0 | 1,
 *   addressIndexes: number[],
 *   requestedKinds: Record<string, { xprv: boolean, xpub: boolean, k: boolean, K: boolean, A: boolean }>,
 *   labels: Partial<Record<'coin' | 'account' | 'change', string> & { referencePath: string }>,
 * }} form
 * @returns {Promise<DerivedNodeOutput[]>}
 */
export async function deriveBip44(root, form) {
    const outputs = []
    const baseSegments = []

    let current = root
    const originalDepth = root.depth
    for (const level of BIP44_LEVELS) {
        if (originalDepth >= level.depth) {
            if (level.depth === 5)
                break
            continue
        }

        const path = getLevelPath(level.id, form)
        if (!path)
            break

        if (current.is_public_key() && path.endsWith("'"))
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
                ...(await serializeNode(current, resolveAbsolutePath(root, makeAbsolutePathLabel(baseSegments), form.labels), form.coinType)),
            })
        }
    }

    if (current.depth === 4) {
        const requestedKinds = getRequestedKinds(form, 'address')
        for (const index of form.addressIndexes) {
            const child = await current.tree(`/${index}`)
            if (hasRequestedKinds(requestedKinds)) {
                outputs.push({
                    id: `address-${index}`,
                    label: `${index}`,
                    noteParts: describeOutputNoteParts('address', form, index),
                    requestedKinds,
                    ...(await serializeNode(child, resolveAbsolutePath(root, makeAbsolutePathLabel(baseSegments, [`/${index}`]), form.labels), form.coinType)),
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
export function getPathPreview(root, form) {
    const fixedSegments = root.depth > 0
        ? Array.from({ length: Math.min(root.depth, 5) }, (_, index) =>
            index + 1 === root.depth ? formatChildNumber(root.i) : '?')
        : []
    const selectableSegments = SELECTABLE_SEGMENT_BY_DEPTH
        .slice(Math.min(root.depth, SELECTABLE_SEGMENT_BY_DEPTH.length))
        .map(segment => typeof segment === 'function' ? segment(form) : segment)

    return ['m', ...fixedSegments, ...selectableSegments].join('/')
}

/**
 * @param {InstanceType<typeof libbip32.XKey>} key
 */
export async function describeRootKey(key) {
    const identifier = await key.identifier()
    return {
        level: describeBip44Level(key.depth),
        index: key.depth > 0 ? formatChildNumber(key.i) : null,
        parentFingerprint: key.depth > 0 ? bytesToHex(key.parent_fingerprint) : null,
        identifierHex: bytesToHex(identifier),
    }
}
