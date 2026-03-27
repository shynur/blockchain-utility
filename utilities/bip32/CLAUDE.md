## 文件组织架构

- `noble-secp256k1.mjs`：vendored secp256k1 库, 不直接使用.
- `secp256k1.mjs`：借助 `noble-secp256k1.mjs` 实现 BIP 32 所需的 secp256k1 APIs.
- `math-tools.mjs`：提供 BIP 32 所需的数学工具函数, `bip32.mjs` 仅依赖此 module 来实现数学运算.  依赖包含: `secp256k1.mjs`.
- `docs/bip-32.mediawiki`：BIP 32 paper.
