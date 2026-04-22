import libslip44 from '../deps.mjs'

export const VALID_MNEMONIC_COUNTS = [12, 15, 18, 21, 24]

export const WORD_MARKERS = [
    '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩',
    '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳',
    '㉑', '㉒', '㉓', '㉔',
]

export const HARDENED_OFFSET = 2 ** 31

export const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
export const XKEY_LENGTH = 111

export const COIN_TYPES = function() {
    const supported = {
        0: '比特币',
        1: '测试网',
        2: '莱特币',
        3: '狗狗币',
        60: '以太坊',
        61: '以太坊经典',
        145: '比特币现金',

    }
    return index.filter(
        coin => (coin[0] - 2**31) in supported
    ).map(coin => ({
        value: coin[0] - 2**31,
        symbol: coin[1],
        localName: supported[coin[0] - 2**31],
        name: coin[2]
    }))
}()

export const BIP44_LEVELS = [
    { depth: 1, id: 'purpose', label: "purpose'" },
    { depth: 2, id: 'coin', label: "coin_type'" },
    { depth: 3, id: 'account', label: "account'" },
    { depth: 4, id: 'change', label: 'change' },
    { depth: 5, id: 'address', label: 'address_index' },
]

export const WIF_VERSION_BY_COIN_TYPE = new Map([
    [0, 0x80],   // BTC
    [1, 0xEF],   // TBTC
    [2, 0xB0],   // LTC
    [3, 0x9E],   // DOGE
    [133, 0x80], // ZEC
    [145, 0x80], // BCH
])
