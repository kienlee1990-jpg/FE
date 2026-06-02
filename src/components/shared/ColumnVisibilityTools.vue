<template>
  <div :id="`tools-${tableId}`" class="table-tools" :class="{ 'table-tools-open': open }">
    <button type="button" class="table-tools-zoom" title="Phóng to bảng" @click="openZoom">
      <i class="bi bi-search"></i>
      <span>Phóng to</span>
    </button>

    <button type="button" class="table-tools-trigger" @click="toggleMenu">
      <i class="bi bi-layout-three-columns"></i>
      <span>Tùy chọn cột</span>
    </button>

    <div v-if="open" class="table-tools-menu">
      <div class="table-tools-head">
        <strong>Cột hiển thị</strong>
        <div class="table-tools-actions">
          <button type="button" @click="showAll">Tất cả</button>
          <button type="button" @click="hideAll">Bỏ hết</button>
        </div>
      </div>

      <label v-for="column in columns" :key="column.index" class="table-tools-option">
        <input v-model="visibleColumns" type="checkbox" :value="column.index" />
        <span>{{ column.label }}</span>
      </label>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="zoomOpen" class="table-zoom-backdrop" @click.self="closeZoom">
      <div class="table-zoom-modal">
        <div class="table-zoom-header">
          <div class="table-zoom-title">
            <span class="table-zoom-icon">
              <i class="bi bi-search"></i>
            </span>
            <div>
              <strong>Phóng to bảng</strong>
              <small>{{ columns.length }} cột</small>
            </div>
          </div>
          <button type="button" class="table-zoom-close" aria-label="Đóng" @click="closeZoom">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div ref="zoomBody" class="table-zoom-body"></div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  tableId: {
    type: String,
    required: true
  },
  defaultVisibleColumns: {
    type: Array,
    default: () => []
  },
  defaultHiddenColumnLabels: {
    type: Array,
    default: () => ['Đơn vị nhận']
  }
})

const open = ref(false)
const zoomOpen = ref(false)
const zoomBody = ref(null)
const columns = ref([])
const visibleColumns = ref([])
const initialized = ref(false)
let tableObserver = null
let pendingCollect = false
let scrollContainer = null

const hiddenSet = computed(() => new Set(columns.value.map(column => column.index).filter(index => !visibleColumns.value.includes(index))))

const getTable = () => document.getElementById(props.tableId)

const normalizeColumnLabel = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')
  .trim()
  .toLowerCase()

const getDefaultHiddenIndexes = () => {
  const hiddenLabels = new Set(props.defaultHiddenColumnLabels.map(normalizeColumnLabel).filter(Boolean))
  if (!hiddenLabels.size) return new Set()

  return new Set(
    columns.value
      .filter(column => hiddenLabels.has(normalizeColumnLabel(column.label)))
      .map(column => column.index)
  )
}

const setupScrollContainer = (table) => {
  const container = table?.parentElement
  if (!container || scrollContainer === container) return

  if (scrollContainer) {
    scrollContainer.classList.remove('managed-table-scroll')
  }

  scrollContainer = container
  scrollContainer.classList.add('managed-table-scroll')
}

const scheduleCollectColumns = () => {
  if (pendingCollect) return
  pendingCollect = true
  nextTick(() => {
    pendingCollect = false
    collectColumns()
  })
}

const disconnectTableObserver = () => {
  if (!tableObserver) return
  tableObserver.disconnect()
  tableObserver = null
}

const observeTableChanges = (table) => {
  if (!table || tableObserver) return

  tableObserver = new MutationObserver(() => {
    scheduleCollectColumns()
  })

  tableObserver.observe(table, {
    childList: true,
    subtree: true
  })
}

const collectColumns = () => {
  const table = getTable()
  if (!table) return

  setupScrollContainer(table)
  observeTableChanges(table)

  const headerCells = Array.from(table.querySelectorAll('thead th'))
  columns.value = headerCells.map((headerCell, index) => ({
    index,
    label: headerCell.textContent?.trim() || `Cột ${index + 1}`
  }))

  const allColumnIndexes = columns.value.map(column => column.index)
  const existing = new Set(allColumnIndexes)

  if (!initialized.value) {
    const defaultHiddenIndexes = getDefaultHiddenIndexes()
    const defaultColumns = props.defaultVisibleColumns
      .map(index => Number(index))
      .filter(index => existing.has(index))
      .filter(index => !defaultHiddenIndexes.has(index))

    visibleColumns.value = defaultColumns.length
      ? defaultColumns
      : allColumnIndexes.filter(index => !defaultHiddenIndexes.has(index))
    initialized.value = true
  } else if (visibleColumns.value.length > columns.value.length) {
    visibleColumns.value = visibleColumns.value.filter(index => existing.has(index))
  }

  applyVisibility()
}

