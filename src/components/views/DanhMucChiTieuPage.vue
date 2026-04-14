<template>
    <BaseLayout>
        <div class="page-wrap">
            <div class="container-fluid py-4">
                <div class="gov-banner mb-4">
                    <div class="gov-emblem">
                        <i class="bi bi-list-check"></i>
                    </div>
                    <div class="gov-text">
                        <div class="wave-title">HỆ THỐNG THEO DÕI CHỈ TIÊU CÔNG TÁC</div>
                        <div class="gov-title">QUẢN LÝ DANH MỤC CHỈ TIÊU</div>
                    </div>
                </div>

                <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
                    <div class="gov-banner">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a3/Emblem_of_Vietnam.svg"
                            class="gov-emblem" />
                    </div>

                    <button class="btn btn-primary btn-action" @click="openCreateModal">
                        <i class="bi bi-plus-circle me-2"></i>
                        Tạo chỉ tiêu
                    </button>
                </div>

                <div class="card custom-card mb-4">
                    <div class="card-header bg-white border-0 pb-0">
                        <h5 class="mb-1">Bộ lọc tìm kiếm</h5>
                        <small class="text-muted">Tra cứu nhanh theo nhiều tiêu chí</small>
                    </div>

                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-12 col-md-6 col-xl-4">
                                <label class="form-label">Từ khóa</label>
                                <input v-model="filters.keyword" type="text" class="form-control"
                                    placeholder="Mã hoặc tên chỉ tiêu" />
                            </div>

                            <div class="col-12 col-md-6 col-xl-3">
                                <label class="form-label">Nguồn chỉ tiêu</label>
                                <select v-model="filters.nguonChiTieu" class="form-select">
                                    <option value="">Tất cả</option>
                                    <option value="BO">Bộ công an</option>
                                    <option value="THANH_PHO">Công an thành phố</option>
                                </select>
                            </div>

                            <div class="col-12 col-md-6 col-xl-3">
                                <label class="form-label">Loại chỉ tiêu</label>
                                <select v-model="filters.loaiChiTieu" class="form-select">
                                    <option value="">Tất cả</option>
                                    <option value="DINH_TINH">Định tính</option>
                                    <option value="DINH_LUONG_TICH_LUY">Định lượng tích lũy</option>
                                    <option value="DINH_LUONG_SO_SANH">Định lượng so sánh</option>
                                </select>
                            </div>

                            <div class="col-12 col-md-6 col-xl-2">
                                <label class="form-label">Trạng thái</label>
                                <select v-model="filters.trangThaiSuDung" class="form-select">
                                    <option value="">Tất cả</option>
                                    <option value="DANG_AP_DUNG">Đang áp dụng</option>
                                    <option value="NGUNG_AP_DUNG">Ngừng áp dụng</option>
                                </select>
                            </div>
                        </div>

                        <div class="d-flex flex-wrap gap-2 mt-4">
                            <button class="btn btn-primary" @click="fetchDanhMucChiTieu">
                                <i class="bi bi-search me-1"></i>
                                Tìm kiếm
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
                            <h5 class="mb-1">Danh sách chỉ tiêu</h5>
                            <small class="text-muted">Theo dõi và quản lý dữ liệu chỉ tiêu</small>
                        </div>
                        <span class="badge text-bg-light border">Tổng: {{ items.length }}</span>
                    </div>

                    <div class="card-body p-0">
                        <div v-if="loading" class="empty-state">
                            <div class="spinner-border text-primary mb-3" role="status"></div>
                            <div>Đang tải dữ liệu...</div>
                        </div>

                        <div v-else-if="!items.length" class="empty-state">
                            <i class="bi bi-inbox fs-1 text-muted mb-2"></i>
                            <div>Chưa có dữ liệu</div>
                        </div>

                        <div v-else class="table-responsive">
                            <table class="table table-hover align-middle mb-0 custom-table">
                                <thead>
                                    <tr>
                                        <th>Mã chỉ tiêu</th>
                                        <th>Tên chỉ tiêu</th>
                                        <th>Nguồn</th>
                                        <th>Loại</th>
                                        <th>Trạng thái</th>
                                        <th class="text-center" style="width: 180px">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in items" :key="item.id">
                                        <td class="fw-semibold text-primary">{{ item.maChiTieu }}</td>
                                        <td>{{ item.tenChiTieu }}</td>
                                        <td>{{ mapNguon(item.nguonChiTieu) }}</td>
                                        <td>{{ mapLoai(item.loaiChiTieu) }}</td>
                                        <td>
                                            <span class="badge rounded-pill"
                                                :class="item.trangThaiSuDung === 'DANG_AP_DUNG' ? 'text-bg-success' : 'text-bg-danger'">
                                                {{ getTrangThaiLabel(item.trangThaiSuDung) }}
                                            </span>
                                        </td>
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
                                        {{ isEdit ? 'Cập nhật chỉ tiêu' : 'Tạo chỉ tiêu mới' }}
                                    </h4>
                                    <p class="text-muted mb-0">Nhập thông tin danh mục chỉ tiêu</p>
                                </div>
                                <button type="button" class="btn-close" @click="closeModal"></button>
                            </div>

                            <div class="modal-body pt-3">
                                <div class="row g-3">
                                    <div class="col-12">
                                        <div class="alert alert-info mb-0">
                                            <i class="bi bi-info-circle me-2"></i>
                                            <strong>Cấp áp dụng</strong> được mặc định là <strong>Thành phố</strong>.
                                        </div>
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">
                                            Mã chỉ tiêu <span class="text-danger">*</span>
                                        </label>
                                        <input v-model="form.maChiTieu" :disabled="isEdit" type="text"
                                            class="form-control" />
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">
                                            Tên chỉ tiêu <span class="text-danger">*</span>
                                        </label>
                                        <input v-model="form.tenChiTieu" type="text" class="form-control" />
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">
                                            Nguồn chỉ tiêu <span class="text-danger">*</span>
                                        </label>
                                        <select v-model="form.nguonChiTieu" class="form-select">
                                            <option value="BO">Bộ công an</option>
                                            <option value="THANH_PHO">Công an thành phố</option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">
                                            Loại chỉ tiêu <span class="text-danger">*</span>
                                        </label>
                                        <select v-model="form.loaiChiTieu" class="form-select">
                                            <option value="DINH_TINH">Định tính</option>
                                            <option value="DINH_LUONG_TICH_LUY">Định lượng tích lũy</option>
                                            <option value="DINH_LUONG_SO_SANH">Định lượng so sánh</option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Lĩnh vực nghiệp vụ</label>
                                        <select v-model="form.linhVucNghiepVu" class="form-select">
                                            <option value="">Chọn lĩnh vực nghiệp vụ</option>
                                            <option v-for="option in linhVucNghiepVuOptions" :key="option"
                                                :value="option">
                                                {{ option }}
                                            </option>
                                            <option :value="NEW_LINH_VUC_VALUE">+ Thêm mới lĩnh vực</option>
                                        </select>
                                    </div>

                                    <div v-if="form.linhVucNghiepVu === NEW_LINH_VUC_VALUE" class="col-12 col-md-6">
                                        <label class="form-label">
                                            Nhập lĩnh vực nghiệp vụ mới <span class="text-danger">*</span>
                                        </label>
                                        <input v-model="form.linhVucNghiepVuMoi" type="text" class="form-control"
                                            placeholder="Nhập lĩnh vực nghiệp vụ mới" />
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Đơn vị tính</label>
                                        <select v-model="form.donViTinh" class="form-select">
                                            <option value="">Chọn đơn vị tính</option>
                                            <option v-for="option in donViTinhOptions" :key="option" :value="option">
                                                {{ option }}
                                            </option>
                                            <option :value="NEW_DON_VI_TINH_VALUE">+ Thêm mới đơn vị tính</option>
                                        </select>
                                    </div>

                                    <div v-if="form.donViTinh === NEW_DON_VI_TINH_VALUE" class="col-12 col-md-6">
                                        <label class="form-label">
                                            Nhập đơn vị tính mới <span class="text-danger">*</span>
                                        </label>
                                        <input v-model="form.donViTinhMoi" type="text" class="form-control"
                                            placeholder="Nhập đơn vị tính mới" />
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Trạng thái sử dụng</label>
                                        <select v-model="form.trangThaiSuDung" class="form-select">
                                            <option value="DANG_AP_DUNG">Đang áp dụng</option>
                                            <option value="NGUNG_AP_DUNG">Ngừng áp dụng</option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Ngày hiệu lực</label>
                                        <input v-model="form.ngayHieuLuc" type="date" class="form-control" />
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Ngày hết hiệu lực</label>
                                        <input v-model="form.ngayHetHieuLuc" type="date" class="form-control" />
                                    </div>

                                    <div class="col-12">
                                        <label class="form-label">Mô tả</label>
                                        <textarea v-model="form.moTa" rows="3" class="form-control"></textarea>
                                    </div>

                                    <div class="col-12">
                                        <label class="form-label">Hướng dẫn tính toán</label>
                                        <textarea v-model="form.huongDanTinhToan" rows="3"
                                            class="form-control"></textarea>
                                    </div>

                                    <template v-if="form.loaiChiTieu === 'DINH_TINH'">
                                        <div class="col-12 col-md-6">
                                            <label class="form-label">Điều kiện hoàn thành</label>
                                            <input v-model="form.dieuKienHoanThanh" type="text" class="form-control" />
                                        </div>
                                        <div class="col-12 col-md-6">
                                            <label class="form-label">Điều kiện không hoàn thành</label>
                                            <input v-model="form.dieuKienKhongHoanThanh" type="text"
                                                class="form-control" />
                                        </div>
                                    </template>

                                    <template v-if="form.loaiChiTieu === 'DINH_LUONG_SO_SANH'">
                                        <div class="col-12 col-md-4">
                                            <label class="form-label">Tỷ lệ % mục tiêu</label>
                                            <input v-model.number="form.tyLePhanTramMucTieu" type="number" min="0"
                                                class="form-control" />
                                        </div>
                                        <div class="col-12 col-md-4">
                                            <label class="form-label">Loại mốc so sánh</label>
                                            <select v-model="form.loaiMocSoSanh" class="form-select">
                                                <option value="">Chọn</option>
                                                <option value="DAU_KY">Đầu kỳ</option>
                                                <option value="CUNG_KY">Cùng kỳ</option>
                                                <option value="KY_TRUOC">Kỳ trước</option>
                                            </select>
                                        </div>
                                        <div class="col-12 col-md-4">
                                            <label class="form-label">Chiều so sánh</label>
                                            <select v-model="form.chieuSoSanh" class="form-select">
                                                <option value="">Chọn</option>
                                                <option value="TANG">Tăng</option>
                                                <option value="GIAM">Giảm</option>
                                            </select>
                                        </div>
                                    </template>
                                </div>
                            </div>

                            <div class="modal-footer border-0 pt-0">
                                <button class="btn btn-light" @click="closeModal">Hủy</button>
                                <button class="btn btn-primary" :disabled="saving" @click="handleSubmit">
                                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                                    {{ saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Lưu chỉ tiêu' }}
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
    import BaseLayout from '../BaseLayout.vue'
    import { apiRequest } from '../../services/api.js'

    const NEW_LINH_VUC_VALUE = '__NEW_LINH_VUC__'
    const NEW_DON_VI_TINH_VALUE = '__NEW_DON_VI_TINH__'
    const DEFAULT_CAP_AP_DUNG = 'THANH_PHO'

    const loading = ref(false)
    const saving = ref(false)
    const showModal = ref(false)
    const isEdit = ref(false)
    const editingId = ref(null)
    const items = ref([])

    const linhVucNghiepVuOptions = computed(() => {
        const values = items.value
            .map(item => item.linhVucNghiepVu?.trim())
            .filter(Boolean)

        return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'vi'))
    })

    const donViTinhOptions = computed(() => {
        const values = items.value
            .map(item => item.donViTinh?.trim())
            .filter(Boolean)

        return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'vi'))
    })

    const filters = reactive({
        keyword: '',
        nguonChiTieu: '',
        loaiChiTieu: '',
        trangThaiSuDung: ''
    })

    const createDefaultForm = () => ({
        maChiTieu: '',
        tenChiTieu: '',
        nguonChiTieu: 'BO',
        loaiChiTieu: 'DINH_TINH',
        linhVucNghiepVu: '',
        linhVucNghiepVuMoi: '',
        donViTinh: '',
        donViTinhMoi: '',
        moTa: '',
        huongDanTinhToan: '',
        coChoPhepPhanRa: false,
        trangThaiSuDung: 'DANG_AP_DUNG',
        ngayHieuLuc: '',
        ngayHetHieuLuc: '',
        dieuKienHoanThanh: '',
        dieuKienKhongHoanThanh: '',
        tyLePhanTramMucTieu: null,
        loaiMocSoSanh: '',
        chieuSoSanh: ''
    })

    const form = reactive(createDefaultForm())

    const resetForm = () => {
        Object.assign(form, createDefaultForm())
    }

    const getResolvedLinhVucNghiepVu = () => {
        if (form.linhVucNghiepVu === NEW_LINH_VUC_VALUE) {
            return form.linhVucNghiepVuMoi?.trim() || ''
        }
        return form.linhVucNghiepVu?.trim() || ''
    }

    const getResolvedDonViTinh = () => {
        if (form.donViTinh === NEW_DON_VI_TINH_VALUE) {
            return form.donViTinhMoi?.trim() || ''
        }
        return form.donViTinh?.trim() || ''
    }

    const buildPayload = () => {
        return {
            maChiTieu: form.maChiTieu?.trim(),
            tenChiTieu: form.tenChiTieu?.trim(),
            nguonChiTieu: form.nguonChiTieu,
            loaiChiTieu: form.loaiChiTieu,
            capApDung: DEFAULT_CAP_AP_DUNG,
            linhVucNghiepVu: getResolvedLinhVucNghiepVu() || null,
            donViTinh: getResolvedDonViTinh() || null,
            moTa: form.moTa || null,
            huongDanTinhToan: form.huongDanTinhToan || null,
            coChoPhepPhanRa: false,
            trangThaiSuDung: form.trangThaiSuDung,
            ngayHieuLuc: form.ngayHieuLuc || null,
            ngayHetHieuLuc: form.ngayHetHieuLuc || null,
            dieuKienHoanThanh: form.loaiChiTieu === 'DINH_TINH' ? form.dieuKienHoanThanh || null : null,
            dieuKienKhongHoanThanh: form.loaiChiTieu === 'DINH_TINH' ? form.dieuKienKhongHoanThanh || null : null,
            tyLePhanTramMucTieu: form.loaiChiTieu === 'DINH_LUONG_SO_SANH' ? form.tyLePhanTramMucTieu : null,
            loaiMocSoSanh: form.loaiChiTieu === 'DINH_LUONG_SO_SANH' ? form.loaiMocSoSanh || null : null,
            chieuSoSanh: form.loaiChiTieu === 'DINH_LUONG_SO_SANH' ? form.chieuSoSanh || null : null
        }
    }

    const buildQueryString = params => {
        const searchParams = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.append(key, value)
            }
        })

        const query = searchParams.toString()
        return query ? `?${query}` : ''
    }

    const fetchDanhMucChiTieu = async () => {
        try {
            loading.value = true

            const queryString = buildQueryString({
                keyword: filters.keyword || undefined,
                nguonChiTieu: filters.nguonChiTieu || undefined,
                loaiChiTieu: filters.loaiChiTieu || undefined,
                trangThaiSuDung: filters.trangThaiSuDung || undefined
            })

            const data = await apiRequest(`/danh-muc-chi-tieu${queryString}`)
            items.value = Array.isArray(data) ? data : []
        } catch (error) {
            console.error(error)
            alert(error.message || 'Không tải được danh mục chỉ tiêu.')
            items.value = []
        } finally {
            loading.value = false
        }
    }

    const openCreateModal = () => {
        isEdit.value = false
        editingId.value = null
        resetForm()
        showModal.value = true
    }

    const openEditModal = item => {
        isEdit.value = true
        editingId.value = item.id

        const existingLinhVuc = item.linhVucNghiepVu?.trim() || ''
        const existingDonViTinh = item.donViTinh?.trim() || ''

        const hasLinhVucInOptions =
            existingLinhVuc && linhVucNghiepVuOptions.value.includes(existingLinhVuc)

        const hasDonViTinhInOptions =
            existingDonViTinh && donViTinhOptions.value.includes(existingDonViTinh)

        Object.assign(form, {
            maChiTieu: item.maChiTieu,
            tenChiTieu: item.tenChiTieu,
            nguonChiTieu: item.nguonChiTieu,
            loaiChiTieu: item.loaiChiTieu,
            linhVucNghiepVu: hasLinhVucInOptions
                ? existingLinhVuc
                : existingLinhVuc
                    ? NEW_LINH_VUC_VALUE
                    : '',
            linhVucNghiepVuMoi: hasLinhVucInOptions ? '' : existingLinhVuc,
            donViTinh: hasDonViTinhInOptions
                ? existingDonViTinh
                : existingDonViTinh
                    ? NEW_DON_VI_TINH_VALUE
                    : '',
            donViTinhMoi: hasDonViTinhInOptions ? '' : existingDonViTinh,
            moTa: item.moTa || '',
            huongDanTinhToan: item.huongDanTinhToan || '',
            coChoPhepPhanRa: false,
            trangThaiSuDung: item.trangThaiSuDung || 'DANG_AP_DUNG',
            ngayHieuLuc: item.ngayHieuLuc ? item.ngayHieuLuc.slice(0, 10) : '',
            ngayHetHieuLuc: item.ngayHetHieuLuc ? item.ngayHetHieuLuc.slice(0, 10) : '',
            dieuKienHoanThanh: item.dieuKienHoanThanh || '',
            dieuKienKhongHoanThanh: item.dieuKienKhongHoanThanh || '',
            tyLePhanTramMucTieu: item.tyLePhanTramMucTieu,
            loaiMocSoSanh: item.loaiMocSoSanh || '',
            chieuSoSanh: item.chieuSoSanh || ''
        })

        showModal.value = true
    }

    const closeModal = () => {
        showModal.value = false
        resetForm()
    }

    const validateForm = () => {
        if (!form.maChiTieu && !isEdit.value) {
            alert('Vui lòng nhập mã chỉ tiêu.')
            return false
        }

        if (!form.tenChiTieu?.trim()) {
            alert('Vui lòng nhập tên chỉ tiêu.')
            return false
        }

        if (form.linhVucNghiepVu === NEW_LINH_VUC_VALUE && !form.linhVucNghiepVuMoi?.trim()) {
            alert('Vui lòng nhập lĩnh vực nghiệp vụ mới.')
            return false
        }

        if (form.donViTinh === NEW_DON_VI_TINH_VALUE && !form.donViTinhMoi?.trim()) {
            alert('Vui lòng nhập đơn vị tính mới.')
            return false
        }

        if (form.loaiChiTieu === 'DINH_TINH') {
            if (!form.dieuKienHoanThanh || !form.dieuKienKhongHoanThanh) {
                alert('Chỉ tiêu định tính phải nhập điều kiện hoàn thành và điều kiện không hoàn thành.')
                return false
            }
        }

        if (form.loaiChiTieu === 'DINH_LUONG_SO_SANH') {
            if (!form.tyLePhanTramMucTieu || !form.loaiMocSoSanh || !form.chieuSoSanh) {
                alert('Chỉ tiêu định lượng so sánh phải nhập đủ tỷ lệ %, loại mốc so sánh và chiều so sánh.')
                return false
            }
        }

        return true
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        try {
            saving.value = true
            const payload = buildPayload()

            if (isEdit.value && editingId.value) {
                await apiRequest(`/danh-muc-chi-tieu/${editingId.value}`, 'PUT', payload)
            } else {
                await apiRequest('/danh-muc-chi-tieu', 'POST', payload)
            }

            closeModal()
            await fetchDanhMucChiTieu()
        } catch (error) {
            console.error(error)
            alert(error.message || 'Lưu chỉ tiêu thất bại.')
        } finally {
            saving.value = false
        }
    }

    const handleDelete = async item => {
        const ok = window.confirm(`Bạn có chắc muốn xóa chỉ tiêu "${item.tenChiTieu}" không?`)
        if (!ok) return

        try {
            await apiRequest(`/danh-muc-chi-tieu/${item.id}`, 'DELETE')
            await fetchDanhMucChiTieu()
        } catch (error) {
            console.error('Delete error:', error)
            alert(error.message || 'Xóa chỉ tiêu thất bại.')
        }
    }

    const getTrangThaiLabel = value => {
        return value === 'DANG_AP_DUNG' ? 'Đang áp dụng' : 'Ngừng áp dụng'
    }

    const resetFilters = async () => {
        filters.keyword = ''
        filters.nguonChiTieu = ''
        filters.loaiChiTieu = ''
        filters.trangThaiSuDung = ''
        await fetchDanhMucChiTieu()
    }

    const mapNguon = value => {
        const map = {
            BO: 'Bộ công an',
            THANH_PHO: 'Công an thành phố'
        }
        return map[value] || value
    }

    const mapLoai = value => {
        const map = {
            DINH_TINH: 'Định tính',
            DINH_LUONG_TICH_LUY: 'Định lượng tích lũy',
            DINH_LUONG_SO_SANH: 'Định lượng so sánh'
        }
        return map[value] || value
    }

    onMounted(() => {
        fetchDanhMucChiTieu()
    })
