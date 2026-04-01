## 文件组织架构

- `docs/bip-32.mediawiki`：BIP 32 paper.
- `test.mjs`: 测试 BIP 32 的章节 "Test Vectors" 提供的所有用例.
- `noble-secp256k1.mjs`：vendored secp256k1 库 (所谓的 `@noble/secp256k1`), 不直接使用.
- `secp256k1.mjs`：借助 `noble-secp256k1.mjs` 实现 BIP 32 所需的 secp256k1 APIs.
- `RIPEMD-160.mjs`：RIPEMD-160 hash function.
- `math-tools.mjs`：提供 BIP 32 所需的数学工具函数 (还在实现阶段, 不考虑哪些函数需要 export), `bip32.mjs` 仅依赖此 module 来实现数学运算.  依赖包含: `secp256k1.mjs`, `RIPEMD-160.mjs`.
- `bip32.mjs`：BIP 32 implementation.
- `index.mjs`：用于导出所有 public API.

## 代码风格

- 专注于可读性: 逻辑清晰, 严格遵循 BIP 所描述的算法执行, 不跳步骤
- 尽可能使用不可变类型
