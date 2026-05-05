import { computed, reactive, ref } from 'vue'
import { apiRequest } from '../services/api.js'
import { getStoredUserProfile, isCatpProfile, isPrivilegedProfile } from '../utils/accessControl'

export const TARGET_EXECUTION_UNIT = 'Công an thành phố Đà Nẵng'

export function useCatpKpiData() {
  const loading = ref(false)
  const errorMessage = ref('')
  const chiTietRows = ref([])
  const danhGiaRows = ref([])
  const theoDoiRows = ref([])
  const kyBaoCaoOptions = ref([])
  const currentProfile = ref(getStoredUserProfile())

  const filters = reactive({
    kyBaoCaoKPIId: '',
    donVi: '',
    xepLoai: '',
    keyword: ''
  })

  const allAssignments = computed(() => flattenAssignments(chiTietRows.value))
  const assignmentIds = computed(() => new Set(allAssignments.value.map(item => item.id)))
  const childAssignmentsByParentId = computed(() => groupRowsById(
    allAssignments.value.filter(item => item.parentId),
    item => item.parentId
  ))
  const canViewAllUnits = computed(() =>
    isPrivilegedProfile(currentProfile.value) || isCatpProfile(currentProfile.value)
  )
  const currentUnitName = computed(() => String(currentProfile.value?.donVi || '').trim())

  const targetAssignments = computed(() => {
    if (!canViewAllUnits.value && currentUnitName.value) {
      return allAssignments.value.filter(item =>
        normalizeText(item.tenDonViNhan) === normalizeText(currentUnitName.value)
      )
    }

    return allAssignments.value.filter(item =>
      normalizeText(item.tenDonViThucHienChinh) === normalizeText(TARGET_EXECUTION_UNIT)
    )
  })

  const evaluationMap = computed(() => {
    const map = new Map()

    for (const item of danhGiaRows.value) {
      const key = Number(item.chiTietGiaoChiTieuId || item.ChiTietGiaoChiTieuId || 0)
      if (!key) continue

      if (!map.has(key)) {
        map.set(key, [])
      }

      map.get(key).push(item)
    }

    return map
  })

  const trackingMap = computed(() => groupRowsById(
    normalizedTheoDoiRows.value,
    item => item.chiTietGiaoChiTieuId
  ))

  const reportRows = computed(() => {
    return targetAssignments.value.map(item =>
      buildReportRow(item, evaluationMap.value, trackingMap.value, filters.kyBaoCaoKPIId)
    )
  })

  const hierarchicalReportRows = computed(() => {
    return targetAssignments.value
      .filter(item => !item.parentId || !assignmentIds.value.has(item.parentId))
      .map(item => {
        const row = buildReportRow(item, evaluationMap.value, trackingMap.value, filters.kyBaoCaoKPIId)
        row.children = collectDescendantAssignments(item.id, childAssignmentsByParentId.value)
          .map(({ assignment, level }) => ({
            ...buildReportRow(assignment, evaluationMap.value, trackingMap.value, filters.kyBaoCaoKPIId),
            treeLevel: level,
            parentId: item.id
          }))
        return row
      })
  })

  const donViOptions = computed(() => {
    return [...new Set(reportRows.value.map(item => item.tenDonViNhan).filter(Boolean))]
      .sort((left, right) => left.localeCompare(right, 'vi'))
  })

  const kyBaoCaoById = computed(() => {
    return kyBaoCaoOptions.value.reduce((map, item) => {
      const id = Number(item?.id ?? item?.Id ?? 0)
      if (id > 0) map.set(id, item)
      return map
    }, new Map())
  })

  const normalizedTheoDoiRows = computed(() => {
    return theoDoiRows.value
      .map(item => {
        const kyBaoCaoKPIId = Number(pick(item, 'kyBaoCaoKPIId', 'KyBaoCaoKPIId') || 0)
        const kyBaoCao = kyBaoCaoById.value.get(kyBaoCaoKPIId) || null

        return {
          chiTietGiaoChiTieuId: Number(pick(item, 'chiTietGiaoChiTieuId', 'ChiTietGiaoChiTieuId') || 0),
          kyBaoCaoKPIId,
          kySort: extractKySortInfo({ ...kyBaoCao, ...item }),
          maKy: pick(item, 'maKy', 'MaKy') || pick(kyBaoCao, 'maKy', 'MaKy') || '',
          tenKy: pick(item, 'tenKy', 'TenKy') || pick(kyBaoCao, 'tenKy', 'TenKy') || '',
          loaiKy: pick(item, 'loaiKy', 'LoaiKy') || pick(kyBaoCao, 'loaiKy', 'LoaiKy') || '',
          giaTriDauKy: getNumberOrNull(pick(item, 'giaTriDauKy', 'GiaTriDauKy')),
          giaTriCuoiKy: getNumberOrNull(pick(item, 'giaTriCuoiKy', 'GiaTriCuoiKy')),
          giaTriLuyKe: getNumberOrNull(pick(item, 'giaTriLuyKe', 'GiaTriLuyKe')),
          giaTriPhatSinhLuyKe: getNumberOrNull(pick(item, 'giaTriPhatSinhLuyKe', 'GiaTriPhatSinhLuyKe')),
          donViTinh: pick(item, 'donViTinh', 'DonViTinh') || '',
          nhanXet: String(pick(item, 'nhanXet', 'NhanXet') || '').trim(),
          ngayCapNhat: pick(item, 'ngayCapNhat', 'NgayCapNhat', 'updatedAt', 'UpdatedAt', 'createdAt', 'CreatedAt') || ''
        }
      })
      .filter(item => item.chiTietGiaoChiTieuId > 0)
  })

  async function fetchData() {
    loading.value = true
    errorMessage.value = ''

    try {
      const [chiTietData, danhGiaData, kyData, theoDoiData] = await Promise.all([
        apiRequest('/ChiTietGiaoChiTieu'),
        apiRequest('/DanhGiaKPI'),
        apiRequest('/KyBaoCaoKPI'),
        apiRequest('/TheoDoiThucHienKPI').catch(error => {
          console.warn('Không thể tải dữ liệu theo dõi KPI cho báo cáo CATP.', error)
          return []
        })
      ])

      chiTietRows.value = normalizeList(chiTietData)
      danhGiaRows.value = normalizeList(danhGiaData)
      kyBaoCaoOptions.value = sortKyBaoCaoOptions(normalizeList(kyData))
      theoDoiRows.value = normalizeList(theoDoiData)
    } catch (error) {
      console.error(error)
      errorMessage.value = error.message || 'Không thể tải dữ liệu chỉ tiêu Công an thành phố.'
      chiTietRows.value = []
      danhGiaRows.value = []
      kyBaoCaoOptions.value = []
      theoDoiRows.value = []
    } finally {
      loading.value = false
    }
  }

  function resetFilters() {
    filters.kyBaoCaoKPIId = ''
    filters.donVi = canViewAllUnits.value ? '' : currentUnitName.value
    filters.xepLoai = ''
    filters.keyword = ''
    return fetchData()
  }

  return {
    donViOptions,
    errorMessage,
    fetchData,
    filters,
    kyBaoCaoOptions,
    hierarchicalReportRows,
    loading,
    reportRows,
    resetFilters
  }
}

