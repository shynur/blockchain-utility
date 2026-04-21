import { BIP44_LEVELS, COIN_TYPES, VALID_MNEMONIC_COUNTS, XKEY_LENGTH } from './lib/constants.mjs'
import { BIP44_IMPORT_ERROR_CODES, canDeriveBitcoinAddress, deriveBip44, describeRootKey, formatAddressIndexesPreview, getPathPreview, resolveRootSource, validateBip44Import } from './lib/derivation.mjs'
import { fitTextareaToContent, moveCaretToEndIfFocused, setFieldValue, toggleSetMembership } from './lib/dom-utils.mjs'
import { RootInputModel, PassphraseModel } from './lib/input-models.mjs'
import { AVAILABLE_OUTPUT_KINDS, createRequestedKindsState, PATH_CARD_GROUPS } from './lib/output-kinds.mjs'
import { AddressIndexState } from './lib/path-state.mjs'
import { renderOutputAbsolutePath, renderPathText, renderXpubPathNotation } from './lib/path-rendering.mjs'
import { renderNoteParts, splitHighlightedText } from './lib/rendering.mjs'
import { clampUint31Text, escapeHtml, MAX_UINT31, pluralizeWords, unhardenIndex } from './lib/utils.mjs'

const rootModel = new RootInputModel()
const passphraseModel = new PassphraseModel()
const addressState = new AddressIndexState()
const WAITING_INPUT_STATUS = '等待输入ing...'

const state = {
    rootResult: null,
    rootInfo: null,
    entryValidated: false,
    preserveGatedPanelsWhilePending: false,
    outputs: [],
    pendingToken: 0,
    change: 0,
    revealXprv: new Set(),
    revealPrivateKey: new Set(),
    selectedPathCards: new Set(),
}

const PATH_CARD_DEPTHS = Object.fromEntries(BIP44_LEVELS.map(level => [level.id, level.depth]))

