<template>
    <BaseLayout>
        <div class="page-wrap">
            <div class="container-fluid py-4">
                <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
                    <div>
                        <h1 class="page-title mb-1">Báo cáo KPI theo kỳ</h1>
                        <p class="page-subtitle mb-0">
                            Chỉ hiển thị các chỉ tiêu đã giao cho đơn vị và cần báo cáo trong kỳ
                        </p>
                    </div>

                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-secondary" @click="fetchItems">
                            <i class="bi bi-arrow-repeat me-2"></i>
                            Tải lại
                        </button>
                    </div>
                </div>

                <div class="row g-3 mb-4">
                    <div class="col-12 col-md-6 col-xl-3">
                        <div class="card summary-card h-100">
                            <div class="card-body">
                                <div class="summary-label">Tổng chỉ tiêu cần báo cáo</div>
                                <div class="summary-value">{{ dashboard.total }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 col-md-6 col-xl-3">
                        <div class="card summary-card h-100">
                            <div class="card-body">
                                <div class="summary-label">Đã cập nhật</div>
                                <div class="summary-value text-success">{{ dashboard.updated }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 col-md-6 col-xl-3">
                        <div class="card summary-card h-100">
                            <div class="card-body">
                                <div class="summary-label">Chưa cập nhật</div>
                                <div class="summary-value text-secondary">{{ dashboard.notUpdated }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 col-md-6 col-xl-3">
                        <div class="card summary-card h-100 risk-card">
                            <div class="card-body">
                                <div class="summary-label">Rủi ro/Cần chú ý</div>
                                <div class="summary-value text-danger">{{ dashboard.risk }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card custom-card mb-4">
                    <div class="card-header bg-white border-0 pb-0">
                        <h5 class="mb-1">Bộ lọc</h5>
                        <small class="text-muted">Lọc theo kỳ báo cáo, đợt giao, đơn vị, trạng thái cập nhật và mức rủi
                            ro</small>
                    </div>

                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-12 col-md-6 col-xl-3">
                                <label class="form-label">Kỳ báo cáo</label>
                                <select v-model.number="filters.kyBaoCaoKPIId" class="form-select">
                                    <option :value="null">Tất cả</option>
                                    <option v-for="item in kyBaoCaoOptions" :key="getId(item)" :value="getId(item)">
                                        {{ item.TenKy || item.tenKy || item.TenKyBaoCao || item.tenKyBaoCao || '-' }}
                                    </option>
                                </select>
                            </div>

                            <div class="col-12 col-md-6 col-xl-3">
                                <label class="form-label">Đợt giao chỉ tiêu</label>
                                <select v-model.number="filters.dotGiaoChiTieuId" class="form-select">
                                    <option :value="null">Tất cả</option>
                                    <option v-for="item in dotOptions" :key="getId(item)" :value="getId(item)">
                                        {{ item.TenDotGiao || item.tenDotGiao || '-' }}
                                    </option>
                                </select>
                            </div>

                            <div class="col-12 col-md-6 col-xl-3">
                                <label class="form-label">Đơn vị</label>
                                <select v-model.number="filters.donViId" class="form-select">
                                    <option :value="null">Tất cả</option>
                                    <option v-for="item in donViFilterOptions" :key="getId(item)" :value="getId(item)">
                                        {{ item.TenDonVi || item.tenDonVi || '-' }}
                                    </option>
                                </select>
                            </div>

                            <div class="col-12 col-md-6 col-xl-3">
                                <label class="form-label">Trạng thái cập nhật</label>
                                <select v-model="filters.capNhatStatus" class="form-select">
                                    <option value="">Tất cả</option>
                                    <option value="DA_CAP_NHAT">Đã cập nhật</option>
                                    <option value="CHUA_CAP_NHAT">Chưa cập nhật</option>
                                </select>
                            </div>

                            <div class="col-12 col-md-6 col-xl-3">
                                <label class="form-label">Cảnh báo rủi ro</label>
                                <select v-model="filters.riskLevel" class="form-select">
                                    <option value="">Tất cả</option>
                                    <option value="BINH_THUONG">Bình thường</option>
                                    <option value="CAN_CHU_Y">Cần chú ý</option>
                                    <option value="RUI_RO_CAO">Rủi ro cao</option>
                                </select>
                            </div>

                            <div class="col-12 col-md-6 col-xl-9">
                                <label class="form-label">Từ khóa</label>
                                <input v-model="filters.keyword" type="text" class="form-control"
                                    placeholder="Mã chỉ tiêu, tên chỉ tiêu, đơn vị, nhận xét..." />
                            </div>
                        </div>

                        <div class="d-flex flex-wrap gap-2 mt-4">
                            <button class="btn btn-primary" @click="fetchItems">
                                <i class="bi bi-search me-1"></i>
                                Lọc dữ liệu
                            </button>
                            <button class="btn btn-outline-secondary" @click="resetFilters">
                                <i class="bi bi-arrow-clockwise me-1"></i>
                                Đặt lại
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card custom-card">
                    <div class="card-header bg-white d-flex justify-content-between align-items-center border-0">
                        <div>
                            <h5 class="mb-1">Danh sách chỉ tiêu cần báo cáo</h5>
                            <small class="text-muted">Chỉ tiêu nào được giao thì mới xuất hiện trong màn này</small>
                        </div>
                        <span class="badge text-bg-light border">Tổng: {{ filteredRows.length }}</span>
                    </div>

                    <div class="card-body p-0">
                        <div v-if="loading" class="empty-state">
                            <div class="spinner-border text-primary mb-3" role="status"></div>
                            <div>Đang tải dữ liệu...</div>
                        </div>

                        <div v-else-if="!filteredRows.length" class="empty-state">
                            <i class="bi bi-inbox fs-1 text-muted mb-2"></i>
                            <div>Không có chỉ tiêu cần báo cáo</div>
                        </div>

                        <div v-else class="table-responsive">
                            <table class="table table-hover align-middle mb-0 custom-table">
                                <thead>
                                    <tr>
                                        <th>Chỉ tiêu</th>
                                        <th>Đơn vị</th>
                                        <th>Kỳ báo cáo</th>
                                        <th>Mục tiêu</th>
                                        <th>Tiến độ</th>
                                        <th>Trạng thái cập nhật</th>
                                        <th>Rủi ro</th>
                                        <th class="text-center" style="width: 220px">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template v-for="row in filteredRows" :key="row.key">
                                        <tr>
                                            <td>
                                                <div class="fw-semibold text-primary">{{ row.tenChiTieu || '-' }}</div>
                                                <small class="text-muted">{{ row.maChiTieu || '-' }}</small>
                                            </td>
                                            <td>{{ row.tenDonVi || '-' }}</td>
                                            <td>
                                                <div class="fw-semibold">{{ row.tenKy || '-' }}</div>
                                                <small class="text-muted">{{ row.tenDotGiao || '-' }}</small>
                                            </td>
                                            <td>
                                                <div>{{ formatNumber(row.giaTriMucTieu) }}</div>
                                                <small class="text-muted" v-if="row.giaTriMucTieuText">
                                                    {{ row.giaTriMucTieuText }}
                                                </small>
                                            </td>
                                            <td>
                                                <div class="fw-semibold">{{ formatPercent(row.tyLeHoanThanh) }}</div>
                                                <div class="progress progress-sm mt-1">
                                                    <div class="progress-bar"
                                                        :style="{ width: `${Math.min(row.tyLeHoanThanh, 100)}%` }">
                                                    </div>
                                                </div>
                                                <small class="text-muted">Lũy kế: {{ formatNumber(row.giaTriLuyKe)
                                                    }}</small>
                                            </td>
                                            <td>
                                                <span class="badge rounded-pill"
                                                    :class="getCapNhatClass(row.capNhatStatus)">
                                                    {{ mapCapNhat(row.capNhatStatus) }}
                                                </span>
                                            </td>
                                            <td>
                                                <span class="badge rounded-pill" :class="getRiskClass(row.riskLevel)">
                                                    {{ mapRisk(row.riskLevel) }}
                                                </span>
                                            </td>
                                            <td class="text-center">
                                                <div class="d-flex justify-content-center flex-wrap gap-2">
                                                    <button v-if="row.capNhatStatus === 'CHUA_CAP_NHAT'"
                                                        class="btn btn-sm btn-primary" @click="openCreateModal(row)">
                                                        <i class="bi bi-plus-circle me-1"></i>Nhập báo cáo
                                                    </button>

                                                    <button v-else class="btn btn-sm btn-outline-primary"
                                                        @click="openEditModal(row)">
                                                        <i class="bi bi-pencil-square me-1"></i>Cập nhật
                                                    </button>

                                                    <button class="btn btn-sm btn-outline-secondary"
                                                        @click="toggleExpand(row.key)">
                                                        <i
                                                            :class="expandedKeys.has(row.key) ? 'bi bi-chevron-up me-1' : 'bi bi-chevron-down me-1'"></i>
                                                        Chi tiết
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        <tr v-show="expandedKeys.has(row.key)">
                                            <td colspan="8" class="bg-light-subtle">
                                                <div class="p-3">
                                                    <div class="row g-3 mb-3">
                                                        <div class="col-12 col-md-3">
                                                            <div class="detail-box">
                                                                <div class="detail-label">Đầu kỳ</div>
                                                                <div class="detail-value">{{
                                                                    formatNumber(row.giaTriDauKy) }}</div>
                                                            </div>
                                                        </div>
                                                        <div class="col-12 col-md-3">
                                                            <div class="detail-box">
                                                                <div class="detail-label">Trong kỳ</div>
                                                                <div class="detail-value">{{
                                                                    formatNumber(row.giaTriThucHienTrongKy) }}</div>
                                                            </div>
                                                        </div>
                                                        <div class="col-12 col-md-3">
                                                            <div class="detail-box">
                                                                <div class="detail-label">Cuối kỳ</div>
                                                                <div class="detail-value">{{
                                                                    formatNumber(row.giaTriCuoiKy) }}</div>
                                                            </div>
                                                        </div>
                                                        <div class="col-12 col-md-3">
                                                            <div class="detail-box">
                                                                <div class="detail-label">Lũy kế</div>
                                                                <div class="detail-value">{{
                                                                    formatNumber(row.giaTriLuyKe) }}</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div class="alert mb-0" :class="getRiskAlertClass(row.riskLevel)">
                                                        <strong>Đánh giá:</strong> {{ getRiskMessage(row) }}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div v-if="showModal" class="modal fade show d-block custom-modal" tabindex="-1"
                    @click.self="closeModal">
                    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div class="modal-content border-0 shadow-lg rounded-4">
                            <div class="modal-header border-0 pb-0">
                                <div>
                                    <h4 class="modal-title mb-1">
                                        {{ isEdit ? 'Cập nhật báo cáo KPI theo kỳ' : 'Nhập báo cáo KPI theo kỳ' }}
                                    </h4>
                                    <p class="text-muted mb-0">
                                        Chỉ tiêu nào đã được giao thì mới nhập báo cáo theo kỳ
                                    </p>
                                </div>
                                <button type="button" class="btn-close" @click="closeModal"></button>
                            </div>

                            <div class="modal-body pt-3">
                                <div class="row g-3">
                                    <div class="col-12">
                                        <div class="alert alert-info mb-0">
                                            <i class="bi bi-info-circle me-2"></i>
                                            Giá trị cuối kỳ chỉ hiển thị để kiểm tra. Backend sẽ tự tính và lưu dữ liệu
                                            cuối cùng.
                                        </div>
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Chỉ tiêu giao <span
                                                class="text-danger">*</span></label>
                                        <select v-model.number="form.chiTietGiaoChiTieuId" class="form-select"
                                            :disabled="lockContext">
                                            <option :value="null">Chọn chỉ tiêu giao</option>
                                            <option v-for="item in chiTietGiaoChiTieuOptions" :key="getId(item)"
                                                :value="getId(item)">
                                                {{ getChiTietDisplay(item) }}
                                            </option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Kỳ báo cáo KPI <span
                                                class="text-danger">*</span></label>
                                        <select v-model.number="form.kyBaoCaoKPIId" class="form-select"
                                            :disabled="lockContext">
                                            <option :value="null">Chọn kỳ báo cáo</option>
                                            <option v-for="item in kyBaoCaoOptions" :key="getId(item)"
                                                :value="getId(item)">
                                                {{ item.TenKy || item.tenKy || item.TenKyBaoCao || item.tenKyBaoCao ||
                                                '-' }}
                                            </option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-md-4">
                                        <label class="form-label">Giá trị đầu kỳ <span
                                                class="text-danger">*</span></label>
                                        <input v-model.number="form.giaTriDauKy" type="number" min="0" step="0.01"
                                            class="form-control" placeholder="Nhập giá trị đầu kỳ" />
                                    </div>

                                    <div class="col-12 col-md-4">
                                        <label class="form-label">Giá trị thực hiện trong kỳ <span
                                                class="text-danger">*</span></label>
                                        <input v-model.number="form.giaTriThucHienTrongKy" type="number" min="0"
                                            step="0.01" class="form-control"
                                            placeholder="Nhập giá trị thực hiện trong kỳ" />
                                    </div>

                                    <div class="col-12 col-md-4">
                                        <label class="form-label">Giá trị cuối kỳ</label>
                                        <input :value="formatEditableNumber(giaTriCuoiKyPreview)" type="text"
                                            class="form-control" readonly />
                                    </div>

                                    <div class="col-12">
                                        <label class="form-label">Nhận xét</label>
                                        <textarea v-model="form.nhanXet" rows="4" class="form-control"
                                            placeholder="Nhập nhận xét, giải trình..."></textarea>
                                    </div>
                                </div>
                            </div>

                            <div class="modal-footer border-0 pt-0">
                                <button class="btn btn-light" @click="closeModal">Hủy</button>
                                <button class="btn btn-primary" :disabled="saving" @click="handleSubmit">
                                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                                    {{ saving ? 'Đang lưu...' : isEdit ? 'Cập nhật báo cáo' : 'Lưu báo cáo' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="showModal" class="modal-backdrop fade show"></div>
            </div>
        </div>
    </BaseLayout>
</template>

<script setup>
    import { computed, onMounted, reactive, ref } from 'vue'
    import axios from 'axios'
    import BaseLayout from '../BaseLayout.vue'

    const api = axios.create({
        baseURL: 'https://localhost:5000/api'
    })

    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    })

    const API_PATHS = {
        theoDoiThucHienKPI: '/TheoDoiThucHienKPI',
        chiTietGiaoChiTieu: '/ChiTietGiaoChiTieu',
        kyBaoCaoKPI: '/KyBaoCaoKPI',
        dotGiaoChiTieu: '/dot-giao-chi-tieu',
        donVi: '/DonVi'
    }

    const loading = ref(false)
    const saving = ref(false)
    const showModal = ref(false)
    const isEdit = ref(false)
    const editingId = ref(null)
    const lockContext = ref(false)
    const expandedKeys = ref(new Set())

    const progressItems = ref([])
    const chiTietGiaoChiTieuOptions = ref([])
    const kyBaoCaoOptions = ref([])
    const dotOptions = ref([])
    const donViOptions = ref([])

    const filters = reactive({
        dotGiaoChiTieuId: null,
        chiTietGiaoChiTieuId: null,
        donViId: null,
        kyBaoCaoKPIId: null,
        capNhatStatus: '',
        riskLevel: '',
        keyword: ''
    })

    const createDefaultForm = () => ({
        chiTietGiaoChiTieuId: null,
        kyBaoCaoKPIId: null,
        giaTriDauKy: 0,
        giaTriThucHienTrongKy: 0,
        nhanXet: ''
    })

    const form = reactive(createDefaultForm())

    const getId = (item) => Number(item?.Id ?? item?.id ?? 0)

    const normalizeList = (response) => {
        if (Array.isArray(response?.data)) return response.data
        if (Array.isArray(response?.data?.data)) return response.data.data
        if (Array.isArray(response?.data?.items)) return response.data.items
        return []
    }

    const resetForm = () => {
        Object.assign(form, createDefaultForm())
    }

    const giaTriCuoiKyPreview = computed(() => {
        const dauKy = Number(form.giaTriDauKy ?? 0)
        const thucHien = Number(form.giaTriThucHienTrongKy ?? 0)
        return dauKy + thucHien
    })

    const getChiTietDisplay = (item) => {
        const ma = item?.MaChiTieu || item?.maChiTieu || ''
        const ten = item?.TenChiTieu || item?.tenChiTieu || ''
        const donVi = item?.TenDonViNhan || item?.tenDonViNhan || ''
        return [ma, ten, donVi].filter(Boolean).join(' - ') || '-'
    }

    const fetchItems = async () => {
        try {
            loading.value = true

            const [progressResponse, chiTietResponse, kyBaoCaoResponse, dotResponse, donViResponse] = await Promise.all([
                api.get(API_PATHS.theoDoiThucHienKPI),
                api.get(API_PATHS.chiTietGiaoChiTieu),
                api.get(API_PATHS.kyBaoCaoKPI),
                api.get(API_PATHS.dotGiaoChiTieu),
                api.get(API_PATHS.donVi)
            ])

            progressItems.value = normalizeList(progressResponse)
            chiTietGiaoChiTieuOptions.value = normalizeList(chiTietResponse)
            kyBaoCaoOptions.value = normalizeList(kyBaoCaoResponse)
            dotOptions.value = normalizeList(dotResponse)
            donViOptions.value = normalizeList(donViResponse)
        } catch (error) {
            console.error('fetchItems error:', error?.response?.status, error?.config?.url, error)
            alert(error?.response?.data?.message || 'Không tải được dữ liệu báo cáo KPI theo kỳ.')
        } finally {
            loading.value = false
        }
    }

    const donViFilterOptions = computed(() => {
        const donViIds = new Set(
            chiTietGiaoChiTieuOptions.value.map((x) => Number(x.DonViNhanId ?? x.donViNhanId ?? 0)).filter(Boolean)
        )

        return donViOptions.value.filter((x) => donViIds.has(getId(x)))
    })

    const rows = computed(() => {
        const reportedMap = new Map()

        for (const report of progressItems.value) {
            const chiTietId = Number(report.ChiTietGiaoChiTieuId ?? report.chiTietGiaoChiTieuId ?? 0)
            const kyId = Number(report.KyBaoCaoKPIId ?? report.kyBaoCaoKPIId ?? 0)
            reportedMap.set(`${chiTietId}_${kyId}`, report)
        }

        const result = []

        for (const chiTiet of chiTietGiaoChiTieuOptions.value) {
            const chiTietId = getId(chiTiet)
            const dotId = Number(chiTiet.DotGiaoChiTieuId ?? chiTiet.dotGiaoChiTieuId ?? 0)
            const donViId = Number(chiTiet.DonViNhanId ?? chiTiet.donViNhanId ?? 0)

            for (const ky of kyBaoCaoOptions.value) {
                const kyId = getId(ky)
                const report = reportedMap.get(`${chiTietId}_${kyId}`)

                const giaTriMucTieu = Number(chiTiet.GiaTriMucTieu ?? chiTiet.giaTriMucTieu ?? 0)
                const giaTriLuyKe = Number(report?.GiaTriLuyKe ?? report?.giaTriLuyKe ?? 0)
                const tyLeHoanThanh = giaTriMucTieu > 0 ? (giaTriLuyKe / giaTriMucTieu) * 100 : 0

                const capNhatStatus = report ? 'DA_CAP_NHAT' : 'CHUA_CAP_NHAT'
                const riskLevel = getRiskLevel({
                    capNhatStatus,
                    giaTriMucTieu,
                    giaTriLuyKe,
                    giaTriThucHienTrongKy: Number(report?.GiaTriThucHienTrongKy ?? report?.giaTriThucHienTrongKy ?? 0)
                })

                result.push({
                    key: `${chiTietId}_${kyId}`,
                    id: getId(report),
                    chiTietGiaoChiTieuId: chiTietId,
                    kyBaoCaoKPIId: kyId,
                    dotGiaoChiTieuId: dotId,
                    donViId,
                    maChiTieu: chiTiet.MaChiTieu || chiTiet.maChiTieu || '-',
                    tenChiTieu: chiTiet.TenChiTieu || chiTiet.tenChiTieu || '-',
                    tenDonVi: chiTiet.TenDonViNhan || chiTiet.tenDonViNhan || '-',
                    tenDotGiao:
                        dotOptions.value.find((x) => getId(x) === dotId)?.TenDotGiao ||
                        dotOptions.value.find((x) => getId(x) === dotId)?.tenDotGiao ||
                        '-',
                    tenKy: ky.TenKy || ky.tenKy || ky.TenKyBaoCao || ky.tenKyBaoCao || '-',
                    maKy: ky.MaKy || ky.maKy || '-',
                    giaTriMucTieu,
                    giaTriMucTieuText: chiTiet.GiaTriMucTieuText || chiTiet.giaTriMucTieuText || '',
                    giaTriDauKy: Number(report?.GiaTriDauKy ?? report?.giaTriDauKy ?? 0),
                    giaTriThucHienTrongKy: Number(report?.GiaTriThucHienTrongKy ?? report?.giaTriThucHienTrongKy ?? 0),
                    giaTriCuoiKy: Number(report?.GiaTriCuoiKy ?? report?.giaTriCuoiKy ?? 0),
                    giaTriLuyKe,
                    nhanXet: report?.NhanXet || report?.nhanXet || '',
                    capNhatStatus,
                    riskLevel
                })
            }
        }

        return result
    })

    const filteredRows = computed(() => {
        return rows.value.filter((row) => {
            const keyword = filters.keyword.trim().toLowerCase()
            const searchText = [
                row.maChiTieu,
                row.tenChiTieu,
                row.tenDonVi,
                row.tenDotGiao,
                row.tenKy,
                row.nhanXet
            ]
                .join(' ')
                .toLowerCase()

            const matchKeyword = !keyword || searchText.includes(keyword)
            const matchDot = !filters.dotGiaoChiTieuId || row.dotGiaoChiTieuId === Number(filters.dotGiaoChiTieuId)
            const matchChiTiet =
                !filters.chiTietGiaoChiTieuId || row.chiTietGiaoChiTieuId === Number(filters.chiTietGiaoChiTieuId)
            const matchDonVi = !filters.donViId || row.donViId === Number(filters.donViId)
            const matchKy = !filters.kyBaoCaoKPIId || row.kyBaoCaoKPIId === Number(filters.kyBaoCaoKPIId)
            const matchCapNhat = !filters.capNhatStatus || row.capNhatStatus === filters.capNhatStatus
            const matchRisk = !filters.riskLevel || row.riskLevel === filters.riskLevel

            return matchKeyword && matchDot && matchChiTiet && matchDonVi && matchKy && matchCapNhat && matchRisk
        })
    })

    const dashboard = computed(() => {
        let updated = 0
        let notUpdated = 0
        let risk = 0

        for (const row of filteredRows.value) {
            if (row.capNhatStatus === 'DA_CAP_NHAT') updated++
            else notUpdated++

            if (row.riskLevel !== 'BINH_THUONG') risk++
        }

        return {
            total: filteredRows.value.length,
            updated,
            notUpdated,
            risk
        }
    })

    const getRiskLevel = ({ capNhatStatus, giaTriMucTieu, giaTriLuyKe, giaTriThucHienTrongKy }) => {
        if (capNhatStatus === 'CHUA_CAP_NHAT') return 'RUI_RO_CAO'
        if (giaTriMucTieu > 0 && giaTriLuyKe / giaTriMucTieu < 0.5) return 'RUI_RO_CAO'
        if (giaTriThucHienTrongKy <= 0) return 'CAN_CHU_Y'
        return 'BINH_THUONG'
    }

    const mapCapNhat = (value) => (value === 'DA_CAP_NHAT' ? 'Đã cập nhật' : 'Chưa cập nhật')

    const getCapNhatClass = (value) => (value === 'DA_CAP_NHAT' ? 'text-bg-success' : 'text-bg-secondary')

    const mapRisk = (value) => {
        switch (value) {
            case 'RUI_RO_CAO':
                return 'Rủi ro cao'
            case 'CAN_CHU_Y':
                return 'Cần chú ý'
            default:
                return 'Bình thường'
        }
    }

    const getRiskClass = (value) => {
        switch (value) {
            case 'RUI_RO_CAO':
                return 'text-bg-danger'
            case 'CAN_CHU_Y':
                return 'text-bg-warning'
            default:
                return 'text-bg-success'
        }
    }

    const getRiskAlertClass = (value) => {
        switch (value) {
            case 'RUI_RO_CAO':
                return 'alert-danger'
            case 'CAN_CHU_Y':
                return 'alert-warning'
            default:
                return 'alert-success'
        }
    }

    const getRiskMessage = (row) => {
        if (row.capNhatStatus === 'CHUA_CAP_NHAT') {
            return 'Chỉ tiêu này đã được giao nhưng đơn vị chưa cập nhật báo cáo trong kỳ hiện tại.'
        }
        if (row.riskLevel === 'RUI_RO_CAO') {
            return 'Tiến độ đang thấp so với mục tiêu, cần ưu tiên theo dõi và đôn đốc.'
        }
        if (row.riskLevel === 'CAN_CHU_Y') {
            return 'Đã có báo cáo nhưng chưa phát sinh kết quả trong kỳ hoặc tiến độ còn chậm.'
        }
        return 'Tiến độ hiện tại đang trong ngưỡng chấp nhận được.'
    }

    const toggleExpand = (key) => {
        const next = new Set(expandedKeys.value)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        expandedKeys.value = next
    }

    const openCreateModal = (row) => {
        isEdit.value = false
        editingId.value = null
        lockContext.value = true
        resetForm()

        form.chiTietGiaoChiTieuId = row.chiTietGiaoChiTieuId
        form.kyBaoCaoKPIId = row.kyBaoCaoKPIId

        showModal.value = true
    }

    const openEditModal = (row) => {
        isEdit.value = true
        editingId.value = row.id
        lockContext.value = true

        Object.assign(form, {
            chiTietGiaoChiTieuId: row.chiTietGiaoChiTieuId,
            kyBaoCaoKPIId: row.kyBaoCaoKPIId,
            giaTriDauKy: row.giaTriDauKy,
            giaTriThucHienTrongKy: row.giaTriThucHienTrongKy,
            nhanXet: row.nhanXet || ''
        })

        showModal.value = true
    }

    const closeModal = () => {
        showModal.value = false
        lockContext.value = false
        resetForm()
    }

    const validateForm = () => {
        if (!form.chiTietGiaoChiTieuId || Number(form.chiTietGiaoChiTieuId) <= 0) {
            alert('Vui lòng chọn chỉ tiêu giao.')
            return false
        }

        if (!form.kyBaoCaoKPIId || Number(form.kyBaoCaoKPIId) <= 0) {
            alert('Vui lòng chọn kỳ báo cáo KPI.')
            return false
        }

        if (Number(form.giaTriDauKy) < 0) {
            alert('Giá trị đầu kỳ không hợp lệ.')
            return false
        }

        if (Number(form.giaTriThucHienTrongKy) < 0) {
            alert('Giá trị thực hiện trong kỳ không hợp lệ.')
            return false
        }

        return true
    }

    const buildPayload = () => ({
        chiTietGiaoChiTieuId: form.chiTietGiaoChiTieuId,
        kyBaoCaoKPIId: form.kyBaoCaoKPIId,
        giaTriDauKy: Number(form.giaTriDauKy ?? 0),
        giaTriThucHienTrongKy: Number(form.giaTriThucHienTrongKy ?? 0),
        nhanXet: form.nhanXet?.trim() || ''
    })

    const handleSubmit = async () => {
        if (!validateForm()) return

        try {
            saving.value = true
            const payload = buildPayload()

            if (isEdit.value && editingId.value) {
                await api.put(`${API_PATHS.theoDoiThucHienKPI}/${editingId.value}`, payload)
            } else {
                await api.post(API_PATHS.theoDoiThucHienKPI, payload)
            }

            closeModal()
            await fetchItems()
        } catch (error) {
            console.error('handleSubmit error:', error?.response?.status, error?.config?.url, error)
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.title ||
                JSON.stringify(error?.response?.data?.errors || {}, null, 2) ||
                'Lưu báo cáo KPI thất bại.'
            alert(message)
        } finally {
            saving.value = false
        }
    }

    const resetFilters = () => {
        filters.dotGiaoChiTieuId = null
        filters.chiTietGiaoChiTieuId = null
        filters.donViId = null
        filters.kyBaoCaoKPIId = null
        filters.capNhatStatus = ''
        filters.riskLevel = ''
        filters.keyword = ''
    }

    const formatNumber = (value) => {
        if (value === null || value === undefined || value === '') return '-'
        return Number(value).toLocaleString('vi-VN')
    }

    const formatPercent = (value) => {
        if (value === null || value === undefined || Number.isNaN(Number(value))) return '0%'
        return `${Number(value).toFixed(1)}%`
    }

    const formatEditableNumber = (value) => {
        if (value === null || value === undefined || Number.isNaN(Number(value))) return ''
        return String(value)
    }

    onMounted(async () => {
        await fetchItems()
    })
</script>

<style scoped>
    .summary-card,
    .detail-box {
        border: 1px solid #e9ecef;
        border-radius: 1rem;
        background: #fff;
    }

    .summary-card .card-body,
    .detail-box {
        padding: 1rem;
    }

    .summary-label,
    .detail-label {
        color: #6c757d;
        font-size: 0.9rem;
        margin-bottom: 0.35rem;
    }

    .summary-value,
    .detail-value {
        font-size: 1.6rem;
        font-weight: 700;
        line-height: 1.2;
    }

    .progress-sm {
        height: 0.5rem;
    }

    .empty-state {
        min-height: 220px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }

    .risk-card {
        border-color: #f5c2c7;
    }
</style>