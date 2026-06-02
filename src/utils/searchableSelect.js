const TYPEAHEAD_TIMEOUT_MS = 800
const DROPDOWN_MIN_HEIGHT = 160
const DROPDOWN_MAX_HEIGHT = 320

const stateBySelect = new WeakMap()
let activeSelect = null
let activeDropdown = null
let activeOptionIndex = -1

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

const isCustomDropdownSelect = (select) =>
  select instanceof HTMLSelectElement &&
  !select.disabled &&
  !select.multiple &&
  Number(select.size || 0) <= 1 &&
  select.dataset.nativeSelect !== "true"

const getScrollableParent = (element) => {
  let current = element?.parentElement

  while (current && current !== document.body) {
    const style = window.getComputedStyle(current)
    const overflowY = style.overflowY

    if (/(auto|scroll|overlay)/.test(overflowY) && current.scrollHeight > current.clientHeight) {
      return current
    }

    current = current.parentElement
  }

  return document.scrollingElement || document.documentElement
}

const ensureRoomBelow = (select) => {
  const rect = select.getBoundingClientRect()
  const availableBelow = window.innerHeight - rect.bottom

  if (availableBelow >= DROPDOWN_MIN_HEIGHT + 24) return

  const scroller = getScrollableParent(select)
  const scrollerRect = scroller === document.scrollingElement || scroller === document.documentElement
    ? { top: 0, height: window.innerHeight }
    : scroller.getBoundingClientRect()
  const targetTop = rect.top - scrollerRect.top - Math.max(64, scrollerRect.height * 0.28)

  if (scroller === document.scrollingElement || scroller === document.documentElement) {
    window.scrollBy({ top: targetTop, behavior: "auto" })
    return
  }

  scroller.scrollTop += targetTop
}

const getSelectRecords = (select) => {
  const records = []

  Array.from(select.children || []).forEach((child) => {
    if (child instanceof HTMLOptionElement) {
      records.push({
        type: "option",
        index: child.index,
        label: child.textContent?.trim() || child.label || "-",
        selected: child.selected,
        disabled: child.disabled,
        placeholder: String(child.value || "").trim() === ""
      })
      return
    }

    if (child instanceof HTMLOptGroupElement) {
      records.push({
        type: "group",
        label: child.label || ""
      })

      Array.from(child.children || []).forEach((option) => {
        if (!(option instanceof HTMLOptionElement)) return
        records.push({
          type: "option",
          index: option.index,
          label: option.textContent?.trim() || option.label || "-",
          selected: option.selected,
          disabled: child.disabled || option.disabled,
          placeholder: String(option.value || "").trim() === ""
        })
      })
    }
  })

  return records
}

const isStickyAllOption = (record) =>
  record.type === "option" &&
  normalizeSearchText(record.label).includes("TAT CA")

const positionDropdown = () => {
  if (!activeSelect || !activeDropdown) return

  const rect = activeSelect.getBoundingClientRect()
  const top = rect.bottom + 6
  const availableBelow = window.innerHeight - top - 12
  const maxHeight = Math.max(DROPDOWN_MIN_HEIGHT, Math.min(DROPDOWN_MAX_HEIGHT, availableBelow))
  const width = Math.max(rect.width, 220)
  const left = Math.min(Math.max(12, rect.left), Math.max(12, window.innerWidth - width - 12))

  activeDropdown.style.left = `${left}px`
  activeDropdown.style.top = `${top}px`
  activeDropdown.style.width = `${width}px`
  activeDropdown.style.maxHeight = `${maxHeight}px`
}

const scrollActiveOptionIntoView = () => {
  if (!activeDropdown) return
  const activeOption = activeDropdown.querySelector(".app-select-option.is-selected")
  activeOption?.scrollIntoView({ block: "nearest" })
}

const renderDropdown = (select) => {
  const dropdown = document.createElement("div")
  dropdown.className = "app-select-dropdown"
  dropdown.setAttribute("role", "listbox")

  const records = getSelectRecords(select)
  const selectedRecord = records.find(record => record.type === "option" && record.selected)
  activeOptionIndex = selectedRecord?.index ?? -1

  records.forEach((record) => {
    if (record.type === "group") {
      const group = document.createElement("div")
      group.className = "app-select-group"
      group.textContent = record.label
      dropdown.appendChild(group)
      return
    }

    const option = document.createElement("button")
    option.type = "button"
    option.className = [
      "app-select-option",
      record.selected ? "is-selected" : "",
      record.placeholder ? "is-placeholder" : "",
      isStickyAllOption(record) ? "is-sticky-all" : ""
    ].filter(Boolean).join(" ")
    option.dataset.optionIndex = String(record.index)
    option.textContent = record.label
    option.disabled = record.disabled
    option.setAttribute("role", "option")
    option.setAttribute("aria-selected", record.selected ? "true" : "false")
    dropdown.appendChild(option)
  })

  dropdown.addEventListener("mousedown", (event) => {
    event.preventDefault()
  })

  dropdown.addEventListener("click", (event) => {
    const option = event.target?.closest?.(".app-select-option")
    if (!option || option.disabled || !activeSelect) return
    selectOptionByIndex(activeSelect, Number(option.dataset.optionIndex))
    closeDropdown()
  })

  return dropdown
}