export function buildKyLabel(item) {
  const maKy = item?.maKy || item?.MaKy || ''
  const tenKy = item?.tenKy || item?.TenKy || ''
  return [maKy, tenKy].filter(Boolean).join(' - ') || tenKy || maKy || '-'
}

export function formatTarget(row) {
  if (row?.giaTriMucTieu !== null && row?.giaTriMucTieu !== undefined && row?.giaTriMucTieu !== '') {
    const formatted = Number(row.giaTriMucTieu).toLocaleString('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })
    if (normalizeText(row?.tieuChiDanhGia).toUpperCase() === 'DINH_LUONG_SO_SANH') {
      return `${formatted}%`
    }
    const unit = String(row?.donViTinh || '').trim()
    return unit ? `${formatted} ${unit}` : formatted
  }

  return row?.giaTriMucTieuText || '-'
}

export function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}

function flattenAssignments(items, parent = null) {
  const flattened = []

  for (const item of items) {
    const children = Array.isArray(item.tieuChiCon || item.TieuChiCon)
      ? (item.tieuChiCon || item.TieuChiCon)
      : []

    const current = {
      id: Number(item.id || item.Id || 0),
      parentId: Number(item.chiTietGiaoChaId || item.ChiTietGiaoChaId || parent?.id || 0) || null,
      coTieuChiCon: children.length > 0,
      thuTuHienThi: Number(item.thuTuHienThi || item.ThuTuHienThi || 0),
      dotGiaoChiTieuId: Number(item.dotGiaoChiTieuId || item.DotGiaoChiTieuId || parent?.dotGiaoChiTieuId || 0),
      maDotGiao: item.maDotGiaoChiTieu || item.MaDotGiaoChiTieu || item.maDotGiao || item.MaDotGiao || parent?.maDotGiao || '',
      maChiTieu: item.maChiTieu || item.MaChiTieu || item.maDanhMucChiTieu || item.MaDanhMucChiTieu || '',
      tenDanhMucChiTieu: item.tenDanhMucChiTieu || item.TenDanhMucChiTieu || item.tenChiTieu || item.TenChiTieu || '',
      tenChiTieu: item.tenChiTieu || item.TenChiTieu || item.tenDanhMucChiTieu || item.TenDanhMucChiTieu || '',
      donViTinh: item.donViTinh || item.DonViTinh || parent?.donViTinh || '',
      tenChiTieuCha: parent?.tenChiTieu || item.tenChiTieuCha || item.TenChiTieuCha || '',
      tenDotGiaoChiTieu: item.tenDotGiaoChiTieu || item.TenDotGiaoChiTieu || item.tenDotGiao || item.TenDotGiao || parent?.tenDotGiaoChiTieu || '',
      tenDonViNhan: item.tenDonViNhan || item.TenDonViNhan || parent?.tenDonViNhan || '',
      tenDonViThucHienChinh: item.tenDonViThucHienChinh || item.TenDonViThucHienChinh || parent?.tenDonViThucHienChinh || '',
      tanSuatBaoCao: item.tanSuatBaoCao || item.TanSuatBaoCao || parent?.tanSuatBaoCao || '',
      tieuChiDanhGia: item.tieuChiDanhGia || item.TieuChiDanhGia || item.loaiChiTieu || item.LoaiChiTieu || '',
      giaTriMucTieu: getNumberOrNull(item.giaTriMucTieu ?? item.GiaTriMucTieu),
      giaTriDauKyCoDinh: getNumberOrNull(item.giaTriDauKyCoDinh ?? item.GiaTriDauKyCoDinh ?? item.giaTriDauKy ?? item.GiaTriDauKy),
      giaTriMucTieuText: item.giaTriMucTieuText || item.GiaTriMucTieuText || ''
    }

    flattened.push(current)

    if (children.length) {
      flattened.push(...flattenAssignments(children, current))
    }
  }

  return flattened
}

