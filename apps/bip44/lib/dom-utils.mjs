export function appendSpan(container, text, className = '') {
    const node = document.createElement('span')
    if (className)
        node.className = className
    if (text)
        node.textContent = text
    container.append(node)
    return node
}

export function fitTextareaToContent(textarea) {
    textarea.style.height = 'auto'
    const nextHeight = `${textarea.scrollHeight}px`
    if (textarea.style.height !== nextHeight)
        textarea.style.height = nextHeight
}

export function moveCaretToEndIfFocused(input) {
    if (document.activeElement !== input)
        return

    const end = input.value.length
    if (input.selectionStart === end && input.selectionEnd === end)
        return

    input.selectionStart = input.selectionEnd = end
}

export function setFieldValue(input, value) {
    if (input.value === value)
        return false

    input.value = value
    return true
}

export function toggleSetMembership(set, value) {
    if (set.has(value))
        set.delete(value)
    else
        set.add(value)
}
