import { BIP44_LEVELS, COIN_TYPES, VALID_MNEMONIC_COUNTS } from './lib/constants.mjs'
import { canDeriveBitcoinAddress, deriveBip44, describeRootKey, formatAddressIndexesPreview, getCoinTypeOption, getPathPreview, resolveRootSource, validateBip44Import } from './lib/derivation.mjs'
import { RootInputModel, PassphraseModel } from './lib/input-models.mjs'
import { AddressIndexState } from './lib/path-state.mjs'
import { clampUint31Text, escapeHtml, MAX_UINT31_TEXT, parseUint31, pluralizeWords } from './lib/utils.mjs'

const rootModel = new RootInputModel()
const passphraseModel = new PassphraseModel()
const addressState = new AddressIndexState()

const state = {
    rootResult: null,
    rootInfo: null,
    outputs: [],
    pendingToken: 0,
    change: 0,
    revealXprv: new Set(),
    revealPrivateKey: new Set(),
    referencePath: '',
    selectedPathCards: new Set(),
    lastValidAccountText: '0',
    lastValidAddressDraftText: '0',
}

const DEFAULT_REQUESTED_KINDS = {
    purpose: { xprv: false, xpub: true, k: false, K: false, A: false },
    coin: { xprv: false, xpub: true, k: false, K: false, A: false },
    account: { xprv: false, xpub: true, k: false, K: false, A: false },
    change: { xprv: false, xpub: true, k: false, K: false, A: false },
    address: { xprv: false, xpub: false, k: false, K: false, A: false },
}
const AVAILABLE_OUTPUT_KINDS = {
    purpose: ['xprv', 'xpub'],
    coin: ['xprv', 'xpub'],
    account: ['xprv', 'xpub'],
    change: ['xprv', 'xpub'],
    address: ['k', 'K', 'A'],
}
const PATH_CARD_GROUPS = Object.keys(DEFAULT_REQUESTED_KINDS)
const PATH_CARD_DEPTHS = Object.fromEntries(BIP44_LEVELS.map(level => [level.id, level.depth]))

const el = {
    rootInput: document.querySelector('#root-input'),
    rootHelp: document.querySelector('#root-help'),
    rootError: document.querySelector('#root-error'),
    passphraseWrap: document.querySelector('#passphrase-wrap'),
    passphraseInput: document.querySelector('#passphrase-input'),
    coinType: document.querySelector('#coin-type'),
    accountInput: document.querySelector('#account-input'),
    accountError: document.querySelector('#account-error'),
    changeSwitch: document.querySelector('#change-switch'),
    changeNote: document.querySelector('#change-note'),
    addressInput: document.querySelector('#address-index-input'),
    addressAdd: document.querySelector('#address-index-add'),
    addressError: document.querySelector('#address-error'),
    addressList: document.querySelector('#address-index-list'),
    pathSummary: document.querySelector('#path-summary'),
    statusError: document.querySelector('#status-error'),
    statusLine: document.querySelector('#status-line'),
    rootInfo: document.querySelector('#root-info'),
    outputs: document.querySelector('#outputs'),
}

const pathCards = Object.fromEntries(
    [...document.querySelectorAll('[data-path-card]')].map(card => [card.dataset.pathCard, card]),
)
const kindPickWraps = Object.fromEntries(
    [...document.querySelectorAll('[data-kind-group]')].map(wrap => [wrap.dataset.kindGroup, wrap]),
)

for (const option of COIN_TYPES) {
    const node = document.createElement('option')
    node.value = String(option.value)
    node.textContent = `${option.value}': ${option.symbol} - ${option.name}`
    el.coinType.append(node)
}

function cloneRequestedKinds() {
    return Object.fromEntries(Object.entries(DEFAULT_REQUESTED_KINDS).map(([key, value]) => [key, { ...value }]))
}

const requestedKindsState = cloneRequestedKinds()
const addressAStateByCoinType = new Map([
    [0, false],
    [1, false],
])
const STATUS_ERROR_HIGHLIGHTS = new Map([
    ['未知协议类型: 仅支持 BIP 44, 考虑更换钱包 app', ['未知协议类型']],
    ['未知币种, 考虑更换钱包 app', ['未知币种']],
    ['密钥违反 BIP 44: 账户须使用硬化派生', ['违反 BIP 44']],
    ['未知的转账链类型: BIP 44 仅允许收款链和找零链', ['未知的转账链类型']],
    ['密钥违反 BIP 44: 地址索引必须使用 normal 派生', ['违反 BIP 44']],
    ['密钥违反 BIP 44: 层级太深', ['违反 BIP 44']],
])