function buildReportRow(item, evaluationMap, trackingMap, selectedKyBaoCaoKPIId) {
  const evaluations = evaluationMap.get(item.id) || []
  const trackingItems = trackingMap.get(item.id) || []
  const selectedEvaluation = resolveEvaluationForAssignment(evaluations, selectedKyBaoCaoKPIId)
  const selectedTracking = resolveTrackingForAssignment(trackingItems, selectedKyBaoCaoKPIId)
  const submittedTrackingItems = resolveSubmittedTrackingItems(trackingItems, selectedTracking, selectedKyBaoCaoKPIId)
  const giaTriMucTieu = getNumberOrNull(selectedEvaluation?.giaTriMucTieu ?? selectedEvaluation?.GiaTriMucTieu) ?? item.giaTriMucTieu
  const giaTriDauKy =
    selectedTracking?.giaTriDauKy ??
    getNumberOrNull(selectedEvaluation?.giaTriDauKy ?? selectedEvaluation?.GiaTriDauKy) ??
    item.giaTriDauKyCoDinh
  const giaTriCuoiKy =
    selectedTracking?.giaTriCuoiKy ??
    getNumberOrNull(selectedEvaluation?.giaTriCuoiKy ?? selectedEvaluation?.GiaTriCuoiKy)
  const giaTriLuyKe = getNumberOrNull(
    selectedTracking?.giaTriLuyKe ??
    selectedTracking?.giaTriCuoiKy ??
    selectedEvaluation?.giaTriLuyKe ??
    selectedEvaluation?.GiaTriLuyKe ??
    selectedEvaluation?.giaTriCuoiKy ??
    selectedEvaluation?.GiaTriCuoiKy
  )
  const tyLeHoanThanh =
    getNumberOrNull(selectedEvaluation?.tyLeHoanThanh ?? selectedEvaluation?.TyLeHoanThanh) ??
    calculateSimpleProgress(giaTriMucTieu, giaTriLuyKe, item)
  const soDuMucTieu =
    getNumberOrNull(selectedEvaluation?.soDuMucTieu ?? selectedEvaluation?.SoDuMucTieu) ??
    calculateRemainingTarget(giaTriMucTieu, giaTriLuyKe)
  const soLieuTrungBinhThang = calculateMonthlyAverage(
    giaTriLuyKe,
    submittedTrackingItems.length,
    item.tanSuatBaoCao || selectedTracking?.loaiKy
  )

  return {
    id: item.id,
    chiTietGiaoChiTieuId: item.id,
    parentId: item.parentId,
    dotGiaoChiTieuId: item.dotGiaoChiTieuId,
    maDotGiao: item.maDotGiao,
    tenDotGiaoChiTieu: item.tenDotGiaoChiTieu,
    maChiTieu: item.maChiTieu,
    tenDanhMucChiTieu: item.tenDanhMucChiTieu || item.tenChiTieu,
    tenChiTieu: item.tenChiTieu,
    tenChiTieuCha: item.tenChiTieuCha,
    tenChiTieuGiao: item.giaTriMucTieuText || item.tenChiTieuCha || '',
    donViTinh: item.donViTinh || '',
    donViTinhLuyKe: selectedTracking?.donViTinh || item.donViTinh || '',
    tenDonViNhan: item.tenDonViNhan,
    tenDonViThucHienChinh: item.tenDonViThucHienChinh,
    tanSuatBaoCao: item.tanSuatBaoCao,
    tieuChiDanhGia: item.tieuChiDanhGia,
    giaTriMucTieu,
    giaTriDauKy,
    giaTriCuoiKy,
    giaTriLuyKe,
    soLieuTrungBinhThang,
    soDuMucTieu,
    soKyDaTongHop: submittedTrackingItems.length,
    giaTriMucTieuText: item.giaTriMucTieuText,
    kyBaoCaoKPIId: Number(selectedEvaluation?.kyBaoCaoKPIId || selectedEvaluation?.KyBaoCaoKPIId || selectedTracking?.kyBaoCaoKPIId || 0),
    maKy: selectedEvaluation?.maKy || selectedEvaluation?.MaKy || selectedTracking?.maKy || '',
    tenKy: selectedEvaluation?.tenKy || selectedEvaluation?.TenKy || selectedTracking?.tenKy || '',
    loaiKy: selectedEvaluation?.loaiKy || selectedEvaluation?.LoaiKy || selectedTracking?.loaiKy || '',
    xepLoai: selectedEvaluation?.xepLoai || selectedEvaluation?.XepLoai || 'CHUA_DANH_GIA',
    ketQua: selectedEvaluation?.ketQua || selectedEvaluation?.KetQua || '',
    nguoiDanhGia: selectedEvaluation?.nguoiDanhGia || selectedEvaluation?.NguoiDanhGia || '',
    nhanXetDanhGia: selectedEvaluation?.nhanXetDanhGia || selectedEvaluation?.NhanXetDanhGia || selectedTracking?.nhanXet || '',
    tyLeHoanThanh,
    chenhLechSoVoiDauKy: getNumberOrNull(selectedEvaluation?.chenhLechSoVoiDauKy ?? selectedEvaluation?.ChenhLechSoVoiDauKy),
    tyLeTangTruongSoVoiDauKy: getNumberOrNull(selectedEvaluation?.tyLeTangTruongSoVoiDauKy ?? selectedEvaluation?.TyLeTangTruongSoVoiDauKy),
    chenhLechSoVoiCungKyNamTruoc: getNumberOrNull(selectedEvaluation?.chenhLechSoVoiCungKyNamTruoc ?? selectedEvaluation?.ChenhLechSoVoiCungKyNamTruoc),
    tyLeTangTruongSoVoiCungKyNamTruoc: getNumberOrNull(selectedEvaluation?.tyLeTangTruongSoVoiCungKyNamTruoc ?? selectedEvaluation?.TyLeTangTruongSoVoiCungKyNamTruoc)
  }
}

