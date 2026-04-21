import { VALID_MNEMONIC_COUNTS, WORD_MARKERS, XKEY_LENGTH } from './constants.mjs'
import { isAsciiLetter, isBase58Char, isWhitespace } from './utils.mjs'

const MAX_MNEMONIC_WORDS = WORD_MARKERS.length

function isXKeyPrefix(text) {
    return text.startsWith('xpub') || text.startsWith('xprv')
}

function isAllowedPassphraseChar(char) {
    return char === ' ' || !isWhitespace(char)
}

function filterPassphraseText(text) {
    return [...text].filter(isAllowedPassphraseChar).join('')
}

function normalizeMnemonicPaste(text) {
    text = text.replace(/^\s+/, '')
    if (text && !isAsciiLetter(text[0]))
        return ''

    let result = ''
    let started = false
    for (const char of text) {
        if (isAsciiLetter(char)) {
            result += char.toLowerCase()
            started = true
            continue
        }

        if (isWhitespace(char)) {
            if (started)
                result += ' '
            continue
        }
    }
    return result
}

function normalizeXKeyPaste(text) {
    let started = false
    let result = ''
    for (const char of text) {
        if (!started) {
            if (isWhitespace(char))
                continue
            started = true
        }
        if (isBase58Char(char))
            result += char
    }
    return result
}

function clampXKey(raw) {
    return raw.slice(0, XKEY_LENGTH)
}

function limitMnemonicWordCount(raw) {
    const trimmedLeft = raw.replace(/^[^A-Za-z\s]+/g, '')
    let result = ''
    let previousWasSpace = true
    let wordCount = 0

    for (const char of trimmedLeft) {
        if (isAsciiLetter(char)) {
            if (previousWasSpace) {
                if (wordCount >= MAX_MNEMONIC_WORDS)
                    break
                wordCount += 1
            }
            result += char.toLowerCase()
            previousWasSpace = false
            continue
        }

        if (isWhitespace(char) && !previousWasSpace) {
            result += ' '
            previousWasSpace = true
        }
    }

    return result
}

export class RootInputModel {
    /**
     * @param {string} initialText
     */
    constructor(initialText = '') {
        /** @type {'mnemonic' | 'xkey'} */
        this.mode = 'mnemonic'
        /** @type {string} */
        this.raw = ''
        this.setRaw(initialText)
    }

    /**
     * @param {string} raw
     */
    setRaw(raw) {
        const mnemonic = limitMnemonicWordCount(raw)
        const compact = mnemonic.replace(/\s+/g, '')
        if (isXKeyPrefix(compact)) {
            this.mode = 'xkey'
            this.raw = clampXKey(normalizeXKeyPaste(raw))
        } else {
            this.mode = 'mnemonic'
            this.raw = mnemonic
        }
    }

    /**
     * Mnemonic and xprv are rendered through a masked/derived view, so they
     * need append-only virtual editing. xpub is plain text and can use the
     * browser's native caret/selection behavior.
     */
    usesVirtualInput() {
        return this.mode === 'mnemonic' || this.raw.startsWith('xprv')
    }

    /**
     * Append filtered user input at the end of the logical value.
     * This is only used while the input is in virtual-editing mode.
     * @param {string} text
     */
    insertText(text) {
        for (const char of text) {
            if (this.mode === 'xkey') {
                if (isBase58Char(char) && this.raw.length < XKEY_LENGTH)
                    this.raw += char
                continue
            }

            if (isAsciiLetter(char)) {
                this.raw = limitMnemonicWordCount(`${this.raw}${char.toLowerCase()}`)
                const compact = this.raw.replace(/\s+/g, '')
                if (isXKeyPrefix(compact)) {
                    this.mode = 'xkey'
                    this.raw = compact
                }
                continue
            }

            if (isWhitespace(char) && this.raw && !this.raw.endsWith(' '))
                this.raw = limitMnemonicWordCount(`${this.raw} `)
        }
    }

    /**
     * @param {string} pastedText
     */
    applyPaste(pastedText) {
        if (this.mode === 'xkey') {
            this.raw = clampXKey(this.raw + normalizeXKeyPaste(pastedText))
            return
        }

        const mnemonicText = normalizeMnemonicPaste(pastedText)
        const compactMnemonic = `${this.raw}${mnemonicText}`.replace(/\s+/g, '')
        if (isXKeyPrefix(compactMnemonic)) {
            this.mode = 'xkey'
            this.raw = clampXKey(normalizeXKeyPaste(`${this.raw}${pastedText}`))
            return
        }

        this.mode = 'mnemonic'
        this.raw = limitMnemonicWordCount(`${this.raw}${mnemonicText}`)
    }

    backspace() {
        if (!this.raw)
            return

        if (this.mode === 'xkey') {
            if (this.raw.startsWith('xprv')) {
                this.raw = ''
                this.mode = 'mnemonic'
                return
            }

            this.raw = this.raw.slice(0, -1)
            if (!isXKeyPrefix(this.raw))
                this.mode = 'mnemonic'
            return
        }

        if (this.raw.endsWith(' ')) {
            const trimmed = this.raw.replace(/\s+$/g, '')
            const lastSpace = trimmed.lastIndexOf(' ')
            this.raw = lastSpace === -1 ? '' : trimmed.slice(0, lastSpace + 1)
            return
        }

        this.raw = this.raw.slice(0, -1)
    }

    getWordState() {
        const raw = this.raw
        const endsWithSpace = raw.endsWith(' ')
        const words = raw.trim() ? raw.trim().split(/\s+/) : []
        const completedCount = endsWithSpace ? words.length : Math.max(0, words.length - 1)
        const activeWord = endsWithSpace ? '' : (words.at(-1) ?? '')

        return {
            words,
            completedCount,
            activeWord,
            endsWithSpace,
            candidateCount: words.length,
            hasValidCount: VALID_MNEMONIC_COUNTS.includes(words.length),
            normalizedSentence: words.join(' '),
        }
    }

    getMnemonicMaskedValue() {
        const { words, activeWord, completedCount } = this.getWordState()
        if (!words.length)
            return ''

        const pieces = []
        for (let index = 0; index < words.length; index++) {
            const marker = WORD_MARKERS[index] ?? `#${index + 1}`
            if (index < completedCount)
                pieces.push(marker)
            else
                pieces.push(activeWord)
        }
        return pieces.filter(Boolean).join(' ')
    }

    getXKeyMaskedValue() {
        if (this.raw.startsWith('xprv')) {
            return `xprv${'*'.repeat(Math.max(0, this.raw.length - 4))}`
        }

        return this.raw
    }

    getDisplayValue() {
        return this.mode === 'xkey'
            ? this.getXKeyMaskedValue()
            : this.getMnemonicMaskedValue()
    }

    getRawValue() {
        return this.raw
    }
}

export class PassphraseModel {
    constructor(initialText = '') {
        /** @type {string} */
        this.raw = ''
        this.setRaw(initialText)
    }

    /**
     * @param {string} raw
     */
    setRaw(raw) {
        this.raw = filterPassphraseText(raw)
    }

    usesVirtualInput() {
        return true
    }

    /**
     * @param {string} text
     */
    insertText(text) {
        this.raw += filterPassphraseText(text)
    }

    backspace() {
        // Passphrase is always fully masked, so a single delete clears it all.
        this.raw = ''
    }

    /**
     * @param {string} text
     */
    applyPaste(text) {
        this.raw += filterPassphraseText(text)
    }

    getDisplayValue() {
        return '*'.repeat(this.raw.length)
    }

    getRawValue() {
        return this.raw
    }
}
