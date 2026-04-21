export const OUTPUT_KIND_KEYS = ['xprv', 'xpub', 'k', 'K', 'A']

export const DEFAULT_REQUESTED_KINDS = {
    purpose: { xprv: false, xpub: true, k: false, K: false, A: false },
    coin: { xprv: false, xpub: true, k: false, K: false, A: false },
    account: { xprv: false, xpub: true, k: false, K: false, A: false },
    change: { xprv: false, xpub: true, k: false, K: false, A: false },
    address: { xprv: false, xpub: false, k: false, K: false, A: false },
}

export const AVAILABLE_OUTPUT_KINDS = {
    purpose: ['xprv', 'xpub'],
    coin: ['xprv', 'xpub'],
    account: ['xprv', 'xpub'],
    change: ['xprv', 'xpub'],
    address: ['k', 'K', 'A'],
}

export const PATH_CARD_GROUPS = Object.keys(DEFAULT_REQUESTED_KINDS)

export function createRequestedKindsState() {
    return structuredClone(DEFAULT_REQUESTED_KINDS)
}
