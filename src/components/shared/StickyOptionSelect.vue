<template>
  <div ref="rootRef" class="sticky-option-select">
    <button
      type="button"
      class="sticky-option-trigger"
      :class="{ disabled }"
      :disabled="disabled"
      @click="toggleMenu"
    >
      <span class="sticky-option-value">{{ selectedLabel }}</span>
      <i class="bi bi-chevron-down"></i>
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="menuRef"
        class="sticky-option-menu"
        :style="menuStyle"
      >
        <div class="sticky-option-fixed">
          <button
            v-if="includeAll"
            type="button"
            class="sticky-option-row sticky-option-all"
            :class="{ active: isSelectedValue(allValue) }"
            @click="selectValue(allValue)"
          >
            {{ allLabel }}
          </button>

          <input
            v-if="searchable"
            ref="searchRef"
            v-model.trim="searchTerm"
            class="sticky-option-search"
            type="text"
            :placeholder="searchPlaceholder"
            @keydown.stop
          />
        </div>

        <div class="sticky-option-list" :style="{ maxHeight: listMaxHeight }">
          <button
            v-for="option in filteredOptions"
            :key="option.key"
            type="button"
            class="sticky-option-row"
            :class="{ active: isSelectedValue(option.value) }"
            @click="selectValue(option.value)"
          >
            {{ option.label }}
          </button>

          <div v-if="!filteredOptions.length" class="sticky-option-empty">
            Không có dữ liệu
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
  import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

  const props = defineProps({
    modelValue: {
      type: [String, Number, null],
      default: null
    },
    options: {
      type: Array,
      default: () => []
    },
    valueKeys: {
      type: Array,
      default: () => ['id', 'Id', 'value']
    },
    labelKeys: {
      type: Array,
      default: () => ['label', 'name', 'tenDonVi', 'TenDonVi']
    },
    includeAll: {
      type: Boolean,
      default: true
    },
    allValue: {
      type: [String, Number, null],
      default: null
    },
    allLabel: {
      type: String,
      default: 'Tất cả'
    },
    placeholder: {
      type: String,
      default: 'Chọn'
    },
    searchPlaceholder: {
      type: String,
      default: 'Tìm nhanh...'
    },
    searchable: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['update:modelValue', 'change'])

  const rootRef = ref(null)
  const menuRef = ref(null)
  const searchRef = ref(null)
  const open = ref(false)
  const searchTerm = ref('')
  const menuStyle = ref({})
  const menuMaxHeight = ref(320)

  const normalizeText = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim()
    .toLowerCase()

  const readByKeys = (item, keys) => {
    if (item === null || item === undefined) return ''
    if (typeof item !== 'object') return item

    for (const key of keys) {
      if (item[key] !== undefined && item[key] !== null) return item[key]
    }

    return ''
  }

  const isSameValue = (left, right) => {
    if (left === right) return true
    if (left === null || left === undefined || right === null || right === undefined) return false
    return String(left) === String(right)
  }

  const normalizedOptions = computed(() => {
    return props.options.map((item, index) => {
      const value = readByKeys(item, props.valueKeys)
      const label = String(readByKeys(item, props.labelKeys) || value || '-').trim()

      return {
        value,
        label,
        key: `${String(value)}-${index}`
      }
    })
  })

  const filteredOptions = computed(() => {
    const keyword = normalizeText(searchTerm.value)
    if (!keyword) return normalizedOptions.value
    return normalizedOptions.value.filter((item) => normalizeText(item.label).includes(keyword))
  })

  const selectedLabel = computed(() => {
    if (props.includeAll && isSameValue(props.modelValue, props.allValue)) return props.allLabel

    const selected = normalizedOptions.value.find((item) => isSameValue(item.value, props.modelValue))
    return selected?.label || props.placeholder
  })

  const listMaxHeight = computed(() => {
    const fixedHeight = props.searchable ? 104 : 48
    return `${Math.max(140, menuMaxHeight.value - fixedHeight)}px`
  })

  const updateMenuPosition = () => {
    const root = rootRef.value
    if (!root) return

    const rect = root.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom - 12
    const maxHeight = Math.max(190, Math.min(360, spaceBelow))

    menuMaxHeight.value = maxHeight
    menuStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 6}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      maxHeight: `${maxHeight}px`
    }
  }

  const openMenu = async () => {
    if (props.disabled) return
    open.value = true
    searchTerm.value = ''
    await nextTick()
    updateMenuPosition()
    searchRef.value?.focus()
    window.addEventListener('click', handleOutsideClick, true)
    window.addEventListener('scroll', updateMenuPosition, true)
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('keydown', handleKeydown)
  }

  const closeMenu = () => {
    open.value = false
    window.removeEventListener('click', handleOutsideClick, true)
    window.removeEventListener('scroll', updateMenuPosition, true)
    window.removeEventListener('resize', updateMenuPosition)
    window.removeEventListener('keydown', handleKeydown)
  }

  const toggleMenu = () => {
    if (open.value) closeMenu()
    else openMenu()
  }

  const selectValue = (value) => {
    emit('update:modelValue', value)
    emit('change', value)
    closeMenu()
  }

  const isSelectedValue = (value) => isSameValue(props.modelValue, value)

  const handleOutsideClick = (event) => {
    const target = event.target
    if (rootRef.value?.contains(target) || menuRef.value?.contains(target)) return
    closeMenu()
  }

  const handleKeydown = (event) => {
    if (event.key === 'Escape') closeMenu()
  }

  watch(() => props.disabled, (value) => {
    if (value) closeMenu()
  })

  onBeforeUnmount(() => {
    closeMenu()
  })
