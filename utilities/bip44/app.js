import { COIN_TYPES, VALID_MNEMONIC_COUNTS } from './lib/constants.mjs'
import { canDeriveBitcoinAddress, deriveBip44, describeRootKey, formatAddressIndexesPreview, getCoinTypeOption, getPathPreview, resolveRootSource } from './lib/derivation.mjs'
import { RootInputModel, PassphraseModel } from './lib/input-models.mjs'
import { AddressIndexState } from './lib/path-state.mjs'
import { escapeHtml, parseUint31, pluralizeWords } from './lib/utils.mjs'

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

const el = {
    rootInput: document.querySelector('#root-input'),
    rootHelp: document.querySelector('#root-help'),
    rootError: document.querySelector('#root-error'),
    inputModeBadge: document.querySelector('#input-mode-badge'),
    passphraseWrap: document.querySelector('#passphrase-wrap'),
    passphraseInput: document.querySelector('#passphrase-input'),
    coinType: document.querySelector('#coin-type'),
    accountInput: document.querySelector('#account-input'),
    accountError: document.querySelector('#account-error'),
    changeSwitch: document.querySelector('#change-switch'),
    changeNote: document.querySelector('#change-note'),
    addressInput: document.querySelector('#address-index-input'),
    addressError: document.querySelector('#address-error'),
    addressList: document.querySelector('#address-index-list'),
    pathSummary: document.querySelector('#path-summary'),
    referencePathWrap: document.querySelector('#reference-path-wrap'),
    referencePathInput: document.querySelector('#reference-path-input'),
    statusLine: document.querySelector('#status-line'),
    rootInfo: document.querySelector('#root-info'),
    outputs: document.querySelector('#outputs'),
}

const pathCards = Object.fromEntries(
    [...document.querySelectorAll('[data-path-card]')].map(card => [card.dataset.pathCard, card]),
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
            if (input.checked)
                state.selectedPathCards.add(group)
            syncPathCardSelection()
            scheduleDerive()
        })
        wrap.append(label)
    }
}

for (const group of Object.keys(DEFAULT_REQUESTED_KINDS))
    createKindControls(group)