function getSelectedCoinType() {
    return Number(el.coinType.value)
}

function getAddressAState(coinType = getSelectedCoinType()) {
    return addressAStateByCoinType.get(coinType) ?? false
}

function setAddressAState(checked, coinType = getSelectedCoinType()) {
    if (canDeriveBitcoinAddress(coinType))
        addressAStateByCoinType.set(coinType, checked)
}

function createKindControls(group) {
    const wrap = document.querySelector(`[data-kind-group="${group}"]`)
    for (const kind of AVAILABLE_OUTPUT_KINDS[group]) {
        const label = document.createElement('label')
        label.className = 'checkline'
        label.dataset.kind = kind
        label.innerHTML = `<input type="checkbox" data-output-group="${group}" data-output-kind="${kind}"><span>${kind}</span>`
        const input = label.querySelector('input')
        input.checked = group === 'address' && kind === 'A'
            ? getAddressAState()
            : requestedKindsState[group][kind]
        input.addEventListener('input', () => {
            if (group === 'address' && kind === 'A')
                setAddressAState(input.checked)
            else
                requestedKindsState[group][kind] = input.checked
            syncPathCardSelection()
            scheduleDerive()
        })
        wrap.append(label)
    }
}

for (const group of PATH_CARD_GROUPS)
    createKindControls(group)

const privateKindInputs = [...document.querySelectorAll('[data-output-kind="xprv"], [data-output-kind="k"]')]
const addressKindInputs = [...document.querySelectorAll('[data-output-kind="A"]')]

function sanitizeRequestedKinds(group, kinds) {
    const allowedKinds = new Set(AVAILABLE_OUTPUT_KINDS[group] ?? [])
    const canAddress = group === 'address' && canDeriveBitcoinAddress(getSelectedCoinType())
    const isSelected = !isPathCardLocked(group) && state.selectedPathCards.has(group)
    return {
        xprv: isSelected && allowedKinds.has('xprv') && kinds.xprv,
        xpub: isSelected && allowedKinds.has('xpub') && kinds.xpub,
        k: isSelected && allowedKinds.has('k') && kinds.k,
        K: isSelected && allowedKinds.has('K') && kinds.K,
        A: isSelected && allowedKinds.has('A') && canAddress && getAddressAState(),
    }
}

function getGenerateAt() {
    return Object.fromEntries(
        Object.entries(requestedKindsState).map(([group, kinds]) => [group, sanitizeRequestedKinds(group, kinds)]),
    )
}

function getFormState() {
    const account = parseUint31(el.accountInput.value)
    return {
        coinType: Number(el.coinType.value),
        account: account ?? 0,
        change: /** @type {0 | 1} */ (state.change),
        addressIndexes: [...addressState.values],
        requestedKinds: getGenerateAt(),
        labels: { referencePath: state.referencePath },
    }
}

function setFieldValue(input, value) {
    if (input.value !== value)
        input.value = value
}

function normalizeRequiredUint31Text(text) {
    const digits = clampUint31Text(text)
    if (!digits)
        return '0'

    return digits.replace(/^0+(?=\d)/, '')
}

function isUint31TextTooLarge(text) {
    const normalized = normalizeRequiredUint31Text(text)
    return normalized.length > MAX_UINT31_TEXT.length
        || (normalized.length === MAX_UINT31_TEXT.length && normalized > MAX_UINT31_TEXT)
}

function getProjectedTextInputValue(input, insertedText) {
    const selectionStart = input.selectionStart ?? input.value.length
    const selectionEnd = input.selectionEnd ?? selectionStart
    return input.value.slice(0, selectionStart) + insertedText + input.value.slice(selectionEnd)
}

function syncAccountInputWidth() {
    el.accountInput.style.setProperty('--chars', String(Math.max(1, el.accountInput.value.length)))
}

function rejectOverflowing(errorEl, label) {
    errorEl.textContent = `${label}: 最大值是 ${MAX_UINT31_TEXT}`
}

function syncRequiredUint31Input(input, lastValidText, onValueSynced, afterSync = () => {}) {
    const normalized = normalizeRequiredUint31Text(input.value)
    const accepted = !isUint31TextTooLarge(normalized)
    const nextText = accepted ? normalized : lastValidText

    setFieldValue(input, nextText)
    onValueSynced(nextText)
    afterSync(nextText)

    return accepted
}

