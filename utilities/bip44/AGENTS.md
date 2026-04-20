# Repository Guidelines

## Project Structure

- `index.html`: Entry point for the Web app.
- `deps.mjs`: 导出可供本项目使用的外部依赖.  (禁止私自修改它以添加依赖; 禁止绕过它使用其它依赖.)
- `docs/bip-44.mediawiki`: BIP 44 paper.
- `Design.md`: Product specification (business logic and UI/UX).

## Build

There is no build step.
The app (i.e., this entire directory) will ultimately be deployed to the server as-is.

## 代码

### 风格

可读性放在第一位, 效率不重要.

代码尽量是自解释的, 否则保留充分的注释.

### 依赖库

依赖库提供的 API 都有 JSDoc.

- BIP 32: 由 `deps.mjs` 导出的 `libbip32` 提供.
- BIP 39: 由 `deps.mjs` 导出的 `libbip39` 提供.

## Git

See <CONTRIBUTE.md>’s section `### Commit Message` for the Git commit message guidelines.
