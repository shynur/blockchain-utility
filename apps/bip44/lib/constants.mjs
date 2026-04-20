export const VALID_MNEMONIC_COUNTS = [12, 15, 18, 21, 24]

export const WORD_MARKERS = [
    '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩',
    '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳',
    '㉑', '㉒', '㉓', '㉔',
]

export const HARDENED_OFFSET = 2 ** 31

export const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

export const COIN_TYPES = [
    { value: 0, symbol: 'BTC', localName: '比特币', name: 'Bitcoin' },
    { value: 1, symbol: 'TBTC', localName: '比特币测试网', name: 'Bitcoin Testnet' },
    { value: 2, symbol: 'LTC', localName: '莱特币', name: 'Litecoin' },
    { value: 3, symbol: 'DOGE', localName: '狗狗币', name: 'Dogecoin' },
    { value: 60, symbol: 'ETH', localName: '以太坊', name: 'Ethereum' },
    { value: 61, symbol: 'ETC', localName: '以太坊经典', name: 'Ethereum Classic' },
    { value: 118, symbol: 'ATOM', localName: 'Cosmos', name: 'Cosmos' },
    { value: 128, symbol: 'XMR', localName: '门罗币', name: 'Monero' },
    { value: 133, symbol: 'ZEC', localName: 'Zcash', name: 'Zcash' },
    { value: 144, symbol: 'XRP', localName: 'XRP', name: 'XRP' },
    { value: 145, symbol: 'BCH', localName: '比特币现金', name: 'Bitcoin Cash' },
    { value: 1815, symbol: 'ADA', localName: 'Cardano', name: 'Cardano' },
    { value: 195, symbol: 'TRX', localName: 'TRON', name: 'TRON' },
    { value: 354, symbol: 'DOT', localName: 'Polkadot', name: 'Polkadot' },
    { value: 501, symbol: 'SOL', localName: 'Solana', name: 'Solana' },
    { value: 714, symbol: 'BNB', localName: 'BNB 智能链', name: 'BNB Smart Chain' },
]

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