function syncAccountInput() {
    return syncRequiredUint31Input(
        el.accountInput,
        state.lastValidAccountText,
        value => {
            state.lastValidAccountText = value
        },
        syncAccountInputWidth,
    )
}

function syncAddressDraftInput() {
    return syncRequiredUint31Input(el.addressInput, state.lastValidAddressDraftText, value => {
        addressState.updateDraft(value)
        state.lastValidAddressDraftText = addressState.draft
    })
}

function fitTextareaToContent(textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
}

function syncPathCardSelection() {
    for (const [group, card] of Object.entries(pathCards)) {
        const locked = isPathCardLocked(group)
        card.classList.toggle('locked', locked)
        card.classList.toggle('selected', !locked && state.selectedPathCards.has(group))
        card.setAttribute('aria-disabled', String(locked))
        kindPickWraps[group].hidden = locked
    }
}

function getImportedPathDepth() {
    return state.rootResult?.kind === 'xkey' ? state.rootResult.root.depth : 0
}

function isPathCardLocked(group) {
    return (PATH_CARD_DEPTHS[group] ?? Infinity) <= getImportedPathDepth()
}

function syncMaskedInputs() {
    setFieldValue(el.rootInput, rootModel.getDisplayValue())
    setFieldValue(el.passphraseInput, passphraseModel.getDisplayValue())
    el.rootInput.selectionStart = el.rootInput.selectionEnd = rootModel.getDisplayCursorPosition()
    el.passphraseInput.selectionStart = el.passphraseInput.selectionEnd = el.passphraseInput.value.length

    el.passphraseWrap.classList.toggle('hidden', rootModel.mode === 'xkey')
    el.rootInput.setAttribute('wrap', 'soft')
    el.passphraseInput.setAttribute('wrap', 'soft')
    fitTextareaToContent(el.rootInput)
    fitTextareaToContent(el.passphraseInput)

    if (rootModel.mode === 'xkey') {
        el.rootHelp.textContent = rootModel.getRawValue().startsWith('xprv')
            ? 'xprv: 前缀保留明文, 后续字符隐藏; | 固定标记第 111 个字符位置, 满 111 后自动校验且不再继续输入。'
            : 'xpub: 只接受 base58 字符; | 固定标记第 111 个字符位置, 满 111 后自动校验且不再继续输入。'
    } else {
        const words = rootModel.getWordState()
        el.rootHelp.textContent = `${pluralizeWords(words.candidateCount)}; 合法词数: ${VALID_MNEMONIC_COUNTS.join('/')}。输入空白会隐藏刚完成的 word。`
    }
}

function renderAddressChips() {
    el.addressList.replaceChildren()
    for (const value of addressState.values) {
        const chip = document.createElement('span')
        chip.className = 'chip'
        chip.innerHTML = `<span>${value}</span><button type="button" aria-label="移除 ${value}">x</button>`
        chip.querySelector('button').addEventListener('click', () => {
            addressState.remove(value)
            renderAddressChips()
            scheduleDerive()
        })
        el.addressList.append(chip)
    }
}

function commitAddressDraft() {
    const result = addressState.commitDraft()
    if (result.ok)
        addressState.updateDraft('0')

    el.addressError.textContent = result.error
    el.addressInput.value = addressState.draft
    state.lastValidAddressDraftText = addressState.draft
    renderAddressChips()
    scheduleDerive()
}

function appendPathTextPart(container, text, className = '') {
    const node = document.createElement('span')
    if (className)
        node.className = className
    node.textContent = text
    container.append(node)
}

function appendPathBreak(container) {
    container.append(document.createElement('wbr'))
}

function renderPathSegment(container, segment) {
    const match = segment.match(/^\{(\d+(?:,\d+)*)\}$/)
    if (!match) {
        appendPathTextPart(container, segment, 'path-segment')
        return
    }

    appendPathTextPart(container, '{', 'path-address-token')
    appendPathBreak(container)

    const values = match[1].split(',')
    for (const [index, value] of values.entries()) {
        appendPathTextPart(container, value, 'path-address-token')
        if (index >= values.length - 1)
            continue

        appendPathTextPart(container, ',', 'path-address-token')
        appendPathBreak(container)
    }

    appendPathBreak(container)
    appendPathTextPart(container, '}', 'path-address-token')
}

