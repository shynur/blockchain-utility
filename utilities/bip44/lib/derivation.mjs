import { libbip32, libbip39 } from '../deps.mjs'
import { BIP44_LEVELS, COIN_TYPES, HARDENED_OFFSET } from './constants.mjs'
import { bytesToHex, formatChildNumber, serializeCompressedPublicKeyHex } from './utils.mjs'

/**
 * @typedef {{
 *   id: string,
 *   depth: number,
 *   label: string,
 *   pathFromRoot: string,
 *   absolutePath: string,
 *   key: InstanceType<typeof libbip32.XKey>,
 *   requestedKinds: { xprv: boolean, xpub: boolean, K: boolean },
 *   canXprv: boolean,
 *   xprv: string | null,
 *   xpub: string,
 *   K: string,
 * }} DerivedNodeOutput
 */

export function getCoinTypeOption(value) {
    return COIN_TYPES.find(option => option.value === value) ?? {
        value,
        symbol: `#${value}`,
        name: 'Custom',
    }
}

export function makeAbsolutePathLabel(baseSegments, extraSegments = []) {
    return ['m', ...baseSegments, ...extraSegments].join('')
}

export function formatAddressIndexesPreview(addressIndexes) {
    if (addressIndexes.length === 0)
        return '{address_index}'
    if (addressIndexes.length === 1)
        return String(addressIndexes[0])
    return `{${addressIndexes.join(',')}}`
}

/**
 * @param {InstanceType<typeof libbip32.XKey>} key
 * @param {string} absolutePath
 */
async function serializeNode(key, absolutePath) {
    const canXprv = !key.is_public_key()
    return {
        absolutePath,
        canXprv,
        xprv: canXprv ? await /** @type {InstanceType<typeof libbip32.XPrv>} */ (key).serialize() : null,
        xpub: await (key.is_public_key() ? key : /** @type {InstanceType<typeof libbip32.XPrv>} */ (key).N()).serialize(),
        K: serializeCompressedPublicKeyHex(key),
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
    return kinds.xprv || kinds.xpub || kinds.K
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
        return {
            kind: 'mnemonic',
            root,
            seedHex: bytesToHex(seed),
            masterXprv: await root.serialize(),
        }
    }

    const xkeyText = source.xkeyText ?? ''
    const root = await libbip32.XKey.deserialize(xkeyText)
    return {
        kind: 'xkey',
        root,
        seedHex: null,
        masterXprv: null,
    }
}

/**
 * @param {InstanceType<typeof libbip32.XKey>} root
 * @param {{
 *   coinType: number,
 *   account: number,
 *   change: 0 | 1,
 *   addressIndexes: number[],
 *   requestedKinds: Record<string, { xprv: boolean, xpub: boolean, K: boolean }>,
 *   labels: Partial<Record<'coin' | 'account' | 'change', string> & { referencePath: string }>,
 * }} form
 * @returns {Promise<{
 *   derived: DerivedNodeOutput[],
 *   basePath: string,
 *   fixedLevels: Array<{ level: typeof BIP44_LEVELS[number], known: boolean, text: string }>,
 * }>}
 */
export async function deriveBip44(root, form) {
    const outputs = []
    /** @type {Array<{ level: typeof BIP44_LEVELS[number], known: boolean, text: string }>} */
    const fixedLevels = []
    const baseSegments = []

    let current = root
    const originalDepth = root.depth
    for (const level of BIP44_LEVELS) {
        if (originalDepth >= level.depth) {
            fixedLevels.push({
                level,
                known: level.depth === originalDepth,
                text: level.depth === originalDepth ? formatChildNumber(root.i) : '?',
            })
            if (level.depth === 5)
                break
            continue
        }

        let path = ''
        if (level.id === 'purpose')
            path = "/44'"
        else if (level.id === 'coin')
            path = `/${form.coinType}'`
        else if (level.id === 'account')
            path = `/${form.account}'`
        else if (level.id === 'change')
            path = `/${form.change}`
        else
            break

        if (current.is_public_key() && path.endsWith("'")) {
            fixedLevels.push({
                level,
                known: false,
                text: 'xpub 无法硬化派生',
            })
            break
        }

        current = await current.tree(path)
        baseSegments.push(path)
        fixedLevels.push({
            level,
            known: true,
            text: path.slice(1),
        })
        const requestedKinds = form.requestedKinds[level.id] ?? { xprv: false, xpub: false, K: false }
        if (hasRequestedKinds(requestedKinds)) {
            outputs.push({
                id: level.id,
                depth: current.depth,
                label: level.label,
                pathFromRoot: baseSegments.join(''),
                requestedKinds,
                ...(await serializeNode(current, resolveAbsolutePath(root, makeAbsolutePathLabel(baseSegments), form.labels))),
                key: current,
            })
        }
    }

    if (current.depth === 4) {
        for (const index of form.addressIndexes) {
            const child = await current.tree(`/${index}`)
            const requestedKinds = form.requestedKinds.address ?? { xprv: false, xpub: false, K: false }
            if (hasRequestedKinds(requestedKinds)) {
                outputs.push({
                    id: `address-${index}`,
                    depth: child.depth,
                    label: `${index}`,
                    pathFromRoot: `${baseSegments.join('')}/${index}`,
                    requestedKinds,
                    ...(await serializeNode(child, resolveAbsolutePath(root, makeAbsolutePathLabel(baseSegments, [`/${index}`]), form.labels))),
                    key: child,
                })
            }
        }
    }

    return {
        derived: outputs,
        basePath: baseSegments.join(''),
        fixedLevels,
    }
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
    const selectableSegments = []

    if (root.depth < 1)
        selectableSegments.push("44'")
    if (root.depth < 2)
        selectableSegments.push(`${form.coinType}'`)
    if (root.depth < 3)
        selectableSegments.push(`${form.account}'`)
    if (root.depth < 4)
        selectableSegments.push(`${form.change}`)
    if (root.depth < 5)
        selectableSegments.push(formatAddressIndexesPreview(form.addressIndexes))

    return ['m', ...fixedSegments, ...selectableSegments].join('/')
}

/**
 * @param {InstanceType<typeof libbip32.XKey>} key
 */
export async function describeRootKey(key) {
    const identifier = await key.identifier()
    const fingerprint = await key.fingerprint()
    return {
        type: key.is_public_key() ? 'public' : 'private',
        depth: key.depth,
        index: key.depth > 0 ? formatChildNumber(key.i) : null,
        parentFingerprint: key.depth > 0 ? bytesToHex(key.parent_fingerprint) : null,
        identifierHex: bytesToHex(identifier),
        fingerprintHex: bytesToHex(fingerprint),
    }
}
