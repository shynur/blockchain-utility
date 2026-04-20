import { dedupeSorted, MAX_UINT31_TEXT, parseUint31 } from './utils.mjs'

export class AddressIndexState {
    constructor() {
        /** @type {number[]} */
        this.values = []
        /** @type {string} */
        this.draft = ''
    }

    /**
     * @param {string} text
     */
    updateDraft(text) {
        this.draft = text.replace(/[^\d]/g, '')
    }

    commitDraft() {
        if (!this.draft)
            return { ok: false, error: '' }

        const value = parseUint31(this.draft)
        if (value == null)
            return { ok: false, error: `address_index: 输入 0 到 ${MAX_UINT31_TEXT} 之间的整数` }

        this.values = dedupeSorted([...this.values, value])
        this.draft = ''
        return { ok: true, error: '' }
    }

    /**
     * @param {number} value
     */
    remove(value) {
        this.values = this.values.filter(item => item !== value)
    }
}
