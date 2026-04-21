import { dedupeSorted } from './utils.mjs'

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
            return false

        const value = Number(this.draft)
        this.values = dedupeSorted([...this.values, value])
        this.draft = ''
        return true
    }

    /**
     * @param {number} value
     */
    remove(value) {
        this.values = this.values.filter(item => item !== value)
    }
}