function collectDescendantAssignments(parentId, childMap, level = 1) {
  const children = [...(childMap.get(parentId) || [])].sort((left, right) => {
    const orderDiff = Number(left.thuTuHienThi || 0) - Number(right.thuTuHienThi || 0)
    if (orderDiff !== 0) return orderDiff

    const leftValue = `${left.maChiTieu || ''} ${left.tenChiTieu || ''}`.toLowerCase()
    const rightValue = `${right.maChiTieu || ''} ${right.tenChiTieu || ''}`.toLowerCase()
    return leftValue.localeCompare(rightValue, 'vi')
  })

  return children.flatMap(child => [
    { assignment: child, level },
    ...collectDescendantAssignments(child.id, childMap, level + 1)
  ])
}

function groupRowsById(items, getKey) {
  return items.reduce((map, item) => {
    const key = Number(getKey(item) || 0)
    if (!key) return map
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(item)
    return map
  }, new Map())
}

function normalizeList(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.data)) return response.data.data
  if (Array.isArray(response?.data?.items)) return response.data.items
  if (Array.isArray(response?.items)) return response.items
  return []
}

function resolveEvaluationForAssignment(evaluations, selectedKyBaoCaoKPIId) {
  if (!Array.isArray(evaluations) || evaluations.length === 0) return null

  if (selectedKyBaoCaoKPIId) {
    return evaluations.find(item =>
      String(item.kyBaoCaoKPIId || item.KyBaoCaoKPIId || '') === String(selectedKyBaoCaoKPIId)
    ) || null
  }

  return [...evaluations].sort(compareEvaluationOrder).at(-1) || null
}

