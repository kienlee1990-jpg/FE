export const DANH_GIA_STATUS_OPTIONS = [
  { value: 'HOAN_THANH_VUOT_MUC', label: 'Hoàn thành vượt mức', shortLabel: 'Vượt mức', className: 'badge-excellent', rank: 4 },
  { value: 'HOAN_THANH', label: 'Hoàn thành', shortLabel: 'Hoàn thành', className: 'badge-good', rank: 3 },
  { value: 'CHUA_HOAN_THANH', label: 'Chưa hoàn thành', shortLabel: 'Chưa hoàn thành', className: 'badge-pass', rank: 2 },
  { value: 'KHONG_HOAN_THANH', label: 'Không hoàn thành', shortLabel: 'Không hoàn thành', className: 'badge-fail', rank: 1 },
  { value: 'CHUA_DANH_GIA', label: 'Chưa đánh giá', shortLabel: 'Chưa đánh giá', className: 'badge-pending', rank: 0 },
  { value: 'CHUA_CAU_HINH', label: 'Chưa cấu hình', shortLabel: 'Chưa cấu hình', className: 'badge-muted', rank: -1 }
]

export const DANH_GIA_TRACKED_STATUS_OPTIONS = DANH_GIA_STATUS_OPTIONS.filter(item =>
  item.value === 'HOAN_THANH_VUOT_MUC' ||
  item.value === 'HOAN_THANH' ||
  item.value === 'CHUA_HOAN_THANH' ||
  item.value === 'KHONG_HOAN_THANH'
)

export const DANH_GIA_TRACKED_STATUS_ORDER = DANH_GIA_TRACKED_STATUS_OPTIONS.map(item => item.value)

export const DIEU_KIEN_THOI_HAN_OPTIONS = [
  { value: 'MAC_DINH', label: 'Mặc định' },
  { value: 'CHUA_DEN_HAN', label: 'Chưa đến hạn' },
  { value: 'DA_DEN_HAN', label: 'Đã đến hạn' }
]

const STATUS_ALIASES = {
  HOAN_THANH_VUOT_MUC: 'HOAN_THANH_VUOT_MUC',
  VUOT_MUC: 'HOAN_THANH_VUOT_MUC',
  XUAT_SAC: 'HOAN_THANH_VUOT_MUC',
  HOAN_THANH: 'HOAN_THANH',
  TOT: 'HOAN_THANH',
  DAT: 'HOAN_THANH',
  CHUA_HOAN_THANH: 'CHUA_HOAN_THANH',
  KHONG_HOAN_THANH: 'KHONG_HOAN_THANH',
  KHONG_DAT: 'KHONG_HOAN_THANH',
  CHUA_DANH_GIA: 'CHUA_DANH_GIA',
  CHUA_CAU_HINH: 'CHUA_CAU_HINH'
}

const statusMetaByCode = Object.fromEntries(DANH_GIA_STATUS_OPTIONS.map(item => [item.value, item]))

export function normalizeDanhGiaText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
}

export function getDanhGiaStatusCode(value) {
  const normalized = normalizeDanhGiaText(value)
  return STATUS_ALIASES[normalized] || normalized || ''
}

export function getDanhGiaStatusMeta(value) {
  const code = getDanhGiaStatusCode(value)
  return statusMetaByCode[code] || {
    value: code || '',
    label: value || 'Chưa xác định',
    shortLabel: value || 'Chưa xác định',
    className: 'badge-default',
    rank: -99
  }
}

export function getDanhGiaLabel(value) {
  return getDanhGiaStatusMeta(value).label
}

export function getDanhGiaShortLabel(value) {
  return getDanhGiaStatusMeta(value).shortLabel
}

export function getDanhGiaBadgeClass(value) {
  return getDanhGiaStatusMeta(value).className
}

export function getDanhGiaRank(value) {
  return getDanhGiaStatusMeta(value).rank
}

export function isHoanThanhStatus(value) {
  const code = getDanhGiaStatusCode(value)
  return code === 'HOAN_THANH' || code === 'HOAN_THANH_VUOT_MUC'
}

export function isKhongHoanThanhStatus(value) {
  const code = getDanhGiaStatusCode(value)
  return code === 'CHUA_HOAN_THANH' || code === 'KHONG_HOAN_THANH'
}

export function createTrackedStatusCounter() {
  return {
    HOAN_THANH_VUOT_MUC: 0,
    HOAN_THANH: 0,
    CHUA_HOAN_THANH: 0,
    KHONG_HOAN_THANH: 0
  }
}

export function countTrackedStatuses(items, selector = item => item?.xepLoai) {
  const result = createTrackedStatusCounter()

  for (const item of items) {
    const code = getDanhGiaStatusCode(selector(item))
    if (Object.prototype.hasOwnProperty.call(result, code)) {
      result[code] += 1
    }
  }

  return result
}

export function getThoiHanLabel(value) {
  const normalized = normalizeDanhGiaText(value)
  return DIEU_KIEN_THOI_HAN_OPTIONS.find(item => item.value === normalized)?.label || value || 'Mặc định'
}
