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
        2: '莱特币',
        3: '狗狗币',
        5: '达世币',
        60: '以太坊',
        118: '阿童木',
        133: '大零币',
        144: '瑞波币',
        145: '比特币现金',
        194: '柚子币',
        195: '波场',
        309: '字节元',
        330: '露娜 / 露娜经典',
        931: '雷神链',

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