function resolveTrackingForAssignment(items, selectedKyBaoCaoKPIId) {
  if (!Array.isArray(items) || items.length === 0) return null

  if (selectedKyBaoCaoKPIId) {
    return items.find(item => String(item.kyBaoCaoKPIId || '') === String(selectedKyBaoCaoKPIId)) || null
  }

  return [...items].sort((left, right) => {
    const kyDiff = compareKySort(left.kySort, right.kySort)
    if (kyDiff !== 0) return kyDiff

    const leftDate = parseDate(left.ngayCapNhat)
    const rightDate = parseDate(right.ngayCapNhat)
    return (leftDate?.getTime() || 0) - (rightDate?.getTime() || 0)
  }).at(-1) || null
}

function resolveSubmittedTrackingItems(items, selectedTracking, selectedKyBaoCaoKPIId) {
  if (!Array.isArray(items) || items.length === 0) return []

  if (selectedKyBaoCaoKPIId) {
    const selectedSort = selectedTracking?.kySort
    if (!selectedSort) return selectedTracking ? [selectedTracking] : []
    return items.filter(item => compareKySort(item.kySort, selectedSort) <= 0)
  }

  return items
}

function compareEvaluationOrder(left, right) {
  const leftKy = extractKySortInfo(left)
  const rightKy = extractKySortInfo(right)

  if (leftKy.nam !== rightKy.nam) return leftKy.nam - rightKy.nam
  if (leftKy.loaiKyOrder !== rightKy.loaiKyOrder) return leftKy.loaiKyOrder - rightKy.loaiKyOrder
  if (leftKy.soKy !== rightKy.soKy) return leftKy.soKy - rightKy.soKy

  const leftDate = parseDate(left.ngayDanhGia || left.NgayDanhGia || left.updatedAt || left.UpdatedAt || left.createdAt || left.CreatedAt)
  const rightDate = parseDate(right.ngayDanhGia || right.NgayDanhGia || right.updatedAt || right.UpdatedAt || right.createdAt || right.CreatedAt)

  return (leftDate?.getTime() || 0) - (rightDate?.getTime() || 0)
}

