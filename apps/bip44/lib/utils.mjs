import { BASE58_ALPHABET, HARDENED_OFFSET } from './constants.mjs'

export const MAX_UINT31 = HARDENED_OFFSET - 1

export function isAsciiLetter(char) {
    return /^[A-Za-z]$/.test(char)
}

export function isWhitespace(char) {
    return /\s/.test(char)
}

export function isBase58Char(char) {
    return BASE58_ALPHABET.includes(char)
}

export function bytesToHex(bytes) {
    return Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('')
}

export function unhardenIndex(index) {
    return index >= HARDENED_OFFSET ? index - HARDENED_OFFSET : index
}

export function formatChildNumber(index) {
    return index >= HARDENED_OFFSET ? `${unhardenIndex(index)}'` : String(index)
}

export function serializeCompressedPublicKey(key) {
    const point = key.is_public_key() ? key.K : key.N().K
    return point.serialize()
}

export function serializeCompressedPublicKeyHex(key) {
    return bytesToHex(serializeCompressedPublicKey(key))
}

export function serializePrivateKeyHex(key) {
    if (key.is_public_key())
        return null

    return key.k.toString(16).padStart(64, '0')
}

export function clampUint31Text(text) {
    return text.replace(/[^\d]/g, '')
}

export function dedupeSorted(values) {
    return Array.from(new Set(values)).sort((left, right) => left - right)
}

export function escapeHtml(text) {
    return text
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;')
}

export function pluralizeWords(count) {
    return `${count} word${count === 1 ? '' : 's'}`
}

export function stripUncertaintyMarkers(text) {
    return text.replace(/^~|~$/g, '')
}