</script>

<style scoped>
    .page-wrap {
        min-height: 100vh;
        background: linear-gradient(180deg, #f8fbff 0%, #eef5fb 100%);
    }

    .page-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1f2d3d;
    }

    .page-subtitle {
        color: #6b7280;
        font-size: 0.95rem;
    }

    .wave-title {
        font-weight: 700;
        letter-spacing: 0.08em;
        font-size: 0.8rem;
        color: #0d6efd;
        margin-bottom: 6px;
        text-transform: uppercase;
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
        font-size: 1.6rem;
        flex-shrink: 0;
    }

    .gov-text {
        flex: 1;
    }

    .gov-title {
        font-size: 1.3rem;
        font-weight: 800;
        color: #1f2d3d;
        line-height: 1.3;
    }

    .gov-sub {
        color: #6b7280;
        margin-top: 4px;
        font-size: 0.95rem;
    }

    .custom-card {
        border: none;
        border-radius: 20px;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
        overflow: hidden;
    }

    .custom-card .card-header {
        padding: 1rem 1.25rem 0.75rem;
    }

    .custom-card .card-body {
        padding: 1.25rem;
    }

    .btn-action {
        border-radius: 12px;
        font-weight: 600;
        padding: 10px 18px;
    }

    .form-label {
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.45rem;
    }

    .form-control,
    .form-select,
    .input-group-text {
        min-height: 44px;
        border-radius: 12px;
        border-color: #dbe3ef;
        box-shadow: none;
    }

    .form-control:focus,
    .form-select:focus {
        border-color: #89d2ef;
        box-shadow: 0 0 0 0.2rem rgba(137, 210, 239, 0.2);
    }

    textarea.form-control {
        min-height: 100px;
        resize: vertical;
    }

    :deep(.table) {
        margin-bottom: 0;
        border-collapse: collapse;
    }

    :deep(.table thead th) {
        border-bottom: 2px solid #dee2e6;
        background: #f8fafc;
        color: #334155;
        font-weight: 700;
        vertical-align: middle;
        white-space: nowrap;
    }

    :deep(.table td),
    :deep(.table th) {
        border-right: 1px solid #eee;
        padding: 14px 16px;
        vertical-align: middle;
    }

    :deep(.table td:last-child),
    :deep(.table th:last-child) {
        border-right: none;
    }

    :deep(.table tbody tr) {
        border-bottom: 1px solid #f1f1f1;
    }

    :deep(.table-hover tbody tr:hover) {
        background-color: rgba(0, 0, 0, 0.03);
    }

    .empty-state {
        min-height: 260px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #6b7280;
        text-align: center;
        padding: 2rem 1rem;
    }

    .badge.text-bg-light {
        font-weight: 600;
        border-radius: 999px;
        padding: 0.45rem 0.7rem;
    }

    .custom-modal {
        background: rgba(137, 210, 239, 0.5);
    }

    :deep(.modal-content) {
        animation: fadeInUp 0.3s ease;
    }

    @keyframes fadeInUp {
        from {
            transform: translateY(20px);
            opacity: 0;
        }

        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .modal-title {
        font-weight: 700;
        color: #1f2937;
    }

    .alert-info {
        border: none;
        border-radius: 14px;
        background: rgba(137, 210, 239, 0.18);
        color: #24566b;
    }

    @media (max-width: 768px) {
        .page-title {
            font-size: 1.4rem;
        }

        .custom-card .card-body {
            padding: 1rem;
        }

        .gov-banner {
            padding: 16px;
            align-items: flex-start;
        }

        .gov-title {
            font-size: 1.05rem;
        }


    }
</style>