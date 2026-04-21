import { getPathPreview, getXpubPathSegments } from './derivation.mjs'
import { appendSpan } from './dom-utils.mjs'
import { stripUncertaintyMarkers } from './utils.mjs'

function appendSeparator(container) {
    const sep = document.createElement('span')
    sep.className = 'path-separator'
    sep.textContent = '/'
    sep.setAttribute('aria-hidden', 'true')
    container.append(sep)
}

function renderPathSegment(container, segment) {
    const uncertainMatch = segment.match(/^~(.+)~$/)
    if (uncertainMatch) {
        const text = uncertainMatch[1]
        const hardenedMatch = text.match(/^(.+)'$/)
        if (hardenedMatch) {
            appendSpan(container, hardenedMatch[1], 'path-segment path-uncertain')
            appendSpan(container, "'", 'path-segment')
        } else {
            appendSpan(container, text, 'path-segment path-uncertain')
        }
        return
    }

    const addressSetMatch = segment.match(/^\{(\d+(?:,\d+)*)\}$/)
    if (!addressSetMatch) {
        appendSpan(container, segment, 'path-segment')
        return
    }

    appendSpan(container, '{', 'path-address-token')
    container.append(document.createElement('wbr'))

    const values = addressSetMatch[1].split(',')
    for (const [index, value] of values.entries()) {
        appendSpan(container, value, 'path-address-token')
        if (index >= values.length - 1)
            continue

        appendSpan(container, ',', 'path-address-token')
        container.append(document.createElement('wbr'))
    }

    container.append(document.createElement('wbr'))
    appendSpan(container, '}', 'path-address-token')
}

function appendSeparatedSegments(container, segments) {
    for (const segment of segments) {
        appendSeparator(container)
        renderPathSegment(container, segment)
    }
}

export function renderPathText(container, path) {
    container.replaceChildren()
    container.setAttribute('aria-label', path)

    const [first, ...rest] = path.split('/')
    renderPathSegment(container, first)
    appendSeparatedSegments(container, rest)
}

export function renderXpubPathNotation(container, root, form) {
    container.replaceChildren()

    const result = getXpubPathSegments(root, form)
    if (!result) {
        container.setAttribute('aria-label', 'M')
        appendSpan(container, 'M', 'path-segment')
        return
    }

    const nParts = ['m', ...result.insideN.map(stripUncertaintyMarkers)]
    const outerParts = result.outsideN.map(stripUncertaintyMarkers)
    let ariaLabel = `N(${nParts.join(' / ')})`
    if (outerParts.length > 0)
        ariaLabel += ' / ' + outerParts.join(' / ')
    container.setAttribute('aria-label', ariaLabel)

    appendSpan(container, 'N(', 'path-notation')
    renderPathSegment(container, 'm')
    appendSeparatedSegments(container, result.insideN)
    appendSpan(container, ')', 'path-notation')
    appendSeparatedSegments(container, result.outsideN)
}

export function renderOutputAbsolutePath(container, root, form, output) {
    if (!root) {
        renderPathText(container, `m${output.pathSuffix}`)
        return
    }

    const importedPath = getPathPreview(root, form).split('/')
    const baseSegments = importedPath.slice(1, root.depth + 1)
    const suffixSegments = output.pathSuffix
        ? output.pathSuffix.slice(1).split('/')
        : []
    const plainSegments = [...baseSegments, ...suffixSegments].map(stripUncertaintyMarkers)
    container.setAttribute('aria-label', ['m', ...plainSegments].join(' / '))

    renderPathSegment(container, 'm')
    appendSeparatedSegments(container, plainSegments)
}