function extractKySortInfo(item) {
  return {
    nam: Number(item?.nam || item?.Nam || 0),
    loaiKyOrder: getLoaiKyOrder(item?.loaiKy || item?.LoaiKy || ''),
    soKy: Number(item?.soKy || item?.SoKy || 0)
  }
}

function getLoaiKyOrder(loaiKy) {
  switch (normalizeText(loaiKy).toUpperCase()) {
    case 'THANG':
      return 1
    case 'QUY':
      return 2
    case '6THANG':
      return 3
    case 'NAM':
      return 4
    default:
      return 99
  }
}

function compareKySort(left, right) {
  const leftValue = left || { nam: 0, loaiKyOrder: 99, soKy: 0 }
  const rightValue = right || { nam: 0, loaiKyOrder: 99, soKy: 0 }
  if (leftValue.nam !== rightValue.nam) return leftValue.nam - rightValue.nam
  if (leftValue.loaiKyOrder !== rightValue.loaiKyOrder) return leftValue.loaiKyOrder - rightValue.loaiKyOrder
  return leftValue.soKy - rightValue.soKy
}

function sortKyBaoCaoOptions(items) {
  return [...items].sort((left, right) => compareEvaluationOrder(left, right))
}

function parseDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function getNumberOrNull(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function calculateSimpleProgress(target, actual, assignment) {
  if (normalizeText(assignment?.tieuChiDanhGia).toUpperCase() === 'DINH_LUONG_SO_SANH') return null
  const targetValue = getNumberOrNull(target)
  const actualValue = getNumberOrNull(actual)
  if (targetValue === null || targetValue <= 0 || actualValue === null) return null
  return Math.round((actualValue / targetValue) * 10000) / 100
}

function calculateMonthlyAverage(value, submittedPeriods, tanSuatBaoCao) {
  const luyKe = getNumberOrNull(value)
  const soKy = Number(submittedPeriods || 0)
  const soThang = soKy * getMonthsPerReportPeriod(tanSuatBaoCao)
  if (luyKe === null || soThang <= 0) return null
  return Math.round((luyKe / soThang) * 100) / 100
}

function getMonthsPerReportPeriod(tanSuatBaoCao) {
  const code = normalizeText(tanSuatBaoCao).toUpperCase()
  if (code.includes('QUY')) return 3
  if (code.includes('6') || code.includes('SAU_THANG')) return 6
  if (code.includes('NAM')) return 12
  return 1
}

function calculateRemainingTarget(target, actual) {
  const targetValue = getNumberOrNull(target)
  const actualValue = getNumberOrNull(actual)
  if (targetValue === null || actualValue === null) return null
  return Math.round((targetValue - actualValue) * 100) / 100
}

function pick(source, ...keys) {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) return source[key]
  }
  return undefined
}