const el = {
    inputPanel: document.querySelector('.input-panel'),
    rootInput: document.querySelector('#root-input'),
    rootHelp: document.querySelector('#root-help'),
    rootError: document.querySelector('#root-error'),
    statusPanel: document.querySelector('.status-panel'),
    passphraseWrap: document.querySelector('#passphrase-wrap'),
    passphraseInput: document.querySelector('#passphrase-input'),
    coinType: document.querySelector('#coin-type'),
    accountInput: document.querySelector('#account-input'),
    changeSwitch: document.querySelector('#change-switch'),
    changeNote: document.querySelector('#change-note'),
    addressEntry: document.querySelector('#address-index-entry'),
    addressInput: document.querySelector('#address-index-input'),
    addressAdd: document.querySelector('#address-index-add'),
    addressList: document.querySelector('#address-index-list'),
    pathSummary: document.querySelector('#path-summary'),
    statusError: document.querySelector('#status-error'),
    statusLine: document.querySelector('#status-line'),
    rootInfo: document.querySelector('#root-info'),
    outputs: document.querySelector('#outputs'),
    outputPanel: document.querySelector('#output-panel'),
    gatedPanels: [...document.querySelectorAll('[data-gated-panel]')],
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

const requestedKindsState = createRequestedKindsState()
const addressAStateByCoinType = new Map(
    COIN_TYPES.filter(c => canDeriveBitcoinAddress(c.value)).map(c => [c.value, true]),
)
const STATUS_ERROR_CONTENT = new Map([
    [BIP44_IMPORT_ERROR_CODES.unknownProtocol, {
        message: '未知协议类型: 仅支持 BIP 44, 考虑更换钱包 app',
        highlights: ['未知协议类型'],
    }],
    [BIP44_IMPORT_ERROR_CODES.unknownCoin, {
        message: '未知币种: 考虑更换钱包 app',
        highlights: ['未知币种'],
    }],
    [BIP44_IMPORT_ERROR_CODES.accountMustBeHardened, {
        message: '密钥违反 BIP 44: 账户须使用硬化派生',
        highlights: ['违反 BIP 44'],
    }],
    [BIP44_IMPORT_ERROR_CODES.unknownChangeChain, {
        message: '未知的转账链类型: BIP 44 仅允许收款链和找零链',
        highlights: ['未知的转账链类型'],
    }],
    [BIP44_IMPORT_ERROR_CODES.addressMustBeNormal, {
        message: '密钥违反 BIP 44: 地址索引必须使用 normal 派生',
        highlights: ['违反 BIP 44'],
    }],
    [BIP44_IMPORT_ERROR_CODES.tooDeep, {
        message: '密钥违反 BIP 44: 层级太深',
        highlights: ['违反 BIP 44'],
    }],
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
let lastValidAccountText = el.accountInput.value
const hoverState = {
    activePathCard: null,
    lastPointerX: null,
    lastPointerY: null,
}

function setPointerHoveredPathCard(card) {
    if (hoverState.activePathCard === card)
        return

    hoverState.activePathCard?.classList.remove('pointer-hover')
    hoverState.activePathCard = card
    hoverState.activePathCard?.classList.add('pointer-hover')
}

function clearPointerHoveredPathCard() {
    hoverState.lastPointerX = null
    hoverState.lastPointerY = null
    setPointerHoveredPathCard(null)
}

function getPathCardFromNode(node) {
    return node instanceof Element ? node.closest('[data-path-card]') : null
}

function syncPointerHoveredPathCard() {
    if (hoverState.lastPointerX == null || hoverState.lastPointerY == null) {
        setPointerHoveredPathCard(null)
        return
    }

    const node = document.elementFromPoint(hoverState.lastPointerX, hoverState.lastPointerY)
    setPointerHoveredPathCard(getPathCardFromNode(node))
}

function handlePathCardPointerEvent(event) {
    if (event.pointerType === 'touch') {
        clearPointerHoveredPathCard()
        return
    }

    hoverState.lastPointerX = event.clientX
    hoverState.lastPointerY = event.clientY
    setPointerHoveredPathCard(getPathCardFromNode(event.target))
}

function sanitizeRequestedKinds(group, kinds) {
    const allowedKinds = new Set(AVAILABLE_OUTPUT_KINDS[group] ?? [])
    const canAddress = group === 'address' && canDeriveBitcoinAddress(getSelectedCoinType())
    const isSelected = isPathCardSelectable(group) && state.selectedPathCards.has(group)
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
    return {
        coinType: Number(el.coinType.value),
        account: Number(el.accountInput.value),
        change: /** @type {0 | 1} */ (state.change),
        addressIndexes: [...addressState.values],
        requestedKinds: getGenerateAt(),
    }
}

function normalizeRequiredUint31Text(text) {
    const digits = clampUint31Text(text)
    if (!digits)
        return '0'

    return digits.replace(/^0+(?=\d)/, '')
}

function isUint31TextTooLarge(text) {
    return Number(normalizeRequiredUint31Text(text)) > MAX_UINT31
}

function getProjectedTextInputValue(input, insertedText) {
    const selectionStart = input.selectionStart ?? input.value.length
    const selectionEnd = input.selectionEnd ?? selectionStart
    return input.value.slice(0, selectionStart) + insertedText + input.value.slice(selectionEnd)
}

function syncAccountInputWidth() {
    el.accountInput.style.setProperty('--chars', String(Math.max(1, el.accountInput.value.length)))
}

function syncRequiredUint31Input(input, getLastValidText, onValueSynced, afterSync = () => {}) {
    const normalized = normalizeRequiredUint31Text(input.value)
    const accepted = !isUint31TextTooLarge(normalized)
    const nextText = accepted ? normalized : getLastValidText()

    setFieldValue(input, nextText)
    onValueSynced(nextText)
    afterSync(nextText)

    return accepted
}

function syncAccountInput() {
    return syncRequiredUint31Input(
        el.accountInput,
        () => lastValidAccountText,
        value => {
            lastValidAccountText = value
        },
        syncAccountInputWidth,
    )
}

function syncAddressDraftInput() {
    return syncRequiredUint31Input(el.addressInput, () => addressState.draft || '0', value => {
        addressState.updateDraft(value)
    })
}

function isTextInputEditing() {
    return document.activeElement === el.rootInput
        || document.activeElement === el.passphraseInput
        || document.activeElement === el.accountInput
        || document.activeElement === el.addressInput
}

function syncPathCardSelection() {
    for (const [group, card] of Object.entries(pathCards)) {
        const locked = isPathCardLocked(group)
        const blocked = isPathCardBlockedByXpub(group)
        card.hidden = blocked
        card.classList.toggle('locked', locked)
        card.classList.toggle('selected', !locked && !blocked && state.selectedPathCards.has(group))
        card.setAttribute('aria-disabled', String(locked || blocked))
        kindPickWraps[group].hidden = locked || blocked
    }
}

function getImportedPathDepth() {
    return state.rootResult?.kind === 'xkey' ? state.rootResult.root.depth : 0
}

function isImportedAddressXkey() {
    return getImportedPathDepth() === 5
}

function isImportedMasterXpub() {
    const root = state.rootResult?.root
    return root && state.rootResult.kind === 'xkey' && root.is_public_key() && root.depth === 0
}

function isPathCardLocked(group) {
    return (PATH_CARD_DEPTHS[group] ?? Infinity) < getImportedPathDepth()
}

// BIP 44 depths 1–3 (purpose', coin_type', account') use hardened derivation.
// An xpub cannot perform hardened derivation, so any card whose path
// passes through a remaining hardened level is unreachable and should be hidden.
const HARDENED_DEPTHS = new Set(
    BIP44_LEVELS.filter(l => l.label.endsWith("'")).map(l => l.depth),
)

function isPathCardBlockedByXpub(group) {
    const root = state.rootResult?.root
    if (!root || state.rootResult.kind !== 'xkey' || !root.is_public_key())
        return false
    const cardDepth = PATH_CARD_DEPTHS[group] ?? Infinity
    if (cardDepth <= root.depth) return false
    for (let d = root.depth + 1; d <= cardDepth; d++) {
        if (HARDENED_DEPTHS.has(d)) return true
    }
    return false
}

function isPathCardSelectable(group) {
    return !isPathCardLocked(group) && !isPathCardBlockedByXpub(group)
}

function syncXkeyLockedValues(root) {
    const depth = root.depth
    if (depth < 2) return

    const childNumber = root.i
    const indexValue = unhardenIndex(childNumber)

    if (depth === 2) {
        el.coinType.value = String(indexValue)
        el.coinType.disabled = true
    } else if (depth === 3) {
        el.accountInput.value = String(indexValue)
        syncAccountInput()
        el.accountInput.disabled = true
    } else if (depth === 4) {
        state.change = /** @type {0 | 1} */ (indexValue)
        el.changeSwitch.disabled = true
    } else if (depth === 5) {
        addressState.values = []
        addressState.updateDraft(String(indexValue))
        addressState.commitDraft()
        addressState.updateDraft('0')
        renderAddressChips()
    }

    syncAddressIndexEntryVisibility()
}

function resetXkeyLockedValues() {
    el.coinType.disabled = false
    el.accountInput.disabled = false
    el.changeSwitch.disabled = false
    syncAddressIndexEntryVisibility()
}

function isRootEntryComplete() {
    if (rootModel.mode === 'xkey')
        return rootModel.getRawValue().length === XKEY_LENGTH

    const wordState = rootModel.getWordState()
    return Boolean(wordState.normalizedSentence) && wordState.hasValidCount
}

function syncStatusPanelVisibility() {
    el.statusPanel.classList.toggle('pending-entry', !isRootEntryComplete())
}

function syncMaskedInputs() {
    const isImportMode = rootModel.mode === 'xkey'
    const rootRawValue = rootModel.getRawValue()

    const rootChanged = setFieldValue(el.rootInput, rootModel.getDisplayValue())
    const passphraseChanged = setFieldValue(el.passphraseInput, passphraseModel.getDisplayValue())

    el.inputPanel.classList.toggle('xkey-entry', isImportMode)
    el.passphraseWrap.classList.toggle('hidden', isImportMode)

    if (rootChanged)
        fitTextareaToContent(el.rootInput)
    if (passphraseChanged)
        fitTextareaToContent(el.passphraseInput)

    if (isImportMode) {
        el.rootHelp.textContent = `已输入 ${rootRawValue.length}/${XKEY_LENGTH}`
    } else {
        const words = rootModel.getWordState()
        el.rootHelp.textContent = `${pluralizeWords(words.candidateCount)}; 合法词数: ${VALID_MNEMONIC_COUNTS.join('/')}。`
    }

    syncStatusPanelVisibility()
}

function renderAddressChips() {
    const locked = isImportedAddressXkey()
    el.addressList.replaceChildren()
    for (const value of addressState.values) {
        const chip = document.createElement('span')
        chip.className = 'chip'
        if (locked) {
            chip.innerHTML = `<span>${value}</span>`
        } else {
            chip.innerHTML = `<span>${value}</span><button type="button" aria-label="移除 ${value}">❌</button>`
            chip.querySelector('button').addEventListener('click', () => {
                addressState.remove(value)
                renderAddressChips()
                scheduleDerive()
            })
        }
        el.addressList.append(chip)
    }
}

function commitAddressDraft() {
    if (addressState.commitDraft())
        addressState.updateDraft('0')

    el.addressInput.value = addressState.draft
    renderAddressChips()
    scheduleDerive()
}

function renderPathSummary() {
    const form = getFormState()
    const root = state.rootResult?.root
    const isXpub = root && state.rootResult.kind === 'xkey' && root.is_public_key()
    const coin = COIN_TYPES.find(option => option.value === form.coinType)

    if (isXpub) {
        renderXpubPathNotation(el.pathSummary, root, form)
    } else {
        const path = root
            ? getPathPreview(root, form)
            : `m/44'/${form.coinType}'/${form.account}'/${form.change}/${formatAddressIndexesPreview(form.addressIndexes)}`
        renderPathText(el.pathSummary, path)
    }

    el.changeSwitch.setAttribute('aria-pressed', String(form.change === 1))
    el.changeSwitch.querySelector('.switch-number').textContent = String(form.change)
    el.changeNote.textContent = form.change === 0
        ? '外部地址 (收款)'
        : '内部地址 (找零)'
    el.coinType.title = `${coin.value}': ${coin.name}`
}

function syncAddressIndexEntryVisibility() {
    const hidden = isImportedAddressXkey()
    el.addressEntry.hidden = hidden
    pathCards.address.classList.toggle('compact', hidden)
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

function togglePathCardSelection(group) {
    if (!isPathCardSelectable(group))
        return
    toggleSetMembership(state.selectedPathCards, group)
    syncPathCardSelection()
    scheduleDerive()
}

function shouldPreserveGatedPanelsWhilePending() {
    return rootModel.mode === 'mnemonic'
        && isRootEntryComplete()
        && (state.entryValidated || state.preserveGatedPanelsWhilePending)
}

function invalidateEntryValidation({ preserveGatedPanels = false } = {}) {
    state.pendingToken += 1

    if (preserveGatedPanels && shouldPreserveGatedPanelsWhilePending())
        state.preserveGatedPanelsWhilePending = true

    if (!state.entryValidated)
        return

    state.entryValidated = false
    syncGatedPanels()
}

function commitMaskedModelChange(model, change) {
    change()
    invalidateEntryValidation({ preserveGatedPanels: model === passphraseModel })
    syncMaskedInputs()
    if (model === rootModel && !isRootEntryComplete())
        clearResults(WAITING_INPUT_STATUS)
    scheduleDerive()
}

function handleVirtualBeforeInput(event, model, inputState) {
    if (event.isComposing || inputState.isComposing)
        return

    if (event.inputType === 'insertLineBreak' || event.inputType === 'insertParagraph') {
        event.preventDefault()
        return
    }

    if ((event.inputType === 'insertText' || event.inputType === 'insertFromComposition') && (event.data ?? inputState.pendingCompositionText)) {
        event.preventDefault()
        const text = event.data ?? inputState.pendingCompositionText
        inputState.pendingCompositionText = ''
        commitMaskedModelChange(model, () => {
            model.insertText(text)
        })
        return
    }

    if (event.inputType === 'deleteContentBackward') {
        event.preventDefault()
        inputState.pendingCompositionText = ''
        commitMaskedModelChange(model, () => {
            model.backspace()
        })
    }
}

function handleVirtualInput(input, model, inputState) {
    if (inputState.isComposing) {
        fitTextareaToContent(input)
        return
    }

    if (inputState.pendingCompositionText) {
        const text = inputState.pendingCompositionText
        inputState.pendingCompositionText = ''
        commitMaskedModelChange(model, () => {
            model.insertText(text)
        })
        return
    }

    if (inputState.supportsBeforeInput)
        return

    const displayValue = model.getDisplayValue()
    if (input.value === displayValue)
        return

    if (input.value.startsWith(displayValue)) {
        const insertedText = input.value.slice(displayValue.length)
        commitMaskedModelChange(model, () => {
            model.insertText(insertedText)
        })
        return
    }

    if (displayValue.startsWith(input.value)) {
        const deleteCount = displayValue.length - input.value.length
        commitMaskedModelChange(model, () => {
            for (let i = 0; i < deleteCount; i++)
                model.backspace()
        })
        return
    }

    syncMaskedInputs()
}

function handleUint31BeforeInput(event, input) {
    if (!event.inputType.startsWith('insert'))
        return

    const insertedText = event.data ?? ''
    if (!insertedText)
        return

    if (isUint31TextTooLarge(getProjectedTextInputValue(input, insertedText)))
        event.preventDefault()
}

function handleUint31Paste(event, input) {
    event.preventDefault()

    const pastedText = event.clipboardData.getData('text/plain')
    const projected = getProjectedTextInputValue(input, pastedText)
    const overflow = isUint31TextTooLarge(projected)

    // Find the longest prefix of the pasted text that keeps the value in range.
    let end = overflow ? 0 : pastedText.length
    if (overflow) {
        for (let i = 1; i <= pastedText.length; i++) {
            if (!isUint31TextTooLarge(getProjectedTextInputValue(input, pastedText.slice(0, i))))
                end = i
        }
    }

    const textToInsert = pastedText.slice(0, end)
    const selStart = input.selectionStart ?? input.value.length
    const selEnd = input.selectionEnd ?? selStart
    const rawBeforeCursor = input.value.slice(0, selStart) + textToInsert
    const rawValue = rawBeforeCursor + input.value.slice(selEnd)

    const normalized = normalizeRequiredUint31Text(rawValue)
    const leadingZerosRemoved = clampUint31Text(rawValue).length - normalized.length
    const cursorPos = Math.max(0, clampUint31Text(rawBeforeCursor).length - leadingZerosRemoved)

    input.value = normalized
    input.setSelectionRange(cursorPos, cursorPos)
    input.dispatchEvent(new Event('input', { bubbles: true }))
}

function renderAll() {
    renderRootInfo()
    renderOutputs()
    renderPathSummary()
}

function renderRootInfo() {
    el.rootInfo.replaceChildren()
    if (!state.rootInfo)
        return

    const items = [
        { label: 'level', value: state.rootInfo.level, hasValue: true },
        { label: 'index', value: state.rootInfo.index ?? '-', hasValue: state.rootInfo.index != null },
        {
            label: 'parent fingerprint',
            value: state.rootInfo.parentFingerprint ?? '-',
            hasValue: state.rootInfo.parentFingerprint != null,
        },
        { label: 'identifier', value: state.rootInfo.identifierHex, hasValue: true },
    ]

    for (const item of items) {
        const node = document.createElement('div')
        node.className = 'info-item'
        if (!item.hasValue)
            node.classList.add('empty-value')
        const descriptionHtml = item.label === 'index'
            ? renderRootIndexDescription(state.rootInfo)
            : ''
        const renderedValue = item.label === 'identifier'
            ? `<strong><span class="identifier-fingerprint">${escapeHtml(item.value.slice(0, 8))}</span>${escapeHtml(item.value.slice(8))}</strong>`
            : `<strong>${escapeHtml(item.value)}</strong>`
        node.innerHTML = `<span class="info-item-label">${escapeHtml(item.label)}</span>${renderedValue}${descriptionHtml}`
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

        const coin = COIN_TYPES.find(option => option.value === rootInfo.indexValue)
        return coin
            ? renderInfoDescription([`${coin.name} (${coin.localName})`])
            : ''
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

function renderOutputsImmediate() {
    state.revealXprv.clear()
    state.revealPrivateKey.clear()
    el.outputs.replaceChildren()
    el.outputs.classList.toggle('empty', state.outputs.length === 0)
    if (!state.outputs.length) {
        el.outputs.textContent = '当前没有选择要生成的节点。'
        return
    }

    for (const output of state.outputs) {
        const card = document.createElement('article')
        card.className = 'output-card'
        card.style.viewTransitionName = `oc-${output.id}`
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
                    <h3>${renderNoteParts(output.noteParts)}</h3>
                    <div class="output-meta">
                        <p></p>
                    </div>
                </div>
            </div>
            <div class="output-fields">
                ${rows}
            </div>
        `
        renderOutputAbsolutePath(card.querySelector('.output-meta p'), state.rootResult?.root ?? null, getFormState(), output)
        attachSecretToggle('xprv', output, card)
        attachSecretToggle('k', output, card)
        el.outputs.append(card)
    }
}

function renderOutputs() {
    const canAnimate = typeof document.startViewTransition === 'function'
        && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        && !isTextInputEditing()
    if (canAnimate) {
        const transition = document.startViewTransition(renderOutputsImmediate)
        transition.finished.finally(() => {
            syncPointerHoveredPathCard()
        })
    } else {
        renderOutputsImmediate()
        syncPointerHoveredPathCard()
    }
}

function syncGatedPanels() {
    const showGatedPanels = state.entryValidated || state.preserveGatedPanelsWhilePending
    for (const panel of el.gatedPanels)
        panel.hidden = !showGatedPanels
    if (showGatedPanels && isImportedMasterXpub())
        el.outputPanel.hidden = true
}

function clearResults(message) {
    state.rootResult = null
    state.rootInfo = null
    state.entryValidated = false
    state.preserveGatedPanelsWhilePending = false
    state.outputs = []
    resetXkeyLockedValues()
    showStatusError('')
    setStatusLine(message)
    syncGatedPanels()
    syncKindAvailability()
    renderAll()
}

function setStatusLine(message) {
    el.statusLine.hidden = !message
    el.statusLine.textContent = message
}

function showStatusError(errorOrMessage) {
    const errorContent = STATUS_ERROR_CONTENT.get(errorOrMessage)
    const message = errorContent?.message ?? errorOrMessage
    const highlights = errorContent?.highlights ?? []
    const parts = splitHighlightedText(message, highlights)
    el.statusError.hidden = !message
    el.statusError.innerHTML = renderNoteParts(parts)
}

function isDeriveResultStale(token) {
    return token !== state.pendingToken
}

async function resolveCurrentRootSource() {
    if (rootModel.mode === 'mnemonic') {
        const wordState = rootModel.getWordState()
        return resolveRootSource({
            importMode: 'mnemonic',
            mnemonicSentence: wordState.normalizedSentence,
            passphrase: passphraseModel.getRawValue(),
        })
    }

    return resolveRootSource({
        importMode: 'xkey',
        xkeyText: rootModel.getRawValue(),
    })
}

function applyInvalidImportState(errorCode) {
    state.entryValidated = false
    state.preserveGatedPanelsWhilePending = false
    state.outputs = []
    setStatusLine('')
    showStatusError(errorCode)
    syncGatedPanels()
    syncKindAvailability()
    renderAll()
}

function applyValidImportState() {
    state.entryValidated = true
    state.preserveGatedPanelsWhilePending = false
    syncGatedPanels()
    syncKindAvailability()
}

function validateImportedRoot() {
    if (state.rootResult?.kind !== 'xkey')
        return true

    const importValidation = validateBip44Import(state.rootResult.root)
    if (!importValidation.ok) {
        applyInvalidImportState(importValidation.errorCode)
        return false
    }

    syncXkeyLockedValues(state.rootResult.root)
    return true
}

function showInvalidRootSourceError() {
    const title = rootModel.mode === 'xkey' ? '密钥无效' : '助记词无效'
    const detail = rootModel.mode === 'xkey'
        ? ': xpub / xprv 不合法'
        : ': 请检查单词和顺序'
    el.statusError.hidden = false
    el.statusError.innerHTML = `<span class="status-error-title">${escapeHtml(title)}</span><span class="status-error-detail">${escapeHtml(detail)}</span>`
}

async function runDerive() {
    syncMaskedInputs()
    syncAddressIndexEntryVisibility()
    renderAddressChips()
    renderPathSummary()

    const token = ++state.pendingToken
    el.rootError.textContent = ''
    showStatusError('')

    try {
        if (!isRootEntryComplete()) {
            clearResults(WAITING_INPUT_STATUS)
            return
        }

        setStatusLine('')
        state.rootResult = await resolveCurrentRootSource()

        if (isDeriveResultStale(token))
            return

        state.rootInfo = await describeRootKey(state.rootResult.root)
        if (isDeriveResultStale(token))
            return

        if (!validateImportedRoot())
            return

        applyValidImportState()
        const derived = await deriveBip44(state.rootResult.root, getFormState())
        if (isDeriveResultStale(token))
            return

        state.outputs = derived
        setStatusLine('')
        renderAll()
    } catch (error) {
        if (isDeriveResultStale(token))
            return
        clearResults('')
        showInvalidRootSourceError()
    }
}

let deriveTimer = 0
function scheduleDerive() {
    state.pendingToken += 1
    window.clearTimeout(deriveTimer)
    deriveTimer = window.setTimeout(runDerive, 120)
}

function handleMaskedKeydown(event, model, maskedState) {
    if (event.isComposing || maskedState.isComposing)
        return

    if (event.key === 'Enter') {
        event.preventDefault()
        return
    }

    if (!maskedState.supportsBeforeInput && event.key === 'Backspace') {
        event.preventDefault()
        commitMaskedModelChange(model, () => {
            model.backspace()
        })
        return
    }

    if (event.key === 'Delete' || event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Home' || event.key === 'End') {
        event.preventDefault()
        return
    }

    if (!maskedState.supportsBeforeInput && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault()
        commitMaskedModelChange(model, () => {
            model.insertText(event.key)
        })
    }
}

function bindMaskedInput(input, model) {
    const inputState = {
        isComposing: false,
        pendingCompositionText: '',
        supportsBeforeInput: 'onbeforeinput' in input,
    }
    const isVirtual = () => model.usesVirtualInput()
    const syncCaret = () => {
        if (!isVirtual())
            return
        window.requestAnimationFrame(() => {
            moveCaretToEndIfFocused(input)
        })
    }

    input.addEventListener('keydown', event => {
        if (!isVirtual())
            return
        handleMaskedKeydown(event, model, inputState)
    })
    input.addEventListener('paste', event => {
        if (!isVirtual())
            return
        event.preventDefault()
        inputState.pendingCompositionText = ''
        commitMaskedModelChange(model, () => {
            model.applyPaste(event.clipboardData.getData('text/plain'))
        })
    })
    input.addEventListener('drop', event => {
        if (isVirtual())
            event.preventDefault()
    })
    input.addEventListener('beforeinput', event => {
        if (isVirtual()) {
            handleVirtualBeforeInput(event, model, inputState)
            return
        }
        if (event.inputType === 'insertLineBreak' || event.inputType === 'insertParagraph')
            event.preventDefault()
    })
    input.addEventListener('input', () => {
        if (isVirtual()) {
            handleVirtualInput(input, model, inputState)
            return
        }
        if (inputState.isComposing) {
            fitTextareaToContent(input)
            return
        }
        inputState.pendingCompositionText = ''
        commitMaskedModelChange(rootModel, () => rootModel.setRaw(input.value))
    })
    input.addEventListener('compositionstart', () => {
        inputState.isComposing = true
        inputState.pendingCompositionText = ''
    })
    input.addEventListener('compositionend', event => {
        inputState.isComposing = false
        inputState.pendingCompositionText = isVirtual() ? (event.data ?? '') : ''
        if (isVirtual()) {
            window.requestAnimationFrame(() => {
                if (!inputState.pendingCompositionText)
                    return

                const text = inputState.pendingCompositionText
                inputState.pendingCompositionText = ''
                commitMaskedModelChange(model, () => {
                    model.insertText(text)
                })
            })
        }
        syncCaret()
    })
    input.addEventListener('focus', syncCaret)
    input.addEventListener('pointerup', syncCaret)
}

function bindUint31Input({ input, syncInput, onValidInput, onEnter }) {
    input.addEventListener('beforeinput', event => {
        handleUint31BeforeInput(event, input)
    })
    input.addEventListener('paste', event => {
        handleUint31Paste(event, input)
    })
    input.addEventListener('input', () => {
        if (syncInput())
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
    syncInput: syncAccountInput,
    onValidInput: scheduleDerive,
})

el.changeSwitch.addEventListener('click', () => {
    state.change = state.change === 0 ? 1 : 0
    scheduleDerive()
})

bindUint31Input({
    input: el.addressInput,
    syncInput: syncAddressDraftInput,
    onValidInput: () => {},
    onEnter: commitAddressDraft,
})
el.addressAdd.addEventListener('click', () => {
    commitAddressDraft()
})

document.addEventListener('pointermove', handlePathCardPointerEvent)
document.addEventListener('pointerdown', handlePathCardPointerEvent)
document.documentElement.addEventListener('pointerleave', clearPointerHoveredPathCard)
window.addEventListener('blur', clearPointerHoveredPathCard)

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
syncAddressIndexEntryVisibility()
renderAddressChips()
renderPathSummary()
renderOutputs()
window.requestAnimationFrame(() => {
    el.rootInput.focus()
    el.rootInput.selectionStart = el.rootInput.selectionEnd = el.rootInput.value.length
})