function renderPathText(container, path) {
    container.replaceChildren()
    container.setAttribute('aria-label', path)

    const segments = path.split('/')
    for (const [index, segment] of segments.entries()) {
        if (index > 0) {
            const separator = document.createElement('span')
            separator.className = 'path-separator'
            separator.textContent = '/'
            separator.setAttribute('aria-hidden', 'true')
            container.append(separator)
        }

        renderPathSegment(container, segment)
    }
}

function renderPathSummary() {
    const form = getFormState()
    const path = state.rootResult?.root
        ? getPathPreview(state.rootResult.root, form)
        : `m/44'/${form.coinType}'/${form.account}'/${form.change}/${formatAddressIndexesPreview(form.addressIndexes)}`
    renderPathText(el.pathSummary, path)

    const coin = getCoinTypeOption(form.coinType)
    el.changeSwitch.setAttribute('aria-pressed', String(form.change === 1))
    el.changeSwitch.querySelector('.switch-number').textContent = String(form.change)
    el.changeNote.textContent = form.change === 0
        ? '外部地址（收款）'
        : '内部地址（找零）'
    el.coinType.title = `${coin.value}': ${coin.name}`
}

function syncKindAvailability() {
    const rootKey = state.rootResult?.root
    const canShowXprv = rootKey
        ? !rootKey.is_public_key()
        : rootModel.mode !== 'xkey' || rootModel.getRawValue().startsWith('xprv')
    for (const input of privateKindInputs) {
        const label = input.closest('.checkline')
        const group = input.dataset.outputGroup
        const kind = input.dataset.outputKind
        input.disabled = !canShowXprv
        label.hidden = !canShowXprv
        if (!canShowXprv) {
            requestedKindsState[group][kind] = false
            input.checked = false
        }
        label.classList.toggle('disabled', !canShowXprv)
    }

    const canShowAddress = canDeriveBitcoinAddress(getSelectedCoinType())
    for (const input of addressKindInputs) {
        const label = input.closest('.checkline')
        input.disabled = !canShowAddress
        label.hidden = !canShowAddress
        label.classList.toggle('disabled', !canShowAddress)
        input.checked = getAddressAState()
    }

    syncPathCardSelection()
}

function shouldTogglePathCardFromClick(event) {
    return !event.target.closest('label, input, select, button, textarea, a, .chip')
}

function toggleSetMembership(set, value) {
    if (set.has(value))
        set.delete(value)
    else
        set.add(value)
}

function togglePathCardSelection(group) {
    if (isPathCardLocked(group))
        return
    toggleSetMembership(state.selectedPathCards, group)
    syncPathCardSelection()
    scheduleDerive()
}

function commitMaskedModelChange(change) {
    change()
    syncMaskedInputs()
    scheduleDerive()
}

function handleMaskedBeforeInput(event, model) {
    if (event.inputType === 'insertLineBreak') {
        event.preventDefault()
        return
    }

    if (event.inputType === 'insertText' && event.data) {
        event.preventDefault()
        commitMaskedModelChange(() => {
            model.insertText(event.data)
        })
        return
    }

    if (event.inputType === 'deleteContentBackward') {
        event.preventDefault()
        commitMaskedModelChange(() => {
            model.backspace()
        })
    }
}

function handleUint31BeforeInput(event, input, errorEl, label) {
    if (!event.inputType.startsWith('insert'))
        return

    const insertedText = event.data ?? ''
    if (!insertedText)
        return

    if (isUint31TextTooLarge(getProjectedTextInputValue(input, insertedText))) {
        event.preventDefault()
        rejectOverflowing(errorEl, label)
        return
    }

    errorEl.textContent = ''
}

function handleUint31Paste(event, input, errorEl, label) {
    const pastedText = event.clipboardData.getData('text/plain')
    if (!isUint31TextTooLarge(getProjectedTextInputValue(input, pastedText))) {
        errorEl.textContent = ''
        return
    }

    event.preventDefault()
    rejectOverflowing(errorEl, label)
}