const applyVisibility = () => {
  const table = getTable()
  if (!table) return

  const rows = Array.from(table.querySelectorAll('tr'))
  const cols = Array.from(table.querySelectorAll('colgroup col'))

  cols.forEach((col, index) => {
    col.style.display = hiddenSet.value.has(index) ? 'none' : ''
  })

  rows.forEach(row => {
    const cells = Array.from(row.children)
    if (cells.length === 1 && Number(cells[0].getAttribute('colspan') || 0) > 1) {
      cells[0].style.display = ''
      return
    }

    cells.forEach((cell, index) => {
      cell.style.display = hiddenSet.value.has(index) ? 'none' : ''
    })
  })
}

const toggleMenu = async () => {
  open.value = !open.value
  if (open.value) {
    await nextTick()
    collectColumns()
  }
}

const showAll = () => {
  visibleColumns.value = columns.value.map(column => column.index)
}

const hideAll = () => {
  visibleColumns.value = []
}

const prepareZoomTable = () => {
  const table = getTable()
  if (!table) return null

  const clone = table.cloneNode(true)
  clone.removeAttribute('id')
  clone.classList.add('table-zoom-clone')

  clone.querySelectorAll('[id]').forEach(element => {
    element.removeAttribute('id')
  })

  if (clone instanceof HTMLElement) {
    const columnCount = Math.max(clone.querySelectorAll('thead th').length, columns.value.length, 1)
    const zoomWidth = Math.max(columnCount * 150, 960)
    clone.style.width = `${zoomWidth}px`
    clone.style.minWidth = '100%'
    clone.style.tableLayout = 'fixed'
  }

  clone.querySelectorAll('col, th, td').forEach(element => {
    if (element instanceof HTMLElement) {
      element.style.display = ''
      element.style.width = ''
      element.style.minWidth = ''
      element.style.maxWidth = ''
      element.style.whiteSpace = ''
      element.style.overflow = ''
      element.style.textOverflow = ''
    }
  })

  return clone
}

const renderZoomTable = () => {
  if (!zoomBody.value) return

  zoomBody.value.replaceChildren()
  const clone = prepareZoomTable()
  if (clone) {
    zoomBody.value.appendChild(clone)
  }
}

const openZoom = async () => {
  open.value = false
  collectColumns()
  zoomOpen.value = true
  document.body.classList.add('table-zoom-open')
  await nextTick()
  renderZoomTable()
}

const closeZoom = () => {
  zoomOpen.value = false
  document.body.classList.remove('table-zoom-open')
  if (zoomBody.value) {
    zoomBody.value.replaceChildren()
  }
}

const handleDocumentClick = (event) => {
  const target = event.target
  if (!(target instanceof Node)) return
  const host = document.getElementById(`tools-${props.tableId}`)
  if (host && !host.contains(target)) {
    open.value = false
  }
}

const handleKeydown = (event) => {
  if (event.key !== 'Escape') return

  if (zoomOpen.value) {
    closeZoom()
    return
  }

  if (open.value) {
    open.value = false
  }
}

watch(visibleColumns, () => {
  applyVisibility()
}, { deep: true })

watch(() => props.tableId, async () => {
  initialized.value = false
  columns.value = []
  visibleColumns.value = []
  disconnectTableObserver()
  await nextTick()
  collectColumns()
})

onMounted(async () => {
  await nextTick()
  collectColumns()
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleKeydown)
  closeZoom()
  if (scrollContainer) {
    scrollContainer.classList.remove('managed-table-scroll')
    scrollContainer = null
  }
  disconnectTableObserver()
})
</script>

