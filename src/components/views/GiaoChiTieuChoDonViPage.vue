<template>
    <BaseLayout>
        <div class="page-wrap">
            <div class="container-fluid py-4">
                <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
                    <div>
                        <h1 class="page-title mb-1">Giao chỉ tiêu cho đơn vị</h1>
                        <p class="page-subtitle mb-0">
                            Quản lý giao chỉ tiêu cho các danh mục không cho phân rã
                        </p>
                    </div>

                    <button class="btn btn-primary btn-action" @click="openCreateModal">
                        <i class="bi bi-plus-circle me-2"></i>
                        Tạo giao chỉ tiêu
                    </button>
                </div>

                <div class="card custom-card mb-4">
                    <div class="card-header bg-white border-0 pb-0">
                        <h5 class="mb-1">Bộ lọc tìm kiếm</h5>
                        <small class="text-muted">Tra cứu nhanh theo nhiều tiêu chí</small>
                    </div>

                    <div class="card-body">
                        <div class="row g-3">
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
                                <label class="form-label">Danh mục chỉ tiêu</label>
                                <select v-model.number="filters.danhMucChiTieuId" class="form-select">
                                    <option :value="null">Tất cả</option>
                                    <option v-for="item in danhMucKhongPhanRaOptions" :key="getId(item)"
                                        :value="getId(item)">
                                        {{ item.MaChiTieu || item.maChiTieu || '' }} -
                                        {{ item.TenChiTieu || item.tenChiTieu || '' }}
                                    </option>
                                </select>
                            </div>

                            <div class="col-12 col-md-6 col-xl-3">
                                <label class="form-label">Đơn vị</label>
                                <select v-model.number="filters.donViId" class="form-select">
                                    <option :value="null">Tất cả</option>
                                    <option v-for="item in donViOptions" :key="getId(item)" :value="getId(item)">
                                        {{ item.TenDonVi || item.tenDonVi || '-' }}
                                    </option>
                                </select>
                            </div>

                            <div class="col-12 col-md-6 col-xl-3">
                                <label class="form-label">Tần suất báo cáo</label>
                                <select v-model="filters.tanSuatBaoCao" class="form-select">
                                    <option value="">Tất cả</option>
                                    <option v-for="item in tanSuatBaoCaoOptions" :key="item.value" :value="item.value">
                                        {{ item.label }}
                                    </option>
                                </select>
                            </div>

                            <div class="col-12">
                                <label class="form-label">Từ khóa</label>
                                <input v-model="filters.keyword" type="text" class="form-control"
                                    placeholder="Tên đợt, mã chỉ tiêu, tên chỉ tiêu, mã đơn vị, tên đơn vị, tần suất, ghi chú" />
                            </div>
                        </div>

                        <div class="d-flex flex-wrap gap-2 mt-4">
                            <button class="btn btn-primary" @click="fetchItems">
                                <i class="bi bi-arrow-repeat me-1"></i>
                                Tải lại dữ liệu
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
                            <h5 class="mb-1">Danh sách chỉ tiêu không phân rã</h5>
                            <small class="text-muted">
                                Chỉ hiển thị các danh mục chỉ tiêu không cho phân rã
                            </small>
                        </div>
                        <span class="badge text-bg-light border">Tổng: {{ filteredItems.length }}</span>
                    </div>

                    <div class="card-body p-0">
                        <div v-if="loading" class="empty-state">
                            <div class="spinner-border text-primary mb-3" role="status"></div>
                            <div>Đang tải dữ liệu...</div>
                        </div>

                        <div v-else-if="!filteredItems.length" class="empty-state">
                            <i class="bi bi-inbox fs-1 text-muted mb-2"></i>
                            <div>Chưa có dữ liệu</div>
                        </div>

                        <div v-else class="table-responsive">
                            <table class="table table-hover align-middle mb-0 custom-table">
                                <thead>
                                    <tr>
                                        <th>Đợt giao</th>
                                        <th>Chỉ tiêu</th>
                                        <th>Đơn vị</th>
                                        <th>Tần suất báo cáo</th>
                                        <th>Giá trị mục tiêu</th>
                                        <th>Ghi chú</th>
                                        <th class="text-center" style="width: 180px">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in filteredItems" :key="getId(item)">
                                        <td>
                                            <div class="fw-semibold">
                                                {{ item.TenDotGiao || item.tenDotGiao || '-' }}
                                            </div>
                                        </td>
                                        <td>
                                            <div class="fw-semibold text-primary">
                                                {{ item.TenChiTieu || item.tenChiTieu || '-' }}
                                            </div>
                                            <small class="text-muted">
                                                {{ item.MaChiTieu || item.maChiTieu || '-' }}
                                            </small>
                                        </td>
                                        <td>
                                            <div class="fw-semibold">
                                                {{ item.TenDonVi || item.tenDonVi || '-' }}
                                            </div>
                                            <small class="text-muted">
                                                {{ item.MaDonVi || item.maDonVi || '-' }}
                                            </small>
                                        </td>
                                        <td>
                                            <span class="badge text-bg-light border">
                                                {{ getTanSuatLabel(item.TanSuatBaoCao || item.tanSuatBaoCao) }}
                                            </span>
                                        </td>
                                        <td>
                                            <div>{{ formatNumber(item.GiaTriMucTieu ?? item.giaTriMucTieu) }}</div>
                                            <small
                                                v-if="(item.DieuKienHoanThanh ?? item.dieuKienHoanThanh) !== null && (item.DieuKienHoanThanh ?? item.dieuKienHoanThanh) !== undefined"
                                                class="text-muted">
                                                Mặc định:
                                                {{ formatNumber(item.DieuKienHoanThanh ?? item.dieuKienHoanThanh) }}
                                            </small>
                                        </td>
                                        <td>{{ item.GhiChu || item.ghiChu || '-' }}</td>
                                        <td class="text-center">
                                            <div class="d-flex justify-content-center gap-2">
                                                <button class="btn btn-sm btn-outline-primary"
                                                    @click="openEditModal(item)">
                                                    <i class="bi bi-pencil-square me-1"></i>Sửa
                                                </button>
                                                <button class="btn btn-sm btn-outline-danger"
                                                    @click="handleDelete(item)">
                                                    <i class="bi bi-trash me-1"></i>Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
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
                                        {{ isEdit ? 'Cập nhật giao chỉ tiêu' : 'Tạo giao chỉ tiêu mới' }}
                                    </h4>
                                    <p class="text-muted mb-0">
                                        Với danh mục không cho phân rã, chọn đợt giao, chỉ tiêu, đơn vị, tần suất báo
                                        cáo và giá trị mục tiêu
                                    </p>
                                </div>
                                <button type="button" class="btn-close" @click="closeModal"></button>
                            </div>

                            <div class="modal-body pt-3">
                                <div class="row g-3">
                                    <div class="col-12">
                                        <div class="alert alert-info mb-0">
                                            <i class="bi bi-info-circle me-2"></i>
                                            <strong>Tần suất báo cáo</strong> được chọn trực tiếp tại đây.
                                            <strong>Giá trị mục tiêu</strong> mặc định lấy từ
                                            <strong>DanhMucChiTieu.DieuKienHoanThanh</strong>, nhưng vẫn có thể chỉnh
                                            sửa tay trước khi lưu.
                                        </div>
                                    </div>

                                    <div class="col-12 col-md-3">
                                        <label class="form-label">
                                            Đợt giao chỉ tiêu <span class="text-danger">*</span>
                                        </label>
                                        <select v-model.number="form.dotGiaoChiTieuId" class="form-select">
                                            <option :value="null">Chọn đợt giao</option>
                                            <option v-for="item in dotOptions" :key="getId(item)" :value="getId(item)">
                                                {{ item.TenDotGiao || item.tenDotGiao || '-' }}
                                            </option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-md-3">
                                        <label class="form-label">
                                            Danh mục chỉ tiêu <span class="text-danger">*</span>
                                        </label>
                                        <select v-model.number="form.danhMucChiTieuId" class="form-select">
                                            <option :value="null">Chọn chỉ tiêu</option>
                                            <option v-for="item in danhMucKhongPhanRaOptions" :key="getId(item)"
                                                :value="getId(item)">
                                                {{ item.MaChiTieu || item.maChiTieu || '' }} -
                                                {{ item.TenChiTieu || item.tenChiTieu || '' }}
                                            </option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-md-3">
                                        <label class="form-label">
                                            Đơn vị <span class="text-danger">*</span>
                                        </label>
                                        <select v-model.number="form.donViId" class="form-select">
                                            <option :value="null">Chọn đơn vị</option>
                                            <option v-for="item in donViOptions" :key="getId(item)"
                                                :value="getId(item)">
                                                {{ item.TenDonVi || item.tenDonVi || '-' }}
                                            </option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-md-3">
                                        <label class="form-label">
                                            Tần suất báo cáo <span class="text-danger">*</span>
                                        </label>
                                        <select v-model="form.tanSuatBaoCao" class="form-select">
                                            <option value="">Chọn tần suất</option>
                                            <option v-for="item in tanSuatBaoCaoOptions" :key="item.value"
                                                :value="item.value">
                                                {{ item.label }}
                                            </option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">
                                            Giá trị mục tiêu <span class="text-danger">*</span>
                                        </label>
                                        <input v-model="form.giaTriMucTieu" type="number" step="any"
                                            class="form-control" placeholder="Nhập giá trị mục tiêu" />
                                        <small class="text-muted">
                                            Mặc định lấy từ ĐiềuKienHoanThanh của danh mục chỉ tiêu đã chọn
                                        </small>
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Giá trị mặc định từ ĐiềuKienHoanThanh</label>
                                        <input :value="displayGiaTriMacDinh" type="text" class="form-control"
                                            readonly />
                                    </div>

                                    <div class="col-12">
                                        <label class="form-label">Ghi chú</label>
                                        <textarea v-model="form.ghiChu" rows="4" class="form-control"
                                            placeholder="Nhập ghi chú nếu có"></textarea>
                                    </div>
                                </div>
                            </div>

                            <div class="modal-footer border-0 pt-0">
                                <button class="btn btn-light" @click="closeModal">Hủy</button>
                                <button class="btn btn-primary" :disabled="saving" @click="handleSubmit">
                                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                                    {{ saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Lưu giao chỉ tiêu' }}
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
    import { computed, onMounted, reactive, ref, watch } from 'vue'
    import BaseLayout from '../BaseLayout.vue'
    import { apiRequest } from '../../services/api.js'

    const API_PATHS = {
        chiTietGiaoChiTieu: '/ChiTietGiaoChiTieu',
        dotGiaoChiTieu: '/dot-giao-chi-tieu',
        danhMucChiTieu: '/danh-muc-chi-tieu',
        donVi: '/DonVi'
    }

    const loading = ref(false)
    const saving = ref(false)
    const showModal = ref(false)
    const isEdit = ref(false)
    const editingId = ref(null)

    const items = ref([])
    const dotOptions = ref([])
    const danhMucOptions = ref([])
    const donViOptions = ref([])

    const tanSuatBaoCaoOptions = [
        { value: 'NGAY', label: 'Ngày' },
        { value: 'TUAN', label: 'Tuần' },
        { value: 'THANG', label: 'Tháng' },
        { value: 'QUY', label: 'Quý' },
        { value: '6_THANG', label: '6 tháng' },
        { value: 'NAM', label: 'Năm' }
    ]

    const filters = reactive({
        dotGiaoChiTieuId: null,
        danhMucChiTieuId: null,
        donViId: null,
        tanSuatBaoCao: '',
        keyword: ''
    })

    const createDefaultForm = () => ({
        dotGiaoChiTieuId: null,
        danhMucChiTieuId: null,
        donViId: null,
        tanSuatBaoCao: '',
        giaTriMucTieu: null,
        ghiChu: ''
    })

    const form = reactive(createDefaultForm())

    const resetForm = () => {
        Object.assign(form, createDefaultForm())
    }

    const getId = (item) => Number(item?.Id ?? item?.id ?? 0)

    const normalizeList = (response) => {
        if (Array.isArray(response)) return response
        if (Array.isArray(response?.data)) return response.data
        if (Array.isArray(response?.data?.data)) return response.data.data
        if (Array.isArray(response?.data?.items)) return response.data.items
        if (Array.isArray(response?.items)) return response.items
        return []
    }

    const getTanSuatLabel = (value) => {
        const found = tanSuatBaoCaoOptions.find((x) => x.value === value)
        return found?.label || value || '-'
    }

    const findDanhMucById = (id) => {
        return danhMucOptions.value.find((x) => getId(x) === Number(id)) || null
    }

    const getGiaTriMacDinhTuDanhMuc = (item) => {
        return item?.DieuKienHoanThanh ?? item?.dieuKienHoanThanh ?? null
    }

    const danhMucKhongPhanRaOptions = computed(() => {
        return danhMucOptions.value.filter(
            (item) => Number(item.CoChoPhepPhanRa ?? item.coChoPhepPhanRa ?? 0) === 0
        )
    })

    const danhMucKhongPhanRaIds = computed(() => {
        return new Set(danhMucKhongPhanRaOptions.value.map((x) => getId(x)))
    })

    const enrichedItems = computed(() => {
        return items.value.map((item) => {
            const dotId = Number(item.DotGiaoChiTieuId ?? item.dotGiaoChiTieuId ?? 0)
            const danhMucId = Number(item.DanhMucChiTieuId ?? item.danhMucChiTieuId ?? 0)
            const donViId = Number(item.DonViNhanId ?? item.donViNhanId ?? 0)

            const dot = dotOptions.value.find((x) => getId(x) === dotId)
            const danhMuc = danhMucOptions.value.find((x) => getId(x) === danhMucId)
            const donVi = donViOptions.value.find((x) => getId(x) === donViId)

            return {
                ...item,
                TenDotGiao:
                    item.TenDotGiao ||
                    item.tenDotGiao ||
                    dot?.TenDotGiao ||
                    dot?.tenDotGiao ||
                    '-',
                TenChiTieu:
                    item.TenChiTieu ||
                    item.tenChiTieu ||
                    danhMuc?.TenChiTieu ||
                    danhMuc?.tenChiTieu ||
                    '-',
                MaChiTieu:
                    item.MaChiTieu ||
                    item.maChiTieu ||
                    danhMuc?.MaChiTieu ||
                    danhMuc?.maChiTieu ||
                    '-',
                TenDonVi:
                    item.TenDonViNhan ||
                    item.tenDonViNhan ||
                    item.TenDonVi ||
                    item.tenDonVi ||
                    donVi?.TenDonVi ||
                    donVi?.tenDonVi ||
                    '-',
                MaDonVi:
                    item.MaDonVi ||
                    item.maDonVi ||
                    donVi?.MaDonVi ||
                    donVi?.maDonVi ||
                    '-',
                TanSuatBaoCao: item.TanSuatBaoCao || item.tanSuatBaoCao || '',
                DieuKienHoanThanh:
                    item.DieuKienHoanThanh ??
                    item.dieuKienHoanThanh ??
                    getGiaTriMacDinhTuDanhMuc(danhMuc),
                GiaTriMucTieu:
                    item.GiaTriMucTieu ??
                    item.giaTriMucTieu ??
                    getGiaTriMacDinhTuDanhMuc(danhMuc)
            }
        })
    })

    const filteredItems = computed(() => {
        return enrichedItems.value.filter((item) => {
            const keyword = filters.keyword.trim().toLowerCase()
            const dotId = Number(item.DotGiaoChiTieuId ?? item.dotGiaoChiTieuId ?? 0)
            const danhMucId = Number(item.DanhMucChiTieuId ?? item.danhMucChiTieuId ?? 0)
            const donViId = Number(item.DonViNhanId ?? item.donViNhanId ?? 0)
            const tanSuatBaoCao = (item.TanSuatBaoCao || item.tanSuatBaoCao || '').trim()

            const isKhongPhanRa = danhMucKhongPhanRaIds.value.has(danhMucId)

            const searchText = [
                item.TenDotGiao || '',
                item.MaChiTieu || '',
                item.TenChiTieu || '',
                item.MaDonVi || '',
                item.TenDonVi || '',
                getTanSuatLabel(item.TanSuatBaoCao || item.tanSuatBaoCao || ''),
                item.GhiChu || item.ghiChu || ''
            ]
                .join(' ')
                .toLowerCase()

            const matchKeyword = !keyword || searchText.includes(keyword)
            const matchDot = !filters.dotGiaoChiTieuId || Number(filters.dotGiaoChiTieuId) === dotId
            const matchDanhMuc = !filters.danhMucChiTieuId || Number(filters.danhMucChiTieuId) === danhMucId
            const matchDonVi = !filters.donViId || Number(filters.donViId) === donViId
            const matchTanSuat = !filters.tanSuatBaoCao || filters.tanSuatBaoCao === tanSuatBaoCao

            return (
                isKhongPhanRa &&
                matchKeyword &&
                matchDot &&
                matchDanhMuc &&
                matchDonVi &&
                matchTanSuat
            )
        })
    })

    const defaultGiaTriMucTieu = computed(() => {
        if (!form.danhMucChiTieuId) return null
        const danhMuc = findDanhMucById(form.danhMucChiTieuId)
        return getGiaTriMacDinhTuDanhMuc(danhMuc)
    })

    const displayGiaTriMacDinh = computed(() => {
        if (
            defaultGiaTriMucTieu.value === null ||
            defaultGiaTriMucTieu.value === undefined ||
            defaultGiaTriMucTieu.value === ''
        ) {
            return '-'
        }
        return formatNumber(defaultGiaTriMucTieu.value)
    })

    watch(
        () => form.danhMucChiTieuId,
        (newValue, oldValue) => {
            if (!newValue) {
                form.giaTriMucTieu = null
                return
            }

            const danhMuc = findDanhMucById(newValue)
            const giaTriMacDinh = getGiaTriMacDinhTuDanhMuc(danhMuc)

            if (!isEdit.value) {
                form.giaTriMucTieu = giaTriMacDinh
                return
            }

            if (newValue !== oldValue) {
                form.giaTriMucTieu = giaTriMacDinh
            }
        },
        { immediate: true }
    )

    const buildPayload = () => ({
        dotGiaoChiTieuId: form.dotGiaoChiTieuId,
        danhMucChiTieuId: form.danhMucChiTieuId,
        donViNhanId: form.donViId,
        donViThucHienChinhId: form.donViId,
        tanSuatBaoCao: form.tanSuatBaoCao || null,
        giaTriMucTieu:
            form.giaTriMucTieu === '' || form.giaTriMucTieu === null || form.giaTriMucTieu === undefined
                ? null
                : Number(form.giaTriMucTieu),
        ghiChu: form.ghiChu?.trim() || null
    })

    const fetchItems = async () => {
        try {
            loading.value = true
            const data = await apiRequest(API_PATHS.chiTietGiaoChiTieu)
            items.value = normalizeList(data)
        } catch (error) {
            console.error('fetchItems error:', error)
            alert(error.message || 'Không tải được danh sách giao chỉ tiêu.')
            items.value = []
        } finally {
            loading.value = false
        }
    }

    const fetchDotOptions = async () => {
        try {
            const data = await apiRequest(API_PATHS.dotGiaoChiTieu)
            dotOptions.value = normalizeList(data)
        } catch (error) {
            console.error('fetchDotOptions error:', error)
            dotOptions.value = []
        }
    }

    const fetchDanhMucOptions = async () => {
        try {
            const data = await apiRequest(API_PATHS.danhMucChiTieu)
            danhMucOptions.value = normalizeList(data)
        } catch (error) {
            console.error('fetchDanhMucOptions error:', error)
            danhMucOptions.value = []
        }
    }

    const fetchDonViOptions = async () => {
        try {
            const data = await apiRequest(API_PATHS.donVi)
            donViOptions.value = normalizeList(data)
        } catch (error) {
            console.error('fetchDonViOptions error:', error)
            donViOptions.value = []
        }
    }

    const openCreateModal = () => {
        isEdit.value = false
        editingId.value = null
        resetForm()
        showModal.value = true
    }

    const openEditModal = (item) => {
        isEdit.value = true
        editingId.value = getId(item)

        const danhMucId = item.DanhMucChiTieuId ?? item.danhMucChiTieuId ?? null
        const danhMuc = findDanhMucById(danhMucId)

        Object.assign(form, {
            dotGiaoChiTieuId: item.DotGiaoChiTieuId ?? item.dotGiaoChiTieuId ?? null,
            danhMucChiTieuId: danhMucId,
            donViId: item.DonViNhanId ?? item.donViNhanId ?? null,
            tanSuatBaoCao: item.TanSuatBaoCao || item.tanSuatBaoCao || '',
            giaTriMucTieu:
                item.GiaTriMucTieu ??
                item.giaTriMucTieu ??
                getGiaTriMacDinhTuDanhMuc(danhMuc),
            ghiChu: item.GhiChu || item.ghiChu || ''
        })

        showModal.value = true
    }

    const closeModal = () => {
        showModal.value = false
        resetForm()
    }

    const validateForm = () => {
        if (!form.dotGiaoChiTieuId || Number(form.dotGiaoChiTieuId) <= 0) {
            alert('Vui lòng chọn đợt giao chỉ tiêu.')
            return false
        }

        if (!form.danhMucChiTieuId || Number(form.danhMucChiTieuId) <= 0) {
            alert('Vui lòng chọn danh mục chỉ tiêu.')
            return false
        }

        if (!danhMucKhongPhanRaIds.value.has(Number(form.danhMucChiTieuId))) {
            alert('Chỉ được chọn danh mục chỉ tiêu không cho phân rã.')
            return false
        }

        if (!form.donViId || Number(form.donViId) <= 0) {
            alert('Vui lòng chọn đơn vị.')
            return false
        }

        if (!form.tanSuatBaoCao) {
            alert('Vui lòng chọn tần suất báo cáo.')
            return false
        }

        if (form.giaTriMucTieu === null || form.giaTriMucTieu === undefined || form.giaTriMucTieu === '') {
            alert('Vui lòng nhập giá trị mục tiêu.')
            return false
        }

        if (Number.isNaN(Number(form.giaTriMucTieu))) {
            alert('Giá trị mục tiêu không hợp lệ.')
            return false
        }

        return true
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        try {
            saving.value = true
            const payload = buildPayload()

            if (isEdit.value && editingId.value) {
                await apiRequest(`${API_PATHS.chiTietGiaoChiTieu}/${editingId.value}`, 'PUT', payload)
            } else {
                await apiRequest(API_PATHS.chiTietGiaoChiTieu, 'POST', payload)
            }

            closeModal()
            await fetchItems()
        } catch (error) {
            console.error('handleSubmit error:', error)
            alert(error.message || 'Lưu giao chỉ tiêu thất bại.')
        } finally {
            saving.value = false
        }
    }

    const handleDelete = async (item) => {
        const tenDonVi = item.TenDonVi || item.tenDonVi || ''
        const ok = window.confirm(`Bạn có chắc muốn xóa giao chỉ tiêu cho đơn vị "${tenDonVi}" không?`)
        if (!ok) return

        try {
            await apiRequest(`${API_PATHS.chiTietGiaoChiTieu}/${getId(item)}`, 'DELETE')
            await fetchItems()
        } catch (error) {
            console.error('handleDelete error:', error)
            alert(error.message || 'Xóa giao chỉ tiêu thất bại.')
        }
    }

    const resetFilters = () => {
        filters.dotGiaoChiTieuId = null
        filters.danhMucChiTieuId = null
        filters.donViId = null
        filters.tanSuatBaoCao = ''
        filters.keyword = ''
    }

    const formatNumber = (value) => {
        if (value === null || value === undefined || value === '') return '-'

        const numberValue = Number(value)
        if (Number.isNaN(numberValue)) return value

        return numberValue.toLocaleString('vi-VN')
    }

    onMounted(async () => {
        await Promise.all([
            fetchItems(),
            fetchDotOptions(),
            fetchDanhMucOptions(),
            fetchDonViOptions()
        ])
    })
</script>

<style scoped>
    .page-wrap {
        background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
        min-height: 100vh;
    }

    .page-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: #0f172a;
    }

    .page-subtitle {
        color: #64748b;
        font-size: 0.95rem;
    }

    .custom-card {
        border: 0;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        overflow: hidden;
    }

    .btn-action {
        border-radius: 12px;
        padding: 0.75rem 1rem;
        font-weight: 600;
    }

    .form-control,
    .form-select {
        border-radius: 12px;
        min-height: 44px;
        border-color: #dbe2ea;
        box-shadow: none;
    }

    .form-control:focus,
    .form-select:focus {
        border-color: #86b7fe;
        box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.12);
    }

    .form-label {
        font-weight: 600;
        color: #334155;
        margin-bottom: 0.45rem;
    }

    .custom-table thead th {
        background: #f8fafc;
        color: #334155;
        font-weight: 700;
        border-bottom: 1px solid #e2e8f0;
        white-space: nowrap;
    }

    .custom-table tbody td {
        padding-top: 1rem;
        padding-bottom: 1rem;
        border-color: #eef2f7;
        color: #334155;
    }

    .custom-table tbody tr:hover {
        background-color: #f8fbff;
    }

    .empty-state {
        min-height: 260px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        color: #64748b;
        font-weight: 500;
    }

    .custom-modal {
        background: rgba(15, 23, 42, 0.35);
    }

    .modal-content {
        border-radius: 24px;
    }

    textarea.form-control {
        min-height: 100px;
        resize: vertical;
    }
</style>