function renderRootInfo() {
    el.rootInfo.replaceChildren()
    if (!state.rootInfo)
        return

    const items = [
        ['level', state.rootInfo.level],
        ['index', state.rootInfo.index ?? '-'],
        ['parent fingerprint', state.rootInfo.parentFingerprint ?? '-'],
        ['identifier', state.rootInfo.identifierHex],
    ]

    for (const [label, value] of items) {
        const node = document.createElement('div')
        node.className = 'info-item'
        const descriptionHtml = label === 'index'
            ? renderRootIndexDescription(state.rootInfo)
            : ''
        const renderedValue = label === 'identifier'
            ? `<strong><span class="identifier-fingerprint">${escapeHtml(value.slice(0, 8))}</span>${escapeHtml(value.slice(8))}</strong>`
            : `<strong>${escapeHtml(value)}</strong>`
        node.innerHTML = `<span class="info-item-label">${escapeHtml(label)}</span>${renderedValue}${descriptionHtml}`
        el.rootInfo.append(node)
    }
}

function renderRootIndexDescription(rootInfo) {
    if (rootInfo.indexValue == null)
        return ''

    if (rootInfo.depth === 1) {
        return rootInfo.isHardened && rootInfo.indexValue === 44
            ? renderInfoDescription(['BIP 44'])
            : ''
    }

    if (rootInfo.depth === 2) {
        if (!rootInfo.isHardened)
            return ''

        const coin = getCoinTypeOption(rootInfo.indexValue)
        return renderInfoDescription([`${coin.name} (${coin.localName})`])
    }

    if (rootInfo.depth === 4) {
        if (!rootInfo.isHardened && rootInfo.indexValue === 0)
            return renderInfoDescription(['收款'])
        if (!rootInfo.isHardened && rootInfo.indexValue === 1)
            return renderInfoDescription(['找零'])
        return ''
    }

    return ''
}

function renderInfoDescription(entries) {
    return `<div class="info-description">${entries
        .map(value => `<span>${escapeHtml(value)}</span>`)
        .join('')}</div>`
}

function maskSecret(kind, value) {
    if (!value)
        return ''
    if (kind === 'xprv')
        return `${value.slice(0, 4)}${'*'.repeat(Math.max(0, value.length - 4))}`
    return '*'.repeat(value.length)
}

function getRevealSet(kind) {
    return kind === 'xprv' ? state.revealXprv : state.revealPrivateKey
}

function renderValueRow(label, value) {
    return `<div class="output-row">
        <label>${label}</label>
        <div class="value-box">${escapeHtml(value)}</div>
        <span></span>
    </div>`
}

function shouldRenderSecret(kind, output) {
    if (kind === 'xprv')
        return output.canXprv && output.requestedKinds.xprv
    return output.requestedKinds.k && output.k
}

function renderSecretRow(kind, output) {
    if (!shouldRenderSecret(kind, output))
        return ''

    const reveal = getRevealSet(kind).has(output.id)
    const value = reveal ? output[kind] : maskSecret(kind, output[kind])
    return `<div class="output-row">
        <label>${kind}</label>
        <div class="secret" data-${kind}-value>${escapeHtml(value)}</div>
        <button class="tiny-button" type="button" data-toggle-${kind}="${escapeHtml(output.id)}">${reveal ? '隐藏' : '显示'}</button>
    </div>`
}

function syncSecretRevealButton(kind, button, output, card) {
    const reveal = getRevealSet(kind).has(output.id)
    const secret = card.querySelector(`[data-${kind}-value]`)
    if (secret)
        secret.textContent = reveal ? output[kind] : maskSecret(kind, output[kind])
    button.textContent = reveal ? '隐藏' : '显示'
}

function attachSecretToggle(kind, output, card) {
    const button = card.querySelector(`[data-toggle-${kind}]`)
    if (!button)
        return

    button.addEventListener('click', () => {
        toggleSetMembership(getRevealSet(kind), output.id)
        syncSecretRevealButton(kind, button, output, card)
    })
}

function renderNoteParts(parts) {
    return parts.map(part => {
        const className = part.highlight ? ' class="output-note-highlight"' : ''
        return `<span${className}>${escapeHtml(part.text)}</span>`
    }).join('')
}

function splitHighlightedText(text, highlights) {
    if (!text || highlights.length === 0)
        return [{ text, highlight: false }]

    const matchedHighlights = highlights
        .map(value => ({ value, index: text.indexOf(value) }))
        .filter(match => match.index >= 0)
        .sort((left, right) => left.index - right.index || right.value.length - left.value.length)

    if (matchedHighlights.length === 0)
        return [{ text, highlight: false }]

    const parts = []
    let cursor = 0
    for (const match of matchedHighlights) {
        const start = match.index
        const end = start + match.value.length
        if (start < cursor)
            continue

        if (start > cursor)
            parts.push({ text: text.slice(cursor, start), highlight: false })
        parts.push({ text: match.value, highlight: true })
        cursor = end
    }

    if (cursor < text.length)
        parts.push({ text: text.slice(cursor), highlight: false })

    return parts
}