<style>
.table-tools{position:sticky;top:0;left:0;right:0;display:flex;justify-content:flex-end;align-items:center;gap:10px;width:100%;min-height:58px;margin-bottom:0;padding:10px 12px;z-index:80;background:linear-gradient(180deg,rgba(255,255,255,.98) 0%,rgba(248,251,255,.94) 100%);border-bottom:1px solid #e2e8f0;backdrop-filter:blur(8px)}
.table-tools.table-tools-open{z-index:160 !important}
.table-tools-trigger{display:inline-flex;align-items:center;gap:8px;padding:9px 15px;border:1px solid #d7deea;border-radius:999px;background:linear-gradient(180deg,#ffffff 0%,#f8fbff 100%);color:#0f172a;font-size:13px;font-weight:700;box-shadow:0 10px 22px rgba(15,23,42,.06);transition:all .18s ease}
.table-tools-zoom{display:inline-flex;align-items:center;gap:8px;padding:9px 13px;border:1px solid #bfdbfe;border-radius:999px;background:#eff6ff;color:#1d4ed8;font-size:13px;font-weight:800;box-shadow:0 10px 22px rgba(37,99,235,.08);transition:all .18s ease}
.table-tools-trigger:hover,.table-tools-zoom:hover{background:#eef6ff;border-color:#bfdbfe;transform:translateY(-1px)}
.table-tools-menu{position:absolute;right:0;top:calc(100% + 8px);width:300px;max-height:360px;overflow:auto;padding:14px;background:#fff;border:1px solid #e2e8f0;border-radius:18px;box-shadow:0 18px 40px rgba(15,23,42,.16);z-index:170 !important}
.table-tools-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.table-tools-actions{display:flex;gap:10px}
.table-tools-actions button{border:none;background:transparent;color:#2563eb;font-size:12px;font-weight:700}
.table-tools-option{display:flex;align-items:center;gap:10px;padding:9px 6px;font-size:14px;color:#0f172a;border-radius:10px}
.table-tools-option:hover{background:#f8fafc}
.table-wrapper,.table-responsive,.managed-table-scroll{width:100% !important;max-height:min(62vh,640px) !important;overflow:auto !important;position:relative !important;padding-bottom:4px;overscroll-behavior:contain;scrollbar-gutter:stable}
table.managed-table{width:100% !important;border-collapse:separate !important;border-spacing:0 !important;background:#fff !important;border:1px solid #e2e8f0 !important;border-radius:18px !important;overflow:visible !important}
table.managed-table thead{position:sticky !important;top:0 !important;z-index:12 !important}
table.managed-table thead th{position:sticky !important;top:0 !important;background:linear-gradient(180deg,#1d4ed8 0%,#2563eb 52%,#3b82f6 100%) !important;background-clip:padding-box;color:#fff !important;font-size:12px !important;font-weight:800 !important;text-transform:uppercase !important;letter-spacing:.04em !important;padding:15px 16px !important;border-bottom:1px solid rgba(191,219,254,.45) !important;white-space:nowrap !important;z-index:12 !important;box-shadow:inset 0 1px 0 rgba(255,255,255,.16),inset 0 -1px 0 rgba(15,23,42,.12) !important}
.table-wrapper:has(> .table-tools) > table.managed-table thead,.table-responsive:has(> .table-tools) > table.managed-table thead,.managed-table-scroll:has(> .table-tools) > table.managed-table thead{top:58px !important}
.table-wrapper:has(> .table-tools) > table.managed-table thead th,.table-responsive:has(> .table-tools) > table.managed-table thead th,.managed-table-scroll:has(> .table-tools) > table.managed-table thead th{top:58px !important}
table.managed-table thead th:first-child{border-top-left-radius:18px !important}
table.managed-table thead th:last-child{border-top-right-radius:18px !important}
table.managed-table thead th::after{content:"";position:absolute;left:12px;right:12px;bottom:0;height:1px;background:rgba(255,255,255,.24)}
table.managed-table thead th:not(:last-child){border-right:1px solid rgba(191,219,254,.5) !important}
table.managed-table tbody td{padding:14px 16px !important;border-bottom:1px solid #eef2f7 !important;border-right:1px solid #e2e8f0 !important;vertical-align:middle !important;color:#334155 !important;background:#fff !important}
table.managed-table tbody td:last-child{border-right:none !important}
table.managed-table tbody tr:nth-child(even) td{background:#fcfdff !important}
table.managed-table tbody tr:hover td{background:#f8fbff !important}
table.managed-table tbody tr:last-child td{border-bottom:none !important}
table.managed-table td .sub-label,
table.managed-table td .muted-line,
table.managed-table td .small,
table.managed-table td small{display:block !important;color:#64748b !important;font-size:12px !important;line-height:1.45 !important;margin-top:4px !important}
table.managed-table td strong{color:#0f172a !important}
table.managed-table .badge{font-weight:700 !important}
table.managed-table td.text-center,table.managed-table th.text-center{text-align:center !important}
table.managed-table td.text-right,table.managed-table th.text-right{text-align:right !important}
table.managed-table td .chip-wrap{display:flex !important;flex-wrap:wrap !important;gap:6px !important}
body.table-zoom-open{overflow:hidden !important}
.table-zoom-backdrop{position:fixed;inset:0;z-index:4100;display:flex;align-items:center;justify-content:center;padding:24px;background:linear-gradient(180deg,rgba(15,23,42,.64),rgba(15,23,42,.48));backdrop-filter:blur(6px)}
.table-zoom-modal{width:min(1540px,98vw);max-height:94vh;display:flex;flex-direction:column;overflow:hidden;border:1px solid rgba(226,232,240,.92);border-radius:20px;background:#f8fafc;box-shadow:0 28px 80px rgba(15,23,42,.34)}
.table-zoom-header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 22px;border-bottom:1px solid #e2e8f0;background:linear-gradient(135deg,#0f2f61 0%,#1d4f99 58%,#d8ad52 140%);color:#fff}
.table-zoom-title{display:flex;align-items:center;min-width:0;gap:13px}
.table-zoom-icon{width:42px;height:42px;display:grid;place-items:center;flex-shrink:0;border:1px solid rgba(255,255,255,.22);border-radius:14px;background:rgba(255,255,255,.13);color:#f8d27a;font-size:18px}
.table-zoom-title strong{display:block;color:#fff;font-size:19px;font-weight:850;line-height:1.2}
.table-zoom-title small{display:block;margin-top:3px;color:rgba(255,255,255,.78);font-size:13px}
.table-zoom-close{width:36px;height:36px;display:grid;place-items:center;flex-shrink:0;border:1px solid rgba(255,255,255,.24);border-radius:12px;background:rgba(255,255,255,.12);color:#fff;font-size:15px;cursor:pointer}
.table-zoom-close:hover{background:rgba(255,255,255,.2);color:#fff}
.table-zoom-body{margin:18px 20px 20px;max-height:calc(94vh - 116px);overflow:auto;border:1px solid #e2e8f0;border-radius:16px;background:#fff}
.table-zoom-body table.table-zoom-clone{min-width:100% !important;table-layout:fixed !important;border-radius:0 !important;border:none !important}
.table-zoom-body table.table-zoom-clone col{width:auto !important;min-width:auto !important}
.table-zoom-body table.table-zoom-clone thead,.table-zoom-body table.table-zoom-clone thead th{position:sticky !important;top:0 !important;z-index:5 !important}
.table-zoom-body table.table-zoom-clone th,.table-zoom-body table.table-zoom-clone td{min-width:96px;max-width:340px;white-space:normal !important;overflow:visible !important;overflow-wrap:anywhere !important;word-break:break-word !important;line-height:1.45 !important;text-overflow:clip !important}
.table-zoom-body table.table-zoom-clone th *,.table-zoom-body table.table-zoom-clone td *{max-width:100% !important;white-space:normal !important;overflow-wrap:anywhere !important;word-break:break-word !important;text-overflow:clip !important}
.table-zoom-body table.table-zoom-clone .badge{display:inline-flex !important;align-items:center !important;justify-content:center !important;white-space:normal !important;line-height:1.25 !important;text-align:center !important}
.table-zoom-body table.table-zoom-clone .row-actions{display:flex !important;flex-wrap:wrap !important;justify-content:center !important;max-width:none !important;gap:6px !important}
.table-zoom-body table.table-zoom-clone .action-btn{min-width:0 !important;white-space:normal !important;line-height:1.2 !important;padding:7px 9px !important}
.table-zoom-body table.table-zoom-clone th:first-child,.table-zoom-body table.table-zoom-clone td:first-child{min-width:64px;max-width:96px;text-align:center !important}
.table-zoom-body table.table-zoom-clone th.text-right,.table-zoom-body table.table-zoom-clone td.text-right,.table-zoom-body table.table-zoom-clone th.text-end,.table-zoom-body table.table-zoom-clone td.text-end{white-space:nowrap !important}
</style>


