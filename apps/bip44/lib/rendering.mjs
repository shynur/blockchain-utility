import { escapeHtml } from './utils.mjs'

export function renderNoteParts(parts) {
    return parts.map(part => {
        const className = part.highlight ? ' class="output-note-highlight"' : ''
        return `<span${className}>${escapeHtml(part.text)}</span>`
    }).join('')
}

export function splitHighlightedText(text, highlights) {
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