function renderOutputs() {
    el.outputs.replaceChildren()
    el.outputs.classList.toggle('empty', state.outputs.length === 0)
    if (!state.outputs.length) {
        el.outputs.textContent = state.rootResult ? '当前没有选择要生成的节点。' : '有效输入出现后会在这里显示。'
        return
    }

    for (const output of state.outputs) {
        const card = document.createElement('article')
        card.className = 'output-card'
        const rows = [
            renderSecretRow('xprv', output),
            renderSecretRow('k', output),
            output.requestedKinds.xpub ? renderValueRow('xpub', output.xpub) : '',
            output.requestedKinds.K ? renderValueRow('K', output.K) : '',
            output.requestedKinds.A && output.A ? renderValueRow('A', output.A) : '',
        ].join('')
        card.innerHTML = `
            <div class="output-top">
                <div>
                    <h3>${escapeHtml(output.label)}</h3>
                    <div class="output-meta">
                        <p>${escapeHtml(output.absolutePath)}</p>
                        <span class="output-note">${renderNoteParts(output.noteParts)}</span>
                    </div>
                </div>
            </div>
            <div class="output-fields">
                ${rows}
            </div>
        `
        attachSecretToggle('xprv', output, card)
        attachSecretToggle('k', output, card)
        el.outputs.append(card)
    }
}

function clearResults(message) {
    state.rootResult = null
    state.rootInfo = null
    state.outputs = []
    showStatusError('')
    setStatusLine(message)
    syncKindAvailability()
    renderRootInfo()
    renderOutputs()
    renderPathSummary()
}

function clearOutputs(message) {
    state.outputs = []
    setStatusLine(message)
    renderOutputs()
    renderPathSummary()
}

function setStatusLine(message) {
    el.statusLine.hidden = !message
    el.statusLine.textContent = message
}

function showStatusError(message) {
    const parts = splitHighlightedText(message, STATUS_ERROR_HIGHLIGHTS.get(message) ?? [])
    el.statusError.hidden = !message
    el.statusError.innerHTML = renderNoteParts(parts)
}

function validateLocalInputs() {
    el.accountError.textContent = ''
    el.addressError.textContent = ''

    if (parseUint31(el.accountInput.value) == null) {
        el.accountError.textContent = `account: 输入 0 到 ${MAX_UINT31_TEXT} 之间的整数`
        return false
    }

    const draft = addressState.draft
    if (draft && parseUint31(draft) == null) {
        el.addressError.textContent = `address_index: 输入 0 到 ${MAX_UINT31_TEXT} 之间的整数`
        return false
    }

    return true
}

async function runDerive() {
    syncMaskedInputs()
    renderAddressChips()
    renderPathSummary()

    const token = ++state.pendingToken
    el.rootError.textContent = ''
    showStatusError('')

    if (!validateLocalInputs())
        return

    try {
        if (rootModel.mode === 'mnemonic') {
            const wordState = rootModel.getWordState()
            if (!wordState.normalizedSentence) {
                clearResults('等待助记词或 xpub/xprv。')
                return
            }
            if (!wordState.hasValidCount) {
                clearResults(`当前 ${wordState.candidateCount} 个 word; 需要 12/15/18/21/24 个 word。`)
                return
            }
            setStatusLine('')
            state.rootResult = await resolveRootSource({
                importMode: 'mnemonic',
                mnemonicSentence: wordState.normalizedSentence,
                passphrase: passphraseModel.getRawValue(),
            })
        } else {
            const xkey = rootModel.getRawValue()
            if (xkey.length !== 111) {
                clearResults('等待完整的 xpub/xprv。')
                showStatusError(`导入内容还没输完整, 目前已输入 ${xkey.length} 个字符。`)
                return
            }
            setStatusLine('')
            state.rootResult = await resolveRootSource({ importMode: 'xkey', xkeyText: xkey })
        }

        if (token !== state.pendingToken)
            return

        state.rootInfo = await describeRootKey(state.rootResult.root)
        if (state.rootResult.kind === 'xkey') {
            const importValidation = validateBip44Import(state.rootResult.root)
            if (!importValidation.ok) {
                syncKindAvailability()
                renderRootInfo()
                clearOutputs('')
                showStatusError(importValidation.error)
                return
            }
        }
        syncKindAvailability()
        const derived = await deriveBip44(state.rootResult.root, getFormState())
        if (token !== state.pendingToken)
            return

        state.outputs = derived
        setStatusLine('')
        renderRootInfo()
        renderOutputs()
        renderPathSummary()
    } catch (error) {
        if (token !== state.pendingToken)
            return
        const message = error instanceof Error ? error.message : String(error)
        clearResults('输入校验失败。')
        showStatusError(
            message.includes('CKDpub')
                ? '这个 xpub 不能继续生成你当前选择的位置。请改用更靠后的 xpub, 或直接导入 xprv。'
                : rootModel.mode === 'xkey'
                    ? '导入内容无法识别。请检查是否完整, 以及是否粘贴了正确的 xpub / xprv。'
                    : '助记词无效。请检查单词、顺序和词数。',
        )
    }
}

