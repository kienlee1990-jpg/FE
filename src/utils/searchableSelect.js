const TYPEAHEAD_TIMEOUT_MS = 800

const stateBySelect = new WeakMap()

const normalizeSearchText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, (char) => char === "đ" ? "d" : "D")
    .trim()
    .toUpperCase()

const isPrintableKey = (event) =>
  event.key?.length === 1 &&
  !event.altKey &&
  !event.ctrlKey &&
  !event.metaKey

const getSelectTypeahead = (select, typedKey) => {
  const now = Date.now()
  const previous = stateBySelect.get(select)
  const normalizedKey = normalizeSearchText(typedKey)

  const nextValue = previous && now - previous.time <= TYPEAHEAD_TIMEOUT_MS
    ? `${previous.value}${normalizedKey}`
    : normalizedKey

  const allSameKey = nextValue.length > 1 && nextValue.split("").every(char => char === normalizedKey)

  const state = {
    value: allSameKey ? normalizedKey : nextValue,
    cycle: allSameKey,
    time: now
  }

  stateBySelect.set(select, state)
  return state
}

const findMatchingOption = (select, searchText, cycle = false) => {
  const options = Array.from(select.options || []).filter(option => !option.disabled)
  const nonEmptyOptions = options.filter(option => String(option.value || "").trim() !== "")
  const optionPool = nonEmptyOptions.length ? nonEmptyOptions : options
  const currentIndex = optionPool.findIndex(option => option.selected)
  const orderedOptions = cycle && currentIndex >= 0
    ? [...optionPool.slice(currentIndex + 1), ...optionPool.slice(0, currentIndex + 1)]
    : optionPool

  return orderedOptions.find((option) =>
    normalizeSearchText(option.textContent || option.label || "").startsWith(searchText)
  )
}

const handleSelectKeydown = (event) => {
  const select = event.target
  if (!(select instanceof HTMLSelectElement)) return
  if (select.disabled || select.multiple || !isPrintableKey(event)) return

  const { value, cycle } = getSelectTypeahead(select, event.key)
  if (!value) return

  const matchedOption = findMatchingOption(select, value, cycle)
  if (!matchedOption || select.value === matchedOption.value) return

  event.preventDefault()
  select.value = matchedOption.value
  select.dispatchEvent(new Event("input", { bubbles: true }))
  select.dispatchEvent(new Event("change", { bubbles: true }))
}

export const installSearchableSelects = () => {
  document.addEventListener("keydown", handleSelectKeydown, true)
}
