<template>
  <BaseLayout>
    <div class="page-shell">
      <div class="page-header">
        <div class="gov-banner">
          <div class="gov-emblem">
            <i class="bi bi-card-checklist"></i>
          </div>
          <div>
            <div class="gov-title">DANH SÁCH CHỈ TIÊU ĐƯỢC GIAO</div>
            <div class="gov-sub">
              {{ canViewAllAssignments
                ? 'Tra cứu toàn bộ danh sách giao chỉ tiêu trong hệ thống.'
                : `Tra cứu các chỉ tiêu đã giao cho ${currentUnitName}.` }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="!canViewAllAssignments && !currentDonViId" class="alert alert-warning border-0 shadow-sm">
        Tài khoản hiện tại chưa được gắn đơn vị, không thể lọc danh sách chỉ tiêu được giao.
      </div>

      <div v-else class="card shadow-sm border-0 mb-3">
        <div class="card-body">
          <div class="filter-grid">
            <div>
              <label class="form-label">Từ khóa</label>
              <input
                v-model.trim="filters.keyword"
                type="text"
                class="form-control"
                placeholder="Đợt giao, danh mục chỉ tiêu, chỉ tiêu giao, ghi chú..." />
            </div>
            <div>
              <label class="form-label">Đợt giao chỉ tiêu</label>
              <select v-model.number="filters.dotGiaoChiTieuId" class="form-select">
                <option :value="null">Tất cả</option>
                <option v-for="dot in dotOptions" :key="dot.id" :value="dot.id">
                  {{ dot.tenDotGiao }}
                </option>
              </select>
            </div>
            <div>
              <label class="form-label">Đơn vị nhận</label>
              <select
                v-model.number="filters.donViNhanId"
                class="form-select"
                :disabled="!canViewAllAssignments">
                <option :value="null">{{ canViewAllAssignments ? 'Tất cả' : currentUnitName }}</option>
                <option v-for="donVi in donViOptions" :key="donVi.id" :value="donVi.id">
                  {{ donVi.tenDonVi }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner-border text-primary"></div>
        <span>Đang tải danh sách chỉ tiêu được giao...</span>
      </div>

      <div v-else-if="filteredItems.length" class="card shadow-sm border-0">
        <div class="card-body p-0">
          <ColumnVisibilityTools table-id="DanhSachChiTieuDuocGiaoPage-table" />
          <table id="DanhSachChiTieuDuocGiaoPage-table" class="table table-hover align-middle mb-0 managed-table assignment-table">
            <colgroup>
              <col class="col-dot-giao" />
              <col class="col-don-vi" />
              <col class="col-danh-muc" />
              <col class="col-chi-tieu-giao" />
              <col class="col-ky-bao-cao" />
              <col class="col-muc-tieu" />
              <col class="col-dau-ky" />
              <col class="col-ghi-chu" />
              <col class="col-thao-tac" />
            </colgroup>
            <thead>
              <tr>
                <th>Đợt giao</th>
                <th>Đơn vị nhận</th>
                <th>Danh mục chỉ tiêu</th>
                <th>Chỉ tiêu giao</th>
                <th>Kỳ báo cáo</th>
                <th>Mục tiêu giao</th>
                <th>Đầu kỳ cố định</th>
                <th>Ghi chú</th>
                <th class="text-center" style="width: 140px">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredItems" :key="item.id">
                <td>
                  <div class="fw-semibold">{{ item.tenDotGiaoChiTieu || '-' }}</div>
                  <div class="muted-line">{{ item.maDotGiaoChiTieu || 'Chưa có mã đợt' }}</div>
                </td>
                <td>
                  <div class="fw-semibold">{{ item.tenDonViNhan || currentUnitName }}</div>
                  <div class="muted-line">{{ item.tenDonViThucHienChinh || 'Chưa gán đơn vị thực hiện chính' }}</div>
                </td>
                <td>
                  <div v-if="item.tieuChiCon.length" class="table-stack">
                    <div v-for="child in item.tieuChiCon" :key="`${child.id}-danh-muc`" class="table-stack-line">
                      <div class="fw-semibold text-primary">{{ child.tenDanhMucChiTieu || '-' }}</div>
                    </div>
                  </div>
                  <div v-else class="fw-semibold text-primary">{{ item.tenDanhMucChiTieu || '-' }}</div>
                </td>
                <td>
                  <div v-if="item.tieuChiCon.length" class="table-stack">
                    <div v-for="child in item.tieuChiCon" :key="`${child.id}-chi-tieu-giao`" class="table-stack-line">
                      <div>{{ child.giaTriMucTieuText || '-' }}</div>
                    </div>
                  </div>
                  <div v-else>{{ item.giaTriMucTieuText || '-' }}</div>
                </td>
                <td>{{ getKyBaoCaoLabel(item.tanSuatBaoCao) }}</td>
                <td>
                  <div v-if="item.tieuChiCon.length" class="table-stack">
                    <div v-for="child in item.tieuChiCon" :key="`${child.id}-target`" class="table-stack-line">
                      <div>{{ formatAssignmentTarget(child) }}</div>
                    </div>
                  </div>
                  <div v-else>{{ formatAssignmentTarget(item) }}</div>
                </td>
                <td>
                  <div v-if="item.tieuChiCon.length" class="table-stack">
                    <div v-for="child in item.tieuChiCon" :key="`${child.id}-baseline`" class="table-stack-line">
                      <div>{{ formatAssignmentBaseline(child) }}</div>
                    </div>
                  </div>
                  <div v-else>{{ formatAssignmentBaseline(item) }}</div>
                </td>
                <td>{{ item.ghiChu || '-' }}</td>
                <td class="text-center">
                  <div v-if="canViewAllAssignments" class="d-flex justify-content-center gap-2">
                    <button class="btn btn-sm btn-outline-primary" @click="openAssignmentEditor(item)">
                      <i class="bi bi-pencil-square me-1"></i>Sửa
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="handleDelete(item)">
                      <i class="bi bi-trash me-1"></i>Xóa
                    </button>
                  </div>
                  <span v-else class="text-muted">Chỉ xem</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="alert alert-light border shadow-sm">
        Không có chỉ tiêu được giao phù hợp với bộ lọc hiện tại.
      </div>
    </div>
  </BaseLayout>
</template>

<script setup>
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import BaseLayout from '../BaseLayout.vue'
  import ColumnVisibilityTools from '../shared/ColumnVisibilityTools.vue'
  import httpClient from '../../services/httpClient'
  import {
    getStoredUserProfile,
    isCatpProfile,
    isPrivilegedProfile
  } from '../../utils/accessControl'
  import {
    isDinhTinhCriterion,
    isDinhLuongSoSanhCriterion,
    isTyLeComparisonKind
  } from '../../utils/danhGiaStatusClean'

  const loading = ref(false)
  const items = ref([])
  const dotOptions = ref([])
  const donViOptions = ref([])
  const currentProfile = ref(getStoredUserProfile())
  const router = useRouter()

  const filters = reactive({
    keyword: '',
    dotGiaoChiTieuId: null,
    donViNhanId: null
  })

  const normalizeText = (value) =>
    String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase()

  const canViewAllAssignments = computed(() =>
    isPrivilegedProfile(currentProfile.value) || isCatpProfile(currentProfile.value)
  )

  const currentDonViId = computed(() => Number(currentProfile.value?.donViId || 0))
  const currentUnitName = computed(() => currentProfile.value?.donVi || 'Đơn vị hiện tại')

  const normalizeList = (response) => {
    if (Array.isArray(response)) return response
    if (Array.isArray(response?.data)) return response.data
    if (Array.isArray(response?.data?.data)) return response.data.data
    if (Array.isArray(response?.items)) return response.items
    return []
  }

  const pick = (item, ...keys) => {
    for (const key of keys) {
      if (item?.[key] !== undefined && item?.[key] !== null) return item[key]
    }
    return null
  }

  const normalizeDot = (item) => ({
    id: Number(pick(item, 'id', 'Id') || 0),
    tenDotGiao: String(pick(item, 'tenDotGiao', 'TenDotGiao', 'tenDotGiaoChiTieu', 'TenDotGiaoChiTieu') || ''),
    maDotGiao: String(pick(item, 'maDotGiao', 'MaDotGiao', 'maDotGiaoChiTieu', 'MaDotGiaoChiTieu') || '')
  })

  const normalizeDonVi = (item) => ({
    id: Number(pick(item, 'id', 'Id') || 0),
    tenDonVi: String(pick(item, 'tenDonVi', 'TenDonVi') || ''),
    maDonVi: String(pick(item, 'maDonVi', 'MaDonVi') || ''),
    loaiDonVi: String(pick(item, 'loaiDonVi', 'LoaiDonVi') || '')
  })

  const normalizeAssignmentChild = (item) => ({
    id: Number(pick(item, 'id', 'Id') || 0),
    tenDanhMucChiTieu: String(pick(item, 'tenDanhMucChiTieu', 'TenDanhMucChiTieu') || ''),
    tieuChiDanhGia: String(pick(item, 'tieuChiDanhGia', 'TieuChiDanhGia', 'loaiChiTieu', 'LoaiChiTieu') || ''),
    kieuSoSanh: String(pick(item, 'kieuSoSanh', 'KieuSoSanh') || ''),
    donViTinh: String(pick(item, 'donViTinh', 'DonViTinh') || ''),
    giaTriMucTieu: pick(item, 'giaTriMucTieu', 'GiaTriMucTieu'),
    giaTriMucTieuText: String(pick(item, 'giaTriMucTieuText', 'GiaTriMucTieuText') || ''),
    giaTriDauKyCoDinh: pick(item, 'giaTriDauKyCoDinh', 'GiaTriDauKyCoDinh')
  })

  const normalizeAssignment = (item) => ({
    id: Number(pick(item, 'id', 'Id') || 0),
    dotGiaoChiTieuId: Number(pick(item, 'dotGiaoChiTieuId', 'DotGiaoChiTieuId') || 0),
    maDotGiaoChiTieu: String(pick(item, 'maDotGiaoChiTieu', 'MaDotGiaoChiTieu') || ''),
    tenDotGiaoChiTieu: String(pick(item, 'tenDotGiaoChiTieu', 'TenDotGiaoChiTieu') || ''),
    tenDanhMucChiTieu: String(pick(item, 'tenDanhMucChiTieu', 'TenDanhMucChiTieu') || ''),
    tieuChiDanhGia: String(pick(item, 'tieuChiDanhGia', 'TieuChiDanhGia', 'loaiChiTieu', 'LoaiChiTieu') || ''),
    kieuSoSanh: String(pick(item, 'kieuSoSanh', 'KieuSoSanh') || ''),
    donViTinh: String(pick(item, 'donViTinh', 'DonViTinh') || ''),
    tanSuatBaoCao: String(pick(item, 'tanSuatBaoCao', 'TanSuatBaoCao') || ''),
    donViNhanId: Number(pick(item, 'donViNhanId', 'DonViNhanId') || 0),
    tenDonViNhan: String(pick(item, 'tenDonViNhan', 'TenDonViNhan') || ''),
    tenDonViThucHienChinh: String(pick(item, 'tenDonViThucHienChinh', 'TenDonViThucHienChinh') || ''),
    giaTriMucTieu: pick(item, 'giaTriMucTieu', 'GiaTriMucTieu'),
    giaTriMucTieuText: String(pick(item, 'giaTriMucTieuText', 'GiaTriMucTieuText') || ''),
    giaTriDauKyCoDinh: pick(item, 'giaTriDauKyCoDinh', 'GiaTriDauKyCoDinh'),
    ghiChu: String(pick(item, 'ghiChu', 'GhiChu') || ''),
    tieuChiCon: normalizeList(pick(item, 'tieuChiCon', 'TieuChiCon')).map(normalizeAssignmentChild)
  })

  const getEffectiveCriterion = (item) => String(item?.tieuChiDanhGia || '').trim().toUpperCase()
  const getEffectiveComparisonKind = (item) => String(item?.kieuSoSanh || '').trim().toUpperCase()

  const tanSuatBaoCaoOptions = [
    { value: 'THANG', label: 'Tháng' },
    { value: 'QUY', label: 'Quý' },
    { value: '6THANG', label: '6 tháng' },
    { value: 'NAM', label: 'Năm' }
  ]

  const getKyBaoCaoLabel = (value) =>
    tanSuatBaoCaoOptions.find(item => item.value === String(value || '').trim().toUpperCase())?.label || value || '-'

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '-'
    const numberValue = Number(value)
    if (Number.isNaN(numberValue)) return String(value)
    return numberValue.toLocaleString('vi-VN')
  }

  const formatAssignmentTarget = (item) => {
    const criterion = getEffectiveCriterion(item)
    if (isDinhTinhCriterion(criterion)) {
      return item.giaTriMucTieuText || 'Chưa nhập mô tả mục tiêu'
    }

    if (item.giaTriMucTieu === null || item.giaTriMucTieu === undefined || item.giaTriMucTieu === '') {
      return 'Chưa nhập giá trị mục tiêu'
    }

    if (isDinhLuongSoSanhCriterion(criterion) || isTyLeComparisonKind(getEffectiveComparisonKind(item))) {
      return `${formatNumber(item.giaTriMucTieu)}%`
    }

    return `${formatNumber(item.giaTriMucTieu)}${item.donViTinh ? ` ${item.donViTinh}` : ''}`
  }

  const formatAssignmentBaseline = (item) => {
    if (isDinhTinhCriterion(getEffectiveCriterion(item))) return '-'
    const value = item?.giaTriDauKyCoDinh
    if (value === null || value === undefined || value === '') return 'Chưa nhập'
    return `${formatNumber(value)}${item?.donViTinh ? ` ${item.donViTinh}` : ''}`
  }

  const getDonViById = (donViId) => donViOptions.value.find((item) => item.id === Number(donViId)) || null

  const getAssignmentScopeKey = (item) => {
    const donVi = getDonViById(item?.donViNhanId)
    const normalizedLoai = normalizeText(donVi?.loaiDonVi)
    const normalizedTen = normalizeText(donVi?.tenDonVi || item?.tenDonViNhan)
    const normalizedMa = normalizeText(donVi?.maDonVi)

    if (
      normalizedLoai.includes('CATP') ||
      normalizedMa === 'CATP' ||
      normalizedTen.includes('CONG AN THANH PHO')
    ) {
      return 'CATP'
    }

    if (
      normalizedLoai.includes('PHONG') ||
      normalizedTen.includes('PHONG ')
    ) {
      return 'PHONG'
    }

    return 'CADP_PHUONG_XA'
  }

  const assignmentScopePathMap = {
    CATP: '/giao-cho-catp',
    PHONG: '/giao-cho-phong',
    CADP_PHUONG_XA: '/giao-cho-cadp-phuong-xa'
  }

  const openAssignmentEditor = (item) => {
    const scopeKey = getAssignmentScopeKey(item)
    const path = assignmentScopePathMap[scopeKey] || assignmentScopePathMap.CADP_PHUONG_XA
    router.push({
      path,
      query: {
        editId: item.id
      }
    })
  }

  const handleDelete = async (item) => {
    const ok = window.confirm(`Bạn có chắc muốn xóa giao chỉ tiêu "${item.tenDanhMucChiTieu}" của đơn vị "${item.tenDonViNhan}" không?`)
    if (!ok) return

    try {
      await httpClient.delete(`/ChiTietGiaoChiTieu/${item.id}`)
      await fetchData()
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || error.message || 'Xóa giao chỉ tiêu thất bại.')
    }
  }

  const filteredItems = computed(() => {
    const keyword = normalizeText(filters.keyword)

    return [...items.value]
      .filter(item => {
        const matchKeyword = !keyword || [
          item.maDotGiaoChiTieu,
          item.tenDotGiaoChiTieu,
          item.tenDanhMucChiTieu,
          item.giaTriMucTieuText,
          item.tenDonViNhan,
          item.ghiChu
        ].some(value => normalizeText(value).includes(keyword))

        const matchDot = !filters.dotGiaoChiTieuId || item.dotGiaoChiTieuId === Number(filters.dotGiaoChiTieuId)
        const matchDonVi = !filters.donViNhanId || item.donViNhanId === Number(filters.donViNhanId)

        return matchKeyword && matchDot && matchDonVi
      })
      .sort((left, right) => {
        const dotCompare = `${left.maDotGiaoChiTieu} ${left.tenDotGiaoChiTieu}`.localeCompare(
          `${right.maDotGiaoChiTieu} ${right.tenDotGiaoChiTieu}`,
          'vi'
        )
        if (dotCompare !== 0) return dotCompare
        return `${left.tenDonViNhan} ${left.tenDanhMucChiTieu}`.localeCompare(
          `${right.tenDonViNhan} ${right.tenDanhMucChiTieu}`,
          'vi'
        )
      })
  })

  const fetchData = async () => {
    if (!canViewAllAssignments.value && !currentDonViId.value) {
      items.value = []
      return
    }

    loading.value = true
    try {
      const assignmentsPromise = canViewAllAssignments.value
        ? httpClient.get('/ChiTietGiaoChiTieu')
        : httpClient.get(`/ChiTietGiaoChiTieu/by-donvi-nhan/${currentDonViId.value}`)

      const [assignmentsRes, dotsRes, donViRes] = await Promise.all([
        assignmentsPromise,
        httpClient.get('/dot-giao-chi-tieu'),
        httpClient.get('/DonVi')
      ])

      items.value = normalizeList(assignmentsRes.data).map(normalizeAssignment)
      dotOptions.value = normalizeList(dotsRes.data).map(normalizeDot)
      donViOptions.value = normalizeList(donViRes.data).map(normalizeDonVi)

      if (!canViewAllAssignments.value && currentDonViId.value) {
        filters.donViNhanId = currentDonViId.value
      }
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || error.message || 'Không tải được danh sách chỉ tiêu được giao.')
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchData)
</script>