let deriveTimer = 0
function scheduleDerive() {
    window.clearTimeout(deriveTimer)
    deriveTimer = window.setTimeout(runDerive, 120)
}

function handleMaskedKeydown(event, model) {
    if (event.key === 'Enter') {
        event.preventDefault()
        return
    }

    if (event.key === 'Backspace') {
        event.preventDefault()
        commitMaskedModelChange(() => {
            model.backspace()
        })
        return
    }

    if (event.key === 'Delete' || event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Home' || event.key === 'End') {
        event.preventDefault()
        return
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault()
        commitMaskedModelChange(() => {
            model.insertText(event.key)
        })
    }
}

function bindMaskedInput(input, model) {
    input.addEventListener('keydown', event => handleMaskedKeydown(event, model))
    input.addEventListener('paste', event => {
        event.preventDefault()
        commitMaskedModelChange(() => {
            model.applyPaste(event.clipboardData.getData('text/plain'))
        })
    })
    input.addEventListener('beforeinput', event => handleMaskedBeforeInput(event, model))
}

function bindUint31Input({ input, errorEl, label, syncInput, onValidInput, onEnter }) {
    input.addEventListener('beforeinput', event => {
        handleUint31BeforeInput(event, input, errorEl, label)
    })
    input.addEventListener('paste', event => {
        handleUint31Paste(event, input, errorEl, label)
    })
    input.addEventListener('input', () => {
        if (!syncInput()) {
            rejectOverflowing(errorEl, label)
            return
        }

        errorEl.textContent = ''
        onValidInput()
    })

    if (!onEnter)
        return

    input.addEventListener('keydown', event => {
        if (event.key !== 'Enter')
            return
        event.preventDefault()
        onEnter()
    })
}

bindMaskedInput(el.rootInput, rootModel)
bindMaskedInput(el.passphraseInput, passphraseModel)

el.coinType.addEventListener('input', () => {
    syncKindAvailability()
    scheduleDerive()
})
bindUint31Input({
    input: el.accountInput,
    errorEl: el.accountError,
    label: 'account',
    syncInput: syncAccountInput,
    onValidInput: scheduleDerive,
})

el.changeSwitch.addEventListener('click', () => {
    state.change = state.change === 0 ? 1 : 0
    scheduleDerive()
})

bindUint31Input({
    input: el.addressInput,
    errorEl: el.addressError,
    label: 'address_index',
    syncInput: syncAddressDraftInput,
    onValidInput: scheduleDerive,
    onEnter: commitAddressDraft,
})
el.addressAdd.addEventListener('click', () => {
    commitAddressDraft()
    el.addressInput.focus()
})

for (const [group, card] of Object.entries(pathCards)) {
    card.addEventListener('click', event => {
        if (!shouldTogglePathCardFromClick(event))
            return
        togglePathCardSelection(group)
    })
}

syncMaskedInputs()
syncKindAvailability()
syncPathCardSelection()
syncAccountInput()
syncAddressDraftInput()
renderAddressChips()
renderPathSummary()
renderOutputs()
window.requestAnimationFrame(() => {
    el.rootInput.focus()
    el.rootInput.selectionStart = el.rootInput.selectionEnd = rootModel.getDisplayCursorPosition()
})
