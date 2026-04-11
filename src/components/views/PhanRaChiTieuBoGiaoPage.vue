<template>
    <BaseLayout>
        <div class="page-wrap">
            <div class="container-fluid py-4">
                <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
                    <div>
                        <h1 class="page-title mb-1">Phân rã chỉ tiêu bộ giao</h1>
                        <p class="page-subtitle mb-0">
                            Quản lý chỉ tiêu phân rã theo từng đợt giao
                        </p>
                    </div>

                    <button class="btn btn-primary btn-action" @click="openCreateModal">
                        <i class="bi bi-plus-circle me-2"></i>
                        Thêm phân rã
                    </button>
                </div>

                <div class="card custom-card mb-4">
                    <div class="card-header bg-white border-0 pb-0">
                        <h5 class="mb-1">Bộ lọc tìm kiếm</h5>
                        <small class="text-muted">Lọc dữ liệu tại frontend theo API hiện tại</small>
                    </div>

                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-12 col-md-6 col-xl-3">
                                <label class="form-label">Từ khóa</label>
                                <input v-model="filters.keyword" type="text" class="form-control"
                                    placeholder="Tên chỉ tiêu, mã chỉ tiêu hoặc ghi chú" />
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
                                <label class="form-label">Danh mục chỉ tiêu</label>
                                <select v-model.number="filters.danhMucChiTieuId" class="form-select">
                                    <option :value="null">Tất cả</option>
                                    <option v-for="item in danhMucPhanRaOptions" :key="getId(item)"
                                        :value="getId(item)">
                                        {{ item.MaChiTieu || item.maChiTieu || '' }} -
                                        {{ item.TenChiTieu || item.tenChiTieu || '' }}
                                    </option>
                                </select>
                            </div>

                            <div class="col-12 col-md-6 col-xl-3">
                                <label class="form-label">Tần suất báo cáo</label>
                                <select v-model="filters.tanSuatBaoCao" class="form-select">
                                    <option value="">Tất cả</option>
                                    <option value="THANG">Tháng</option>
                                    <option value="QUY">Quý</option>
                                    <option value="6THANG">6 tháng</option>
                                    <option value="NAM">Năm</option>
                                </select>
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
                            <h5 class="mb-1">Danh sách phân rã chỉ tiêu</h5>
                            <small class="text-muted">Theo dõi chỉ tiêu phân rã theo từng đợt</small>
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
                                        <th>Mã chỉ tiêu</th>
                                        <th>Tên chỉ tiêu</th>
                                        <th>Tần suất báo cáo</th>
                                        <th>Đơn vị nhận</th>
                                        <th>Đơn vị thực hiện chính</th>
                                        <th>Giá trị mục tiêu</th>
                                        <th>Ghi chú</th>
                                        <th class="text-center" style="width: 180px">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in filteredItems" :key="getId(item)">
                                        <td>{{ item.TenDotGiao || item.tenDotGiao || '-' }}</td>
                                        <td class="fw-semibold text-primary">
                                            {{ item.MaChiTieu || item.maChiTieu || '-' }}
                                        </td>
                                        <td>{{ item.TenChiTieu || item.tenChiTieu || '-' }}</td>
                                        <td>{{ mapTanSuat(item.TanSuatBaoCao || item.tanSuatBaoCao) }}</td>
                                        <td>{{ item.TenDonViNhan || item.tenDonViNhan || '-' }}</td>
                                        <td>{{ item.TenDonViThucHienChinh || item.tenDonViThucHienChinh || '-' }}</td>
                                        <td>
                                            <div>{{ formatNumber(item.GiaTriMucTieu ?? item.giaTriMucTieu) }}</div>
                                            <small class="text-muted"
                                                v-if="item.GiaTriMucTieuText || item.giaTriMucTieuText">
                                                {{ item.GiaTriMucTieuText || item.giaTriMucTieuText }}
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
                                        {{ isEdit ? 'Cập nhật phân rã chỉ tiêu' : 'Thêm phân rã chỉ tiêu' }}
                                    </h4>
                                    <p class="text-muted mb-0">
                                        Chỉ được chọn các chỉ tiêu có cho phép phân rã
                                    </p>
                                </div>
                                <button type="button" class="btn-close" @click="closeModal"></button>
                            </div>

                            <div class="modal-body pt-3">
                                <div class="row g-3">
                                    <div class="col-12">
                                        <div class="alert alert-info mb-0">
                                            <i class="bi bi-info-circle me-2"></i>
                                            Danh mục chỉ tiêu chỉ hiển thị các chỉ tiêu có
                                            <strong>CoChoPhepPhanRa = 1</strong>.
                                        </div>
                                    </div>

                                    <div class="col-12 col-md-6">
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

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">
                                            Danh mục chỉ tiêu <span class="text-danger">*</span>
                                        </label>
                                        <select v-model.number="form.danhMucChiTieuId" class="form-select">
                                            <option :value="null">Chọn chỉ tiêu</option>
                                            <option v-for="item in danhMucPhanRaOptions" :key="getId(item)"
                                                :value="getId(item)">
                                                {{ item.MaChiTieu || item.maChiTieu || '' }} -
                                                {{ item.TenChiTieu || item.tenChiTieu || '' }}
                                            </option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">
                                            Tần suất báo cáo <span class="text-danger">*</span>
                                        </label>
                                        <select v-model="form.tanSuatBaoCao" class="form-select">
                                            <option value="THANG">Tháng</option>
                                            <option value="QUY">Quý</option>
                                            <option value="6THANG">6 tháng</option>
                                            <option value="NAM">Năm</option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">
                                            Đơn vị nhận <span class="text-danger">*</span>
                                        </label>
                                        <select v-model.number="form.donViNhanId" class="form-select">
                                            <option :value="null">Chọn đơn vị nhận</option>
                                            <option v-for="item in donViOptions" :key="getId(item)"
                                                :value="getId(item)">
                                                {{ item.TenDonVi || item.tenDonVi || '-' }}
                                            </option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">
                                            Đơn vị thực hiện chính <span class="text-danger">*</span>
                                        </label>
                                        <select v-model.number="form.donViThucHienChinhId" class="form-select">
                                            <option :value="null">Chọn đơn vị thực hiện chính</option>
                                            <option v-for="item in donViOptions" :key="getId(item)"
                                                :value="getId(item)">
                                                {{ item.TenDonVi || item.tenDonVi || '-' }}
                                            </option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-md-4">
                                        <label class="form-label">
                                            Giá trị mục tiêu <span class="text-danger">*</span>
                                        </label>
                                        <input v-model.number="form.giaTriMucTieu" type="number" min="0" step="0.01"
                                            class="form-control" placeholder="Nhập giá trị mục tiêu" />
                                    </div>

                                    <div class="col-12 col-md-4">
                                        <label class="form-label">Giá trị mục tiêu (text)</label>
                                        <input v-model="form.giaTriMucTieuText" type="text" class="form-control"
                                            placeholder="Ví dụ: 95%, 10 vụ, 120 hồ sơ" />
                                    </div>

                                    <div class="col-12 col-md-4">
                                        <label class="form-label">Thứ tự hiển thị</label>
                                        <input v-model.number="form.thuTuHienThi" type="number" min="1" step="1"
                                            class="form-control" placeholder="Nhập thứ tự hiển thị" />
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
                                    {{ saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Lưu phân rã' }}
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

    const filters = reactive({
        keyword: '',
        dotGiaoChiTieuId: null,
        danhMucChiTieuId: null,
        tanSuatBaoCao: ''
    })

    const createDefaultForm = () => ({
        dotGiaoChiTieuId: null,
        danhMucChiTieuId: null,
        donViNhanId: null,
        donViThucHienChinhId: null,
        tanSuatBaoCao: 'THANG',
        giaTriMucTieu: null,
        giaTriMucTieuText: '',
        ghiChu: '',
        thuTuHienThi: 1
    })

    const form = reactive(createDefaultForm())

    const resetForm = () => {
        Object.assign(form, createDefaultForm())
    }

    const getId = (item) => Number(item?.Id ?? item?.id ?? 0)

    const normalizeList = (response) => {
        if (Array.isArray(response?.data)) return response.data
        if (Array.isArray(response?.data?.data)) return response.data.data
        if (Array.isArray(response?.data?.items)) return response.data.items
        return []
    }

    const danhMucPhanRaOptions = computed(() => {
        return danhMucOptions.value.filter(
            (item) => Number(item.CoChoPhepPhanRa ?? item.coChoPhepPhanRa ?? 0) === 1
        )
    })

    const danhMucPhanRaIds = computed(() => {
        return new Set(danhMucPhanRaOptions.value.map((x) => getId(x)))
    })

    const enrichedItems = computed(() => {
        return items.value.map((item) => {
            const dotId = Number(item.DotGiaoChiTieuId ?? item.dotGiaoChiTieuId ?? 0)
            const danhMucId = Number(item.DanhMucChiTieuId ?? item.danhMucChiTieuId ?? 0)
            const donViNhanId = Number(item.DonViNhanId ?? item.donViNhanId ?? 0)
            const donViThucHienChinhId = Number(item.DonViThucHienChinhId ?? item.donViThucHienChinhId ?? 0)

            const dot = dotOptions.value.find((x) => getId(x) === dotId)
            const danhMuc = danhMucOptions.value.find((x) => getId(x) === danhMucId)
            const donViNhan = donViOptions.value.find((x) => getId(x) === donViNhanId)
            const donViThucHienChinh = donViOptions.value.find((x) => getId(x) === donViThucHienChinhId)

            return {
                ...item,
                TenDotGiao:
                    item.TenDotGiao ||
                    item.tenDotGiao ||
                    dot?.TenDotGiao ||
                    dot?.tenDotGiao ||
                    '-',
                MaChiTieu:
                    item.MaChiTieu ||
                    item.maChiTieu ||
                    danhMuc?.MaChiTieu ||
                    danhMuc?.maChiTieu ||
                    '-',
                TenChiTieu:
                    item.TenChiTieu ||
                    item.tenChiTieu ||
                    danhMuc?.TenChiTieu ||
                    danhMuc?.tenChiTieu ||
                    '-',
                TanSuatBaoCao:
                    item.TanSuatBaoCao ||
                    item.tanSuatBaoCao ||
                    '-',
                TenDonViNhan:
                    item.TenDonViNhan ||
                    item.tenDonViNhan ||
                    donViNhan?.TenDonVi ||
                    donViNhan?.tenDonVi ||
                    '-',
                TenDonViThucHienChinh:
                    item.TenDonViThucHienChinh ||
                    item.tenDonViThucHienChinh ||
                    donViThucHienChinh?.TenDonVi ||
                    donViThucHienChinh?.tenDonVi ||
                    '-'
            }
        })
    })

    const filteredItems = computed(() => {
        return enrichedItems.value.filter((item) => {
            const keyword = filters.keyword.trim().toLowerCase()

            const maChiTieu = (item.MaChiTieu || item.maChiTieu || '').toLowerCase()
            const tenChiTieu = (item.TenChiTieu || item.tenChiTieu || '').toLowerCase()
            const ghiChu = (item.GhiChu || item.ghiChu || '').toLowerCase()
            const dotId = Number(item.DotGiaoChiTieuId ?? item.dotGiaoChiTieuId ?? 0)
            const danhMucId = Number(item.DanhMucChiTieuId ?? item.danhMucChiTieuId ?? 0)
            const tanSuatBaoCao = item.TanSuatBaoCao || item.tanSuatBaoCao || ''

            const matchKeyword =
                !keyword ||
                maChiTieu.includes(keyword) ||
                tenChiTieu.includes(keyword) ||
                ghiChu.includes(keyword)

            const matchDot =
                !filters.dotGiaoChiTieuId ||
                Number(filters.dotGiaoChiTieuId) === dotId

            const matchDanhMuc =
                !filters.danhMucChiTieuId ||
                Number(filters.danhMucChiTieuId) === danhMucId

            const matchTanSuat =
                !filters.tanSuatBaoCao ||
                filters.tanSuatBaoCao === tanSuatBaoCao

            return matchKeyword && matchDot && matchDanhMuc && matchTanSuat
        })
    })

    const buildPayload = () => ({
        dotGiaoChiTieuId: form.dotGiaoChiTieuId,
        danhMucChiTieuId: form.danhMucChiTieuId,
        donViNhanId: form.donViNhanId,
        donViThucHienChinhId: form.donViThucHienChinhId,
        tanSuatBaoCao: form.tanSuatBaoCao || null,
        giaTriMucTieu: form.giaTriMucTieu,
        giaTriMucTieuText: form.giaTriMucTieuText?.trim() || null,
        ghiChu: form.ghiChu?.trim() || null,
        thuTuHienThi: form.thuTuHienThi ?? 1
    })

    const fetchItems = async () => {
        try {
            loading.value = true
            const response = await api.get(API_PATHS.chiTietGiaoChiTieu)
            items.value = normalizeList(response)
        } catch (error) {
            console.error('fetchItems error:', error?.response?.status, error?.config?.url, error)
            alert(error?.response?.data?.message || 'Không tải được danh sách phân rã chỉ tiêu.')
        } finally {
            loading.value = false
        }
    }

    const fetchDotOptions = async () => {
        try {
            const response = await api.get(API_PATHS.dotGiaoChiTieu)
            dotOptions.value = normalizeList(response)
        } catch (error) {
            console.error('fetchDotOptions error:', error?.response?.status, error?.config?.url, error)
            dotOptions.value = []
        }
    }

    const fetchDanhMucOptions = async () => {
        try {
            const response = await api.get(API_PATHS.danhMucChiTieu)
            danhMucOptions.value = normalizeList(response)
        } catch (error) {
            console.error('fetchDanhMucOptions error:', error?.response?.status, error?.config?.url, error)
            danhMucOptions.value = []
        }
    }

    const fetchDonViOptions = async () => {
        try {
            const response = await api.get(API_PATHS.donVi)
            donViOptions.value = normalizeList(response)
        } catch (error) {
            console.error('fetchDonViOptions error:', error?.response?.status, error?.config?.url, error)
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

        Object.assign(form, {
            dotGiaoChiTieuId: item.DotGiaoChiTieuId ?? item.dotGiaoChiTieuId ?? null,
            danhMucChiTieuId: item.DanhMucChiTieuId ?? item.danhMucChiTieuId ?? null,
            donViNhanId: item.DonViNhanId ?? item.donViNhanId ?? null,
            donViThucHienChinhId: item.DonViThucHienChinhId ?? item.donViThucHienChinhId ?? null,
            tanSuatBaoCao: item.TanSuatBaoCao || item.tanSuatBaoCao || 'THANG',
            giaTriMucTieu: item.GiaTriMucTieu ?? item.giaTriMucTieu ?? null,
            giaTriMucTieuText: item.GiaTriMucTieuText || item.giaTriMucTieuText || '',
            ghiChu: item.GhiChu || item.ghiChu || '',
            thuTuHienThi: item.ThuTuHienThi ?? item.thuTuHienThi ?? 1
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

        if (!danhMucPhanRaIds.value.has(Number(form.danhMucChiTieuId))) {
            alert('Chỉ được chọn những chỉ tiêu có cho phân rã.')
            return false
        }

        if (!form.tanSuatBaoCao) {
            alert('Vui lòng chọn tần suất báo cáo.')
            return false
        }

        if (!form.donViNhanId || Number(form.donViNhanId) <= 0) {
            alert('Vui lòng chọn đơn vị nhận.')
            return false
        }

        if (!form.donViThucHienChinhId || Number(form.donViThucHienChinhId) <= 0) {
            alert('Vui lòng chọn đơn vị thực hiện chính.')
            return false
        }

        if (form.giaTriMucTieu === null || form.giaTriMucTieu === '' || Number(form.giaTriMucTieu) < 0) {
            alert('Vui lòng nhập giá trị mục tiêu hợp lệ.')
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
                await api.put(`${API_PATHS.chiTietGiaoChiTieu}/${editingId.value}`, payload)
            } else {
                await api.post(API_PATHS.chiTietGiaoChiTieu, payload)
            }

            closeModal()
            await fetchItems()
        } catch (error) {
            console.error('handleSubmit error:', error?.response?.status, error?.config?.url, error)

            const message =
                error?.response?.data?.message ||
                error?.response?.data?.title ||
                JSON.stringify(error?.response?.data?.errors || {}, null, 2) ||
                'Lưu phân rã chỉ tiêu thất bại.'

            alert(message)
        } finally {
            saving.value = false
        }
    }

    const handleDelete = async (item) => {
        const id = getId(item)
        const tenChiTieu = item.TenChiTieu || item.tenChiTieu || ''

        const ok = window.confirm(`Bạn có chắc muốn xóa phân rã của chỉ tiêu "${tenChiTieu}" không?`)
        if (!ok) return

        try {
            await api.delete(`${API_PATHS.chiTietGiaoChiTieu}/${id}`)
            await fetchItems()
        } catch (error) {
            console.error('handleDelete error:', error?.response?.status, error?.config?.url, error)
            alert(error?.response?.data?.message || 'Xóa phân rã chỉ tiêu thất bại.')
        }
    }

    const resetFilters = () => {
        filters.keyword = ''
        filters.dotGiaoChiTieuId = null
        filters.danhMucChiTieuId = null
        filters.tanSuatBaoCao = ''
    }

    const formatNumber = (value) => {
        if (value === null || value === undefined || value === '') return '-'
        return Number(value).toLocaleString('vi-VN')
    }

    const mapTanSuat = (value) => {
        const map = {
            THANG: 'Tháng',
            QUY: 'Quý',
            '6THANG': '6 tháng',
            NAM: 'Năm'
        }
        return map[value] || value || '-'
    }

    watch(
        () => form.donViNhanId,
        (newValue) => {
            if (!form.donViThucHienChinhId && newValue) {
                form.donViThucHienChinhId = newValue
            }
        }
    )

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