</script>

<style scoped>
  .sticky-option-select {
    position: relative;
    width: 100%;
  }

  .sticky-option-trigger {
    width: 100%;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 0.375rem 2.25rem 0.375rem 0.75rem;
    border: 1px solid #dbe2ea;
    border-radius: 12px;
    background: #fff;
    color: #212529;
    text-align: left;
    box-shadow: none;
  }

  .sticky-option-trigger:not(.disabled):hover,
  .sticky-option-trigger:not(.disabled):focus {
    border-color: #89d2ef;
    box-shadow: 0 0 0 0.2rem rgba(137, 210, 239, 0.2);
    outline: none;
  }

  .sticky-option-trigger.disabled {
    background: #e9ecef;
    color: #6c757d;
    cursor: not-allowed;
  }

  .sticky-option-value {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sticky-option-menu {
    z-index: 3000;
    overflow: hidden;
    border: 1px solid #d6e0ef;
    border-radius: 14px;
    background: #fff;
    box-shadow: 0 18px 44px rgba(15, 23, 42, 0.18);
  }

  .sticky-option-fixed {
    position: relative;
    z-index: 1;
    padding: 8px;
    border-bottom: 1px solid #e8eef7;
    background: #fff;
  }

  .sticky-option-search {
    width: 100%;
    min-height: 38px;
    margin-top: 8px;
    padding: 8px 10px;
    border: 1px solid #dbe2ea;
    border-radius: 10px;
    outline: none;
  }

  .sticky-option-search:focus {
    border-color: #0d6efd;
    box-shadow: 0 0 0 0.16rem rgba(13, 110, 253, 0.12);
  }

  .sticky-option-list {
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 6px;
  }

  .sticky-option-row {
    width: 100%;
    min-height: 38px;
    display: block;
    padding: 8px 10px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: #1f2937;
    text-align: left;
    line-height: 1.35;
  }

  .sticky-option-row:hover,
  .sticky-option-row.active {
    background: #eef5ff;
    color: #0d47a1;
  }

  .sticky-option-all {
    font-weight: 700;
  }

  .sticky-option-empty {
    padding: 14px 10px;
    color: #64748b;
    text-align: center;
  }
</style>
