import { VALID_MNEMONIC_COUNTS, WORD_MARKERS } from './constants.mjs'
import { isAsciiLetter, isBase58Char, isWhitespace } from './utils.mjs'

const MAX_MNEMONIC_WORDS = WORD_MARKERS.length

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

function trimTrailingSpaces(text) {
    return text.replace(/\s+$/g, '')
}

function collapseMnemonic(raw) {
    const trimmedLeft = raw.replace(/^[^A-Za-z\s]+/g, '')
    let result = ''
    let previousWasSpace = true
    for (const char of trimmedLeft) {
        if (isAsciiLetter(char)) {
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

function limitMnemonicWordCount(raw) {
    let result = ''
    let previousWasSpace = true
    let wordCount = 0

    for (const char of collapseMnemonic(raw)) {
        if (isAsciiLetter(char)) {
            if (previousWasSpace) {
                if (wordCount >= MAX_MNEMONIC_WORDS)
                    break
                wordCount += 1
            }
            result += char
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
        const candidate = limitMnemonicWordCount(raw)
        const prefixCandidate = candidate.replace(/\s+/g, '')
        if (prefixCandidate.startsWith('xpub') || prefixCandidate.startsWith('xprv'))
            this.mode = 'xkey'
        else
            this.mode = 'mnemonic'

        this.raw = this.mode === 'xkey'
            ? normalizeXKeyPaste(raw)
            : candidate
    }

    /**
     * Append filtered user input at the end of the logical value.
     * The UI is intentionally append/backspace-only because the visible text is
     * masked and therefore does not map cleanly to raw cursor positions.
     * @param {string} text
     */
    insertText(text) {
        for (const char of text) {
            if (this.mode === 'xkey') {
                if (isBase58Char(char))
                    this.raw += char
                if (!(this.raw.startsWith('xpub') || this.raw.startsWith('xprv')))
                    this.mode = 'mnemonic'
                continue
            }

            if (isAsciiLetter(char)) {
                this.raw = limitMnemonicWordCount(`${this.raw}${char.toLowerCase()}`)
                const compact = this.raw.replace(/\s+/g, '')
                if (compact.startsWith('xpub') || compact.startsWith('xprv')) {
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
     * @param {InputEvent} event
     */
    applyBeforeInput(event) {
        if (this.mode === 'xkey') {
            if (event.inputType === 'insertText' && event.data && ![...event.data].every(isBase58Char))
                event.preventDefault()
            if (event.inputType === 'insertFromPaste')
                event.preventDefault()
            return
        }

        if (event.inputType === 'insertText' && event.data) {
            const valid = [...event.data].every(char => isAsciiLetter(char) || isWhitespace(char))
            if (!valid)
                event.preventDefault()
        }
        if (event.inputType === 'insertFromPaste')
            event.preventDefault()
    }

    /**
     * @param {string} currentValue
     * @param {string | null} insertedText
     */
    afterNativeInput(currentValue, insertedText = null) {
        if (this.mode === 'xkey' || /^x(?:pub|prv)/.test(currentValue.trimStart()))
            this.mode = 'xkey'

        this.raw = this.mode === 'xkey'
            ? normalizeXKeyPaste(currentValue)
            : limitMnemonicWordCount(currentValue)

        if (insertedText && this.mode === 'mnemonic') {
            const prefixCandidate = this.raw.replace(/\s+/g, '')
            if (prefixCandidate.startsWith('xpub') || prefixCandidate.startsWith('xprv')) {
                this.mode = 'xkey'
                this.raw = normalizeXKeyPaste(currentValue)
            }
        }

        if (this.mode === 'xkey') {
            const compact = this.raw
            if (!(compact.startsWith('xpub') || compact.startsWith('xprv')))
                this.mode = 'mnemonic'
        }
    }

    /**
     * @param {string} pastedText
     */
    applyPaste(pastedText) {
        if (this.mode === 'xkey') {
            this.raw += normalizeXKeyPaste(pastedText)
            if (!(this.raw.startsWith('xpub') || this.raw.startsWith('xprv')))
                this.mode = 'mnemonic'
            return
        }

        const mnemonicText = normalizeMnemonicPaste(pastedText)
        const compactMnemonic = `${this.raw}${mnemonicText}`.replace(/\s+/g, '')
        if (compactMnemonic.startsWith('xpub') || compactMnemonic.startsWith('xprv')) {
            this.mode = 'xkey'
            this.raw = normalizeXKeyPaste(`${this.raw}${pastedText}`)
            return
        }

        this.mode = 'mnemonic'
        this.raw = limitMnemonicWordCount(`${this.raw}${mnemonicText}`)
    }

    backspace() {
        if (!this.raw)
            return

        if (this.mode === 'xkey') {
            this.raw = this.raw.slice(0, -1)
            if (!(this.raw.startsWith('xpub') || this.raw.startsWith('xprv')))
                this.mode = 'mnemonic'
            return
        }

        if (this.raw.endsWith(' ')) {
            this.raw = trimTrailingSpaces(this.raw)
            const lastSpace = this.raw.lastIndexOf(' ')
            this.raw = lastSpace === -1 ? '' : `${this.raw.slice(0, lastSpace + 1)}`
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
            const masked = `xprv${'*'.repeat(Math.max(0, this.raw.length - 4))}`
            if (masked.length > 111)
                return `${masked.slice(0, 111)}|${masked.slice(111)}`
            if (masked.length === 111)
                return `${masked}|`
            return masked
        }

        if (this.raw.length > 111)
            return `${this.raw.slice(0, 111)}|${this.raw.slice(111)}`
        if (this.raw.length === 111)
            return `${this.raw}|`
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
        this.raw = [...raw].filter(char => !isWhitespace(char)).join('')
    }

    /**
     * @param {string} text
     */
    insertText(text) {
        this.raw += [...text].filter(char => !isWhitespace(char)).join('')
    }

    backspace() {
        this.raw = this.raw.slice(0, -1)
    }

    /**
     * @param {InputEvent} event
     */
    applyBeforeInput(event) {
        if (event.inputType === 'insertText' && event.data && [...event.data].some(isWhitespace))
            event.preventDefault()
        if (event.inputType === 'insertFromPaste')
            event.preventDefault()
    }

    /**
     * @param {string} currentValue
     */
    afterNativeInput(currentValue) {
        this.setRaw(currentValue)
    }

    /**
     * @param {string} text
     */
    applyPaste(text) {
        this.raw += [...text].filter(char => !isWhitespace(char)).join('')
    }

    getDisplayValue() {
        return '*'.repeat(this.raw.length)
    }

    getRawValue() {
        return this.raw
    }
}
