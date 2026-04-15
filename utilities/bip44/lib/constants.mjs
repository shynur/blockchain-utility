export const VALID_MNEMONIC_COUNTS = [12, 15, 18, 21, 24]

export const WORD_MARKERS = [
    '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩',
    '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳',
    '㉑', '㉒', '㉓', '㉔',
]

export const HARDENED_OFFSET = 2 ** 31

export const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

export const COIN_TYPES = [
    { value: 0, symbol: 'BTC', name: 'Bitcoin' },
    { value: 1, symbol: 'TBTC', name: 'Bitcoin Testnet' },
    { value: 2, symbol: 'LTC', name: 'Litecoin' },
    { value: 3, symbol: 'DOGE', name: 'Dogecoin' },
    { value: 60, symbol: 'ETH', name: 'Ethereum' },
    { value: 61, symbol: 'ETC', name: 'Ethereum Classic' },
    { value: 118, symbol: 'ATOM', name: 'Cosmos' },
    { value: 128, symbol: 'XMR', name: 'Monero' },
    { value: 133, symbol: 'ZEC', name: 'Zcash' },
    { value: 144, symbol: 'XRP', name: 'XRP' },
    { value: 145, symbol: 'BCH', name: 'Bitcoin Cash' },
    { value: 1815, symbol: 'ADA', name: 'Cardano' },
    { value: 195, symbol: 'TRX', name: 'TRON' },
    { value: 354, symbol: 'DOT', name: 'Polkadot' },
    { value: 501, symbol: 'SOL', name: 'Solana' },
    { value: 714, symbol: 'BNB', name: 'BNB Smart Chain' },
]

export const BIP44_LEVELS = [
    { depth: 1, id: 'purpose', label: "purpose'" },
    { depth: 2, id: 'coin', label: "coin_type'" },
    { depth: 3, id: 'account', label: "account'" },
    { depth: 4, id: 'change', label: 'change' },
    { depth: 5, id: 'address', label: 'address_index' },
]