<style scoped>
  .page-shell {
    padding: 20px;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 18px;
  }

  .gov-banner {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px;
    border-radius: 20px;
    background: linear-gradient(135deg, #ffffff 0%, #f4f9ff 100%);
    box-shadow: 0 10px 30px rgba(13, 110, 253, 0.08);
    border: 1px solid rgba(13, 110, 253, 0.08);
  }

  .gov-emblem {
    width: 64px;
    height: 64px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0d6efd, #4ea1ff);
    color: #fff;
    font-size: 28px;
    box-shadow: 0 10px 24px rgba(13, 110, 253, 0.24);
  }

  .gov-title {
    font-size: 1.3rem;
    font-weight: 800;
    color: #1f2d3d;
    margin-bottom: 4px;
  }

  .gov-sub {
    font-size: 0.95rem;
    color: #4f6b88;
  }

  .filter-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 14px;
  }

  .loading-state {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #475569;
    padding: 18px 0;
  }

  .table td,
  .table th {
    padding: 16px;
    border-color: #eef2f7;
  }

  .muted-line {
    display: block;
    font-size: 12px;
    color: #64748b;
    margin-top: 3px;
  }

  .table-stack {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .table-stack-line {
    padding-bottom: 8px;
    border-bottom: 1px dashed #dbe3ef;
  }

  .table-stack-line:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }

  :deep(.assignment-table) {
    min-width: 1520px;
  }

  :deep(.assignment-table .col-dot-giao) {
    width: 180px;
  }

  :deep(.assignment-table .col-don-vi) {
    width: 220px;
  }

  :deep(.assignment-table .col-danh-muc) {
    width: 230px;
  }

  :deep(.assignment-table .col-chi-tieu-giao) {
    width: 220px;
  }

  :deep(.assignment-table .col-ky-bao-cao) {
    width: 130px;
  }

  :deep(.assignment-table .col-muc-tieu) {
    width: 170px;
  }

  :deep(.assignment-table .col-dau-ky) {
    width: 170px;
  }

  :deep(.assignment-table .col-ghi-chu) {
    width: 220px;
  }

  :deep(.assignment-table .col-thao-tac) {
    width: 180px;
  }

  @media (max-width: 992px) {
    .filter-grid {
      grid-template-columns: 1fr;
    }

    .table {
      min-width: 1200px;
    }
  }
</style>