function sanitizeRequestedKinds(group, kinds) {
    const allowedKinds = new Set(AVAILABLE_OUTPUT_KINDS[group] ?? [])
    const canAddress = group === 'address' && canDeriveBitcoinAddress(getSelectedCoinType())
    const isSelected = state.selectedPathCards.has(group)
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

function fitTextareaToContent(textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
}

function syncPathCardSelection() {
    for (const [group, card] of Object.entries(pathCards))
        card.classList.toggle('selected', state.selectedPathCards.has(group))
}

function syncMaskedInputs() {
    setFieldValue(el.rootInput, rootModel.getDisplayValue())
    setFieldValue(el.passphraseInput, passphraseModel.getDisplayValue())
    el.rootInput.selectionStart = el.rootInput.selectionEnd = rootModel.getDisplayCursorPosition()
    el.passphraseInput.selectionStart = el.passphraseInput.selectionEnd = el.passphraseInput.value.length

    el.inputModeBadge.textContent = rootModel.mode
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

        const segmentNode = document.createElement('span')
        segmentNode.textContent = segment
        container.append(segmentNode)
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
    el.changeNote.textContent = form.change === 0
        ? '0: external / receiving addresses'
        : '1: internal / change addresses'
    el.coinType.title = `${coin.value}': ${coin.name}`

    const showReference = Boolean(state.rootResult && state.rootResult.kind === 'xkey' && state.rootResult.root.depth > 0)
    el.referencePathWrap.classList.toggle('hidden', !showReference)
}

function syncKindAvailability() {
    const rootKey = state.rootResult?.root
    const canShowXprv = rootKey
        ? !rootKey.is_public_key()
        : rootModel.mode !== 'xkey' || rootModel.getRawValue().startsWith('xprv')
    for (const input of document.querySelectorAll('[data-output-kind="xprv"]')) {
        const label = input.closest('.checkline')
        const group = input.dataset.outputGroup
        const disabled = !canShowXprv
        input.disabled = disabled
        label.hidden = disabled
        if (disabled) {
            requestedKindsState[group].xprv = false
            input.checked = false
        }
        label.classList.toggle('disabled', disabled)
    }

    for (const input of document.querySelectorAll('[data-output-kind="k"]')) {
        const label = input.closest('.checkline')
        const group = input.dataset.outputGroup
        const disabled = !canShowXprv
        input.disabled = disabled
        label.hidden = disabled
        if (disabled) {
            requestedKindsState[group].k = false
            input.checked = false
        }
        label.classList.toggle('disabled', disabled)
    }

    const canShowAddress = canDeriveBitcoinAddress(getSelectedCoinType())
    for (const input of document.querySelectorAll('[data-output-kind="A"]')) {
        const label = input.closest('.checkline')
        input.disabled = !canShowAddress
        label.hidden = !canShowAddress
        label.classList.toggle('disabled', !canShowAddress)
        input.checked = getAddressAState()
    }
}

function shouldTogglePathCardFromClick(event) {
    return !event.target.closest('label, input, select, button, textarea, a')
}

function togglePathCardSelection(group) {
    if (state.selectedPathCards.has(group))
        state.selectedPathCards.delete(group)
    else
        state.selectedPathCards.add(group)
    syncPathCardSelection()
    scheduleDerive()
}

function handleMaskedBeforeInput(event, model) {
    if (event.inputType === 'insertLineBreak') {
        event.preventDefault()
        return
    }

    if (event.inputType === 'insertText' && event.data) {
        event.preventDefault()
        model.insertText(event.data)
        syncMaskedInputs()
        scheduleDerive()
        return
    }

    if (event.inputType === 'deleteContentBackward') {
        event.preventDefault()
        model.backspace()
        syncMaskedInputs()
        scheduleDerive()
        return
    }
}

function renderRootInfo() {
    el.rootInfo.replaceChildren()
    if (!state.rootInfo) {
        document.documentElement.style.setProperty('--status-panel-width', '420px')
        el.rootInfo.style.setProperty('--status-columns', '2')
        return
    }

    const items = [
        ['depth', String(state.rootInfo.depth)],
        ['index', state.rootInfo.index ?? '-'],
        ['parent fingerprint', state.rootInfo.parentFingerprint ?? '-'],
        ['identifier', state.rootInfo.identifierHex],
    ]
    const columnCount = items.length >= 5 ? 3 : items.length >= 3 ? 2 : 1
    const panelWidth = columnCount === 1 ? '320px' : columnCount === 2 ? '420px' : '620px'
    document.documentElement.style.setProperty('--status-panel-width', panelWidth)
    el.rootInfo.style.setProperty('--status-columns', String(columnCount))

    for (const [label, value] of items) {
        const node = document.createElement('div')
        node.className = 'info-item'
        const renderedValue = label === 'identifier'
            ? `<strong><span class="identifier-fingerprint">${escapeHtml(value.slice(0, 8))}</span>${escapeHtml(value.slice(8))}</strong>`
            : `<strong>${escapeHtml(value)}</strong>`
        node.innerHTML = `<span class="info-item-label">${escapeHtml(label)}</span>${renderedValue}`
        el.rootInfo.append(node)
    }
}

function maskXprv(value) {
    if (!value)
        return ''
    return `${value.slice(0, 4)}${'*'.repeat(Math.max(0, value.length - 4))}`
}

function maskPrivateKey(value) {
    if (!value)
        return ''
    return '*'.repeat(value.length)
}

function renderNoteParts(parts) {
    return parts.map(part => {
        const className = part.highlight ? ' class="output-note-highlight"' : ''
        return `<span${className}>${escapeHtml(part.text)}</span>`
    }).join('')
}

function syncXprvRevealButton(button, output, card) {
    const reveal = state.revealXprv.has(output.id)
    const secret = card.querySelector('[data-xprv-value]')
    if (secret)
        secret.textContent = reveal ? output.xprv : maskXprv(output.xprv)
    button.textContent = reveal ? '隐藏' : '显示'
}

function syncPrivateKeyRevealButton(button, output, card) {
    const reveal = state.revealPrivateKey.has(output.id)
    const secret = card.querySelector('[data-k-value]')
    if (secret)
        secret.textContent = reveal ? output.k : maskPrivateKey(output.k)
    button.textContent = reveal ? '隐藏' : '显示'
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
        const reveal = state.revealXprv.has(output.id)
        const xprvRow = output.canXprv
            && output.requestedKinds.xprv
            ? `
                <div class="output-row">
                    <label>xprv</label>
                    <div class="secret" data-xprv-value>${escapeHtml(reveal ? output.xprv : maskXprv(output.xprv))}</div>
                    <button class="tiny-button" type="button" data-toggle-xprv="${escapeHtml(output.id)}">${reveal ? '隐藏' : '显示'}</button>
                </div>`
            : ''
        const kReveal = state.revealPrivateKey.has(output.id)
        const kRow = output.requestedKinds.k && output.k
            ? `
                <div class="output-row">
                    <label>k</label>
                    <div class="secret" data-k-value>${escapeHtml(kReveal ? output.k : maskPrivateKey(output.k))}</div>
                    <button class="tiny-button" type="button" data-toggle-k="${escapeHtml(output.id)}">${kReveal ? '隐藏' : '显示'}</button>
                </div>`
            : ''
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
                ${xprvRow}
                ${kRow}
                ${output.requestedKinds.xpub ? `<div class="output-row">
                    <label>xpub</label>
                    <div class="value-box">${escapeHtml(output.xpub)}</div>
                    <span></span>
                </div>` : ''}
                ${output.requestedKinds.K ? `<div class="output-row">
                    <label>K</label>
                    <div class="value-box">${escapeHtml(output.K)}</div>
                    <span></span>
                </div>` : ''}
                ${output.requestedKinds.A && output.A ? `<div class="output-row">
                    <label>A</label>
                    <div class="value-box">${escapeHtml(output.A)}</div>
                    <span></span>
                </div>` : ''}
            </div>
        `
        const toggle = card.querySelector('[data-toggle-xprv]')
        if (toggle) {
            toggle.addEventListener('click', () => {
                if (state.revealXprv.has(output.id))
                    state.revealXprv.delete(output.id)
                else
                    state.revealXprv.add(output.id)
                syncXprvRevealButton(toggle, output, card)
            })
        }
        const kToggle = card.querySelector('[data-toggle-k]')
        if (kToggle) {
            kToggle.addEventListener('click', () => {
                if (state.revealPrivateKey.has(output.id))
                    state.revealPrivateKey.delete(output.id)
                else
                    state.revealPrivateKey.add(output.id)
                syncPrivateKeyRevealButton(kToggle, output, card)
            })
        }
        el.outputs.append(card)
    }
}

function clearResults(message) {
    state.rootResult = null
    state.rootInfo = null
    state.outputs = []
    el.statusLine.textContent = message
    syncKindAvailability()
    renderRootInfo()
    renderOutputs()
    renderPathSummary()
}

function validateLocalInputs() {
    el.accountError.textContent = ''
    el.addressError.textContent = ''

    if (parseUint31(el.accountInput.value) == null) {
        el.accountError.textContent = 'account: 输入 0 到 2147483647 之间的整数'
        return false
    }

    const draft = addressState.draft
    if (draft && parseUint31(draft) == null) {
        el.addressError.textContent = 'address_index: 输入 0 到 2147483647 之间的整数'
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
            el.statusLine.textContent = '校验助记词并生成 master key...'
            state.rootResult = await resolveRootSource({
                importMode: 'mnemonic',
                mnemonicSentence: wordState.normalizedSentence,
                passphrase: passphraseModel.getRawValue(),
            })
        } else {
            const xkey = rootModel.getRawValue()
            if (xkey.length !== 111) {
                clearResults(`xpub/xprv 需要 111 个 base58 字符, 当前 ${xkey.length} 个。`)
                return
            }
            el.statusLine.textContent = '校验 xpub/xprv...'
            state.rootResult = await resolveRootSource({ importMode: 'xkey', xkeyText: xkey })
        }

        if (token !== state.pendingToken)
            return

        state.rootInfo = await describeRootKey(state.rootResult.root)
        syncKindAvailability()
        const derived = await deriveBip44(state.rootResult.root, getFormState(), true)
        if (token !== state.pendingToken)
            return

        state.outputs = derived.derived
        el.statusLine.textContent = state.rootResult.kind === 'mnemonic'
            ? '助记词有效, 已生成 BIP44 节点。'
            : '导入 key 有效, 已按可用子路径生成节点。'
        renderRootInfo()
        renderOutputs()
        renderPathSummary()
    } catch (error) {
        if (token !== state.pendingToken)
            return
        const message = error instanceof Error ? error.message : String(error)
        el.rootError.textContent = message.includes('CKDpub')
            ? 'xpub 不能进行硬化派生; 请导入 account/change 层级的 xpub, 或改用 xprv。'
            : `${message}; 请检查输入格式、词数、单词拼写或 xkey 长度。`
        clearResults('输入校验失败。')
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
        model.backspace()
        syncMaskedInputs()
        scheduleDerive()
        return
    }

    if (event.key === 'Delete' || event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Home' || event.key === 'End') {
        event.preventDefault()
        return
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault()
        model.insertText(event.key)
        syncMaskedInputs()
        scheduleDerive()
    }
}

el.rootInput.addEventListener('keydown', event => handleMaskedKeydown(event, rootModel))
el.rootInput.addEventListener('paste', event => {
    event.preventDefault()
    rootModel.applyPaste(event.clipboardData.getData('text/plain'))
    syncMaskedInputs()
    scheduleDerive()
})
el.rootInput.addEventListener('beforeinput', event => handleMaskedBeforeInput(event, rootModel))

el.passphraseInput.addEventListener('keydown', event => handleMaskedKeydown(event, passphraseModel))
el.passphraseInput.addEventListener('paste', event => {
    event.preventDefault()
    passphraseModel.applyPaste(event.clipboardData.getData('text/plain'))
    syncMaskedInputs()
    scheduleDerive()
})
el.passphraseInput.addEventListener('beforeinput', event => handleMaskedBeforeInput(event, passphraseModel))

el.coinType.addEventListener('input', () => {
    syncKindAvailability()
    scheduleDerive()
})
el.accountInput.addEventListener('input', () => {
    el.accountInput.value = el.accountInput.value.replace(/[^\d]/g, '')
    el.accountInput.style.setProperty('--chars', String(Math.max(1, el.accountInput.value.length)))
    scheduleDerive()
})

el.changeSwitch.addEventListener('click', () => {
    state.change = state.change === 0 ? 1 : 0
    scheduleDerive()
})

el.referencePathInput.addEventListener('input', () => {
    state.referencePath = el.referencePathInput.value
    scheduleDerive()
})

el.addressInput.addEventListener('input', () => {
    addressState.updateDraft(el.addressInput.value)
    el.addressInput.value = addressState.draft
    scheduleDerive()
})
el.addressInput.addEventListener('keydown', event => {
    if (event.key !== 'Enter')
        return
    event.preventDefault()
    const result = addressState.commitDraft()
    el.addressError.textContent = result.error
    el.addressInput.value = addressState.draft
    renderAddressChips()
    scheduleDerive()
})

el.deriveNow.addEventListener('click', runDerive)

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
renderAddressChips()
renderPathSummary()
renderOutputs()
window.requestAnimationFrame(() => {
    el.rootInput.focus()
    el.rootInput.selectionStart = el.rootInput.selectionEnd = rootModel.getDisplayCursorPosition()
})
