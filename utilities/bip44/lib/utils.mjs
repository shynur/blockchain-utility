import { BASE58_ALPHABET, HARDENED_OFFSET } from './constants.mjs'

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

export function formatChildNumber(index) {
    return index >= HARDENED_OFFSET ? `${index - HARDENED_OFFSET}'` : String(index)
}

export function serializeCompressedPublicKeyHex(key) {
    const point = key.is_public_key() ? key.K : key.N().K
    return bytesToHex(point.serialize())
}

export function clampUint31Text(text) {
    return text.replace(/[^\d]/g, '')
}

export function parseUint31(text) {
    if (!/^\d+$/.test(text))
        return null

    const value = Number(text)
    if (!Number.isInteger(value) || value < 0 || value >= HARDENED_OFFSET)
        return null

    return value
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