const refreshDropdownSelection = () => {
  if (!activeSelect || !activeDropdown) return

  activeOptionIndex = activeSelect.selectedIndex
  activeDropdown.querySelectorAll(".app-select-option").forEach((option) => {
    const isSelected = Number(option.dataset.optionIndex) === activeOptionIndex
    option.classList.toggle("is-selected", isSelected)
    option.setAttribute("aria-selected", isSelected ? "true" : "false")
  })

  scrollActiveOptionIntoView()
}

function closeDropdown() {
  if (activeDropdown) {
    activeDropdown.remove()
  }

  activeDropdown = null
  activeSelect = null
  activeOptionIndex = -1
}

const openDropdown = (select) => {
  if (!isCustomDropdownSelect(select)) return

  closeDropdown()
  activeSelect = select
  activeSelect.focus({ preventScroll: true })
  ensureRoomBelow(select)

  requestAnimationFrame(() => {
    if (activeSelect !== select) return
    activeDropdown = renderDropdown(select)
    document.body.appendChild(activeDropdown)
    positionDropdown()
    scrollActiveOptionIntoView()
  })
}

function selectOptionByIndex(select, index) {
  if (!select || index < 0 || index >= select.options.length) return
  const option = select.options[index]
  if (!option || option.disabled) return

  select.selectedIndex = index
  select.dispatchEvent(new Event("input", { bubbles: true }))
  select.dispatchEvent(new Event("change", { bubbles: true }))
  select.focus({ preventScroll: true })
}

const moveActiveOption = (direction) => {
  if (!activeSelect) return

  const enabledOptions = Array.from(activeSelect.options || [])
    .filter(option => !option.disabled)
    .map(option => option.index)

  if (!enabledOptions.length) return

  const currentPosition = enabledOptions.indexOf(activeOptionIndex)
  const nextPosition = currentPosition < 0
    ? 0
    : (currentPosition + direction + enabledOptions.length) % enabledOptions.length

  activeOptionIndex = enabledOptions[nextPosition]
  activeSelect.selectedIndex = activeOptionIndex
  refreshDropdownSelection()
}

const handleDocumentPointerDown = (event) => {
  const target = event.target
  if (!(target instanceof Node)) return

  if (activeDropdown?.contains(target)) return

  const select = target instanceof HTMLSelectElement ? target : null
  if (select && isCustomDropdownSelect(select)) {
    event.preventDefault()
    openDropdown(select)
    return
  }

  closeDropdown()
}

const handleWindowUpdate = () => {
  if (!activeDropdown) return
  positionDropdown()
}

const handleSelectKeydown = (event) => {
  const select = event.target instanceof HTMLSelectElement ? event.target : activeSelect
  if (!(select instanceof HTMLSelectElement)) return
  if (select.disabled || select.multiple) return

  if (activeDropdown && activeSelect === select) {
    if (event.key === "Escape") {
      event.preventDefault()
      closeDropdown()
      select.focus({ preventScroll: true })
      return
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      moveActiveOption(event.key === "ArrowDown" ? 1 : -1)
      return
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault()
      const direction = event.key === "Home" ? -Infinity : Infinity
      const enabledOptions = Array.from(select.options || []).filter(option => !option.disabled)
      const option = direction < 0 ? enabledOptions[0] : enabledOptions[enabledOptions.length - 1]
      if (option) {
        activeOptionIndex = option.index
        select.selectedIndex = option.index
        refreshDropdownSelection()
      }
      return
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      selectOptionByIndex(select, activeOptionIndex)
      closeDropdown()
      return
    }
  }

  if (isCustomDropdownSelect(select) && ["ArrowDown", "Enter", " "].includes(event.key)) {
    event.preventDefault()
    openDropdown(select)
    return
  }

  if (!isPrintableKey(event)) return

  const { value, cycle } = getSelectTypeahead(select, event.key)
  if (!value) return

  const matchedOption = findMatchingOption(select, value, cycle)
  if (!matchedOption || select.value === matchedOption.value) return

  event.preventDefault()
  select.value = matchedOption.value
  select.dispatchEvent(new Event("input", { bubbles: true }))
  select.dispatchEvent(new Event("change", { bubbles: true }))

  if (activeDropdown && activeSelect === select) {
    refreshDropdownSelection()
  }
}

export const installSearchableSelects = () => {
  document.addEventListener("keydown", handleSelectKeydown, true)
  document.addEventListener("pointerdown", handleDocumentPointerDown, true)
  window.addEventListener("resize", handleWindowUpdate)
  window.addEventListener("scroll", handleWindowUpdate, true)
}
